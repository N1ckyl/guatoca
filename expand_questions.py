# -*- coding: utf-8 -*-
import json
import os

game_data_path = os.path.join(os.path.dirname(__file__), 'data', 'game_data.json')

with open(game_data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_flash = [
    {"games": "flash", "text": "Di 3 red flags en un pretendiente. Cada jugador toma un trago por cada red flag con la que se sienta identificado."},
    {"games": "flash", "text": "Di 3 cosas tóxicas que la gente normaliza. Los que las hayan hecho toman 2 tragos."},
    {"games": "flash", "text": "Nombra 3 lugares raros donde besaste a alguien en 5 segundos o toma 2 tragos."},
    {"games": "flash", "text": "Di 3 mentiras típicas que dices cuando no quieres salir de fiesta. Quien las haya usado toma 1 trago."},
    {"games": "flash", "text": "Menciona 3 aplicaciones que borraste por pena o toma 2 tragos."},
    {"games": "flash", "text": "Di 3 cosas que no le perdonarías a una pareja en 5 segundos o toma 3 tragos."},
    {"games": "flash", "text": "Nombra 3 tragos o cócteles con ron antes de que cuenten hasta 3 o toma un buen trago."},
    {"games": "flash", "text": "Di 3 tipos de mensajes que te da pereza responder. Quienes los dejen en visto toman 1 trago."},
    {"games": "flash", "text": "Confiesa 3 cosas que te fijas primero en alguien en 5 segundos o reparte 3 tragos."},
    {"games": "flash", "text": "Di 3 canciones para cantar a grito herido borracho o bebe 2 tragos."},
    {"games": "flash", "text": "Di 3 red flags en Instagram (ej: tener las historias destacadas con 'yo'). Quien las tenga toma."},
    {"games": "flash", "text": "Nombra 3 apodos ridículos que le hayas puesto a un ex en 5 segundos o toma 2 tragos."},
    {"games": "flash", "text": "Di 3 cosas que te hagan perder el interés al instante en una cita o toma 2 tragos."},
    {"games": "flash", "text": "Menciona 3 razones por las que te irías sin despedirte de una fiesta o toma un trago largo."},
    {"games": "flash", "text": "Di 3 compras compulsivas de las que te arrepentiste al día siguiente o toma 2 tragos."},
    {"games": "flash", "text": "Nombra 3 cosas que revisas en una persona antes de seguirla en redes o bebe 1 trago."},
    {"games": "flash", "text": "Di 3 comidas que solo comes con resaca. Si alguien coincide contigo, ambos toman 1 trago."},
    {"games": "flash", "text": "Nombra 3 momentos en los que fingiste que se te cortó la llamada en 5 segundos o bebe 2 tragos."},
    {"games": "flash", "text": "Di 3 hábitos que te dan asco en público o toma un trago."},
    {"games": "flash", "text": "Menciona 3 cosas que ocultas en tu galería de fotos en 5 segundos o enseña la última foto tomada."},
    {"games": "flash", "text": "Di 3 cosas que jamás admitirías sobrio/a o toma 3 tragos."},
    {"games": "flash", "text": "Nombra 3 amigos a los que nunca les confiarías un secreto en 5 segundos o bebe 2 tragos."},
    {"games": "flash", "text": "Di 3 frases típicas para terminar una relación por mensaje o bebe 2 tragos."},
    {"games": "flash", "text": "Nombra 3 posiciones en las que jamás dormirías o toma 1 trago."},
    {"games": "flash", "text": "Di 3 placeres culposos musicales que escuchas a solas o bebe 2 tragos."},
    {"games": "flash", "text": "Di 3 pretextos para no prestar plata a un amigo o toma 2 tragos."},
    {"games": "flash", "text": "Nombra 3 cosas que te hayan dado ataque de risa en un momento inapropiado o bebe 1 trago."},
    {"games": "flash", "text": "Di 3 manías que tengas en la cama o toma 2 tragos."},
    {"games": "flash", "text": "Menciona 3 apodos vergonzosos que te ponía tu familia de niño o toma 2 tragos."},
    {"games": "flash", "text": "Di 3 veces que stalkeaste el perfil de alguien sin querer dar like y lo diste. Quien lo haya hecho bebe."}
]

new_events = [
    {"games": "classic,hammered,xxl,couple", "text": "REGLA DE PALABRA PROHIBIDA: {turn} elige una palabra que no se puede decir hasta el final de la partida. Quien la diga, toma 1 trago."},
    {"games": "classic,hammered,xxl,couple", "text": "EL MAESTRO DE LOS OJOS: {turn} no puede hacer contacto visual con nadie. El primero que lo mire a los ojos toma 2 tragos."},
    {"games": "classic,hammered,xxl,couple", "text": "CASCADA ÉPICA: {turn} empieza a beber y todos le siguen al unísono. Nadie puede parar hasta que el de su izquierda se detenga."},
    {"games": "classic,hammered,xxl,couple", "text": "COMPAÑEROS DE TRAGO: {turn} elige a un cómplice. Cada vez que uno tome por cualquier razón, el otro toma automáticamente."},
    {"games": "classic,hammered,xxl,couple", "text": "EL PULGAR SAGRADO: {turn} puede poner su pulgar en la mesa en cualquier momento. El último en imitarlo toma 2 tragos."},
    {"games": "classic,hammered,xxl,couple", "text": "TIEMPO SIN MÓVILES: Todos ponen sus teléfonos en el centro de la mesa boca abajo. El primero que lo toque se termina su vaso."},
    {"games": "classic,hammered,xxl,couple", "text": "VOZ DE ROBOT: {turn} debe hablar como un robot hasta su próximo turno. Si habla normal, toma 1 trago por cada frase."},
    {"games": "classic,hammered,xxl,couple", "text": "PREGUNTAS PROHIBIDAS: Nadie puede responder a ninguna pregunta de {turn}. Quien responda toma 1 trago."},
    {"games": "classic,hammered,xxl,couple", "text": "CAMBIO DE MANO: A partir de ahora todos deben beber exclusivamente con su mano no dominante. Quien use la mano equivocada toma 2 tragos."},
    {"games": "classic,hammered,xxl,couple", "text": "EL ABOGADO: Nadie puede contestar por sí mismo; {otherPlayer} es su abogado y debe responder por {turn}. Si falla, ambos beben."},
    {"games": "classic,hammered,xxl,couple", "text": "TUTEO PROHIBIDO: Queda prohibido tutear. Todos deben tratarse de 'Usted' o 'Su Majestad'. El que tutee bebe."},
    {"games": "classic,hammered,xxl,couple", "text": "BOMBARDERO: {turn} lanza una moneda al aire. Si sale cara, reparte 4 tragos; si sale cruz, se los toma él/ella solo/a."},
    {"games": "classic,hammered,xxl,couple", "text": "MEDUSA: Todos bajan la cabeza y a la cuenta de 3 miran fijamente a alguien. Si dos personas se miran fijamente a los ojos, ambas gritan y toman 2 tragos."},
    {"games": "classic,hammered,xxl,couple", "text": "EL MAYORDOMO: {turn} debe servirle la bebida a {otherPlayer} con la mayor cortesía y reverencia cada vez que lo pida."},
    {"games": "classic,hammered,xxl,couple", "text": "CONFESIÓN GRUPAL: Todos votan con el dedo quién es el más probable de desaparecerse primero esta noche. El más votado toma 3 tragos."}
]

new_drinks = [
    {"games": "classic,hammered,xxl,couple", "text": "El jugador que esté en la casilla más alta del tablero toma 2 tragos para frenar su racha."},
    {"games": "classic,hammered,xxl,couple", "text": "El jugador que vaya en último lugar en el tablero toma 2 tragos de consuelo."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 1 trago todos los que tengan menos de 30% de batería en el móvil."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 1 trago el jugador que tenga el calzado más caro del grupo."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 2 tragos todos los que hayan besado a más de una persona en la misma noche."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 1 trago la persona más alta del grupo, y 2 tragos la persona más baja."},
    {"games": "classic,hammered,xxl,couple", "text": "Todos los que lleven ropa de color negro toman 1 trago."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 2 tragos el que haya llegado más tarde a la reunión de hoy."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 1 trago todos los que tengan un ex con el que aún hablen."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 2 tragos quien haya visto la última historia de Instagram de su ex en las últimas 48 horas."},
    {"games": "classic,hammered,xxl,couple", "text": "El jugador con el corte de pelo más reciente toma 1 trago."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 2 tragos todos los que tengan un piercing o tatuaje oculto."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 1 trago los solteros, toman 2 tragos los que están en una situación complicada."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 2 tragos la persona a la que el grupo considere el más tacaño con la cuenta."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 1 trago todo aquel que haya mandado un audio de WhatsApp de más de 3 minutos esta semana."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 2 tragos los que hayan vomitado por alcohol en el último mes."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 1 trago todos los que tengan hermanos mayores."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 3 tragos quien tenga más seguidores en Instagram o TikTok."},
    {"games": "classic,hammered,xxl,couple", "text": "Toman 1 trago todos los que lleven reloj analógico o smartwatch puesto."},
    {"games": "classic,hammered,xxl,couple", "text": "Toma 2 tragos quien haya pagado el último Uber del grupo."}
]

new_nhie = [
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca me he besado con alguien cuyo nombre no recordaba al día siguiente."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca me he quedado dormido en el baño de un bar o discoteca."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he fingido estar hablando por teléfono para evitar a alguien conocido."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he mandado una captura de pantalla a la misma persona de la que estaba hablando."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he salido con alguien solo para darle celos a mi ex."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he tenido un crush secreto con alguien de este grupo."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he mentido en mi currículum laboral para conseguir un trabajo."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he conducido con la música tan alta fingiendo estar en un videoclip."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he entrado sin pagar a una fiesta, concierto o club."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he stalkeado tanto a alguien que terminé encontrando las redes de su abuela."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he tenido resaca durante dos días seguidos."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca me he arrepentido de un tatuaje o cambio radical de look."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca me he ido de una fiesta sin despedirme de nadie (la bomba de humo)."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he fingido un orgasmo para terminar más rápido."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he comido algo del suelo aplicando la regla de los 5 segundos en un lugar público."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he abierto un mensaje de Instagram en modo avión para que no salga 'visto'."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca me he liado con la expareja de un amigo o conocido."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he tenido un sueño erótico con alguien que está en esta misma habitación."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he borrado una publicación en redes porque no tuvo suficientes likes en 10 minutos."},
    {"games": "nhie,classic,hammered,xxl,flash", "text": "Yo nunca he tenido que pedirle a un amigo que me recordara qué pasó anoche."}
]

new_dares = [
    {"games": "tod,classic,hammered,xxl", "text": "Llama a un contacto al azar de tu agenda y cántale los primeros 20 segundos de 'Feliz Cumpleaños' sin dar explicaciones o bebe 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "Deja que {otherPlayer} revise tus últimos 5 mensajes de WhatsApp en voz alta o bebe 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "Imita a alguien de este grupo durante 30 segundos hasta que adivinen quién es o bebe 2 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "Manda un audio de 5 segundos maullando como un gato al tercer chat más reciente de tu WhatsApp o bebe 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "Baila el coro de una canción de reguetón sensual con {otherPlayer} durante 20 segundos o bebe 2 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "Publica una historia en Instagram con la pantalla completamente negra y la frase 'No debí haberlo hecho...' por 10 minutos o bebe 4 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "Bebe un trago del vaso de {otherPlayer} sin usar las manos o bebe 2 tragos del tuyo."},
    {"games": "tod,classic,hammered,xxl", "text": "Habla con acento extranjero (francés, argentino o ruso) durante los próximos dos turnos o bebe 2 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "Muestra tu cara más sensual a la cámara o bebe 2 tragos de castigo."},
    {"games": "tod,classic,hammered,xxl", "text": "Déjate dar un golpe suave con la almohada por todos los jugadores o bebe 2 tragos."}
]

new_truths = [
    {"games": "tod,classic,hammered,xxl", "text": "¿Quién de los presentes te parece la persona más atractiva y por qué? Si no respondes, toma 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Cuál ha sido la situación más vergonzosa que has vivido borracho/a? Cuenta los detalles o bebe 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Alguna vez has tenido sentimientos por la pareja de un amigo/a? Sé honesto/a o bebe 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Qué es lo más tóxico que has hecho por celos? Si te niegas a confesar, bebe 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Cuál es tu mayor fantasía íntima que nunca le has contado a nadie? Bebe 3 tragos si no quieres responder."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Alguna vez has fingido que te caía bien alguien de esta mesa cuando en realidad no? Di quién o bebe 4 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Cuántas personas han estado en tu cama en el último año? Bebe 2 tragos si prefieres callar."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Cuál ha sido tu peor cita y qué inventaste para poder escapar? Cuéntalo o bebe 2 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Alguna vez te has acostado con alguien solo por despecho? Confiesa o bebe 3 tragos."},
    {"games": "tod,classic,hammered,xxl", "text": "¿Qué secreto ocultas de tu familia que si se enteraran te desheredarían? O bebe 4 tragos."}
]

# Agregar a game_data
if 'flash' not in data['cards']:
    data['cards']['flash'] = []

def add_unique(category_name, new_items):
    existing_texts = {item['text'].strip().lower() for item in data['cards'].get(category_name, [])}
    count = 0
    for it in new_items:
        if it['text'].strip().lower() not in existing_texts:
            data['cards'][category_name].append(it)
            existing_texts.add(it['text'].strip().lower())
            count += 1
    return count

c_flash = add_unique('flash', new_flash)
c_event = add_unique('event', new_events)
c_drink = add_unique('drink', new_drinks)
c_nhie = add_unique('nhie', new_nhie)
c_dare = add_unique('dare', new_dares)
c_truth = add_unique('truth', new_truths)

print(f"Added new cards: flash={c_flash}, event={c_event}, drink={c_drink}, nhie={c_nhie}, dare={c_dare}, truth={c_truth}")

with open(game_data_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("game_data.json updated successfully!")
