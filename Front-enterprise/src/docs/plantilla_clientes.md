# Estructura de la Plantilla de Importación de Clientes

Esta es la estructura que debe tener el archivo Excel para importar clientes correctamente.

## Columnas Requeridas

| Columna | Campo Interno | Tipo | Descripción | Requerido |
|---------|---------------|------|-------------|-----------|
| nombre | name | Texto | Nombre completo del cliente | Sí |
| tipo_cliente | client_type | Texto | Tipo de cliente: residencial, comercial, industrial | Sí |
| correo | email | Email | Dirección de correo electrónico | Sí |
| documento | nic | Texto | Número de identificación de contrato | Sí |

## Columnas Opcionales

| Columna | Campo Interno | Tipo | Descripción | Valor por Defecto |
|---------|---------------|------|-------------|-------------------|
| telefono | phone | Texto | Número de teléfono | Vacío |
| consumo_mensual | monthly_consumption | Número | Consumo mensual en kW/h | Vacío |
| direccion | address | Texto | Dirección física | Vacío |
| departamento | department_id | Texto | Departamento | Vacío |
| ciudad | city_id | Texto | Ciudad | Vacío |
| notas | notes | Texto | Notas adicionales | Vacío |
| activo | is_active | Booleano | 1 para activo, 0 para inactivo | 1 (activo) |
| usuario_responsable | responsible_user_id | Número | ID de usuario responsable | Se asigna automáticamente al usuario que realiza la importación |

## Valores de Ejemplo

| nombre | tipo_cliente | correo | documento | telefono | consumo_mensual | direccion | departamento | ciudad | notas | activo | usuario_responsable |
|--------|--------------|--------|-----------|----------|-----------------|-----------|--------------|--------|-------|--------|-------------------|
| Juan Pérez | residencial | juan.perez@email.com | 123456789 | 3001234567 | 500 | Calle 123 #45-67 | Atlántico | Barranquilla | Cliente nuevo | 1 | (Opcional - se asigna automáticamente) |
| Empresa S.A.S | comercial | contacto@empresa.com | 987654321 | 3009876543 | 1200 | Av. Principal #123 | Bogotá | Bogotá | Cliente corporativo | 1 | (Opcional - se asigna automáticamente) |

## Instrucciones Importantes

1. La primera fila debe contener los encabezados exactamente como se muestran en la tabla
2. Los campos requeridos deben tener valores en todas las filas
3. Los emails y documentos deben ser únicos en todo el sistema
4. El campo `usuario_responsable` es opcional - si no se proporciona, se asignará automáticamente al usuario que realiza la importación
5. El valor booleano `activo` debe ser `1` para activo o `0` para inactivo
6. Los campos de departamento y ciudad deben coincidir con valores existentes en el sistema
7. El campo `tipo_cliente` debe ser exactamente uno de: `residencial`, `comercial`, `industrial`