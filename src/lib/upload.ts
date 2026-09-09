/**
 * Checks for the photo someone attaches to the share form. They run in the
 * browser before the file leaves the phone, and live here so they can be
 * unit tested without a DOM.
 */

/** Types the file picker offers. Every one must be confirmable by the sniffer. */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
] as const;

/** How much of the head of a file to read: enough to clear an ftyp brand. */
export const SNIFF_BYTES = 32;

const ascii = (value: string) => Array.from(value, (character) => character.charCodeAt(0));

/** True when the bytes at this offset match the signature, false past the end. */
const at = (bytes: Uint8Array, offset: number, signature: number[]) =>
  signature.every((byte, index) => bytes[offset + index] === byte);

/** ISO base media brands that mean a still image rather than a video. */
const HEIF_BRANDS = ['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs', 'mif1', 'msf1'];

/**
 * The image type a file's own bytes claim to be, or null for anything else.
 * The MIME type a browser reports is derived from the file name and is trivial
 * to fake, so this reads the signature instead. Markup formats such as SVG
 * have no binary signature, so they fall into the null case by construction.
 */
export function sniffImageType(bytes: Uint8Array): string | null {
  if (at(bytes, 0, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (at(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (at(bytes, 0, ascii('RIFF')) && at(bytes, 8, ascii('WEBP'))) return 'image/webp';
  if (at(bytes, 0, ascii('GIF87a')) || at(bytes, 0, ascii('GIF89a'))) return 'image/gif';
  if (at(bytes, 4, ascii('ftyp')) && HEIF_BRANDS.some((brand) => at(bytes, 8, ascii(brand)))) {
    return 'image/heic';
  }
  return null;
}
