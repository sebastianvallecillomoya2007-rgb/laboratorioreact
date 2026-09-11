# Workflow: radar de novedades NEXUS

```mermaid
flowchart TD
  A([Inicio: montar React]) --> B[Inactivo: preparar efecto]
  B --> C[Disparador: inicio, temporizador de 10 s o actualización manual]
  C --> D[En ejecución: fetch /api/products con límite de 6 s]
  D --> E{¿HTTP correcto y catálogo válido?}
  E -- Sí --> F[Filtrar lanzamientos de los últimos 90 días con stock]
  F --> G[Ordenar por valoración, fecha e ID; seleccionar top 3]
  G --> H[Éxito: actualizar catálogo, ranking, hora e historial]
  E -- No --> I[Error: mostrar causa y conservar últimos datos válidos]
  H --> J[Esperar próximo intervalo de 10 s]
  I --> J
  J --> C
  H -. Pausar .-> K[Inactivo: cancelar petición y temporizadores]
  I -. Pausar .-> K
  D -. Pausar .-> K
  K --> L[Reanudar]
  L --> C
  C -. Simular fallo .-> M[Una petición usa /api/demo-error]
  M --> E
  B -. Desmontar / cambiar configuración .-> N([Limpieza: cancelar intervalos y abortar fetch])
```

El montaje programa el primer ciclo inmediatamente. Un candado evita solicitudes simultáneas. Pausar conserva el último catálogo; reanudar comienza un ciclo nuevo. La simulación devuelve HTTP 503 una sola vez y el siguiente intervalo usa la ruta normal. Un catálogo válido sin novedades es un éxito con una lista vacía. El plazo de 90 días se calcula con la fecha del sistema, en UTC.
