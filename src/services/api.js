/**
 * API Service for Colorimetric Drug Test-Kit ML Model Backend
 * Connects to Python REST backend configured via VITE_API_URL
 */

const getApiBaseUrl = () => {
  // If explicitly set and not plain localhost:5000, use it
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000') {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // When running in browser (especially over ngrok / HTTPS / LAN), use relative endpoint
  // so Vite's dev server proxy securely forwards /api to localhost:5000 without Mixed Content blocks
  return '';
};

const API_BASE_URL = getApiBaseUrl();

export const OFFICIAL_DISCLAIMER =
  'This digital analysis provides a presumptive field-test result based on visual colourimetric calibration. It does NOT replace official laboratory confirmatory testing (e.g., GC-MS / LC-MS). Confirmatory laboratory evidence must be submitted for formal legal proceedings.';

/**
 * Checks connection and operational status of the ML Model Backend
 */
export async function checkModelHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        modelLoaded: Boolean(data.modelLoaded),
        modelName: data.modelName || 'NAAMII SVM Classifier',
        accuracy: data.svmAccuracy ? `${(data.svmAccuracy * 100).toFixed(1)}%` : '82.6%',
        url: API_BASE_URL || window.location.origin,
      };
    }
  } catch (err) {
    // Model backend is offline / unreachable
  }

  return {
    connected: false,
    modelLoaded: false,
    modelName: null,
    accuracy: null,
    url: API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'),
    error: 'ML Model Server Disconnected. Ensure python ml-backend/app.py is running on port 5000.',
  };
}

/**
 * Sends captured test-kit image and metadata to the ML Model for inference
 * @param {Blob} imageBlob - The captured JPEG frame
 * @param {Object} metadata - Test metadata { testId, caseId, sampleId, category, officerId, timestamp }
 */
export async function analyzeImage(imageBlob, metadata = {}) {
  const formData = new FormData();
  formData.append('image', imageBlob, `${metadata.testId || 'test_capture'}.jpg`);
  formData.append('metadata', JSON.stringify(metadata));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        connected: true,
        source: 'ML_API',
        modelName: 'NAAMII Colorimetric Model (SVM/RF)',
        result: data.result, // 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE'
        confidence: typeof data.confidence === 'number' ? data.confidence : null,
        mlClass: data.mlClass || null,
        deltaE: data.deltaE || null,
        chromophore: data.chromophore || null,
        referenceColor: data.referenceColor || null,
        notes: data.notes || 'Colorimetric reaction profile analyzed by trained ML model.',
        disclaimer: OFFICIAL_DISCLAIMER,
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        connected: true,
        error: `ML API responded with error HTTP ${response.status}: ${errorText}`,
        disclaimer: OFFICIAL_DISCLAIMER,
      };
    }
  } catch (error) {
    console.error('ML API connection error:', error);
    return {
      success: false,
      connected: false,
      error: `ML model server at ${API_BASE_URL} is currently unreachable.`,
      disclaimer: OFFICIAL_DISCLAIMER,
    };
  }
}

export { API_BASE_URL };
