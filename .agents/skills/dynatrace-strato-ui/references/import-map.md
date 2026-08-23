# Mapa de imports verificado — Strato Design System

Extraído mecánicamente de las páginas oficiales de `developer.dynatrace.com/design/components/*`
(373 documentos, dominio `strato` en la KB local). Cada entrada corresponde a un import
real encontrado en la documentación oficial. Si un componente no está aquí, búscalo con
`dtx docs search "<nombre>" --domain strato` antes de usarlo.

## @dynatrace/strato-components

| Subpath | Componentes |
| --- | --- |
| `/core` | AppRoot, FocusScope, OverlayContainer |
| `/layouts` | AppHeader, Container, Divider, Flex, Grid, HelpMenu, InputGroup, Page, PageLayout, Surface, TitleBar |
| `/buttons` | Button, IntentButton, NotifyButton, RunQueryButton |
| `/content` | Accordion, AiLoadingIndicator, AiResponse, Avatar, AvatarGroup, Chip, ChipGroup, CodeSnippet, EmptyState, ExpandableText, FeatureHighlight, HealthIndicator, InformationOverlay, KeyboardShortcut, KeyboardShortcutTooltip, Markdown, MessageContainer, Microguide, ProgressBar, ProgressCircle, ReleasePhaseIndicator, Skeleton, SkeletonText, TerminologyOverlay |
| `/typography` | Blockquote, Code, Emphasis, ExternalLink, Heading, Highlight, Link, List, Paragraph, Strikethrough, Strong, Text, TextEllipsis |
| `/forms` | Checkbox, DateTimePicker, FieldSet, FormField, Label, NumberInput, NumberInputV2, PasswordInput, Radio, SearchInput, Select, Switch, TextArea, TextInput, ToggleButtonGroup |
| `/filters` | FilterBar, FilterField, SegmentSelector, TimeframeSelector |
| `/tables` | DataTable, SimpleTable |
| `/charts` | AnnotationsChart, CategoricalBarChart (+Config), DonutChart (+Config), GaugeChart, HistogramChart, HoneycombChart (+Config), MeterBarChart (+Config), MultiMeterBarChart (+Config), PieChart (+Config), SingleValue (+Config), Sparkline, TimeseriesChart (+Config), TopList, TreeMap, XYChart (+Config) |
| `/overlays` | Modal, Overlay, Sheet, Tooltip |
| `/navigation` | AppLink, Breadcrumbs, Menu, Tab, Tabs |
| `/notifications` | NotificationSettings, ToastContainer, ToastOptions |
| `/editors` | CodeEditor, DQLEditor |

## @dynatrace/strato-design-tokens

Subpaths verificados: `animations`, `borders`, `box-shadows`, `breakpoints`, `colors`,
`easings`, `elevations`, `spacings`, `timings`, `typography`.

```typescript
import Colors from '@dynatrace/strato-design-tokens/colors';
import Spacings from '@dynatrace/strato-design-tokens/spacings';
```

Taxonomía de colores (referencia oficial `/design/design-tokens/Colors/`):

- `Colors.Theme.Foreground`, `Colors.Theme.Background.{Shell,Surface}`, `Colors.Theme.{Neutral,Primary,Success,Warning,Critical}`
- `Colors.Background.{Base,Surface}`, `Colors.Background.Container.{Neutral,Primary,Success,Warning,Critical}`, `Colors.Background.Field.{...}`
- `Colors.Text.{Neutral,Primary,Success,Warning,Critical}` (+ `.OnAccent`)
- `Colors.Icon.{...}` y `Colors.Border.{...}` (misma gramática de intención + `.OnAccent`)
- `Colors.BoxShadow`, `Colors.Syntax`
- `Colors.Charts.Status.{Ideal,Good,Neutral,Warning,Critical}`
- `Colors.Charts.Categorical.Color01..Color10+`

## @dynatrace/strato-geo

MapView + capas: BaseLayer, BubbleLayer, ChoroplethLayer, ConnectionLayer, DotLayer.

## Paquetes npm oficiales

- `@dynatrace/strato-components`
- `@dynatrace/strato-design-tokens`
- `@dynatrace/strato-icons`
- `@dynatrace/strato-geo`

Actualización unificada: `npx dt-app update` (recomendado cada 2 semanas).
