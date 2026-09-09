import { describe, expect, test } from 'vitest';
import { ACCEPTED_IMAGE_TYPES, SNIFF_BYTES, sniffImageType } from '../src/lib/upload';

const hex = (values: string) =>
  Uint8Array.from(values.trim().split(/\s+/).map((byte) => parseInt(byte, 16)));

const text = (value: string) => new TextEncoder().encode(value);

const join = (...parts: Uint8Array[]) => {
  const total = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    total.set(part, at);
    at += part.length;
  }
  return total;
};

/** Four bytes of box or chunk length, whatever they happen to be. */
const size = hex('00 00 00 20');

describe('sniffImageType accepts real photos', () => {
  test('reads a JPEG by its start-of-image marker', () => {
    expect(sniffImageType(join(hex('ff d8 ff e0'), text('\0\x10JFIF')))).toBe('image/jpeg');
  });

  test('reads a PNG by its eight-byte signature', () => {
    expect(sniffImageType(join(hex('89 50 4e 47 0d 0a 1a 0a'), size))).toBe('image/png');
  });

  test('reads a WebP by the WEBP tag inside its RIFF container', () => {
    expect(sniffImageType(join(text('RIFF'), size, text('WEBPVP8 ')))).toBe('image/webp');
  });

  test('reads a GIF by its version header', () => {
    expect(sniffImageType(join(text('GIF89a'), size))).toBe('image/gif');
  });

  test('reads an iPhone HEIC by the brand in its ftyp box', () => {
    expect(sniffImageType(join(size, text('ftypheic'), size))).toBe('image/heic');
  });
});

describe('sniffImageType rejects everything that is not a photo', () => {
  test('rejects an SVG, which is markup that can carry script', () => {
    expect(sniffImageType(text('<svg xmlns="http://www.w3.org/2000/svg"><script>'))).toBeNull();
  });

  test('rejects an SVG that opens with an XML declaration', () => {
    expect(sniffImageType(text('<?xml version="1.0"?><svg onload="alert(1)">'))).toBeNull();
  });

  test('rejects an HTML page', () => {
    expect(sniffImageType(text('<!DOCTYPE html><html><body><script>'))).toBeNull();
  });

  test('rejects a PDF', () => {
    expect(sniffImageType(text('%PDF-1.7\n%\xe2\xe3\xcf\xd3'))).toBeNull();
  });

  test('rejects a Windows executable', () => {
    expect(sniffImageType(join(text('MZ'), hex('90 00 03 00 00 00 04 00')))).toBeNull();
  });

  test('rejects a zip archive', () => {
    expect(sniffImageType(join(text('PK'), hex('03 04 14 00 00 00 08 00')))).toBeNull();
  });

  test('rejects a RIFF container that is not WebP, such as a WAV', () => {
    expect(sniffImageType(join(text('RIFF'), size, text('WAVEfmt ')))).toBeNull();
  });

  test('rejects an ftyp box whose brand is not a still image, such as an MP4', () => {
    expect(sniffImageType(join(size, text('ftypisom'), size))).toBeNull();
  });

  test('rejects a buffer too short to hold any signature', () => {
    expect(sniffImageType(hex('ff d8'))).toBeNull();
  });

  test('rejects an empty buffer', () => {
    expect(sniffImageType(new Uint8Array(0))).toBeNull();
  });

  test('rejects a JPEG signature that appears after the start of the file', () => {
    expect(sniffImageType(join(text('GARBAGE!'), hex('ff d8 ff e0')))).toBeNull();
  });
});

describe('accepted types and the sniffer stay in step', () => {
  test('every type offered in the file picker is one the sniffer can confirm', () => {
    const confirmable = new Set([
      sniffImageType(join(hex('ff d8 ff e0'), size)),
      sniffImageType(join(hex('89 50 4e 47 0d 0a 1a 0a'), size)),
      sniffImageType(join(text('RIFF'), size, text('WEBPVP8 '))),
      sniffImageType(join(text('GIF89a'), size)),
      sniffImageType(join(size, text('ftypheic'), size)),
    ]);
    for (const type of ACCEPTED_IMAGE_TYPES) {
      expect(confirmable).toContain(type);
    }
  });

  test('the picker never falls back to a wildcard', () => {
    expect(ACCEPTED_IMAGE_TYPES).not.toContain('image/*');
    expect(ACCEPTED_IMAGE_TYPES.join(',')).toContain('image/jpeg');
  });

  test('reads far enough into the file to clear an ftyp brand', () => {
    expect(SNIFF_BYTES).toBeGreaterThanOrEqual(12);
  });
});
