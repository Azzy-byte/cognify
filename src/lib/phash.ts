/**
 * Perceptual hashing for face recognition.
 * Generates a 64-char binary string hash from an image.
 * Uses DCT-like average hash for better perceptual matching.
 */
export function generatePerceptualHash(imageSource: HTMLImageElement | HTMLCanvasElement | string): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = (img: HTMLImageElement | HTMLCanvasElement) => {
      try {
        // Step 1: Downscale to 8x8 grayscale
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }

        canvas.width = 8;
        canvas.height = 8;
        ctx.drawImage(img, 0, 0, 8, 8);
        const data = ctx.getImageData(0, 0, 8, 8).data;

        // Convert to grayscale
        const gray: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }

        // Compute average (excluding extremes for better robustness)
        const sorted = [...gray].sort((a, b) => a - b);
        const trimmed = sorted.slice(4, 60); // trim top/bottom 4 values
        const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;

        // Generate hash
        const hash = gray.map(v => v >= avg ? '1' : '0').join('');
        resolve(hash);
      } catch (e) {
        reject(e);
      }
    };

    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => process(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSource;
    } else {
      process(imageSource);
    }
  });
}

export function hammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  const len = Math.min(hash1.length, hash2.length);
  for (let i = 0; i < len; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
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
  // More lenient threshold for perceptual matching (out of 64 bits)
  const threshold = 22;
  let bestMatch: MatchResult = { recognized: false };
  let bestDistance = Infinity;

  for (const person of people) {
    if (!person.photo_hashes || person.photo_hashes.length === 0) continue;
    for (const storedHash of person.photo_hashes) {
      const distance = hammingDistance(newHash, storedHash);
      if (distance < threshold && distance < bestDistance) {
        bestDistance = distance;
        bestMatch = {
          recognized: true,
          name: person.name,
          relationship: person.relationship,
          confidence: Math.round((1 - distance / 64) * 100),
          personId: person.id,
        };
      }
    }
  }

  return bestMatch;
}
