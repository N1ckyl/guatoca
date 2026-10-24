import json

def clean_val(v):
    if isinstance(v, str):
        return v.replace('\x80\xa6', '...').replace('\x80', '').replace('\x85', '...').replace('\x92', "'").replace('\x91', "'").replace('\x93', '"').replace('\x94', '"').replace('\x96', '-').replace('\x97', '-')
    elif isinstance(v, dict):
        return {clean_val(k): clean_val(val) for k, val in v.items()}
    elif isinstance(v, list):
        return [clean_val(x) for x in v]
    return v

for path in ['E:/repoig inversa/guatoca_web/data/labels.json', 'E:/repoig inversa/guatoca_web/data/game_data.json']:
    with open(path, 'r', encoding='utf-8') as f:
        d = json.load(f)
    cleaned = clean_val(d)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

print('Sanitized data successfully!')
