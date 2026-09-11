# Guion de demostración — NEXUS Gaming

Duración sugerida: 3–5 minutos.

## Preparación
- Ejecutar `npm ci` la primera vez y `npm run dev`.
- Abrir la URL de Vite y `db.json` en el editor.
- Verificar que al menos tres productos tengan fecha dentro de los últimos 90 días. Las fechas iniciales corresponden a septiembre de 2026.
- Tener disponibles `docs/workflow.svg`, el informe y `src/hooks/useRadar.js`.

## Presentación
1. **Caso de uso (30 s).** “Esta tienda automatiza la selección de novedades. Cada 10 segundos consulta el catálogo y muestra hasta tres productos recientes con stock, ordenados por valoración”.
2. **Disparador y éxito (20 s).** Mostrar el panel y la hora de última actualización. Esperar un ciclo sin tocar nada; la hora y el historial cambian.
3. **Cambio observable (30 s).** En `db.json`, cambiar la valoración de `ram-01` a 5 y guardar. Debe subir al primer lugar en el siguiente ciclo si su fecha sigue dentro de los 90 días. Poner su stock en 0 debe sacarlo del ranking. Restaurar los valores originales (rating 4.8, stock 20).
4. **Pausa (20 s).** Pulsar Pausar y esperar más de 10 segundos: estado Inactivo y hora estable. Reanudar y observar Éxito.
5. **Error y recuperación (20 s).** Abrir Actividad, simular fallo. Mostrar Error/HTTP 503 y los datos conservados. Sin hacer clic, esperar el siguiente ciclo y comprobar Éxito.
6. **En ejecución (20 s).** En herramientas del navegador → Network, activar un perfil lento durante una consulta. Mostrar En ejecución; al completar, Éxito. Si supera 6 s, el timeout lleva a Error. Desactivar throttling.
7. **Tienda (30 s).** Filtrar una categoría, buscar un nombre y cambiar el orden. Agregar al carrito, modificar cantidad y mostrar el total. Explicar que es una simulación sin pagos.
8. **Código y diagrama (45 s).** Mostrar useState, useEffect, setInterval, fetch, AbortController y el retorno de limpieza. Relacionar cada rama con el workflow.
9. **Cierre (15 s).** Aclarar que las fechas, precios y valoraciones son de demostración y que la selección proviene del catálogo local.

## Casos adicionales
| Prueba | Resultado esperado |
| --- | --- |
| JSON inválido | API HTTP 500; UI Error; conserva última lectura válida |
| Corregir JSON | Recuperación automática en el siguiente ciclo |
| Precio negativo o ID duplicado | Error de validación; no se reemplazan los datos válidos |
| `products: []` | Éxito; catálogo y ranking vacíos |
| Producto con fecha futura | Se ve en catálogo, queda fuera del radar |
| Producto antiguo o sin stock | Queda fuera del radar |
| Todos agotados | Radar vacío; botones de agregar deshabilitados |
| Pausar durante fetch | Petición abortada; Inactivo; ningún resultado tardío modifica la UI |
| Buscar texto inexistente | Mensaje sin resultados y botón Limpiar filtros |
| Navegar con Tab / Escape | Foco visible; diálogo cerrado con Escape |

## Antes de entregar
- [ ] Completar datos personales del informe y exportarlo a PDF.
- [ ] Confirmar `npm test`, `npm run lint` y `npm run build`.
- [ ] Restaurar los productos después de las pruebas manuales.
- [ ] Subir el código al repositorio y comprobar el enlace.
- [ ] Entregar informe y diagrama según el medio indicado por el docente.
