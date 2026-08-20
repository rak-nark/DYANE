# Atribución — de la señal al dueño

Una query costosa no es un hallazgo hasta que tiene nombre. Tres rutas, de más rápida a más
laboriosa.

---

## Ruta 1 · `client.source` — la URL completa del dashboard

La más rápida cuando existe `dt.system.events`. Devuelve directamente el link.

```
fetch dt.system.events, from:now()-7d
| filter event.kind == "BILLING_USAGE_EVENT" and event.type == "Events - Query"
    and user.email == "USUARIO"
| summarize consultas = count(), GiB = sum(toLong(billed_bytes))/1073741824.0,
    by: {client.source}
| sort GiB desc | limit 10
```

Salida típica:

```
https://<hash>--<tenant>.apps.dynatrace.com/ui/dashboard/d54af978-9b0b-4c7f-aee2-2d0b5e7aa82d
```

El GUID final es el `document.id`. Con eso:

```bash
dtctl get dashboard d54af978-9b0b-4c7f-aee2-2d0b5e7aa82d -o json --plain > dash.json
```

**Dos observaciones que ahorran confusión:**

- El mismo dashboard aparece bajo **varios hosts con hash distinto** (uno por sesión/app-context).
  Suma los GiB de todas las variantes del mismo GUID antes de cuantificar el impacto.
- Un `client.source` **null** con muchas ejecuciones y GiB bajos suele ser tráfico de API o de la
  app Problems, no un dashboard. No lo persigas.

---

## Ruta 2 · Búsqueda por palabra clave del negocio

Cuando no tienes el GUID pero sí sabes de qué habla la query (nombre de bucket, campo custom,
tabla).

```bash
dtctl get dashboards -o json --plain > dash_list.json
grep -o '{"id":"[^}]*PALABRA_CLAVE[^}]*}' dash_list.json
```

Usa una palabra del **dominio de negocio** (`Factura`, `Ventanilla`, `CUFE`), no un término
técnico — los nombres de dashboard los escriben los usuarios.

Confirma que el patrón vive ahí:

```bash
dtctl get dashboard <ID> -o json --plain > dash.json
grep -o '"defaultTimeframe":{[^}]*}[^}]*}' dash.json   # el multiplicador de costo
grep -c 'CAMPO_CARACTERISTICO' dash.json               # confirma el patrón de query
```

El `defaultTimeframe` es lo primero que hay que mirar: un dashboard a 90 días escanea 90x lo que
uno a 1 día, con el mismo refresh.

---

## Ruta 3 · Escaneo de tiles

El JSON del dashboard **escapa los `\n`**, así que un `grep` plano no encuentra el `query_string`
completo tal como aparece en `dt.system.query_executions`. Para comparación exacta hay que
decodificar.

Con `jq`:
```bash
jq -r '.tiles | to_entries[] | .value.query // empty' dash.json
```

Con `dtctl --jq` directamente, sin archivo intermedio.

Para barrer **todos** los dashboards del tenant (el enfoque de la app de gobernanza oficial):
descargar el contenido de cada documento, recorrer `tiles`, extraer `tile.query` y
`tile.queries[]`, y contar ocurrencias por texto normalizado. Filtra por prefijo válido
(`fetch|timeseries|smartscapeEdges|smartscapeNodes`) para descartar strings que no son DQL.

---

## Atribuir configuración: quién creó la regla

Para compliance scans, metric-extraction rules, monitores sintéticos o cualquier objeto de
settings, el dueño está en los eventos de auditoría:

```
fetch dt.system.events, from:"FROM_DATE"
| filter event.kind == "AUDIT_EVENT"
| filter contains(dt.settings.schema_id, "SCHEMA_BUSCADO")
| fields timestamp, user.email, event.type, dt.settings.schema_id, dt.settings.object_id
| sort timestamp desc | limit 50
```

Da quién y cuándo. Combínalo con el primer evento generado por el objeto para fechar el inicio
del cargo:

```
fetch security.events, from:"FROM_DATE"
| filter event.type == "COMPLIANCE_FINDING"
| summarize first = min(timestamp), last = max(timestamp)
```

La diferencia entre "cuándo se configuró" y "cuándo empezó a facturar" a veces revela que el
capability se habilitó por error en un cambio masivo.

---

## Antes de escribir un nombre en el informe

Cuatro verificaciones. Todas han evitado un error real:

1. **¿El `user.email` es el autor o el visor?** En dashboards compartidos es el visor. Reporta el
   **dashboard** como objeto y la persona solo como contacto, salvo que sea una query de consola
   (`query_pool == "DEFAULT"`).

2. **¿Eres tú?** Filtra tu propio correo y el del equipo auditor. Un análisis de consumo mal
   escrito aparece en el top 3 del propio informe.

3. **¿Es recurrente o fue una vez?** Cruza contra la tendencia mensual del §1.6 del cookbook. Un
   forense legítimo escanea mucho un día; un problema estructural escanea todos los meses.

4. **¿Hay un requisito detrás?** Antes de recomendar bajar retención o apagar un capability,
   pregunta. En facturación electrónica, salud y banca la retención suele ser regulatoria y la
   recomendación correcta es cambiar el modelo de tarifa, no borrar el dato.

---

## Redacción

Escribe **el objeto como sujeto**, no la persona:

> ✅ "El dashboard *Facturas Electrónicas v3* (`1347d11d`) ejecuta dos tiles con `avg = 141 GiB`
> y ~18 900 ejecuciones en el periodo. Contacto: <equipo>."

> ❌ "<Persona> generó el 99 % del consumo del tenant."

La segunda versión es técnicamente derivable del mismo dato y convierte un informe de costos en
un problema de personas. La primera produce el mismo cambio sin ese costo.
