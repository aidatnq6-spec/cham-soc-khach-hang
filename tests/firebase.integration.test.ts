import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getMetadata } from "firebase/storage";
import { seedDataset } from "@/lib/domain/schema";

// Explicit emulator environment is mandatory. Ordinary npm test never reaches Firebase.
const emulator = process.env.FIRESTORE_EMULATOR_HOST;
const suite = emulator ? describe : describe.skip;
suite(
  "Firebase emulator: migration, CRUD, atomic restore and owner rules",
  () => {
    let client: ReturnType<
      (typeof import("@/lib/firebase/client"))["getFirebase"]
    >;
    let repo: typeof import("@/lib/firebase/repository");
    let uid: string;
    let other: FirebaseApp;
    beforeAll(async () => {
      if (
        !emulator?.startsWith("127.0.0.1:") &&
        !emulator?.startsWith("localhost:")
      )
        throw new Error("Only local emulators allowed");
      vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "demo-cskh");
      vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "demo-key");
      vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "demo-app");
      vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "localhost");
      vi.stubEnv(
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "demo-cskh.appspot.com",
      );
      vi.stubEnv("NEXT_PUBLIC_USE_FIREBASE_EMULATORS", "true");
      client = (await import("@/lib/firebase/client")).getFirebase();
      repo = await import("@/lib/firebase/repository");
      const email = "phongdepdanang@gmail.com";
      const password = "Emulator-only-12345";
      try {
        await createUserWithEmailAndPassword(client.auth, email, password);
      } catch {
        await signInWithEmailAndPassword(client.auth, email, password);
      }
      uid = client.auth.currentUser!.uid;
      other = initializeApp(
        { projectId: "demo-cskh", apiKey: "demo-key", appId: "other-app" },
        "other-test",
      );
      const auth = getAuth(other);
      connectAuthEmulator(auth, "http://127.0.0.1:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(getFirestore(other), "127.0.0.1", 8080);
      try {
        await createUserWithEmailAndPassword(
          auth,
          "other@example.com",
          password,
        );
      } catch {
        await signInWithEmailAndPassword(auth, "other@example.com", password);
      }
    }, 30_000);
    beforeEach(async () => {
      const response = await fetch(
        `http://${emulator}/emulator/v1/projects/demo-cskh/databases/(default)/documents`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Emulator reset failed");
    });
    afterAll(async () => {
      if (client) await signOut(client.auth);
      if (other) await deleteApp(other);
    });
    const main = () => doc(client.db, "users", uid, "app", "main");
    const generation = async () =>
      (await getDoc(main())).data()!.activeGeneration as string;
    it("migrates the full legacy state once and preserves original state", async () => {
      const data = seedDataset();
      const state = {
        issues: data.issues,
        checklistState: { "seed-001": { "0": true } },
        viewCounts: { "seed-001": 7 },
      };
      await setDoc(main(), { state });
      await repo.ensureMigrated(uid, { issues: [] });
      const gen = await generation();
      const migrated = await repo.readServerIndependentDataset(uid, gen);
      expect(migrated.issues).toHaveLength(13);
      expect(migrated.progress["seed-001"]).toEqual({
        checked: { "0": true },
        views: 7,
      });
      await repo.ensureMigrated(uid, { issues: [] });
      expect(await generation()).toBe(gen);
      expect((await getDoc(main())).data()!.state).toEqual(state);
    }, 20_000);
    it("resumes an interrupted migration using the original generation and stable IDs", async () => {
      await setDoc(main(), {
        state: seedDataset(),
        migration: { token: "old", generation: "interrupted", leaseUntil: 0 },
      });
      await setDoc(
        doc(
          client.db,
          "users",
          uid,
          "app",
          "main",
          "generations",
          "interrupted",
          "issues",
          "seed-001",
        ),
        { ...seedDataset().issues[0], revision: 1 },
      );
      await repo.ensureMigrated(uid, undefined);
      expect(await generation()).toBe("interrupted");
      expect(
        (await repo.readServerIndependentDataset(uid, "interrupted")).issues,
      ).toHaveLength(13);
    }, 20_000);
    it("blocks a second migrator while the migration lease is active", async () => {
      await setDoc(main(), {
        state: seedDataset(),
        migration: {
          token: "other",
          generation: "pending",
          leaseUntil: Date.now() + 120000,
        },
      });
      await expect(repo.ensureMigrated(uid, undefined)).rejects.toThrow(
        "thiết bị khác",
      );
    });
    it("saves individual records, rejects stale revisions and updates progress", async () => {
      await repo.ensureMigrated(uid, undefined);
      const gen = await generation();
      const original = (
        await repo.readServerIndependentDataset(uid, gen)
      ).issues.find((i) => i.id === "seed-001")!;
      await repo.saveIssue(uid, gen, { ...original, name: "Đã sửa" });
      await expect(
        repo.saveIssue(uid, gen, { ...original, name: "Bản cũ" }),
      ).rejects.toThrow("thay đổi");
      await repo.updateProgress(uid, gen, original.id, {
        step: "0",
        checked: true,
      });
      await repo.updateProgress(uid, gen, original.id, { view: true });
      const data = await repo.readServerIndependentDataset(uid, gen);
      expect(data.issues.find((i) => i.id === original.id)!.name).toBe(
        "Đã sửa",
      );
      expect(data.progress[original.id]).toEqual({
        checked: { "0": true },
        views: 1,
      });
      await repo.deleteIssue(
        uid,
        gen,
        data.issues.find((i) => i.id === original.id)!,
      );
      expect(
        (await repo.readServerIndependentDataset(uid, gen)).issues,
      ).toHaveLength(12);
    }, 20_000);
    it("replaces with an empty dataset atomically and retains the previous generation", async () => {
      await repo.ensureMigrated(uid, undefined);
      const old = await generation();
      await repo.replaceDataset(uid, old, { issues: [], progress: {} });
      const next = await generation();
      expect(next).not.toBe(old);
      expect(
        (await repo.readServerIndependentDataset(uid, next)).issues,
      ).toEqual([]);
      expect(
        (await repo.readServerIndependentDataset(uid, old)).issues,
      ).toHaveLength(13);
    }, 20_000);
    it("keeps the active dataset when staging a replacement fails", async () => {
      await repo.ensureMigrated(uid, undefined);
      const old = await generation();
      const invalid = seedDataset();
      invalid.issues[0].name = "";
      // Rules reject the staged batch. The pointer must still reference the original dataset.
      await expect(repo.replaceDataset(uid, old, invalid)).rejects.toThrow();
      expect(await generation()).toBe(old);
      expect(
        (await repo.readServerIndependentDataset(uid, old)).issues,
      ).toHaveLength(13);
    }, 20_000);
    it("publishes a complete dataset through Firestore snapshots", async () => {
      await repo.ensureMigrated(uid, undefined);
      const received = await new Promise<number>((resolve, reject) => {
        let stop = () => {};
        const timeout = setTimeout(() => {
          stop();
          reject(new Error("Snapshot timeout"));
        }, 5000);
        stop = repo.subscribeDataset(
          uid,
          (data) => {
            clearTimeout(timeout);
            stop();
            resolve(data.issues.length);
          },
          (error) => {
            clearTimeout(timeout);
            stop();
            reject(error);
          },
        );
      });
      expect(received).toBe(13);
    }, 20_000);
    it.runIf(!!process.env.TEST_API_URL)(
      "accepts a real emulator ID token through the running Next.js API",
      async () => {
        const endpoint = process.env.TEST_API_URL!;
        if (!endpoint.startsWith("http://127.0.0.1:4180/"))
          throw new Error("Only test API allowed");
        const token = await client.auth.currentUser!.getIdToken();
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: "USB Token không nhận" }),
        });
        // Token verification succeeds; no real paid provider is configured in this process.
        expect(response.status).toBe(503);
        expect((await response.json()).error).toContain(
          "Chưa cấu hình OpenRouter",
        );
      },
      20_000,
    );
    it("rejects reads and writes from another authenticated email and anonymous clients", async () => {
      await repo.ensureMigrated(uid, undefined);
      const forbidden = doc(getFirestore(other), "users", uid, "app", "main");
      await expect(getDoc(forbidden)).rejects.toMatchObject({
        code: "permission-denied",
      });
      await expect(
        setDoc(forbidden, { schemaVersion: 999 }),
      ).rejects.toMatchObject({ code: "permission-denied" });
      await signOut(getAuth(other));
      await expect(getDoc(forbidden)).rejects.toMatchObject({
        code: "permission-denied",
      });
    }, 20_000);
    it("accepts owner image uploads and rejects unsafe content types", async () => {
      const storage = getStorage(client.auth.app);
      const path = `users/${uid}/issues/seed-001/test-${crypto.randomUUID()}.png`;
      await uploadBytes(ref(storage, path), new Uint8Array([137, 80, 78, 71]), {
        contentType: "image/png",
      });
      expect((await getMetadata(ref(storage, path))).contentType).toBe(
        "image/png",
      );
      await expect(
        uploadBytes(
          ref(storage, `users/${uid}/issues/seed-001/bad.txt`),
          new Uint8Array([1]),
          { contentType: "text/plain" },
        ),
      ).rejects.toMatchObject({ code: "storage/unauthorized" });
    }, 20_000);
  },
);
