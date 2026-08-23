---
name: dynatrace-strato-ui
description: Desarrolla UIs de apps Dynatrace (AppEngine) con el Strato Design System usando React + TypeScript y buenas prácticas oficiales — estructura de app (Page/AppHeader/TitleBar), design tokens y theming (@dynatrace/strato-design-tokens), mapa de imports verificado por categoría, estados de salud universales (Ideal/Good/Neutral/Warning/Critical), charts y geo maps, patrones oficiales (filtering, forms-validation, error-messages, ai-presence) y política de versionado/actualización. Úsala cuando pidan "app Dynatrace", "app para AppEngine", "UI con Strato", "estilos Strato", "design tokens", "theming", "componentes Strato", "cómo estructuro mi app", "colores oficiales Dynatrace", "indicadores de estado/salud" o cualquier desarrollo visual dentro del ecosistema Dynatrace Apps.
---

# Desarrollo de UIs Dynatrace con Strato Design System

Esta skill estandariza cómo construir la interfaz de una **app de Dynatrace (AppEngine)** con el
**Strato Design System**: apps React single-page escritas en TypeScript. Todo lo documentado aquí
fue extraído y validado contra las páginas oficiales de `developer.dynatrace.com/design/*`
(373 páginas ingestadas en la KB local bajo dominio `strato` — verificable con
`dtx docs search "<término>" --domain strato`).

Strato es el sucesor de Barista y es EL sistema de diseño oficial de la plataforma: usarlo no es
opcional si quieres consistencia con el resto del ecosistema Dynatrace.

## Antes de empezar: ¿qué tipo de superficie estás construyendo?

- **App de AppEngine** (React + TypeScript, se despliega en la plataforma) → esta skill aplica completa.
- **Dashboard de Grail** → los dashboards ya usan Strato internamente; no necesitas montar UI propia
  (usa la skill de dashboards). Esta skill es para cuando el usuario necesita UNA APP.
- **Extensión 2.0** → tiene su propio framework de UI; no uses los componentes React de Strato ahí.

## Flujo de trabajo

### Paso 0 — Verifica el entorno y la vigencia de paquetes

```bash
# Las apps Dynatrace se scaffoldean y mantienen con dt-app
npx dt-app update   # actualiza TODOS los paquetes Strato a la vez
```

Regla oficial: actualizar paquetes Strato **cada dos semanas**. Strato sigue semver:

| Release | Cadencia | Contenido |
| --- | --- | --- |
| MAJOR | 2 veces por año | Breaking changes, removals de deprecated |
| MINOR | Cada 2 semanas | Features compatibles hacia atrás |
| PATCH | A demanda | Bug fixes |

Los componentes/tokens pasan por `New` → `Stable` → `Deprecated`. Un componente deprecated
**se elimina en el próximo MAJOR**: revisa
[Upcoming changes](https://developer.dynatrace.com/release-notes/design-system/upcoming-changes/)
antes de planificar un upgrade mayor.

### Paso 1 — Estructura la app según el patrón oficial ANTES de escribir pantallas

Toda app debe seguir la misma base estructural ([App structure](https://developer.dynatrace.com/design/patterns/app-structure/)):

1. **`Page`** — componente raíz de cada vista, con 4 regiones:
   - `Header`: navegación principal y acciones primarias.
   - `Sidebar`: SOLO contenido que filtre/influya sobre el main view (nunca acciones sueltas).
   - `Main view`: el contenido central de la app.
   - `Detail view`: información complementaria del main view en pantallas anchas
     (NO pongas ahí contenido no relacionado).
2. **`AppHeader`** — siempre presente arriba: nombre de la app (vuelve al home), navegación
   primaria y acciones globales (settings, help, search, notifications).
3. **`TitleBar`** — título de página/sección con regiones: navigation (breadcrumbs/back),
   prefix (icono), title, subtitle y suffix (acciones relacionadas).

### Paso 2 — Usa SIEMPRE el mapa de imports verificado

Los componentes se importan desde subpaths por categoría de `@dynatrace/strato-components`.
El mapa completo está en `references/import-map.md` (extraído mecánicamente de la docs oficial,
no de memoria). Resumen de categorías:

```typescript
import { Page, PageLayout, Flex, Grid } from '@dynatrace/strato-components/layouts';
import { Button, IntentButton } from '@dynatrace/strato-components/buttons';
import { DataTable } from '@dynatrace/strato-components/tables';
import { TextInput, Select, Switch } from '@dynatrace/strato-components/forms';
import { FilterBar, TimeframeSelector } from '@dynatrace/strato-components/filters';
import { TimeseriesChart, PieChart } from '@dynatrace/strato-components/charts';
import { Text, Heading } from '@dynatrace/strato-components/typography';
import { Modal, Overlay, Tooltip } from '@dynatrace/strato-components/overlays';
import { AppRoot } from '@dynatrace/strato-components/core';
import { DQLEditor, CodeEditor } from '@dynatrace/strato-components/editors';
import { ToastContainer } from '@dynatrace/strato-components/notifications';
import Colors from '@dynatrace/strato-design-tokens/colors';
```

Si un import que vas a escribir NO aparece en `references/import-map.md`, búscalo antes de usarlo:
`dtx docs search "<Componente>" --domain strato`. No inventes subpaths.

### Paso 3 — Estila con design tokens, nunca con colores hardcodeados

Instala y consume los tokens como objetos tipados:

```bash
npm install @dynatrace/strato-design-tokens
```

```typescript
import Colors from '@dynatrace/strato-design-tokens/colors';
// también existen: animations, borders, box-shadows, breakpoints,
// easings, elevations, spacings, timings, typography
```

Taxonomía clave de colores (verificada en la referencia oficial de tokens):

- `Colors.Background.{Base, Surface, Container.*, Field.*}` por intención
  (`Neutral, Primary, Success, Warning, Critical`) y variantes `.OnAccent`.
- `Colors.Text.*`, `Colors.Icon.*`, `Colors.Border.*` con la misma gramática de intención.
- `Colors.Theme.*`: capa de theming (`Theme.Foreground`, `Theme.Background.Shell/Surface`,
  `Theme.Neutral/Primary/Success/Warning/Critical`) — usa esta capa para temas custom.
- `Colors.Charts.Status.{Ideal, Good, Neutral, Warning, Critical}`: colores canónicos de estado.
- `Colors.Charts.Categorical.Color01..Color10+`: paleta categórica para series.

### Paso 4 — Comunica estado/salud SOLO con los 5 niveles universales

[Status and health](https://developer.dynatrace.com/design/patterns/status-and-health/) define
5 niveles fijos. No inventes niveles ni colores propios:

| Nivel | Uso |
| --- | --- |
| **Ideal** | Éxito / condición deseada (ej.: cluster healthy, proceso completado) |
| **Good** | Informativo destacado o issue menor sin acción requerida |
| **Neutral** | Inactivo / sin connotación positiva o negativa |
| **Warning** | Problema potencial o crítico inminente (ej.: riesgo medio) |
| **Critical** | Falla que requiere atención inmediata |

La visualización combina **color + forma + símbolo** (accesibilidad: nunca solo color).
Usa `HealthIndicator` (`@dynatrace/strato-components/content`) y los tokens
`Colors.Charts.Status.*` para que tus indicadores sean idénticos a los nativos.

### Paso 5 — Aplica los patrones oficiales en vez de improvisar UX

Cada patrón tiene página oficial con guidelines (buscables con `dtx docs search ... --domain strato`):

- `patterns/filtering` — barras de filtro consistentes (usa `FilterBar`/`FilterField`).
- `patterns/forms-validation` — validación de formularios (`FormField` + reglas del patrón).
- `patterns/error-messages`, `patterns/loading-saving`, `patterns/common-actions`.
- `patterns/app-naming-guidelines` — nomenclatura de apps (revisa antes de publicar).
- `patterns/ai-presence` — cómo indicar presencia de IA en tu app (`AiLoadingIndicator`, `AiResponse`).

### Paso 6 — Visualiza datos con las librerías nativas

- Charts: `TimeseriesChart, XYChart, HistogramChart, CategoricalBarChart, PieChart, DonutChart,
  GaugeChart, HoneycombChart, MeterBarChart, MultiMeterBarChart, TopList, TreeMap, Sparkline,
  SingleValue, AnnotationsChart` (+ sus `*Config` companions) desde `.../charts`.
- Geo: `MapView` con capas `BaseLayer, BubbleLayer, ChoroplethLayer, ConnectionLayer, DotLayer`
  desde `@dynatrace/strato-geo`.

## Buenas prácticas transversales

1. **Tokens > CSS custom**: si existe un token, úsalo; recién entonces CSS Modules para lo que
   Strato no cubre (clases scoped localmente).
2. **Componentes compuestos**: sigue el patrón de composición de Strato
   (`<Parent><Parent.Child/></Parent>`) al construir tus propios componentes compartidos.
3. **Accesibilidad no negociable**: casi todo componente tiene página `/a11y/` oficial — consúltala
   al usar overlays, tablas y formularios.
4. **Tech radar oficial** para librerías de apoyo: state management ligero con **Zustand/Jotai**
   (no Redux), validación con **Zod**, fechas con **date-fns**
   ([tech radar](https://developer.dynatrace.com/plan/tech-radar/)).
5. **Preview ≠ estable**: componentes nuevos pueden entrar en preview (ver release notes de
   components-preview); evalúa riesgo antes de basar una pantalla crítica en ellos.

## Validación en este entorno

```powershell
# Buscar cualquier componente/token/patrón en la KB local (373 páginas oficiales)
.\dtx.cmd docs search "DataTable" --domain strato
.\dtx.cmd docs search "Colors.Theme" --domain strato

# Trazabilidad de esta skill
.\dtx.cmd skill validate dynatrace-strato-ui
```

Fuentes de evidencia: `references/evidence.json` · Mapa completo de imports:
`references/import-map.md`
