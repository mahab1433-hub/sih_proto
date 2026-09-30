"""
Flask REST API for Colorimetric ML Backend
Exposes /api/analyze, /api/health, and /api/models with full CORS support.
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from cv_analyzer import analyze_image_stream, ml_bundle

app = Flask(__name__)
# Enable CORS for frontend requests from any origin or localhost:5173
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'NAAMII Colorimetric ML Service',
        'modelLoaded': ml_bundle is not None,
        'modelName': ml_bundle['model_name'] if ml_bundle else None,
        'rfAccuracy': ml_bundle['rf_accuracy'] if ml_bundle else None,
        'svmAccuracy': ml_bundle['svm_accuracy'] if ml_bundle else None,
    })


@app.route('/api/models', methods=['GET'])
def models_info():
    if not ml_bundle:
        return jsonify({'error': 'No model loaded'}), 503

    return jsonify({
        'activeModel': ml_bundle['model_name'],
        'classes': ml_bundle['classes'],
        'featureCount': len(ml_bundle['feature_names']),
        'featureNames': ml_bundle['feature_names'],
        'metrics': {
            'svmAccuracy': ml_bundle['svm_accuracy'],
            'rfAccuracy': ml_bundle['rf_accuracy'],
            'lrAccuracy': ml_bundle['lr_accuracy'],
        },
        'datasetCitation': 'Khanal et al., Cambridge Univ Press / ChemRxiv (NAAMII 2021)',
    })


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Receives multipart/form-data:
      - 'image': JPEG or PNG frame binary
      - 'metadata': JSON metadata string with testId, kitId, sampleId, scenario
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided in form field "image"'}), 400

    file = request.files['image']
    image_bytes = file.read()

    metadata_str = request.form.get('metadata', '{}')
    try:
        metadata = json.loads(metadata_str)
    except Exception:
        metadata = {}

    try:
        result = analyze_image_stream(image_bytes, metadata)
        return jsonify(result), 200
    except Exception as e:
        print(f"Error during analysis: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting NAAMII Colorimetric ML API Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
