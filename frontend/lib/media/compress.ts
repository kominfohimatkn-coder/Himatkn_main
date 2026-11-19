const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_DIMENSION_PX = 2400;
const SIZE_TRIGGER_BYTES = 3.5 * 1024 * 1024;
const MAX_RESULT_BYTES = 3.8 * 1024 * 1024;
const JPEG_QUALITIES = [0.85, 0.75, 0.65] as const;

async function decodeImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      throw new Error("File gambar tidak valid atau gagal dibaca.");
    }
  }
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal mengompres gambar."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function toJpgFilename(originalName: string): string {
  const trimmed = originalName.trim();
  if (!trimmed) {
    return "image.jpg";
  }
  const base = trimmed.replace(/\.[^.]+$/, "");
  return `${base || "image"}.jpg`;
}

/**
 * Mengompres dan mengecilkan gambar sebelum diunggah agar tidak melebihi
 * batas payload backend/Vercel (~4 MB).
 */
export async function compressImageForUpload(file: File): Promise<File> {
  const mimeType = file.type.toLowerCase();

  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error(
      "Format gambar tidak didukung. Gunakan file JPG, PNG, atau WebP.",
    );
  }

  const bitmap = await decodeImage(file);

  try {
    const longestSide = Math.max(bitmap.width, bitmap.height);

    if (longestSide <= MAX_DIMENSION_PX && file.size <= SIZE_TRIGGER_BYTES) {
      return file;
    }

    const scale =
      longestSide > MAX_DIMENSION_PX ? MAX_DIMENSION_PX / longestSide : 1;
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Browser tidak mendukung pemrosesan gambar.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    for (const quality of JPEG_QUALITIES) {
      const blob = await canvasToJpegBlob(canvas, quality);

      if (blob.size <= MAX_RESULT_BYTES) {
        return new File([blob], toJpgFilename(file.name), {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });
      }
    }

    throw new Error(
      "Ukuran gambar masih melebihi 3,8 MB setelah dikompres. Pilih gambar lain atau perkecil resolusinya.",
    );
  } finally {
    bitmap.close();
  }
}
