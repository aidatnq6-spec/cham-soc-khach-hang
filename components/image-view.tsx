"use client";
/* Firebase images are private blobs; Next's public image optimizer cannot authenticate them. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { imageBlob } from "@/lib/firebase/images";
export function ImageView({ source, alt }: { source: string; alt: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    if (source.startsWith("data:")) return;
    let alive = true;
    let objectUrl = "";
    void imageBlob(source)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (alive) setUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);
  const src = source.startsWith("data:") ? source : url;
  return src ? (
    <img src={src} alt={alt} loading="lazy" />
  ) : (
    <p className="muted">{error ? "Chưa tải được ảnh." : "Đang tải ảnh…"}</p>
  );
}
