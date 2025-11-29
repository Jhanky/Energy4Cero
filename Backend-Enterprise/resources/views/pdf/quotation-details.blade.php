<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalles de Cotización {{ $quotation->quotation_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 18px;
            margin: 0;
            color: #333;
        }

        .header p {
            font-size: 12px;
            margin: 5px 0 0 0;
            color: #666;
        }

        .section {
            margin-bottom: 20px;
        }

        .section h2 {
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            width: 30%;
            font-weight: bold;
            padding: 3px 0;
        }

        .info-value {
            display: table-cell;
            width: 70%;
            padding: 3px 0;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            font-size: 9px;
        }

        .table th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
        }

        .table .text-right {
            text-align: right;
        }

        .table .text-center {
            text-align: center;
        }

        .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
        }

        .total-row td {
            padding: 8px 6px;
        }

        .summary-section {
            margin-top: 20px;
        }

        .summary-item {
            display: table;
            width: 100%;
            margin-bottom: 3px;
        }

        .summary-label {
            display: table-cell;
            width: 80%;
            font-size: 9px;
        }

        .summary-value {
            display: table-cell;
            width: 20%;
            text-align: right;
            font-size: 9px;
        }

        .total-final {
            background-color: #e8e8e8;
            font-weight: bold;
            font-size: 10px;
            padding: 8px;
            text-align: center;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>DETALLES DE COTIZACIÓN</h1>
        <p>Cotización: {{ $quotation->quotation_number }}</p>
    </div>

    <!-- Información del Cliente -->
    <div class="section">
        <h2>INFORMACIÓN DEL CLIENTE</h2>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nombre:</div>
                <div class="info-value">{{ $quotation->client->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Tipo:</div>
                <div class="info-value">{{ $quotation->client->client_type === 'empresa' ? 'Empresa' : 'Residencial' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">{{ $quotation->client->email ?: 'No disponible' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Teléfono:</div>
                <div class="info-value">{{ $quotation->client->phone ?: 'No disponible' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Dirección:</div>
                <div class="info-value">{{ $quotation->client->address ?: 'No disponible' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Ciudad:</div>
                <div class="info-value">{{ $quotation->client->city ? $quotation->client->city->name : 'No disponible' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Departamento:</div>
                <div class="info-value">{{ $quotation->client->department ? $quotation->client->department->name : 'No disponible' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Consumo mensual:</div>
                <div class="info-value">
                    {{ $quotation->client->monthly_consumption ? number_format($quotation->client->monthly_consumption, 0, ',', '.') . ' kWh' : 'No especificado' }}
                </div>
            </div>
        </div>
    </div>

    <!-- Información del Proyecto -->
    <div class="section">
        <h2>INFORMACIÓN DEL PROYECTO</h2>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Proyecto:</div>
                <div class="info-value">{{ $quotation->project_name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Tipo de sistema:</div>
                <div class="info-value">
                    @php
                        $systemTypes = [
                            'On-grid' => 'Sistema Solar Conectado a Red',
                            'Off-grid' => 'Sistema Solar Autónomo',
                            'Híbrido' => 'Sistema Solar Híbrido',
                            'Interconectado' => 'Sistema Solar Interconectado'
                        ];
                        echo $systemTypes[$quotation->system_type] ?? 'Sistema Solar Fotovoltaico';
                    @endphp
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Tipo de red:</div>
                <div class="info-value">{{ $quotation->grid_type }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Potencia:</div>
                <div class="info-value">{{ number_format($quotation->power_kwp, 2, ',', '.') }} kW</div>
            </div>
            <div class="info-row">
                <div class="info-label">Requiere financiación:</div>
                <div class="info-value">{{ $quotation->requires_financing ? 'Sí' : 'No' }}</div>
            </div>
        </div>
    </div>

    <!-- Información de la Cotización -->
    <div class="section">
        <h2>INFORMACIÓN DE LA COTIZACIÓN</h2>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Vendedor:</div>
                <div class="info-value">{{ $quotation->user->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Estado:</div>
                <div class="info-value">{{ $quotation->status->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Fecha de creación:</div>
                <div class="info-value">{{ $quotation->created_at->format('d/m/Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Fecha de vencimiento:</div>
                <div class="info-value">{{ $quotation->updated_at ? $quotation->updated_at->format('d/m/Y') : 'No definida' }}</div>
            </div>
        </div>
    </div>

    <!-- Tabla de Suministros -->
    @if($quotation->usedProducts && $quotation->usedProducts->count() > 0)
    <div class="section">
        <h2>SUMINISTROS</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-right">% Util.</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quotation->usedProducts as $product)
                <tr>
                    <td>
                        @php
                            $types = [
                                'panel' => 'Panel Solar',
                                'inverter' => 'Inversor',
                                'battery' => 'Batería'
                            ];
                            echo $types[$product->product_type] ?? ucfirst($product->product_type);
                        @endphp
                    </td>
                    <td>{{ $product->brand }} {{ $product->model }}</td>
                    <td class="text-center">{{ number_format($product->quantity, 0, ',', '.') }}</td>
                    <td class="text-right">$ {{ number_format($product->unit_price, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($product->profit_percentage, 1, ',', '.') }}%</td>
                    <td class="text-right">$ {{ number_format($product->total_value, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Tabla de Items Complementarios -->
    @if($quotation->items && $quotation->items->count() > 0)
    <div class="section">
        <h2>ITEMS COMPLEMENTARIOS</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-center">Unidad</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-right">% Util.</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quotation->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-center">{{ number_format($item->quantity, 2, ',', '.') }}</td>
                    <td class="text-center">{{ $item->unit }}</td>
                    <td class="text-right">$ {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($item->profit_percentage, 1, ',', '.') }}%</td>
                    <td class="text-right">$ {{ number_format($item->total_value, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Resumen de Costos -->
    <div class="section summary-section">
        <h2>RESUMEN DE COSTOS</h2>

        <div class="summary-item">
            <div class="summary-label">Subtotal</div>
            <div class="summary-value">$ {{ number_format($quotation->subtotal, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">Gestión comercial ({{ number_format($quotation->commercial_management_percentage * 100, 1, ',', '.') }}%)</div>
            <div class="summary-value">$ {{ number_format($quotation->commercial_management, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">Subtotal 2</div>
            <div class="summary-value">$ {{ number_format($quotation->subtotal2, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">Administración ({{ number_format($quotation->administration_percentage * 100, 1, ',', '.') }}%)</div>
            <div class="summary-value">$ {{ number_format($quotation->administration, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">Imprevistos ({{ number_format($quotation->contingency_percentage * 100, 1, ',', '.') }}%)</div>
            <div class="summary-value">$ {{ number_format($quotation->contingency, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">Utilidad ({{ number_format($quotation->profit_percentage * 100, 1, ',', '.') }}%)</div>
            <div class="summary-value">$ {{ number_format($quotation->profit, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">IVA utilidad</div>
            <div class="summary-value">$ {{ number_format($quotation->profit_iva, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">Subtotal 3</div>
            <div class="summary-value">$ {{ number_format($quotation->subtotal3, 0, ',', '.') }}</div>
        </div>

        <div class="summary-item">
            <div class="summary-label">Retenciones ({{ number_format($quotation->withholding_percentage * 100, 1, ',', '.') }}%)</div>
            <div class="summary-value">$ {{ number_format($quotation->withholdings, 0, ',', '.') }}</div>
        </div>

        <div class="total-final">
            TOTAL COTIZACIÓN: $ {{ number_format($quotation->total_value, 0, ',', '.') }}
        </div>
    </div>
</body>
</html>
