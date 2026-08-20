# Architecture Overview

## Preguntas frecuentes del proyecto

### ¿Dónde está React?
`ui/main.tsx:1` — monta `ReactDOM.createRoot` con `AppRoot` y `BrowserRouter`.

### ¿Dónde está el entry point?
`ui/main.tsx` — es el archivo que inyecta `<App />` en el DOM.

### ¿Dónde están las páginas?
`ui/app/pages/` — `Home.tsx` y `Data.tsx`.

### ¿Dónde están los componentes?
`ui/app/components/` — `Header.tsx` y `Card.tsx`.

### ¿Dónde está configurada Dynatrace?
`app.config.json` — nombre, ID, version, scopes, y `environmentUrl`.

### ¿Dónde están las App Functions?
En `api/`. Se crean con `npx dt-app function create <nombre>`. Ver [API Contract](api-contract.md) para el diseño de endpoints.

### ¿Cómo se llaman desde React?
Con el hook `useAppFunction({ name: 'functionName', data: payload })` de `@dynatrace-sdk/react-hooks`.

### ¿Dónde está configurado Strato?
En `package.json` como dependencias (`@dynatrace/strato-components`, `strato-design-tokens`, `strato-icons`) y se usa vía imports directos en cada componente.

### ¿Cómo se construye?
`npm run build` → ejecuta `dt-app build` → output en `dist/`.

### ¿Cómo se despliega?
`npm run deploy` → ejecuta `dt-app deploy` → despliega al `environmentUrl` de `app.config.json`.
