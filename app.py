from flask import Flask, request, jsonify, send_file
import json
import yaml
import os
import tempfile

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/convert', methods=['POST'])
def convert_json_to_yaml():
    # Verifică dacă există fișiere JSON în cererea utilizatorului
    if 'file1' not in request.files or 'file2' not in request.files:
        return jsonify({'error': 'Two files must be provided'}), 400

    json_file1 = request.files['file1']
    json_file2 = request.files['file2']

    # Verifică dacă fișierele au extensia .json
    if not json_file1.filename.endswith('.json') or not json_file2.filename.endswith('.json'):
        return jsonify({'error': 'Both files must be JSON files'}), 400

    try:
        # Citește conținutul fișierelor JSON și le încarcă
        json_data1 = json.load(json_file1)
        json_data2 = json.load(json_file2)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    # Convertește JSON-urile în YAML
    yaml_data1 = yaml.dump(json_data1, default_flow_style=False)
    yaml_data2 = yaml.dump(json_data2, default_flow_style=False)

    # Scrie informațiile YAML în fișiere temporare
    temp_dir = tempfile.gettempdir()
    yaml_file_path1 = os.path.join(temp_dir, os.path.splitext(json_file1.filename)[0] + '.yaml')
    yaml_file_path2 = os.path.join(temp_dir, os.path.splitext(json_file2.filename)[0] + '.yaml')

    with open(yaml_file_path1, 'w') as f1:
        f1.write(yaml_data1)

    with open(yaml_file_path2, 'w') as f2:
        f2.write(yaml_data2)

    # Returnează fișierele YAML utilizatorului
    return jsonify({
        'file1': f'/download/{os.path.basename(yaml_file_path1)}',
        'file2': f'/download/{os.path.basename(yaml_file_path2)}'
    })

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
