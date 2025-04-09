import json

def load_json_file(filepath):
    with open(filepath) as f:
        return json.load(f)
def clean_rag_facts(text: str, max_lines: int = 10) -> str:
    """Deduplicate and trim retrieved facts to avoid repetition."""
    lines = list(dict.fromkeys(text.strip().splitlines()))
    return "\n".join(lines[:max_lines])
