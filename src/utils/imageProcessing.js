/**
 * Image Processing & Canvas Utilities
 * Validates optical capture, calculates luminance/contrast, and compresses frames.
 */

/**
 * Validates image Blob dimensions and lighting quality
 */
export async function validateImage(imageBlob) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      // Create offscreen canvas to sample luminance
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const sampleWidth = Math.min(width, 240);
      const sampleHeight = Math.min(height, 180);
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      const data = imageData.data;

      let totalLuminance = 0;
      let count = 0;
      let specularGlarePixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        totalLuminance += lum;
        count++;

        if (r > 248 && g > 248 && b > 248) {
          specularGlarePixels++;
        }
      }

      const meanLuminance = count > 0 ? Math.round(totalLuminance / count) : 128;
      const glareRatio = count > 0 ? specularGlarePixels / count : 0;

      const warnings = [];
      if (width < 640 || height < 480) {
        warnings.push(`Low resolution (${width}x${height}). Recommend 1080p.`);
      }
      if (meanLuminance < 35) {
        warnings.push('Image is excessively dark. Increase ambient lighting.');
      } else if (meanLuminance > 235) {
        warnings.push('Image has excessive brightness or washout.');
      }
      if (glareRatio > 0.12) {
        warnings.push('Specular reflection / glare detected in reaction area.');
      }

      resolve({
        valid: warnings.length === 0,
        warnings,
        metrics: {
          width,
          height,
          resolution: `${width}x${height}`,
          luminance: meanLuminance,
          glareRatio: Number((glareRatio * 100).toFixed(1)),
        },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        warnings: ['Failed to read image data.'],
        metrics: { width: 0, height: 0, resolution: '0x0', luminance: 0, glareRatio: 0 },
      });
    };

    img.src = url;
  });
}

/**
 * Resizes and compresses an image blob to optimal dimensions (max 1920x1080, quality 0.90)
 */
export async function resizeAndCompressImage(imageBlob, maxDimension = 1920, quality = 0.90) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (compressedBlob) => {
          resolve(compressedBlob || imageBlob);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(imageBlob);
    };

    img.src = url;
  });
}

/**
 * Converts a Blob to a base64 Data URL string
 */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
