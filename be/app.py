from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

# Note:
# The upstream microburbs API sometimes returns non-standard JSON tokens such as bare
# NaN or Infinity, or uses strings like "nan" or "None" to indicate missing values.
# Those are not valid JSON and break some clients. This service reads the raw response
# text and sanitizes it by mapping NaN/Infinity and common string markers to JSON null
# (Python None) before returning the payload to clients.
#
# Quick PowerShell test (run while the server is running):
#   curl http://127.0.0.1:5000/api/properties | Out-File -Encoding utf8 -FilePath response.json
#   Get-Content .\response.json -TotalCount 200

# API Configuration
API_BASE_URL = "https://www.microburbs.com.au/report_generator/api/suburb/properties"
API_TOKEN = "test"

@app.route('/api/properties')
def get_properties():
    suburb = request.args.get('suburb', 'Belmont North')
    
    try:
        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(API_BASE_URL, headers=headers, params={"suburb": suburb})

        # The upstream API sometimes returns invalid JSON tokens like NaN or Infinity
        # and sometimes uses strings like "nan" or "None" for missing values.
        # Use json.loads on the raw text with parse_constant to map bare NaN/Infinity
        # to None, then walk the structure to replace string 'nan'/'none' with None.
        text = response.text

        def _replace_strings(obj):
            # recursively replace string tokens that mean missing values with None
            if isinstance(obj, dict):
                return {k: _replace_strings(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [_replace_strings(x) for x in obj]
            if isinstance(obj, str):
                if obj.strip().lower() in ("nan", "none", "null", ""):
                    return None
                return obj
            return obj

        try:
            # parse_constant handles bare NaN/Infinity -> get mapped to None
            data = json.loads(text, parse_constant=lambda x: None)
        except ValueError:
            # fallback: if upstream returned something odd, try a permissive replace
            safe = text.replace('NaN', 'null').replace('Infinity', 'null')
            data = json.loads(safe)

        cleaned = _replace_strings(data)

        return jsonify(cleaned)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Flask running on http://localhost:5000")
    app.run(debug=True, port=5000)