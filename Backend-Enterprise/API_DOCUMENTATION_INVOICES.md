# Documentación de APIs - Gestión de Facturas

## 📋 **Resumen**
Los servicios API para la gestión de facturas están completamente implementados y funcionales. Este documento detalla todas las funcionalidades disponibles.

## 🗄️ **Base de Datos**

### Tabla `invoices`
```sql
- invoice_id (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- supplier_id (BIGINT, FOREIGN KEY -> suppliers.supplier_id)
- cost_center_id (BIGINT, FOREIGN KEY -> cost_centers.cost_center_id)
- invoice_number (VARCHAR(50), UNIQUE)
- amount_before_iva (DECIMAL(15,2))
- total_value (DECIMAL(15,2))
- status (ENUM: 'pendiente', 'pagada', 'anulada')
- payment_type (ENUM: 'parcial', 'total')
- issue_date (DATE)
- due_date (DATE, NULLABLE)
- file_path (VARCHAR(255), NULLABLE)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Índices
- (supplier_id, status)
- (cost_center_id, status)
- issue_date

## 🔗 **Endpoints API**

### **Base URL:** `http://127.0.0.1:8000/api`

### **Autenticación Requerida**
Todos los endpoints requieren autenticación Bearer Token y permisos `commercial.read` o `commercial.update`.

---

## 📊 **1. Estadísticas de Facturas**
**GET** `/invoices/statistics`

**Permisos:** `commercial.read`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_invoices": 150,
      "pending_invoices": 45,
      "paid_invoices": 98,
      "cancelled_invoices": 7,
      "total_amount": 250000000.00,
      "pending_amount": 75000000.00,
      "paid_amount": 165000000.00,
      "overdue_invoices": 12,
      "by_supplier": [
        {
          "supplier_id": 1,
          "count": 25,
          "total": 50000000.00
        }
      ],
      "monthly_stats": [
        {
          "year": 2025,
          "month": 11,
          "count": 15,
          "total": 25000000.00
        }
      ]
    }
  }
}
```

---

## 📋 **2. Opciones para Formularios**
**GET** `/invoices/options`

**Permisos:** `commercial.read`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "options": {
      "statuses": [
        {"value": "pendiente", "label": "Pendiente"},
        {"value": "pagada", "label": "Pagada"},
        {"value": "anulada", "label": "Anulada"}
      ],
      "payment_types": [
        {"value": "parcial", "label": "Pago Parcial"},
        {"value": "total", "label": "Pago Total"}
      ]
    }
  }
}
```

---

## 📄 **3. Listar Facturas**
**GET** `/invoices`

**Permisos:** `commercial.read`

**Parámetros de Query:**
- `search` (string): Búsqueda por número de factura, nombre de proveedor o centro de costos
- `status` (string): Filtrar por estado
- `payment_type` (string): Filtrar por tipo de pago
- `supplier_id` (int): Filtrar por proveedor
- `cost_center_id` (int): Filtrar por centro de costos
- `start_date` (date): Fecha inicial para rango
- `end_date` (date): Fecha final para rango
- `sort_by` (string): Campo para ordenar (default: invoice_id)
- `sort_order` (string): Orden asc/desc (default: desc)
- `per_page` (int): Elementos por página (default: 15)

**Ejemplo:** `GET /invoices?status=pendiente&per_page=10`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "invoice_number": "FAC-001-2025",
        "supplier": {"supplier_id": 1, "name": "Proveedor XYZ"},
        "cost_center": {"cost_center_id": 1, "name": "Centro A"},
        "amount_before_iva": 1000000.00,
        "total_value": 1190000.00,
        "status": "pendiente",
        "payment_type": "total",
        "issue_date": "2025-11-01",
        "due_date": "2025-11-15",
        "file_path": null,
        "notes": "Factura de servicios",
        "created_at": "2025-11-01T10:00:00Z",
        "is_overdue": false,
        "days_until_due": 7,
        "iva": 190000.00,
        "iva_percentage": 19.00,
        "full_name": "FAC-001-2025 - Proveedor XYZ"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 150,
      "last_page": 10,
      "from": 1,
      "to": 15
    },
    "stats": {
      "total": 150,
      "pending": 45,
      "paid": 98,
      "cancelled": 7,
      "total_amount": 250000000.00,
      "pending_amount": 75000000.00
    }
  }
}
```

---

## 👁️ **4. Obtener Factura Específica**
**GET** `/invoices/{id}`

**Permisos:** `commercial.read`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": 1,
      "invoice_number": "FAC-001-2025",
      "supplier": {...},
      "cost_center": {...},
      // ... otros campos
    }
  }
}
```

---

## ➕ **5. Crear Factura**
**POST** `/invoices`

**Permisos:** `commercial.update`

**Content-Type:** `multipart/form-data` (si incluye archivo)

**Campos Requeridos:**
- `supplier_id` (int)
- `cost_center_id` (int)
- `invoice_number` (string, único)
- `amount_before_iva` (decimal)
- `total_value` (decimal, >= amount_before_iva)
- `status` (enum: pendiente, pagada, anulada)
- `payment_type` (enum: parcial, total)
- `issue_date` (date, <= hoy)

**Campos Opcionales:**
- `due_date` (date, > issue_date)
- `notes` (string, max 1000)
- `file` (file, pdf/jpg/jpeg/png, max 5MB)

**Ejemplo:**
```json
{
  "supplier_id": 1,
  "cost_center_id": 1,
  "invoice_number": "FAC-001-2025",
  "amount_before_iva": 1000000.00,
  "total_value": 1190000.00,
  "status": "pendiente",
  "payment_type": "total",
  "issue_date": "2025-11-01",
  "due_date": "2025-11-15",
  "notes": "Factura de servicios"
}
```

---

## ✏️ **6. Actualizar Factura**
**PUT** `/invoices/{id}`

**Permisos:** `commercial.update`

**Campos:** Mismos que crear, pero todos opcionales

**Validaciones Especiales:**
- `invoice_number` único (excepto para el mismo registro)
- `total_value >= amount_before_iva`
- `issue_date <= hoy`
- `due_date > issue_date` (si ambos presentes)

---

## 🔄 **7. Cambiar Estado de Factura**
**PATCH** `/invoices/{id}/status`

**Permisos:** `commercial.update`

**Body:**
```json
{
  "status": "pagada"
}
```

---

## 📎 **8. Subir Archivo a Factura**
**POST** `/invoices/{id}/upload-file`

**Permisos:** `commercial.update`

**Content-Type:** `multipart/form-data`

**Campos:**
- `file` (file, requerido): PDF o imagen (max 5MB)

---

## 📥 **9. Descargar Archivo de Factura**
**GET** `/invoices/{id}/download-file`

**Permisos:** `commercial.read`

**Respuesta:** Archivo binario para descarga

---

## 🗑️ **10. Eliminar Factura**
**DELETE** `/invoices/{id}`

**Permisos:** `commercial.update`

**Nota:** También elimina el archivo asociado si existe

---

## 🎯 **Funcionalidades del Modelo Invoice**

### Scopes Disponibles
- `byStatus($status)`: Filtrar por estado
- `byPaymentType($paymentType)`: Filtrar por tipo de pago
- `search($query)`: Búsqueda en número, proveedor y centro de costos
- `byDateRange($start, $end)`: Filtrar por rango de fechas
- `pending()`: Solo facturas pendientes
- `paid()`: Solo facturas pagadas

### Accessors Disponibles
- `getIdAttribute()`: Retorna invoice_id como id
- `getIvaAttribute()`: Calcula IVA (total_value - amount_before_iva)
- `getIvaPercentageAttribute()`: Porcentaje de IVA
- `getIsOverdueAttribute()`: Si está vencida
- `getDaysUntilDueAttribute()`: Días hasta vencimiento
- `getFullNameAttribute()`: Nombre completo para display

### Relaciones
- `supplier()`: BelongsTo Supplier
- `costCenter()`: BelongsTo CostCenter

---

## 🔧 **Validaciones Implementadas**

### Al Crear/Actualizar:
- Proveedor debe existir
- Centro de costos debe existir
- Número de factura único
- Monto antes IVA >= 0
- Valor total >= monto antes IVA
- Fecha emisión <= fecha actual
- Fecha vencimiento > fecha emisión (si presente)
- Estado válido
- Tipo de pago válido
- Notas max 1000 caracteres

### Al Subir Archivo:
- Solo PDF, JPG, JPEG, PNG
- Máximo 5MB
- Nombre único generado automáticamente

---

## 📱 **Frontend Implementado**

### Componente: `VistaFacturas.jsx`
- ✅ Tabla con paginación y filtros
- ✅ Búsqueda en tiempo real
- ✅ Modales: Crear, Editar, Eliminar, Subir Archivo
- ✅ Estados de carga y error
- ✅ Validación de formularios
- ✅ Manejo de archivos
- ✅ UI moderna con Tailwind CSS

### Servicio: `invoiceService.js`
- ✅ Todos los métodos API implementados
- ✅ Manejo de FormData para archivos
- ✅ Configuración correcta de headers
- ✅ Tratamiento de errores

---

## 🚀 **Estado del Sistema**

✅ **Base de Datos:** Migraciones ejecutadas
✅ **Backend:** APIs completamente implementadas
✅ **Frontend:** Interfaz completa implementada
✅ **Servidor:** Laravel corriendo en puerto 8000
✅ **Autenticación:** Middleware configurado
✅ **Permisos:** Sistema de roles implementado

---

## 🧪 **Testing**

Para probar las APIs:

1. **Obtener token de autenticación:**
   ```bash
   curl -X POST http://127.0.0.1:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"usuario@ejemplo.com","password":"password"}'
   ```

2. **Usar token en requests:**
   ```bash
   curl -X GET http://127.0.0.1:8000/api/invoices \
     -H "Authorization: Bearer TU_TOKEN_AQUI"
   ```

---

## 📝 **Notas Importantes**

- Todas las fechas están en formato YYYY-MM-DD
- Los montos usan punto como separador decimal
- Los archivos se almacenan en `storage/app/public/invoices/`
- El IVA se calcula asumiendo 19% en Colombia
- Las búsquedas son case-insensitive
- La paginación incluye metadatos completos
- Los errores incluyen mensajes detallados en español

---

**Sistema completamente funcional y listo para uso en producción.** 🎉
