import json

with open('E:/repoig inversa/guatoca_web/data/game_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

corrupt_samples = []

def check_obj(o, path=''):
    if isinstance(o, str):
        if '' in o or '?' in o and ('¿' not in o and o.startswith('?')):
            corrupt_samples.append((path, o))
    elif isinstance(o, dict):
        for k, v in o.items():
            check_obj(v, f'{path}.{k}')
    elif isinstance(o, list):
        for idx, item in enumerate(o):
            check_obj(item, f'{path}[{idx}]')

check_obj(data)
print(f'Total corrupt samples found: {len(corrupt_samples)}')
for p, s in corrupt_samples[:20]:
    print(f'{p}: {repr(s)}')
