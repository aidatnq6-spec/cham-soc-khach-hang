import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
  type DocumentReference,
  type DocumentData,
} from "firebase/firestore";
import { getFirebase } from "./client";
import { issueSchema, migrationSource } from "@/lib/domain/schema";
import type { Dataset, Issue, Progress } from "@/types";

const root = (uid: string) =>
  doc(getFirebase().db, "users", uid, "app", "main");
const genRef = (uid: string, generation: string) =>
  doc(collection(root(uid), "generations"), generation);
export const issueCollectionPath = (uid: string, generation: string) =>
  `users/${uid}/app/main/generations/${generation}/issues`;
const conflict = () =>
  new Error("Dữ liệu đã thay đổi trên thiết bị khác. Tải bản mới và thử lại.");
function assertImages(uid: string, issues: Issue[]) {
  for (const issue of issues)
    for (const image of issue.images) {
      if (
        !image.startsWith("data:") &&
        !image.startsWith(`users/${uid}/issues/`)
      )
        throw new Error(
          "Ảnh thuộc tài khoản khác. Hãy nhập bản sao lưu có ảnh nhúng.",
        );
    }
}

export async function ensureMigrated(
  uid: string,
  local: unknown,
): Promise<void> {
  const main = root(uid);
  const token = crypto.randomUUID();
  const prepared = await runTransaction(getFirebase().db, async (tx) => {
    const snap = await tx.get(main);
    const meta = snap.data() ?? {};
    if (meta.schemaVersion === 2) return null;
    if (meta.migration?.leaseUntil > Date.now())
      throw new Error(
        "Một thiết bị khác đang chuyển dữ liệu. Vui lòng thử lại sau 2 phút.",
      );
    const source = migrationSource(meta.state, local);
    assertImages(uid, source.issues);
    const generation =
      meta.migration?.generation ?? `migrate-${crypto.randomUUID()}`;
    tx.set(
      main,
      {
        ...(meta.state == null
          ? { state: { issues: source.issues, progress: source.progress } }
          : {}),
        migration: { token, generation, leaseUntil: Date.now() + 120_000 },
      },
      { merge: true },
    );
    return { source, generation };
  });
  if (!prepared) return;
  const { source, generation } = prepared;
  for (let start = 0; start < source.issues.length; start += 100) {
    const chunk = source.issues.slice(start, start + 100);
    await runTransaction(getFirebase().db, async (tx) => {
      const snap = await tx.get(main);
      if (
        snap.data()?.migration?.token !== token ||
        snap.data()?.schemaVersion === 2
      )
        throw conflict();
      for (const issue of chunk) {
        tx.set(doc(collection(genRef(uid, generation), "issues"), issue.id), {
          ...issue,
          revision: 1,
        });
        tx.set(
          doc(collection(genRef(uid, generation), "progress"), issue.id),
          source.progress[issue.id] ?? { checked: {}, views: 0 },
        );
      }
      tx.update(main, { "migration.leaseUntil": Date.now() + 120_000 });
    });
  }
  await runTransaction(getFirebase().db, async (tx) => {
    const snap = await tx.get(main);
    if (snap.data()?.migration?.token !== token) throw conflict();
    tx.set(
      main,
      {
        schemaVersion: 2,
        activeGeneration: generation,
        stateVersion: 1,
        migration: { token, generation, leaseUntil: 0, completed: true },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export function subscribeDataset(
  uid: string,
  next: (data: Dataset, generation: string) => void,
  failed: (error: Error) => void,
) {
  let stopChildren: (() => void)[] = [];
  let current = "";
  const stopMain = onSnapshot(
    root(uid),
    (snapshot) => {
      const generation = snapshot.data()?.activeGeneration as
        string | undefined;
      if (!generation || generation === current) return;
      stopChildren.forEach((stop) => stop());
      current = generation;
      let issues: Issue[] | null = null;
      let progress: Dataset["progress"] | null = null;
      const publish = () => {
        if (issues && progress) next({ issues, progress }, generation);
      };
      stopChildren = [
        onSnapshot(
          collection(genRef(uid, generation), "issues"),
          (snap) => {
            try {
              issues = snap.docs.map((d) =>
                issueSchema.parse({ ...d.data(), id: d.id }),
              );
              publish();
            } catch {
              failed(
                new Error(
                  "Có kịch bản không hợp lệ trên Firebase. Dữ liệu gốc vẫn được giữ.",
                ),
              );
            }
          },
          failed,
        ),
        onSnapshot(
          collection(genRef(uid, generation), "progress"),
          (snap) => {
            progress = Object.fromEntries(
              snap.docs.map((d) => [
                d.id,
                { checked: d.data().checked ?? {}, views: d.data().views ?? 0 },
              ]),
            );
            publish();
          },
          failed,
        ),
      ];
    },
    failed,
  );
  return () => {
    stopMain();
    stopChildren.forEach((stop) => stop());
  };
}

async function editRecord(
  uid: string,
  generation: string,
  id: string,
  issue: Issue | null,
  expectedRevision: number,
) {
  const main = root(uid);
  const target = doc(collection(genRef(uid, generation), "issues"), id);
  await runTransaction(getFirebase().db, async (tx) => {
    const meta = await tx.get(main);
    const existing = await tx.get(target);
    if (
      meta.data()?.activeGeneration !== generation ||
      (existing.data()?.revision ?? 0) !== expectedRevision
    )
      throw conflict();
    if (issue) tx.set(target, { ...issue, revision: expectedRevision + 1 });
    else {
      tx.delete(target);
      tx.delete(doc(collection(genRef(uid, generation), "progress"), id));
    }
    tx.update(main, {
      stateVersion: (meta.data()?.stateVersion ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });
  });
}
export async function saveIssue(uid: string, generation: string, issue: Issue) {
  const clean = issueSchema.parse(issue);
  assertImages(uid, [clean]);
  await editRecord(uid, generation, clean.id, clean, clean.revision);
}
export async function deleteIssue(
  uid: string,
  generation: string,
  issue: Issue,
) {
  await editRecord(uid, generation, issue.id, null, issue.revision);
}
export async function updateProgress(
  uid: string,
  generation: string,
  id: string,
  change: { step?: string; checked?: boolean; reset?: boolean; view?: boolean },
) {
  const main = root(uid);
  const reference = doc(collection(genRef(uid, generation), "progress"), id);
  await runTransaction(getFirebase().db, async (tx) => {
    const meta = await tx.get(main);
    const issue = await tx.get(
      doc(collection(genRef(uid, generation), "issues"), id),
    );
    const snap = await tx.get(reference);
    if (meta.data()?.activeGeneration !== generation || !issue.exists())
      throw conflict();
    const previous = snap.data() as Progress | undefined;
    const checked = change.reset ? {} : { ...previous?.checked };
    if (change.step !== undefined) checked[change.step] = !!change.checked;
    tx.set(reference, {
      checked,
      views: (previous?.views ?? 0) + (change.view ? 1 : 0),
    });
    tx.update(main, { stateVersion: (meta.data()?.stateVersion ?? 0) + 1 });
  });
}

export async function replaceDataset(
  uid: string,
  activeGeneration: string,
  data: Dataset,
) {
  assertImages(uid, data.issues);
  const main = root(uid);
  const before = (await getDoc(main)).data();
  if (before?.activeGeneration !== activeGeneration) throw conflict();
  const generation = `import-${crypto.randomUUID()}`;
  const records: [DocumentReference<DocumentData>, DocumentData][] =
    data.issues.flatMap(
      (issue) =>
        [
          [
            doc(collection(genRef(uid, generation), "issues"), issue.id),
            { ...issue, revision: 1 },
          ],
          [
            doc(collection(genRef(uid, generation), "progress"), issue.id),
            data.progress[issue.id] ?? { checked: {}, views: 0 },
          ],
        ] as [DocumentReference<DocumentData>, DocumentData][],
    );
  for (let start = 0; start < records.length; start += 300) {
    const batch = writeBatch(getFirebase().db);
    records
      .slice(start, start + 300)
      .forEach(([ref, value]) => batch.set(ref, value));
    await batch.commit();
  }
  // Only flip the pointer after every staged record succeeds; concurrent edits abort replacement.
  await runTransaction(getFirebase().db, async (tx) => {
    const meta = (await tx.get(main)).data();
    if (
      meta?.activeGeneration !== activeGeneration ||
      meta?.stateVersion !== before.stateVersion
    )
      throw conflict();
    tx.update(main, {
      activeGeneration: generation,
      stateVersion: meta.stateVersion + 1,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function readServerIndependentDataset(
  uid: string,
  generation: string,
) {
  const [issues, progress] = await Promise.all([
    getDocs(collection(genRef(uid, generation), "issues")),
    getDocs(collection(genRef(uid, generation), "progress")),
  ]);
  return {
    issues: issues.docs.map((d) =>
      issueSchema.parse({ ...d.data(), id: d.id }),
    ),
    progress: Object.fromEntries(
      progress.docs.map((d) => [d.id, d.data() as Progress]),
    ),
  };
}
