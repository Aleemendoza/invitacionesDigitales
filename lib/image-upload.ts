export const MAX_IMAGE_UPLOAD_BYTES = 3_500_000;
const MAX_IMAGE_DIMENSION = 2200;

export async function prepareImageUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Elegí una imagen válida.");
  if (file.size <= MAX_IMAGE_UPLOAD_BYTES) return file;

  const image = await loadImage(file);
  let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
  let quality = 0.86;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("No pudimos preparar la imagen.");
    if (blob.size <= MAX_IMAGE_UPLOAD_BYTES || attempt === 5) {
      if (blob.size > MAX_IMAGE_UPLOAD_BYTES) throw new Error("La imagen sigue siendo demasiado pesada. Probá con otra foto.");
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
    }
    quality -= 0.12;
    if (quality < 0.5) { quality = 0.78; scale *= 0.72; }
  }
  throw new Error("No pudimos preparar la imagen.");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No pudimos leer la imagen.")); };
    image.src = url;
  });
}
