# Plantilla de entregables

Dos documentos. El ejecutivo se lee en 5 minutos y se lleva a una reunión comercial; el técnico
permite reproducir el análisis sin volver a preguntar.

---

## A. `Informe_Consumo_DPS_<Cliente>_<YYYY-MM>.md`

```markdown
# Informe de consumo DPS — <Cliente>
**Ambiente:** <tenant>.apps.dynatrace.com · **Periodo:** <inicio> a <fin>
**Elaborado:** <fecha> · **Audiencia:** dirección / compras / observabilidad

## 1. Conclusión en una línea
<Qué pasó, cuánto costó y qué hay que hacer. Una frase.>

## 2. Resumen de consumo

| Capability | Consumo | Tarifa | Costo | Calidad |
|---|---|---|---|---|
| Logs/Traces/Events — Query | X GiB escaneados | $0.0035/GiB | $X | exacto |
| Logs/Traces/Events — Ingest & Process | X GiB | $0.20/GiB | $X | estimado |
| Logs/Traces/Events — Retain | X GiB-día | $0.0007/GiB-día | $X | estimado |
| Metrics — Ingest & Process | X datapoints | $0.15/100k | $X | parcial (<N> días) |
| Security Posture Management | X nodos × Y h | $0.007/host-hora | $X | exacto en alcance |
| **Total del periodo** | | | **$X** | |

> Cada fila lleva etiqueta de calidad. Las estimaciones declaran su supuesto en §6.

## 3. Concentración del gasto
<Regla 80/20: qué bucket / qué query / qué usuario concentra el consumo. Con %.>

Ejemplo del formato esperado:
> El bucket `X` concentra el **99.6 %** del total escaneado del tenant. Dentro de él, dos
> patrones de `query_string` con `avg = 141 GiB` y ~18 900 ejecuciones cada uno explican la
> totalidad — corresponden a tiles del dashboard "<nombre>" con auto-refresh.

## 4. Consumo indebido identificado

| # | Hallazgo | Impacto $ | Dueño | Acción | Esfuerzo |
|---|---|---|---|---|---|
| 1 | <patrón> | $X | <persona/equipo> | <qué hacer> | <horas> |

Impacto = costo del periodo auditado + proyección anualizada si no se corrige.

## 5. Recomendaciones priorizadas
1. **<Acción de mayor ahorro>** — ahorro estimado $X/año, esfuerzo <bajo/medio/alto>.
2. ...

Incluye siempre la comparativa contractual si Query domina:
> Escenario A (actual: Query + Retain) = $X · Escenario B (Retain with Included Queries) = $Y.
> Diferencia anualizada: $Z. Requiere renegociación de la línea de retención.

## 6. Supuestos y limitaciones
- **Query:** exacto; `dt.system.query_executions` cubre todo el periodo.
- **Ingest/Retain:** estimado desde snapshot + supuesto de crecimiento lineal. No hay serie
  histórica diaria de tamaño de bucket vía DQL.
- **Metrics Ingest:** la métrica de self-monitoring retiene ~24–30 días; no se reconstruyó
  <meses>. Cifra parcial.
- **Security Posture:** cobertura continua asumida desde la fecha de habilitación confirmada; no
  hay eventos on/off del capability, solo la config actual y el primer hallazgo.
- <Incidencias de ejecución relevantes: cortes de scan, errores de red, reintentos.>

## 7. Anexo — evidencia
<Tablas crudas de las queries clave: top buckets, top query_string, top usuarios.>
```

---

## B. `Metodologia_y_Queries_<Cliente>_<YYYY-MM>.md`

Documenta **en orden de ejecución**: cada comando, su propósito y qué se aprendió de la salida.

```markdown
# Metodología y queries — <Cliente>
**Complementa a:** `Informe_Consumo_DPS_<Cliente>_<YYYY-MM>.md`
**Herramienta:** dtctl / MCP Dynatrace + DQL sobre Grail

## 0. Setup del contexto
<Comandos de auth/contexto y cualquier problema encontrado.>

## 1. Descubrimiento — qué hay y cómo se factura
<inventory + búsqueda de métricas de billing. Documenta que las categorías DPS NO existen.>

## 2..N. Una sección por capability
Para cada una:
- **Comando(s)** en bloque de código
- **Hallazgo** — qué devolvió y qué significa
- **Lección para el equipo** — si hubo un callejón sin salida, dilo aquí

## Intentos descartados
<Query que se probó, por qué falla, qué se usó en su lugar. Esta sección ahorra días.>

## Fórmulas de costeo usadas
<Tabla categoría / fórmula / fuente del dato.>

## Cómo extender esto a un dashboard de gobernanza
<Qué queries de las anteriores son reutilizables como tiles permanentes.>
```

---

## Reglas de redacción

- **Toda cifra lleva calidad.** exacto / estimado / parcial / no disponible.
- **Nombres propios en los hallazgos.** "el bucket X, el dashboard Y, el usuario Z" — un informe
  que dice "algunos dashboards" no genera acción.
- **Impacto en dólares y en tiempo.** "$X/año" y "N horas de trabajo para corregirlo".
- **Los intentos fallidos se documentan.** El siguiente que audite no repite el callejón.
- **Sin adjetivos de alarma.** "El consumo creció 12x entre enero y julio" pesa más que
  "consumo desbordado y crítico".
