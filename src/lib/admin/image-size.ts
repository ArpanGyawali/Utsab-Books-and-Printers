/**
 * Minimal JPEG/PNG dimension reader for admin uploads. sharp isn't a
 * dependency of this project, and next/image wants intrinsic sizes for
 * remote files — so we read them from the header bytes at upload time.
 * Returns null when the header can't be parsed (caller stores null and the
 * public page falls back to a layout-shift-tolerant default).
 */

export function imageSize(
  bytes: Uint8Array,
  mime: string
): { w: number; h: number } | null {
  try {
    if (mime === "image/png") return pngSize(bytes);
    if (mime === "image/jpeg") return jpegSize(bytes);
    return null;
  } catch {
    return null;
  }
}

function u32(b: Uint8Array, off: number): number {
  return (b[off] << 24) | (b[off + 1] << 16) | (b[off + 2] << 8) | b[off + 3];
}

function pngSize(b: Uint8Array): { w: number; h: number } | null {
  // 8-byte signature, then IHDR: length(4) "IHDR"(4) width(4) height(4)
  const isPng =
    b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (!isPng) return null;
  const w = u32(b, 16);
  const h = u32(b, 20);
  return w > 0 && h > 0 ? { w, h } : null;
}

function jpegSize(b: Uint8Array): { w: number; h: number } | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let off = 2;
  while (off + 9 < b.length) {
    if (b[off] !== 0xff) return null;
    const marker = b[off + 1];
    // SOF0–SOF15 carry dimensions, except DHT(C4)/JPG(C8)/DAC(CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      const h = (b[off + 5] << 8) | b[off + 6];
      const w = (b[off + 7] << 8) | b[off + 8];
      return w > 0 && h > 0 ? { w, h } : null;
    }
    off += 2 + ((b[off + 2] << 8) | b[off + 3]);
  }
  return null;
}
