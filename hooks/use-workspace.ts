"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  allowedEmail,
  firebaseConfigured,
  getFirebase,
} from "@/lib/firebase/client";
import * as repository from "@/lib/firebase/repository";
import { portableDataset, storeEmbeddedImages } from "@/lib/firebase/images";
import {
  addBackup,
  cacheKey,
  migrateLocalBackups,
  readBackups,
} from "@/lib/domain/backups";
import { errorMessage, parseDataset } from "@/lib/domain/schema";
import type { Dataset, Issue } from "@/types";
import {
  readStored,
  writeStored,
  removeStored,
} from "@/lib/domain/local-store";

const empty: Dataset = { issues: [], progress: {} };
export function useWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [data, setData] = useState<Dataset>(empty);
  const [generation, setGeneration] = useState("");
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState("");
  const [fault, setFault] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const activeUser = useRef<string | null>(null);
  const operation = useRef(false);
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  }, [data]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (!firebaseConfigured) return;
    let alive = true;
    let stop: (() => void) | undefined;
    void Promise.resolve()
      .then(() => {
        if (!alive) return;
        stop = onAuthStateChanged(
          getFirebase().auth,
          (current) => {
            if (!alive) return;
            if (current && current.email?.toLowerCase() !== allowedEmail) {
              void signOut(getFirebase().auth);
              setFault("Email này không được phép sử dụng ứng dụng.");
              return;
            }
            activeUser.current = current?.uid ?? null;
            setUser(current);
            setAuthReady(true);
            setData(empty);
            setGeneration("");
            setReady(false);
          },
          (error) => {
            setFault(errorMessage(error));
            setAuthReady(true);
          },
        );
      })
      .catch((error) => {
        if (alive) {
          setFault(errorMessage(error));
          setAuthReady(true);
        }
      });
    return () => {
      alive = false;
      stop?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    let stop: (() => void) | undefined;
    let cacheRevision = 0;
    const uid = user.uid;
    async function start() {
      try {
        if (!online) {
          const stored = await readStored<Dataset>(cacheKey(uid));
          const cached =
            stored ?? JSON.parse(localStorage.getItem(cacheKey(uid)) ?? "null");
          if (!cached)
            throw new Error(
              "Chưa có dữ liệu offline trên thiết bị này. Kết nối mạng để tải lần đầu.",
            );
          if (alive) {
            setData(parseDataset(cached));
            setReady(true);
            setFault("");
          }
          return;
        }
        setReady(false);
        setFault("");
        let legacy: unknown;
        let saved: string | null = null;
        try {
          saved = localStorage.getItem("it-support-script-data-v1");
        } catch {
          /* Cloud loading must not depend on browser storage access. */
        }
        // Invalid local JSON must not hide a valid cloud state.
        if (saved) {
          try {
            legacy = JSON.parse(saved);
          } catch {
            legacy = { invalidLocalJson: true };
          }
        }
        await repository.ensureMigrated(uid, legacy);
        if (!alive) return;
        void migrateLocalBackups(uid).catch(() => {
          if (alive)
            setNotice(
              "Dữ liệu Firebase vẫn tải bình thường. Chưa chuyển được sao lưu trên thiết bị; các bản cũ vẫn được giữ.",
            );
        });
        stop = repository.subscribeDataset(
          uid,
          (snapshot, currentGeneration) => {
            if (!alive) return;
            setData(snapshot);
            latest.current = snapshot;
            setGeneration(currentGeneration);
            setReady(true);
            setFault("");
            const version = ++cacheRevision;
            void portableDataset(snapshot)
              .then(async (portable) => {
                if (!alive || version !== cacheRevision) return;
                await writeStored(cacheKey(uid), portable);
                if (!alive || version !== cacheRevision) return;
                const latestAuto = (await readBackups(uid)).find(
                  (b) => b.reason === "Sao lưu tự động hằng ngày",
                );
                if (
                  !latestAuto ||
                  Date.now() - Date.parse(latestAuto.createdAt) > 86_400_000
                )
                  await addBackup(uid, portable, "Sao lưu tự động hằng ngày");
              })
              .catch(() => {
                if (alive)
                  setNotice(
                    "Dữ liệu đã tải. Chưa lưu đủ ảnh/sao lưu offline; kiểm tra Storage hoặc dung lượng trình duyệt.",
                  );
              });
          },
          (error) => {
            if (alive) {
              setFault(errorMessage(error));
              setReady(false);
            }
          },
        );
      } catch (error) {
        if (alive) {
          setFault(errorMessage(error));
          setReady(false);
        }
      }
    }
    void start();
    return () => {
      alive = false;
      stop?.();
    };
  }, [user, online, retryKey]);

  const run = useCallback(
    async (
      work: () => Promise<void>,
      success: string,
      backupReason?: string,
    ) => {
      if (!user || !ready || !generation || !online || operation.current) {
        setFault("Kết nối mạng và chờ dữ liệu sẵn sàng trước khi thay đổi.");
        return false;
      }
      operation.current = true;
      setPending(true);
      setFault("");
      const uid = user.uid;
      try {
        if (backupReason) {
          const backup = await portableDataset(latest.current);
          if (activeUser.current !== uid) return false;
          await addBackup(uid, backup, backupReason);
        }
        if (activeUser.current !== uid) return false;
        await work();
        if (activeUser.current === uid) setNotice(success);
        return true;
      } catch (error) {
        if (activeUser.current === uid) setFault(errorMessage(error));
        return false;
      } finally {
        operation.current = false;
        setPending(false);
      }
    },
    [user, ready, generation, online],
  );

  async function login(email: string, password: string) {
    setPending(true);
    setFault("");
    try {
      if (email.trim().toLowerCase() !== allowedEmail)
        throw new Error("Email này không được phép truy cập.");
      await signInWithEmailAndPassword(
        getFirebase().auth,
        email.trim(),
        password,
      );
    } catch (error) {
      setFault(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  async function logout() {
    const uid = user?.uid;
    try {
      if (user) {
        localStorage.removeItem(cacheKey(user.uid));
        localStorage.removeItem("it-support-script-data-v1");
      }
    } catch {
      /* A blocked browser store must never prevent Firebase sign-out. */
    }
    try {
      await signOut(getFirebase().auth);
      if (uid) await removeStored(cacheKey(uid)).catch(() => {});
      setNotice("");
      setFault("");
    } catch (error) {
      setFault(errorMessage(error));
    }
  }
  return {
    user,
    authReady,
    data,
    ready,
    pending,
    online,
    notice,
    fault,
    configured: firebaseConfigured,
    setNotice,
    setFault,
    login,
    logout,
    retry: () => setRetryKey((k) => k + 1),
    run,
    save: (issue: Issue) =>
      run(
        () => repository.saveIssue(user!.uid, generation, issue),
        "Đã lưu và đồng bộ kịch bản.",
        "Trước khi lưu kịch bản",
      ),
    remove: (issue: Issue) =>
      run(
        () => repository.deleteIssue(user!.uid, generation, issue),
        "Đã xóa kịch bản.",
        "Trước khi xóa kịch bản",
      ),
    progress: (
      id: string,
      change: Parameters<typeof repository.updateProgress>[3],
    ) =>
      run(
        () => repository.updateProgress(user!.uid, generation, id, change),
        change.view ? "" : "Đã lưu checklist.",
      ),
    replace: (dataset: Dataset) =>
      run(
        async () => {
          const restored = await storeEmbeddedImages(user!.uid, dataset);
          await repository.replaceDataset(user!.uid, generation, restored);
        },
        "Đã khôi phục và đồng bộ dữ liệu.",
        "Trước khi thay thế dữ liệu",
      ),
  };
}
export type WorkspaceController = ReturnType<typeof useWorkspace>;
