import struct, json, re, UnityPy

env = UnityPy.load('E:/repoig inversa/guatoca_extracted/apk_content/assets/bin/Data/data.unity3d')

ui_dict = {}
cards_dict = {}
levels_list = []
avatars_list = []
examples_dict = {}

def clean_spanish_text(s):
    if not isinstance(s, str):
        return s
    # Fix corrupt relics
    s = s.replace('\xad', 'í')
    s = s.replace('\x80\xa6', '...').replace('\x85', '...').replace('\x80', '')
    s = s.replace('\x91', "'").replace('\x92', "'").replace('\x93', '"').replace('\x94', '"')
    s = s.replace('\x96', '-').replace('\x97', '-')
    s = s.replace('', 'í')
    return s

def clean_obj(o):
    if isinstance(o, dict):
        return {clean_spanish_text(k): clean_obj(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [clean_obj(x) for x in o]
    elif isinstance(o, str):
        return clean_spanish_text(o)
    return o

for obj in env.objects:
    if obj.type.name == 'TextAsset':
        raw = obj.get_raw_data()
        name_len = struct.unpack('<I', raw[:4])[0]
        aligned = (4 + name_len + 3) & ~3
        name = raw[4:4+name_len].decode('utf-8', errors='ignore')
        
        script_len = struct.unpack('<I', raw[aligned:aligned+4])[0]
        script_bytes = raw[aligned+4 : aligned+4+script_len]
        
        clean_bytes = bytearray(script_bytes)
        for i in range(len(clean_bytes)):
            if clean_bytes[i] in [0x9d, 0x81, 0x8d, 0x8f, 0x90]:
                clean_bytes[i] = 0x20
                
        text = clean_bytes.decode('cp1252', errors='replace')
        text = re.sub(r',\s*([\]\}])', r'\1', text)
        
        if name == 'LevelsInfo':
            levels_list = json.loads(text)
        elif name == 'AvatarsInfo':
            avatars_list = json.loads(text)
        elif name == 'es_ES':
            if 8000 <= script_len <= 9000:
                ui_dict.update(json.loads(text))
            elif script_len > 300000:
                cards_dict.update(json.loads(text))
            elif 2500 <= script_len <= 3000:
                try:
                    examples_dict.update(json.loads(text))
                except Exception as e:
                    print('Examples parse error:', e)

if 'NaN' in cards_dict:
    del cards_dict['NaN']

ui_dict = clean_obj(ui_dict)
cards_dict = clean_obj(cards_dict)
examples_dict = clean_obj(examples_dict)

labels = {
    'modes': {
        'classic': 'CLÁSICO',
        'hammered': 'ETÍLICO',
        'hot': 'HOT',
        'couple': 'PAREJA',
        'flash': 'FLASH',
        'xxl': 'XXL',
        'nhie': 'YO NUNCA',
        'tod': 'VERDAD O RETO',
        'mlt': 'QUIÉN ES MÁS PROBABLE QUE',
        'versus': 'VERSUS'
    },
    'categories': {
        'drink': 'Pagar',
        'event': 'Evento',
        'hot': 'Hot',
        'hot1': 'Hot Nivel 1',
        'hot2': 'Hot Nivel 2',
        'hot3': 'Hot Nivel 3',
        'truth': 'Verdad',
        'dare': 'Reto',
        'nhie': 'Yo nunca',
        'mlt': 'Quién es más probable',
        'versus': 'Versus',
        'start': 'START',
        'meta': 'END'
    },
    'descriptions': {
        'classic': ui_dict.get('classic_desc', 'El tablero más equilibrado y versátil para todos los tipos de fiestas.'),
        'hammered': ui_dict.get('hammered_desc', '¿Quieres conseguir el efecto rápidamente? Juega al tablero etílico y llega como puedas a la meta.'),
        'hot': ui_dict.get('hot_desc', '¿Buscas algo más que unas risas? Solo los más valientes y calientes se atreverán a probar el tablero HOT.'),
        'couple': ui_dict.get('couple_desc', '¿Aburrido/a con tu pareja? Pasad un rato romántico conociéndoos, riendo y calentándoos con este tablero.'),
        'flash': ui_dict.get('flash_desc', '¿Buscas echar una partida rápida? Desbloquea un tablero más corto y propúlsate por sus 35 casillas hacia la meta.'),
        'xxl': ui_dict.get('xxl_desc', '¿Nunca te cansas de jugar a La Guatoca? Hazte con el tablero XXL y sus 85 casillas para disfrutar durante más tiempo.'),
        'nhie': ui_dict.get('nhie_desc', 'Únicamente frases de "Yo nunca". Beben todos los jugadores que SÍ hayan realizado la acción.'),
        'tod': ui_dict.get('tod_desc', 'Por turnos, cada jugador elige entre Verdad o Reto y bebe si no es lo suficientemente valiente como para cumplir con su frase.'),
        'mlt': ui_dict.get('mlt_desc', 'Solo frases de "¿Quién es más probable que...?". A la cuenta de 3, señalen a quien crean que encaja. El más señalado bebe.'),
        'versus': ui_dict.get('versus_desc', 'Ponte a prueba a ti y a tus amigos. Formad dos equipos y evitad beber enfrentándoos en diferentes juegos.')
    }
}

board_counts = {'classic': 52, 'flash': 35, 'xxl': 85, 'hammered': 50, 'hot': 50, 'couple': 40}

for lvl in levels_list:
    lid = lvl['id']
    lvl['title'] = labels['modes'].get(lid, lid)
    lvl['description'] = labels['descriptions'].get(lid, '')
    lvl['isUnlocked'] = True
    lvl['examples'] = examples_dict.get(lvl.get('examplesKey', ''), [])
    if lvl['type'] == 'BOARD':
        lvl['itemCount'] = board_counts.get(lid, 52)
        lvl['itemUnit'] = 'casillas'
    else:
        count = len(cards_dict.get(lid, []))
        if lid == 'tod':
            count = len(cards_dict.get('truth', [])) + len(cards_dict.get('dare', []))
        lvl['itemCount'] = count
        lvl['itemUnit'] = 'frases'

pkg = {
    'levels': levels_list,
    'avatars': avatars_list,
    'cards': cards_dict,
    'ui': ui_dict,
    'examples': examples_dict
}

with open('E:/repoig inversa/guatoca_web/data/labels.json', 'w', encoding='utf-8') as f:
    json.dump(labels, f, ensure_ascii=False, indent=2)

with open('E:/repoig inversa/guatoca_web/data/game_data.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, ensure_ascii=False, indent=2)

print('Cleaned game_data.json and labels.json generated!')
