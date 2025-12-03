# Mostrar Cotización

Obtiene la información detallada de una cotización específica, incluyendo productos, ítems y todos los porcentajes asociados.

## Endpoint

```http
GET /api/quotations/{id}
```

## Parámetros de la URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la cotización a obtener |

## Encabezados

```http
Authorization: Bearer <token>
Accept: application/json
```

## Respuesta Exitosa

```json
{
    "success": true,
    "data": {
        "quotation_id": 10,
        "client_id": 1,
        "user_id": 1,
        "project_name": "Proyecto de prueba",
        "system_type": "On-grid",
        "power_kwp": "4.00",
        "panel_count": 7,
        "requires_financing": 0,
        "profit_percentage": "0.050",
        "iva_profit_percentage": "0.190",
        "commercial_management_percentage": "0.030",
        "administration_percentage": "0.080",
        "contingency_percentage": "0.020",
        "withholding_percentage": "0.035",
        "subtotal": 22219025,
        "profit": 1144279.79,
        "profit_iva": 217413.16,
        "commercial_management": 666570.75,
        "administration": 1830847.66,
        "contingency": 457711.92,
        "withholdings": 928754.69,
        "total_value": 27464602.96,
        "creation_date": "2025-10-27T20:52:28.000000Z",
        "subtotal2": 22885595.75,
        "subtotal3": 26535848.27,
        "status_id": 1,
        "status": {
            "status_id": 1,
            "name": "Borrador",
            "description": "Cotización en elaboración",
            "color": "#9ca3af"
        },
        "client": {
            "client_id": 1,
            "name": "Marianne Langosh",
            "nic": "31911",
            "client_type": "comercial",
            "email": "terrance.kirlin@example.org",
            "phone": "430.627.0126"
        },
        "user": {
            "id": 1,
            "name": "Administrador",
            "email": "admin@energy4cero.com"
        },
        "products": [
            {
                "used_product_id": 26,
                "quotation_id": 10,
                "product_id": 1,
                "product_type": "panel",
                "quantity": 7,
                "unit_price": "435000.00",
                "partial_value": "3045000.00",
                "profit_percentage": "0.250",
                "profit": "761250.00",
                "total_value": "3806250.00"
            },
            {
                "used_product_id": 27,
                "quotation_id": 10,
                "product_id": 1,
                "product_type": "inverter",
                "quantity": 1,
                "unit_price": "5455220.00",
                "partial_value": "5455220.00",
                "profit_percentage": "0.250",
                "profit": "1363805.00",
                "total_value": "6819025.00"
            }
        ],
        "quotation_items": [
            {
                "quotation_item_id": 11,
                "quotation_id": 10,
                "description": "Estructura de soporte para paneles solares",
                "item_type": "material",
                "quantity": "7.00",
                "unit": "unidad",
                "unit_price": "105000.00",
                "partial_value": "735000.00",
                "profit_percentage": "0.250",
                "profit": "183750.00",
                "total_value": "918750.00"
            },
            {
                "quotation_item_id": 12,
                "quotation_id": 10,
                "description": "Trámites y permisos",
                "item_type": "servicio",
                "quantity": "1.00",
                "unit": "trámite",
                "unit_price": "7000000.00",
                "partial_value": "7000000.00",
                "profit_percentage": "0.050",
                "profit": "350000.00",
                "total_value": "7350000.00"
            },
            {
                "quotation_item_id": 13,
                "quotation_id": 10,
                "description": "Mano de obra instalación",
                "item_type": "mano_obra",
                "quantity": "7.00",
                "unit": "panel",
                "unit_price": "200000.00",
                "partial_value": "1400000.00",
                "profit_percentage": "0.250",
                "profit": "350000.00",
                "total_value": "1750000.00"
            },
            {
                "quotation_item_id": 14,
                "quotation_id": 10,
                "description": "Material eléctrico",
                "item_type": "material",
                "quantity": "1.00",
                "unit": "metro",
                "unit_price": "1260000.00",
                "partial_value": "1260000.00",
                "profit_percentage": "0.250",
                "profit": "315000.00",
                "total_value": "1575000.00"
            }
        ]
    },
    "message": "Cotización obtenida exitosamente"
}
```

## Respuesta de Error

```json
{
  "success": false,
  "message": "Cotización no encontrada"
}
```

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | Cotización obtenida exitosamente |
| 404 | Cotización no encontrada |
| 500 | Error interno del servidor |
