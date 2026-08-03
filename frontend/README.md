# Sentellent Frontend

Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Framer Motion.

See the [root README](../README.md) for architecture, environment variables,
and Docker deployment.

## Development

```bash
npm ci
npm run dev    # http://localhost:3000 (expects backend at NEXT_PUBLIC_API_URL)
```

## Production build

```bash
npm run build
npm start
```

The app builds to a standalone bundle (`output: "standalone"`) used by the
multi-stage `Dockerfile` in this directory.
