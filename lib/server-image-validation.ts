const MAX_DIMENSION = 12_000;
const MAX_PIXELS = 40_000_000;

export type SafeImage = { bytes: Uint8Array; contentType: "image/jpeg" | "image/png" | "image/webp"; extension: "jpg" | "png" | "webp" };

function dimensions(bytes: Uint8Array, type: SafeImage["contentType"]) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (type === "image/png") return { width: view.getUint32(16), height: view.getUint32(20) };
  if (type === "image/webp") {
    const kind = String.fromCharCode(...bytes.slice(12, 16));
    if (kind === "VP8X") return { width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16), height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16) };
    if (kind === "VP8L") {
      const bits = view.getUint32(21, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  }
  for (let offset = 2; offset + 9 < bytes.length;) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + length + 2 > bytes.length) return null;
    if (marker >= 0xc0 && marker <= 0xc3) return { height: (bytes[offset + 5] << 8) | bytes[offset + 6], width: (bytes[offset + 7] << 8) | bytes[offset + 8] };
    offset += length + 2;
  }
  return null;
}

// Remove JPEG APP1 segments (EXIF/XMP, including GPS) without decoding pixels.
function stripJpegMetadata(bytes: Uint8Array) {
  const chunks: Uint8Array[] = [bytes.slice(0, 2)];
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda) { chunks.push(bytes.slice(offset)); break; }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + length + 2 > bytes.length) throw new Error("invalid_image");
    if (marker !== 0xe1) chunks.push(bytes.slice(offset, offset + length + 2));
    offset += length + 2;
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total); let cursor = 0;
  for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

export async function validateAndSanitizeImage(file: File, maxBytes: number): Promise<SafeImage> {
  if (file.size < 24 || file.size > maxBytes) throw new Error("invalid_image");
  const original = new Uint8Array(await file.arrayBuffer());
  let contentType: SafeImage["contentType"]; let extension: SafeImage["extension"];
  if (original[0] === 0xff && original[1] === 0xd8) { contentType = "image/jpeg"; extension = "jpg"; }
  else if ([137,80,78,71,13,10,26,10].every((value, index) => original[index] === value)) { contentType = "image/png"; extension = "png"; }
  else if (String.fromCharCode(...original.slice(0, 4)) === "RIFF" && String.fromCharCode(...original.slice(8, 12)) === "WEBP") { contentType = "image/webp"; extension = "webp"; }
  else throw new Error("invalid_image");
  const size = dimensions(original, contentType);
  if (!size || size.width < 1 || size.height < 1 || size.width > MAX_DIMENSION || size.height > MAX_DIMENSION || size.width * size.height > MAX_PIXELS) throw new Error("invalid_image_dimensions");
  return { bytes: contentType === "image/jpeg" ? stripJpegMetadata(original) : original, contentType, extension };
}
