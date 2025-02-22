import json

def load_json_file(filepath):
    with open(filepath) as f:
        return json.load(f)
