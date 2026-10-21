import { getBytes, ref, uploadBytes } from "firebase/storage";
import { getFirebase } from "./client";
import type { Dataset } from "@/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export async function compressImage(file: File): Promise<Blob> {
  if (
    !/^image\/(png|jpeg|webp)$/.test(file.type) ||
    file.size > 20 * 1024 * 1024
  )
    throw new Error("Chọn ảnh PNG, JPEG hoặc WebP tối đa 20 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Không nén được ảnh.")),
        "image/jpeg",
        0.82,
      ),
    );
  } finally {
    bitmap.close();
  }
}
export async function uploadImages(
  uid: string,
  issueId: string,
  files: File[],
) {
  const paths: string[] = [];
  for (const file of files) {
    const blob = await compressImage(file);
    const path = `users/${uid}/issues/${issueId}/${crypto.randomUUID()}.jpg`;
    await uploadBytes(ref(getFirebase().storage, path), blob, {
      contentType: "image/jpeg",
    });
    paths.push(path);
  }
  return paths;
}
export async function imageBlob(source: string): Promise<Blob> {
  if (source.startsWith("data:")) return (await fetch(source)).blob();
  const bytes = await getBytes(
    ref(getFirebase().storage, source),
    MAX_IMAGE_BYTES,
  );
  return new Blob([bytes], { type: "image/jpeg" });
}
export async function imageData(source: string) {
  if (source.startsWith("data:")) return source;
  const blob = await imageBlob(source);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
export async function portableDataset(data: Dataset): Promise<Dataset> {
  const result = structuredClone(data);
  for (const issue of result.issues)
    issue.images = await Promise.all(issue.images.map(imageData));
  return result;
}
export async function storeEmbeddedImages(
  uid: string,
  data: Dataset,
): Promise<Dataset> {
  const result = structuredClone(data);
  for (const issue of result.issues) {
    for (let index = 0; index < issue.images.length; index++) {
      const image = issue.images[index];
      if (!image.startsWith("data:")) continue;
      const blob = await imageBlob(image);
      const extension =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";
      const path = `users/${uid}/issues/${issue.id}/${crypto.randomUUID()}.${extension}`;
      await uploadBytes(ref(getFirebase().storage, path), blob, {
        contentType: blob.type,
      });
      issue.images[index] = path;
    }
  }
  return result;
}
export async function copyImage(source: string) {
  if (!navigator.clipboard?.write || !window.ClipboardItem)
    throw new Error("Trình duyệt chưa hỗ trợ copy ảnh. Hãy dùng nút Tải ảnh.");
  // Start the clipboard write within the user gesture; Safari accepts a promised blob.
  const png = imageBlob(source).then(async (blob) => {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      throw new Error("Không chuyển được ảnh.");
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Không chuyển được ảnh."))),
        "image/png",
      ),
    );
  });
  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}
