# MatchPet (Demo Frontend)

Aplicación frontend (Parcel) en modo demo: sin Firebase y sin suite de tests.

## Requisitos

- Node.js + npm

## Instalación

```bash
npm install
```

## Ejecutar en local

```bash
npm start
```

Parcel levanta el sitio en `http://localhost:1234`.

## Modo demo (sin backend)

- Autenticación y datos se guardan en `localStorage`.
- Puedes crear un usuario desde `src/signing_up/signing_up.html`.
- El catálogo de mascotas se inicializa con datos semilla la primera vez.

Para “reiniciar” la demo, limpia el `localStorage` del navegador.
