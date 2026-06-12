# GDD — Atrápame si puedes

Documento de diseño del juego para la aplicación de presentador.

## Contexto

- Concurso de televisión con **5 jugadores** iniciales y **6 rondas**.
- Aplicación **solo frontend** (React + Vite + TypeScript + Tailwind +
  shadcn/ui).
- Una sola pantalla operada por el **presentador**.
- Nombres de jugadores **editables** al iniciar la partida.
- Preguntas en `src/data/questions/data.json` (array por ronda) + `config.json`.
- Estado en Zustand (`src/store/gameStore.ts`), lógica pura en `src/engine/`.

## Estado inicial

- Jugadores activos: 5 (orden J1–J5)
- `Bote_Global = 0`
- Puntuaciones individuales en 0

## Presentador — Opciones

Menú **Opciones** en la cabecera (visible durante la partida):

- **Ir a ronda** (1–6) para ensayos.
- **Reiniciar partida** (vuelve al setup).

## Marcador lateral

Visible en rondas **1, 2 y 3** (y desempate). **Oculto** en rondas **4, 5 y 6**
(tienen su propio marcador en pantalla).

---

## Ronda 1: Cooperativa

- Juegan los 5 de forma cooperativa, **uno tras otro**.
- **Preguntas abiertas** por jugador (sets en `data.json`).
- Cada jugador: **45 segundos** (`round1TimerSeconds`) para responder todas las
  que pueda.
- Hasta **7 preguntas** por jugador (mínimo 1).
- **+50** al bote por acierto. Fallos = 0.
- Nadie se elimina.

### Flujo

1. Pulsa «Iniciar timer» → aparece la pregunta y arranca el cronómetro.
2. **Revelar respuesta** pausa el temporizador.
3. **Acierto** o **Fallo** → reanuda el timer y pasa a la **siguiente pregunta**
   automáticamente.
4. Al acabar el tiempo (o las preguntas del set): **resumen del turno**
   (aciertos, fallos, bote del turno, bote global).
5. **Siguiente jugador** hasta completar los 5. El último pasa a Ronda 2.

### UI

- Atajos: `A` acierto, `F` fallo, `Espacio` pausar/reanudar.

---

## Ronda 2: Escalera Individual

- Antes de jugar: **resumen** con puntos de cada jugador y bote total.
- El bote se reparte equitativamente entre los jugadores (pasa a marcadores
  individuales).
- **Matching**: 6 respuestas visibles siempre, **1 pregunta** a la vez.
- Las respuestas se **barajan** al iniciar cada jugador.
- Al **acertar**: feedback verde, la respuesta desaparece, suma puntos y avanza
  la pregunta.
- Al **fallar**: feedback rojo y **avanza** a la siguiente pregunta (la
  respuesta permanece en pantalla).
- Puntos: P1=50, P2=40, P3=30, P4=20, P5=10.
- Botones **Siguiente jugador** y **Cerrar ronda** con **modal de
  confirmación**.

### UI

- Una pregunta central + grid de todas las respuestas restantes (clicables).

---

## Ronda 3: Duelos (Suma Cero)

- Antes de jugar: **resumen** con puntos y **posición** de cada jugador.
- **5 duelos**: orden de retadores por puntuación **de mayor a menor**
  (auto-selección).
- Retador en columna izquierda (fijo por orden). Retado y tema: **botones
  marciales**.
- Solo en fase de duelo se muestran pregunta y controles del presentador.
- Preguntas abiertas del tema elegido.
- Puntos por pregunta del duelo: **10, 20, 30, 40…** (pregunta 1 = 10 pts).
- Retado acierta → roba al retador. Retado falla → cede al retador.
- Acierto/Fallo avanza a la siguiente pregunta con **animación de delta de
  puntos**.
- Tras cada duelo: **resumen del duelo**. Al terminar los 5: **resumen final**
  con eliminado.
- Elimina al de menor puntuación. Empate → **Piedra/Papel/Tijera**.

### UI

- Atajos en duelo: `A` acierto, `F` fallo.

---

## Ronda 4: Parejas

- Parejas por ranking: **1º+3º** vs **2º+4º** en puntos.
- **Vista previa** de equipos antes de las preguntas.
- Preguntas **binarias** (2 opciones), turnos alternos.
- Las opciones se **barajan** en cada pregunta (la correcta no queda siempre en
  la misma posición).
- Respuesta **clicando** la opción: feedback verde/rojo y animación **+1** al
  acertar.
- Tras **2 segundos** cambia automáticamente de pregunta y de turno.
- Primera pareja en **5 aciertos** gana. La otra eliminada.
- Marcador: **5 círculos** que se iluminan (no barra de progreso).
- Al ganar: **resumen de ronda** (ganadora, eliminados, clasificación) antes de
  pasar a Ronda 5.

---

## Ronda 5: La Final (Escalera)

- 1 vs 1 entre los 2 finalistas (1º y 2º en puntos tras R4).
- Preguntas abiertas, turnos alternos.
- Diseño de **escalera horizontal ascendente**:
  - Recorrido interno: `0-1-2-3-4-5-4-3-2-1-0` (11 posiciones).
  - Jugador A sube desde la **izquierda**, jugador B desde la **derecha**.
  - El peldaño **5 es común** (meta).
- Cada **acierto** sube un peldaño. Gana quien llegue al peldaño 5.
- Fallo: pasa turno sin subir.

### UI escalera

- **Inicio (0)**: sin recuadro, solo la **etiqueta con el nombre** del jugador.
- Peldaños **1–4**: casillas numeradas. Al alcanzar un peldaño, se ponen en
  **verde** ese y todos los anteriores del recorrido.
- Peldaño **5**: mismo estilo que el resto (sin iluminación especial ni texto
  «Meta»).
- Leyenda inferior: solo los **nombres** de los dos finalistas.
- En el peldaño ocupado, el marcador muestra el **nombre completo** del jugador.

### Fin de ronda

- Al llegar al 5: **resumen de ronda** (ganador final destacado, clasificación).
- Botón **«Comenzar El Bote — Ronda 6»** para pasar al minuto final.

### UI

- Atajos: `A` acierto, `F` fallo.

---

## Ronda 6: El Bote (El Minuto Final)

- Solo juega el **ganador de la Ronda 5**.
- Temporizador de **60 segundos** (pausable).
- **5 temas**, 1 pregunta abierta por tema (campo `name` + `question` en JSON).
- En pantalla: **5 cajas** con el título del tema.
- Solo el **tema activo** destacado muestra su pregunta debajo (no todas a la
  vez).

### Mecánica en bucle

- Los temas se recorren en **bucle** hasta que se acabe el tiempo o se **acerten
  los 5**.
- Si **acierta** un tema: suma al bote (`round6BotePerTopic`) y ese tema queda
  fuera del bucle.
- Si **falla** o pulsa **«Siguiente tema (sin revelar)»**: se marca como fallado
  y pasa al siguiente tema pendiente.
- Los temas fallados **pueden repetirse** cuando el bucle vuelve a ellos.
- **Revelar** pausa el cronómetro.
- **Acierto**, **Fallo** o **Siguiente tema** reanudan el temporizador.
- Botón para **finalizar la ronda** manualmente.

### Fin de ronda

- Al acabar el tiempo (o completar los 5 temas): **resumen del turno**
  (aciertos, fallos, bote ganado, resultado por tema).
- Si **gana bote** (`boteEarned > 0`): animación de **confeti**.
- Si **no gana nada** (`boteEarned === 0`): lluvia de emojis **💩**.
- **«Ver ganador»** → pantalla final del campeón.

### UI

- Atajos: `A` acierto, `F` fallo, `Espacio` pausar/reanudar timer.

---

## Esquema JSON (`data.json`)

Archivo único: array de objetos por ronda.

### Ronda 1

```json
{
  "round": 1,
  "sets": [
    {
      "playerOrder": 1,
      "questions": [{ "id": "r1-001", "text": "…", "answer": "…" }]
    }
  ]
}
```

- **5 sets** (J1–J5).
- Entre **1 y 7 preguntas** por set.

### Ronda 2

```json
{
  "round": 2,
  "sets": [
    {
      "playerOrder": 1,
      "questions": [{ "id": "r2-p1-q1", "text": "…" }],
      "answers": [
        { "id": "r2-p1-a1", "text": "…", "matchesQuestionId": "r2-p1-q1" },
        { "id": "r2-p1-fake", "text": "…", "matchesQuestionId": null }
      ]
    }
  ]
}
```

- 5 preguntas + 6 respuestas (1 señuelo) por set. 5 sets (J1–J5).

### Ronda 3

```json
{
  "round": 3,
  "topics": [
    {
      "id": "historia",
      "name": "Historia",
      "questions": [{ "id": "r3-h-001", "text": "…", "answer": "…" }]
    }
  ]
}
```

- Mínimo 5 temas.

### Ronda 4

```json
{
  "round": 4,
  "questions": [
    {
      "id": "r4-001",
      "text": "…",
      "options": [
        { "id": "a", "text": "Verdadero", "isCorrect": true },
        { "id": "b", "text": "Falso", "isCorrect": false }
      ]
    }
  ]
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
  "name": "El Minuto Final (El Bote)",
  "topics": [
    {
      "id": "r6-t1",
      "name": "Viajes",
      "question": {
        "id": "r6-001",
        "text": "¿Pregunta?",
        "answer": "Respuesta"
      }
    }
  ]
}
```

- Exactamente **5 temas** en orden fijo de presentación.
- Cada tema: **1 sola pregunta** en el campo `question` (objeto, no array).
- `id` único por tema y por pregunta.
- Ejemplo de temas: Viajes, One Direction, Sopas, Pueblos, Manualidades.

### Configuración (`config.json`)

```json
{
  "showName": "Atrápame si puedes",
  "round1TimerSeconds": 45,
  "round4TargetCorrect": 5,
  "round5TargetCorrect": 5,
  "round2Points": [50, 40, 30, 20, 10],
  "round6TimerSeconds": 60,
  "round6BotePerTopic": 100
}
```

| Campo                 | Uso                                    |
| --------------------- | -------------------------------------- |
| `round1TimerSeconds`  | Segundos por jugador en R1             |
| `round4TargetCorrect` | Aciertos para ganar en R4              |
| `round2Points`        | Puntos por pregunta en R2 (P1–P5)      |
| `round6TimerSeconds`  | Duración del minuto final              |
| `round6BotePerTopic`  | Puntos al bote por tema acertado en R6 |

---

## Flujo de rondas

```
R1 (cooperativa)
  → resumen por jugador
R2 (escalera)
  → resumen intro → juego
R3 (duelos)
  → resumen intro → duelos → resumen final
  → [RPS si empate]
R4 (parejas)
  → vista previa → juego → resumen
R5 (escalera final)
  → juego → resumen
R6 (bote)
  → juego → resumen (confeti / 💩) → pantalla ganador
```

## Atajos de teclado

| Tecla     | Acción                            |
| --------- | --------------------------------- |
| `A`       | Acierto (R1, R3 en duelo, R5, R6) |
| `F`       | Fallo (R1, R3 en duelo, R5, R6)   |
| `Espacio` | Pausar/reanudar timer (R1 y R6)   |

Rondas 2 y 4 no usan atajos A/F (interacción por clic en pantalla).
