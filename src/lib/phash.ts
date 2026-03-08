/**
 * Perceptual hashing for face recognition.
 * Generates a robust binary hash from an image using dual-hash strategy.
 */

type HashComparison = {
  distance: number;
  bits: number;
  ratio: number;
};

const FACE_DETECTION_TIMEOUT_MS = 180;

const toCanvas = (img: HTMLImageElement | HTMLCanvasElement) => {
  if (img instanceof HTMLCanvasElement) return img;
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0);
  return canvas;
};

const cropCenterSquare = (canvas: HTMLCanvasElement) => {
  const size = Math.min(canvas.width, canvas.height);
  const sx = Math.max(0, Math.floor((canvas.width - size) / 2));
  const sy = Math.max(0, Math.floor((canvas.height - size) / 2));

  const next = document.createElement('canvas');
  next.width = size;
  next.height = size;
  const ctx = next.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(canvas, sx, sy, size, size, 0, 0, size, size);
  return next;
};

const tryCropPrimaryFace = async (canvas: HTMLCanvasElement) => {
  const FaceDetectorCtor = (window as unknown as { FaceDetector?: new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => { detect: (src: HTMLCanvasElement) => Promise<Array<{ boundingBox: { x: number; y: number; width: number; height: number } }>> } }).FaceDetector;
  if (!FaceDetectorCtor) return cropCenterSquare(canvas);

  const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });

  const detections = await Promise.race([
    detector.detect(canvas),
    new Promise<Array<{ boundingBox: { x: number; y: number; width: number; height: number } }>>((resolve) =>
      setTimeout(() => resolve([]), FACE_DETECTION_TIMEOUT_MS)
    ),
  ]);

  if (!detections.length) return cropCenterSquare(canvas);

  const box = detections[0].boundingBox;
  const pad = Math.max(box.width, box.height) * 0.35;
  const sx = Math.max(0, Math.floor(box.x - pad));
  const sy = Math.max(0, Math.floor(box.y - pad));
  const sw = Math.min(canvas.width - sx, Math.floor(box.width + pad * 2));
  const sh = Math.min(canvas.height - sy, Math.floor(box.height + pad * 2));

  const next = document.createElement('canvas');
  next.width = Math.max(1, sw);
  next.height = Math.max(1, sh);
  const ctx = next.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, next.width, next.height);
  return next;
};

const grayscale = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const tmp = document.createElement('canvas');
  tmp.width = width;
  tmp.height = height;
  const ctx = tmp.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(canvas, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  const output: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    output.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return output;
};

const averageHash = (canvas: HTMLCanvasElement) => {
  const gray = grayscale(canvas, 8, 8);
  const sorted = [...gray].sort((a, b) => a - b);
  const trimmed = sorted.slice(4, 60);
  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  return gray.map(v => (v >= avg ? '1' : '0')).join('');
};

const differenceHash = (canvas: HTMLCanvasElement) => {
  const gray = grayscale(canvas, 9, 8);
  const bits: string[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = gray[y * 9 + x];
      const right = gray[y * 9 + x + 1];
      bits.push(left > right ? '1' : '0');
    }
  }
  return bits.join('');
};

export async function generatePerceptualHash(imageSource: HTMLImageElement | HTMLCanvasElement | string): Promise<string> {
  const process = async (img: HTMLImageElement | HTMLCanvasElement) => {
    const sourceCanvas = toCanvas(img);
    const cropped = await tryCropPrimaryFace(sourceCanvas).catch(() => cropCenterSquare(sourceCanvas));
    return `${averageHash(cropped)}${differenceHash(cropped)}`;
  };

  if (typeof imageSource === 'string') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const isDataLike = imageSource.startsWith('data:') || imageSource.startsWith('blob:');
      if (!isDataLike) img.crossOrigin = 'anonymous';
      img.onload = () => {
        void process(img).then(resolve).catch(reject);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSource;
    });
  }

  return process(imageSource);
}

export function hammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  const len = Math.min(hash1.length, hash2.length);
  for (let i = 0; i < len; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  distance += Math.abs(hash1.length - hash2.length);
  return distance;
}

export function compareHashes(hash1: string, hash2: string): HashComparison {
  const h1 = hash1 || '';
  const h2 = hash2 || '';
  if (!h1 || !h2) return { distance: Infinity, bits: 1, ratio: 1 };

  // Backward compatibility with old 64-bit hashes vs new 128-bit hashes.
  if ((h1.length === 64 && h2.length === 128) || (h1.length === 128 && h2.length === 64)) {
    const shortHash = h1.length < h2.length ? h1 : h2;
    const longHash = h1.length > h2.length ? h1 : h2;
    const first = hammingDistance(shortHash, longHash.slice(0, 64));
    const second = hammingDistance(shortHash, longHash.slice(64, 128));
    const best = Math.min(first, second);
    return { distance: best, bits: 64, ratio: best / 64 };
  }

  const bits = Math.max(h1.length, h2.length);
  const distance = hammingDistance(h1, h2);
  return { distance, bits, ratio: bits > 0 ? distance / bits : 1 };
}

export interface MatchResult {
  recognized: boolean;
  name?: string;
  relationship?: string;
  confidence?: number;
  personId?: string;
}

export function findMatch(
  newHash: string,
  people: Array<{ id: string; name: string; relationship: string; photo_hashes?: string[] }>
): MatchResult {
  let bestMatch: MatchResult = { recognized: false };
  let bestRatio = Infinity;

  for (const person of people) {
    if (!person.photo_hashes || person.photo_hashes.length === 0) continue;
    for (const storedHash of person.photo_hashes) {
      const { ratio } = compareHashes(newHash, storedHash);
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestMatch = {
          recognized: ratio <= 0.4,
          name: person.name,
          relationship: person.relationship,
          confidence: Math.round((1 - Math.min(1, ratio)) * 100),
          personId: person.id,
        };
      }
    }
  }

  if (bestMatch.recognized) return bestMatch;
  return { recognized: false };
}
