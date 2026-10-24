import json

path = r'E:\repoig inversa\guatoca_web\data\game_data.json'
with open(path, 'r', encoding='utf-8') as f:
    gd = json.load(f)

# Ensure colordice level exists
if not any(l['id'] == 'colordice' for l in gd['levels']):
    gd['levels'].append({
        'id': 'colordice',
        'type': 'MODE',
        'titleKey': 'colordice_title',
        'infoKey': 'colordice_desc',
        'title': 'DADO DE COLORES',
        'description': 'Lanza el dado de 6 colores. Cada color corresponde a una carta distinta: Tomar, Yo Nunca, Verdad, Reto, Evento o Hot.',
        'buttonSpriteName': 'colordice'
    })

# Extra drink cards with conditional rules
extra_drinks = [
    'La persona más probable de ser arrestada toma',
    'El jugador en la casilla más alta toma 2 tragos',
    'El jugador en la casilla más baja toma 2 tragos',
    'La persona con menos porcentaje de batería en el móvil toma 2 tragos',
    'Todos los que lleven ropa de color negro toman 1 trago',
    'Todos los solteros toman 1 trago. Los que tienen pareja toman 2',
    'La persona más bajita del grupo reparte 3 tragos',
    'La persona más alta del grupo toma 2 tragos',
    'El que haya llegado más tarde a la fiesta toma 2 tragos',
    'Quien tenga más fotos en la galería de su teléfono toma 2 tragos',
    'El jugador con el calzado más limpio reparte 2 tragos',
    'Todos los que tengan tatuajes toman 1 trago por cada tatuaje visible',
    'Toman todos los que hayan stalkeado a su ex en la última semana',
    'El jugador a la derecha de {turn} toma 2 tragos con él/ella',
    'Toman todos los que tengan menos de 1000 seguidores en Instagram',
    'Toman todos los que lleven calcetines blancos',
    'Quien haya bebido café hoy toma 1 trago',
    'Toman todos los que hayan mentido sobre su edad alguna vez'
]

# Extra event cards with mini-games and ongoing rules
extra_events = [
    '{turn} elige una palabra prohibida hasta el final de la partida. ¡Quien la diga toma un trago cada vez!',
    'MEDUSA: Todos miran hacia abajo. A la de 3, todos miran a alguien. Si dos personas se cruzan la mirada, ¡ambas toman 2 tragos!',
    'CASCADA: {turn} empieza a tomar de su vaso. El de su izquierda empieza a tomar y nadie puede parar hasta que el de su derecha pare.',
    'PULGAR MAESTRO: {turn} es el maestro del pulgar. Cuando ponga su pulgar discretamente en la mesa, el último en copiarlo toma 2 tragos (dura toda la partida).',
    'REGLA REAL: {turn} crea una regla obligatoria para todos durante las próximas 3 rondas (ej: hablar sin decir la letra R o beber con la mano izquierda).',
    'ESCLAVO DE BEBIDA: {turn} elige a un jugador. Durante las próximas 3 rondas, cada vez que {turn} tome, su esclavo toma también.',
    'RIMA RÁPIDA: {turn} dice una palabra. Por orden hacia la derecha, cada jugador debe decir una palabra que rime en menos de 3 segundos. Quien repita o tarde toma 2.',
    'PIEDRA, PAPEL O TIJERA: {turn} reta a {otherPlayer} a 3 rondas de piedra, papel o tijera. El perdedor toma 3 tragos.',
    'BATALLA DE MIRADAS: {turn} y {otherPlayer} se miran fijamente sin parpadear. El primero en parpadear o reírse toma 2 tragos.',
    'CATEGORÍAS: {turn} elige una categoría (ej: marcas de coches, canciones de Bad Bunny). En sentido horario deben nombrar uno. Quien se quede en blanco toma 2.',
    'PROHIBIDO DECIR SÍ O NO: Nadie puede decir sí ni no durante las próximas 2 rondas. Quien se equivoque toma 1 trago.',
    'EL CONTACTO MISTERIOSO: {turn} debe pedir a {otherPlayer} que escoja un contacto de su agenda y mandarle un audio cantando una estrofa o tomar 3 tragos.'
]

# Extra dares
extra_dares = [
    '{turn}, deja que {otherPlayer} te dibuje un bigote con boli o marcador en la cara o toma 3 tragos.',
    '{turn}, imita a un miembro del grupo hasta que los demás adivinen quién es o toma 3 tragos.',
    '{turn}, publica un estado de WhatsApp que diga "Me caso en 2 meses" y déjalo 5 minutos o toma 4 tragos.',
    '{turn}, habla con acento extranjero (francés, argentino o italiano) hasta tu siguiente turno o toma 2 tragos.',
    '{turn}, deja que el grupo revise tus últimas 3 fotos de la galería o toma 3 tragos.',
    '{turn}, haz 10 flexiones de pecho seguidas o toma 2 tragos.',
    '{turn}, cómete una cucharada de mostaza/mayonesa/salsa picante o toma 3 tragos.',
    '{turn}, llama a un amigo y convéncele de que te preste 50 euros durante 1 minuto o toma 4 tragos.',
    '{turn}, intercambia una prenda de ropa con {otherPlayer} por el resto de la partida o toma 2 tragos.'
]

# Extra truths
extra_truths = [
    '{turn}, ¿cuál es la mentira más gorda que has dicho para no salir de fiesta o zafarte de un plan?',
    '{turn}, ¿alguna vez te ha atraído la pareja o el crush de algún amigo presente? Di la verdad o toma 3.',
    '{turn}, ¿cuál ha sido tu momento más vergonzoso estando completamente borracho/a?',
    '{turn}, ¿quién de las personas presentes te parece la más atractiva físicamente?',
    '{turn}, ¿alguna vez has fingido un orgasmo? Cuenta los detalles o toma 2 tragos.',
    '{turn}, ¿qué es lo más tóxico que has hecho por celos o inseguridad?',
    '{turn}, ¿has mandado alguna foto picante a la persona equivocada por error?',
    '{turn}, ¿cuál es el secreto más oscuro que tus padres nunca deben saber?'
]

# Flash rapid challenges
flash_cards = [
    'Di 3 red flags en una persona. Todos los que tengan al menos una toman 1 trago por cada una con la que se identifiquen.',
    'Di 3 marcas de cerveza en menos de 5 segundos o toma 2 tragos.',
    'Di 3 cosas que te den cringe en una primera cita. Quien las haya hecho toma 1 trago.',
    'Nombra 3 canciones de reguetón clásico en 5 segundos o toma 2 tragos.',
    'Di 3 excusas típicas para llegar tarde. Quien las haya usado toma 1 trago.',
    'Di 3 apodos ridículos que te hayan puesto o toma 2 tragos.',
    'Nombra 3 países que empiecen por la letra M en 5 segundos o toma 2 tragos.',
    'Di 3 cosas que no harías ni por 1000 euros en 5 segundos o toma 2 tragos.',
    'El último en aplaudir dos veces toma 1 trago.',
    'Todos señalan a la persona con peor gusto para elegir pareja. La más señalada toma 2 tragos.',
    'Di 3 cosas que siempre llevas en el bolso o bolsillos en 4 segundos o toma 2 tragos.',
    'Di 3 series de Netflix en 5 segundos o toma 2 tragos.',
    'Todos señalan al que peor aguante el alcohol. El más votado toma 2 tragos.',
    'El último en poner las dos manos sobre la cabeza toma 1 trago.',
    'Di 3 insultos graciosos en 5 segundos o toma 2 tragos.',
    'Todos los que tengan los ojos claros toman 1 trago, los de ojos oscuros reparten 1.',
    'Nombra 3 posiciones sexuales en 5 segundos sin dudar o toma 3 tragos.',
    'Di 3 cosas que te hagan perder el interés al instante. Quien las haga toma 1 trago.',
    'El jugador que tenga las uñas pintadas reparte 2 tragos.',
    'Todos los que hayan visto porno en las últimas 24 horas toman 1 trago.'
]

for d in extra_drinks:
    gd['cards']['drink'].append({'games': 'classic, xxl, flash, hammered', 'text': d})

for e in extra_events:
    gd['cards']['event'].append({'games': 'classic, xxl, flash, hammered', 'text': e})

for r in extra_dares:
    gd['cards']['dare'].append({'games': 'classic, xxl, flash, hammered', 'text': r})

for t in extra_truths:
    gd['cards']['truth'].append({'games': 'classic, xxl, flash, hammered', 'text': t})

gd['cards']['flash'] = [{'games': 'flash', 'text': f} for f in flash_cards]

with open(path, 'w', encoding='utf-8') as f:
    json.dump(gd, f, ensure_ascii=False, indent=2)

print('Enriched game_data.json successfully!')
for c, l in gd['cards'].items():
    print(c, len(l))
