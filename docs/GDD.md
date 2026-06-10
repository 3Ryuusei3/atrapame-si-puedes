# GDD — Atrapame si puedes

Documento de diseño del juego para la aplicación de presentador.

## Contexto

- Concurso de televisión con **5 jugadores** iniciales y **6 rondas**.
- Aplicación **solo frontend** (React + Vite + Tailwind + shadcn).
- Una sola pantalla operada por el **presentador**.
- Nombres de jugadores **editables** al iniciar la partida.
- Preguntas en `src/data/questions/data.json` (array por ronda).

## Estado inicial

- Jugadores activos: 5 (orden J1–J5)
- `Bote_Global = 0`
- Puntuaciones individuales en 0

---

## Ronda 1: Cooperativa

- Juegan los 5 de forma cooperativa.
- **Preguntas abiertas**.
- Cada jugador: **60 segundos** para responder todas las que pueda.
- **+50** al bote por acierto. Fallos = 0.
- Nadie se elimina.

### UI

- La pregunta **no se muestra** hasta pulsar «Iniciar timer».
- **Revelar respuesta** pausa el temporizador.
- Al pulsar **Acierto** o **Fallo**: se reanuda el timer y pasa a la **siguiente pregunta** automáticamente.
- Atajos: `A` acierto, `F` fallo, `Espacio` pausar/reanudar.

---

## Ronda 2: Escalera Individual

- Antes de jugar: **resumen** con puntos de cada jugador y bote total.
- El bote se clona a marcadores individuales.
- **Matching**: 6 respuestas visibles siempre, **1 pregunta** a la vez.
- Al acertar: la respuesta desaparece y avanza la pregunta.
- Al fallar: la respuesta permanece, misma pregunta.
- Puntos: P1=50, P2=40, P3=30, P4=20, P5=10.
- Botones **Siguiente jugador** y **Cerrar ronda** con **modal de confirmación**.

### UI

- Una pregunta central + grid de todas las respuestas restantes.

---

## Ronda 3: Duelos (Suma Cero)

- Antes de jugar: **resumen** con puntos y **posición** de cada jugador.
- **5 duelos**: orden de retadores por puntuación **de mayor a menor** (auto-selección).
- Retador en columna izquierda (fijo por orden). Retado y tema: **botones marciales**.
- Preguntas abiertas del tema elegido.
- Puntos por pregunta del duelo: **10, 20, 30, 40…** (pregunta 1 = 10 pts).
- Retado acierta → roba al retador. Retado falla → cede al retador.
- Acierto/Fallo avanza a la siguiente pregunta automáticamente.
- Elimina al de menor puntuación. Empate → Piedra/Papel/Tijera.

---

## Ronda 4: Parejas

- Parejas por ranking: **1º+3º** vs **2º+4º** en puntos.
- **Vista previa** de equipos antes de las preguntas.
- Preguntas **binarias** (2 opciones), turnos alternos.
- Primera pareja en **5 aciertos** gana. La otra eliminada.
- Marcador: **5 círculos** que se iluminan (no barra de progreso).

---

## Ronda 5: La Final (Escalera)

- 1 vs 1 entre los 2 finalistas (1º y 2º en puntos tras R4).
- Preguntas abiertas, turnos alternos.
- Diseño de **escalera**: peldaños `1-2-3-4-5-4-3-2-1`. El **5 es común** (meta).
- Cada **acierto** sube un peldaño. Gana quien llegue al peldaño 5.
- Fallo: pasa turno sin subir.

---

## Ronda 6: El Bote

- Solo juega el **ganador de la Ronda 5**.
- Temporizador de **60 segundos** (pausable).
- **5 temas**, 1 pregunta abierta por tema.
- En pantalla: **5 cuadradillos** con tema + pregunta visible.
- Si **acierta** un tema: suma al bote y no se repite ese tema.
- Si **falla**: pasa al siguiente tema (un intento por tema).
- Botón para **parar el tiempo**.

---

## Esquema JSON (`data.json`)

Archivo único: array de objetos por ronda.

### Ronda 1

```json
{ "round": 1, "questions": [{ "id": "r1-001", "text": "…", "answer": "…" }] }
```

### Ronda 2

```json
{
  "round": 2,
  "sets": [{
    "playerOrder": 1,
    "questions": [{ "id": "r2-p1-q1", "text": "…" }],
    "answers": [
      { "id": "r2-p1-a1", "text": "…", "matchesQuestionId": "r2-p1-q1" },
      { "id": "r2-p1-fake", "text": "…", "matchesQuestionId": null }
    ]
  }]
}
```

5 preguntas + 6 respuestas (1 señuelo) por set. 5 sets (J1–J5).

### Ronda 3

```json
{
  "round": 3,
  "topics": [{
    "id": "historia",
    "name": "Historia",
    "questions": [{ "id": "r3-h-001", "text": "…", "answer": "…" }]
  }]
}
```

Mínimo 5 temas.

### Ronda 4

```json
{
  "round": 4,
  "questions": [{
    "id": "r4-001",
    "text": "…",
    "options": [
      { "id": "a", "text": "Verdadero", "isCorrect": true },
      { "id": "b", "text": "Falso", "isCorrect": false }
    ]
  }]
}
```

### Ronda 5

```json
{ "round": 5, "questions": [{ "id": "r5-001", "text": "…", "answer": "…" }] }
```

### Ronda 6

```json
{
  "round": 6,
  "topics": [
    {
      "id": "r6-t1",
      "name": "Historia",
      "question": {
        "id": "r6-t1-q",
        "text": "¿Pregunta?",
        "answer": "Respuesta"
      }
    }
  ]
}
```

- Exactamente **5 temas**.
- Cada tema: **1 sola pregunta** en el campo `question` (objeto, no array).
- `id` único por tema y por pregunta.

### Configuración (`config.json`)

```json
{
  "showName": "Atrapame si puedes",
  "round1TimerSeconds": 60,
  "round4TargetCorrect": 5,
  "round5TargetCorrect": 5,
  "round2Points": [50, 40, 30, 20, 10],
  "round6TimerSeconds": 60,
  "round6BotePerTopic": 100
}
```

---

## Flujo de rondas

```
R1 (cooperativa) → R2 (escalera) → R3 (duelos) → [RPS?] → R4 (parejas)
→ R5 (escalera final) → R6 (bote) → Pantalla ganador
```

## Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `A` | Acierto |
| `F` | Fallo |
| `Espacio` | Pausar/reanudar timer (R1 y R6) |
