# Marca del cliente: extracción y homologación de colores

## Extraer la paleta

Usá una herramienta de color-fetch contra el sitio o app real del cliente (ej.
https://www.colorfetch.com/ apuntando al dominio del cliente). Esto te da los colores de marca
reales sin depender de que el usuario los tenga documentados en un lugar accesible.

## Homologar contra un dashboard existente — SIEMPRE con datos live, nunca de memoria

Si ya existe otro dashboard de este cliente (del mismo proyecto o de un pilar/proceso distinto),
**extraé los `colorRules` reales de su JSON vía `dtctl get dashboard` en vez de confiar en lo que
recordás de una sesión anterior o de esta misma conversación**. Los colores "recordados"
pueden estar desactualizados si el usuario tocó el dashboard manualmente en la UI después de tu
última lectura — pasó en sesión real: un pedido de "arreglá el tamaño" resultó estar ya resuelto
porque el usuario lo había ajustado a mano entre una consulta y la siguiente.

```bash
dtctl get dashboard <id-del-dashboard-existente> -o json > /tmp/ref_dashboard.json
# luego grep/parseá visualizationSettings.coloring.colorRules de cada tile
```

## Mapeo semántico de colores que funcionó bien en sesión real (AFORE México)

No son colores universales — son un ejemplo del criterio de mapeo, adaptalo a la paleta real
del cliente que estés trabajando:

| Rol semántico | Ejemplo de color usado | Uso |
|---|---|---|
| Código de éxito primario (0) | Navy `#0033A0` | Estado de éxito principal, banners |
| Código de éxito secundario (7) | Teal `#02ADC7` | Variante de éxito, distinción visual |
| Genérico / neutro | Azul `#216FF3` | Series sin significado de éxito/error específico |
| Alerta / código de atención (32) | Amarillo `#DFE52A` | Estados intermedios, no error grave |
| Éxito confirmado (binario) | Verde `#67C63F` | Trend binario Éxito/No-Éxito |
| Error (11 u otros códigos de error) | Rojo de variable nativa de Dynatrace (error color) | Usar la variable de tema nativa de error, no un rojo custom — se mantiene coherente con el resto de la UI de Dynatrace (problemas, alertas nativas) |

Aplicá la paleta de forma **consistente en todos los tiles** vía `colorRules` de tipo
custom-color en `visualizationSettings.coloring` — no solo en el banner de título de cada
columna. Un dashboard donde solo el banner tiene marca y el resto es gris default de Dynatrace
se ve como un trabajo a medias.

## Reutilizar el logo

Si el logo del cliente ya fue subido como documento de la plataforma en una sesión anterior
(vía Document API, `/platform/document/v1/documents/<id>/content`), reutilizá ese ID en vez de
volver a subirlo — buscalo primero antes de asumir que hay que resubir.

## Un banner de título ≠ terminado

Después de aplicar la paleta, verificá visualmente (screenshot o navegación real, no solo el
JSON) que:
- Los colores se vean coherentes con el resto de dashboards del mismo cliente (misma paleta,
  mismo criterio semántico código→color).
- El singleValue de "Total" no tenga el color de fondo si el usuario pidió que solo el texto
  lleve color (`colorThresholdTarget: "background"` fuera si corresponde — ver
  `layout-pilares.md` punto 3).
