# NEXUS Gaming — Laboratorio de automatización en React

Tienda gamer con catálogo, filtros, búsqueda, ordenamiento, carrito de demostración y un radar que consulta una API local cada **10 segundos**. La API lee `db.json` en cada petición: no necesitas JSON Server, una cuenta ni una clave de API.

**Datos ficticios:** nombres, precios en CRC, valoraciones y fechas se incluyen únicamente para demostrar la automatización. “Mejores” significa los mejor valorados dentro de este catálogo; no es una comparación real del mercado.

## Iniciar

Requisito: **Node.js 24** (versión utilizada: 24.20.0) y npm. Desde la raíz del repositorio:

```powershell
cd laboratorio
npm ci
npm run dev
```

Abre la dirección que indique Vite, normalmente **http://127.0.0.1:5173/**. Un solo comando inicia React y la API en el puerto 3001. Usa **Ctrl+C** para detener ambos. Si 5173 está ocupado, Vite elige otro puerto. Si 3001 está ocupado, detén la instancia anterior antes de iniciar otra.

En PowerShell, si la política de ejecución bloquea `npm.ps1`, usa `npm.cmd ci` y `npm.cmd run dev`; no necesitas cambiar la política del equipo.

## Qué hace automáticamente

1. Al montar la aplicación se programa una primera consulta.
2. Un `setInterval` dispara otro ciclo cada 10 segundos.
3. `fetch('/api/products')` consulta la API y lee la versión actual de `db.json`.
4. Se valida el catálogo completo.
5. Se seleccionan productos con stock y fecha entre hoy y hace 90 días, inclusive, usando días UTC.
6. Se ordenan por valoración descendente, fecha descendente y por ID ascendente en caso de empate.
7. Se muestran los primeros tres y se actualizan catálogo, hora e historial.
8. Ante HTTP incorrecto, respuesta inválida, red caída o timeout de 6 segundos, se muestra el error, se conservan los últimos datos válidos y se reintenta en el próximo intervalo.

El ranking se deriva de los datos: no hay una lista fija de IDs destacados. No se hace scraping ni se descubren productos nuevos en Internet; el proceso automatiza la consulta y clasificación del catálogo local.

**Estados:** Inactivo, En ejecución, Éxito y Error. Pausar cancela la petición y los temporizadores; reanudar consulta de nuevo. Actualizar hace una consulta inmediata. La actividad muestra hasta 8 resultados recientes. Una lista vacía es válida y produce éxito sin novedades.

## Probar un cambio automático

Con la página abierta, edita `db.json`: cambia una valoración, un precio o el stock y guarda. Espera como máximo el siguiente ciclo, sin recargar la página. Para agregar una novedad, copia un producto y asigna un ID único, fecha actual y stock positivo.

Ejemplo de producto válido:

```json
{
  "id": "demo-nuevo",
  "name": "Nexus Demo Edition",
  "category": "Tarjetas gráficas",
  "price": 150000,
  "stock": 5,
  "rating": 5,
  "releaseDate": "2026-09-11",
  "description": "Producto ficticio para demostrar el radar."
}
```

**Cambia la fecha del ejemplo por el día de tu presentación.** Los datos iniciales están preparados para septiembre de 2026; después de 90 días dejarán de aparecer en el radar por diseño. Permanecerán en el catálogo. Las fechas futuras y los productos agotados quedan excluidos del ranking.

Categorías válidas: Tarjetas gráficas, Procesadores, Memoria RAM, Almacenamiento, Periféricos y Monitores. Precios mayores que cero, stock entero no negativo, valoración entre 0 y 5 y fechas reales `AAAA-MM-DD`. No uses comas finales en JSON.

## Demostración de todos los estados

Consulta [el guion completo](docs/demostracion.md).

- **Éxito:** abrir la aplicación y esperar el primer resultado.
- **En ejecución:** se muestra durante cada consulta. Para verlo con calma, usa Network → throttling en DevTools; una petición de más de 6 segundos genera timeout.
- **Inactivo:** pulsar “Pausar radar”; comprobar que la hora no cambia durante más de 10 segundos.
- **Error:** abrir “Actividad de la automatización” y pulsar “Simular fallo de una consulta”. La ruta de demostración devuelve HTTP 503; el siguiente ciclo recupera el estado Éxito automáticamente.

Puedes provocar un error real escribiendo JSON inválido en `db.json`, guardando y esperando; corrige el archivo para observar la recuperación.

## Comprobaciones

```powershell
npm test
npm run lint
npm run build
```

Las pruebas de Node verifican ranking, desempates, límites temporales, catálogo vacío, validación y una API real con archivo temporal: lectura después de cambios, JSON roto, recuperación, HTTP 503, 404 y 405.

Prueba opcional de navegador con Chrome instalado y `npm run dev` ejecutándose:

```powershell
node scripts/check-browser.mjs
```

Usa Chrome sin ventana con perfil temporal separado. Prueba carga, pausa, reanudación, recuperación de error, filtros, búsqueda, carrito y ancho móvil. Guarda capturas en `docs/evidencias/`. Por defecto busca Chrome en su ruta habitual de Windows; puedes configurar `CHROME_PATH`. Necesita el puerto 9337 libre. El script espera la dirección 5173 y el catálogo inicial de 12 productos, por lo que debe ejecutarse antes de editar los datos de demostración.

Para probar la compilación, en dos terminales:

```powershell
npm run api
```

```powershell
npm run preview
```

Abre la dirección de preview que indique Vite. El frontend compilado necesita la API: subir solo `dist` a un alojamiento estático no proporciona el servidor.

## Estructura

| Archivo | Función |
| --- | --- |
| `src/App.jsx` | Página, búsqueda, categorías, orden y selección del carrito |
| `src/hooks/useRadar.js` | Disparadores, estados, fetch, timeout, reintentos y limpieza |
| `src/lib/catalog.js` | Validación y cálculo del ranking |
| `src/components/ProductCard.jsx` | Tarjeta reutilizable del catálogo |
| `src/components/ProductArt.jsx` | Ilustraciones SVG locales por categoría |
| `src/components/RadarPanel.jsx` | Ranking, controles, estados e historial |
| `src/components/Cart.jsx` | Diálogo accesible, cantidades y total |
| `server/api.mjs` | API HTTP de Node; lectura de db.json por petición |
| `scripts/dev.mjs` | Arranque conjunto de Vite y API |
| `db.json` | 12 productos ficticios y metadatos |
| `tests/` | Pruebas de reglas y API |
| `docs/` | Informe, diagrama, guía y evidencias |

El carrito usa memoria de React durante la sesión; al recargar se vacía. No procesa pagos ni crea pedidos. Los precios y las cantidades visibles se ajustan a la última consulta válida.

## Entregables y rúbrica

| Requisito del PDF | Evidencia |
| --- | --- |
| Vite + React | package.json, vite.config.js |
| useState + useEffect | useRadar.js; RadarPanel.jsx |
| Disparador claro | Montaje, temporizador de 10 segundos y botones |
| Caso asíncrono o temporal | fetch, async/await, setInterval, setTimeout |
| Limpieza de efectos | clearInterval, clearTimeout, AbortController y bandera disposed |
| Al menos dos componentes reutilizables | ProductCard, ProductArt, Cart, RadarPanel |
| Cuatro estados | Inactivo / En ejecución / Éxito / Error |
| Inicio, disparador, procesos, decisión, éxito y error | [Workflow Mermaid](docs/workflow.md) y [diagrama SVG](docs/workflow.svg) |
| Informe de 1–2 páginas | [Informe imprimible de 2 páginas](docs/informe.html) |
| Demostración funcional | [Guion](docs/demostracion.md) y capturas en docs/evidencias |
| Código en repositorio y README | Proyecto listo para incorporar al repositorio existente |

La rúbrica distribuye 30 puntos para automatización, 20 para hooks y efectos, 15 para asincronía, 20 para el diagrama, 10 para componentización/calidad y 5 para informe/documentación. Esta tabla permite ubicar cada evidencia; la calificación corresponde al docente.

## Preparar la entrega

1. Revisa el código y practica el guion; la actividad es individual.
2. El PDF incluido tiene campos personales pendientes. Completa nombre, curso/grupo y fecha en `docs/informe.html`. Abre el archivo y usa **Imprimir → Guardar como PDF**, tamaño A4, escala 100 %, sin encabezados/pies del navegador. Tiene dos páginas definidas.
3. Incluye el informe, workflow y código. Las capturas son opcionales según el PDF.
4. Desde la raíz del repositorio, revisa y publica los cambios en tu GitHub:

```powershell
git status
git add README.md laboratorio
git commit -m "Implementa tienda gamer y radar automatizado en React"
git push origin HEAD
```

5. Comprueba en GitHub que se vean los archivos y entrega el enlace que solicite el docente.

No subas `node_modules` ni `dist`; están excluidos en .gitignore. Los comandos de publicación se proporcionan para la entrega; no se han ejecutado automáticamente.
