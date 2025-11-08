# Advertencia: Archivos duplicados

**NOTA IMPORTANTE:** Este directorio contiene archivos duplicados con funcionalidad similar a la que se encuentra en `src/features/comercial/`.

## Archivos obsoletos en este directorio:
- `DetatalleCotizacion.jsx` → Reemplazado por `src/features/comercial/cotizaciones/DetalleCotizacion.jsx`

## Archivo funcional actual:
- El componente activo para detalles de cotización se encuentra en: `src/features/comercial/cotizaciones/DetalleCotizacion.jsx`
- Este se importa y usa en `src/App.jsx` en la ruta `cotizaciones/:id`

## Recomendación:
Eliminar este directorio `src/pages/comercial` o mover todos los componentes activos a `src/features/comercial/` para mantener una única fuente de verdad.