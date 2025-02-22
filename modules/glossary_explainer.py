import json

def explain(term):
    with open('data/glossary.json') as file:
        glossary = json.load(file)
    return {
        "term": term,
        "definition": glossary.get(term.lower(), "Definition not found.")
    }
