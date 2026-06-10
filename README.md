# Atrapame si puedes

Aplicación de presentador para el concurso de televisión **Atrapame si puedes**.

## Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (estado local, sin backend)

## Desarrollo

```bash
npm install
npm run dev
```

## Preguntas

Todas las rondas van en un único archivo: [`src/data/questions/data.json`](src/data/questions/data.json)

La configuración del concurso está en [`src/data/questions/config.json`](src/data/questions/config.json).

Ver [`docs/GDD.md`](docs/GDD.md) para reglas completas y esquema JSON (incluida la **Ronda 6**).

## Atajos del presentador

| Tecla | Acción |
|-------|--------|
| `A` | Acierto |
| `F` | Fallo |
| `Espacio` | Pausar/reanudar timer (Rondas 1 y 6) |
