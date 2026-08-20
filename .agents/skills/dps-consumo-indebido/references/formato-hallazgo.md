# Formato de hallazgo y cálculo de impacto

## Plantilla

```markdown
### H<N> · <Título> — Sev. <A/B/C>

**Evidencia**
```
<query ejecutada>
```
| … | … |   ← salida recortada a las 3-5 filas que sostienen el hallazgo

**Qué está pasando**
<2-3 frases: qué objeto, desde cuándo, con qué frecuencia, sobre qué dato.>

**Objeto:** <dashboard / regla / config + ID> · **Contacto:** <equipo o persona>

**Impacto**
| | |
|---|---|
| Consumo observado | <X GiB / N datapoints / N host-horas> |
| Costo del periodo | $<A> |
| Proyección anual sin corregir | $<B> |
| Ahorro estimado de la corrección | $<C> (<factor>) |

**Acción:** <cambio concreto y verificable>
**Esfuerzo:** <horas> · **Riesgo:** <qué se pierde o se rompe>
**Verificación:** <query o métrica que confirma que el fix funcionó, a los N días>
```

El campo **Verificación** no es opcional. Un hallazgo sin forma de comprobar el fix se vuelve a
descubrir en la siguiente auditoría.

---

## Cálculo del impacto

### Costo del periodo
`consumo_observado × tarifa` del `rate-card.json`. Usa **GiB**, no GB decimal (7.4 % de
diferencia).

### Proyección anual
```
proyeccion = costo_periodo × (365 / dias_del_periodo)
```

Solo si el patrón es **estable**. Si la tendencia mensual es creciente, dilo y proyecta con la
pendiente de los últimos 3 meses en vez de con el promedio — y márcalo como escenario.

### Factor de reducción — justifícalo siempre

| Acción | Factor | Razonamiento |
|---|---|---|
| Refresh 1 min → 15 min | ×1/15 (−93 %) | ejecuciones proporcionales al refresh |
| Refresh 1 min → bajo demanda | ~−99 % | de 1 440/día a unas decenas |
| Timeframe 90 d → 7 d | ×7/90 (−92 %) | bytes escaneados proporcionales al rango |
| Añadir filtro de bucket | −(1 − share_del_bucket) | según §1.3 del cookbook |
| Desactivar estándar de compliance irrelevante | −(cnt_estándar / cnt_total) | proporción de hallazgos |
| Borrar metric-extraction | −100 % de esa `grail.metric.key` | el dato deja de generarse |
| Bajar retención 365 d → 90 d | ×90/365 (−75 %) en Retain | GiB-día proporcional |
| Migrar a Retain with Included Queries | Query → $0; Retain × (0.02/0.0007) | comparar totales, no líneas |

Las acciones **se multiplican** cuando aplican al mismo objeto: bajar refresh **y** timeframe en
el mismo tile da `1/15 × 7/90 ≈ −99.5 %`. Dilo así, no sumes porcentajes.

---

## Priorización

```
prioridad = ahorro_anual / horas_de_esfuerzo
```

Ordena la tabla ejecutiva por esa razón. Un hallazgo de $80k que se arregla en 2 h (40k/h) va
antes que uno de $200k que exige renegociar contrato (~1k/h con 200 h de proceso comercial).

Salvo una excepción: si un hallazgo Sev. C es la **causa estructural** de varios Sev. A, va
primero en el relato aunque no en la ejecución. Se corrige lo táctico ya y se abre lo
estructural en paralelo.

---

## Tabla ejecutiva

| # | Hallazgo | Sev. | Objeto | Ahorro anual | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|
| H1 | Dashboard con refresh sobre bucket de 1 TB | A | `1347d11d` | $X | 2 h | 1 |

Debajo de la tabla, una línea de cierre:

> Ahorro anual total identificado: **$X** · Esfuerzo agregado: **N horas** ·
> Cifras exactas: <n> hallazgos · Estimadas: <m> hallazgos.

---

## Qué NO es un hallazgo

- "Revisar los dashboards del tenant" — no tiene objeto ni cifra.
- "El consumo es alto" — no tiene comparación ni acción.
- "Podría optimizarse" — no tiene factor de reducción.
- Un pico único sin recurrencia — es un evento, no un patrón.
- Algo que tú mismo generaste auditando.

Si no puedes llenar **Objeto**, **Impacto $** y **Acción**, no es un hallazgo todavía: es una
pista. Ponlo en un apartado "Pendientes de investigar" y sigue.
