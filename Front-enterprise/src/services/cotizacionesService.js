import apiService from './api';

class CotizacionesService {
  // Obtener todas las cotizaciones
  async getCotizaciones(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/quotations?${queryString}` : '/quotations';
      console.log(`📥 Solicitando cotizaciones con URL: ${url}`);
      const response = await apiService.request(url);
      console.log('📥 Respuesta de cotizaciones:', response);

      // Logs detallados para diagnóstico
      if (response.success && response.data) {
        console.log('✅ Respuesta exitosa de cotizaciones');
        console.log('📊 Total de cotizaciones:', response.data.total);
        console.log('📄 Cotizaciones en esta página:', response.data.data?.length || 0);
        if (response.data.data && response.data.data.length > 0) {
          console.log('🔍 Primera cotización:', response.data.data[0]);
        } else {
          console.warn('⚠️ No hay cotizaciones en la base de datos');
        }
      } else {
        console.warn('⚠️ Respuesta sin éxito o sin datos:', response);
      }

      return response;
    } catch (error) {
      console.error('❌ Error al obtener cotizaciones:', error);
      throw error;
    }
  }

  // Obtener una cotización específica
  async getCotizacion(id) {
    try {
      console.log(`📥 Solicitando cotización con ID: ${id}`);
      const response = await apiService.request(`/quotations/${id}`);
      console.log(`📥 Respuesta para cotización ${id}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error al obtener cotización ${id}:`, error);
      throw error;
    }
  }

  // Crear nueva cotización
  async createCotizacion(cotizacionData) {
    try {
      // Agregar log para depuración
      console.log('📤 Enviando datos de cotización al backend:', JSON.stringify(cotizacionData, null, 2));

      const response = await apiService.request('/quotations', {
        method: 'POST',
        body: JSON.stringify(cotizacionData)
      });

      console.log('📥 Respuesta del backend:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al crear cotización:', error);
      throw error;
    }
  }

  // Actualizar cotización
  async updateCotizacion(id, cotizacionData) {
    try {
      console.log('🔄 Servicio: Iniciando actualización de cotización', {
        id: id,
        dataKeys: Object.keys(cotizacionData),
        hasUsedProducts: !!cotizacionData.used_products,
        hasItems: !!cotizacionData.items,
        usedProductsCount: cotizacionData.used_products ? cotizacionData.used_products.length : 0,
        itemsCount: cotizacionData.items ? cotizacionData.items.length : 0
      });

      console.log('📤 Servicio: Enviando datos al backend:', JSON.stringify(cotizacionData, null, 2));

      const response = await apiService.request(`/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cotizacionData)
      });

      console.log('📥 Servicio: Respuesta del backend:', JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error('❌ Servicio: Error al actualizar cotización:', error);
      throw error;
    }
  }

  // Eliminar cotización
  async deleteCotizacion(id) {
    try {
      return await apiService.request(`/quotations/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {

      throw error;
    }
  }

  // Cambiar estado de cotización
  async changeCotizacionStatus(id, statusId) {
    try {
      // Validar que el statusId sea un número válido
      const numericStatusId = parseInt(statusId, 10);
      if (isNaN(numericStatusId)) {
        console.error('❌ El statusId no es un número válido:', statusId);
        throw new Error(`El ID de estado no es válido: ${statusId}`);
      }

      console.log('📤 Enviando solicitud de cambio de estado:', {
        url: `/quotations/${id}/status`,
        method: 'POST',
        status_id: numericStatusId
      });

      // Crear FormData para enviar el _method como parámetro de formulario
      const formData = new FormData();
      formData.append('status_id', numericStatusId);
      formData.append('_method', 'PATCH');

      // Para FormData, necesitamos remover Content-Type header 
      // para que el navegador lo establezca automáticamente
      const headers = { ...apiService.getHeaders() };
      delete headers['Content-Type'];

      const response = await apiService.request(`/quotations/${id}/status`, {
        method: 'POST',
        body: formData,
        headers: headers, // Usar los headers modificados
      });

      console.log('📥 Respuesta del cambio de estado:', response);
      return response;
    } catch (error) {

      console.error('❌ Error en cambio de estado:', error);
      throw error;
    }
  }

  // Obtener estadísticas de cotizaciones
  async getStatistics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/quotations/statistics?${queryString}` : '/quotations/statistics';
      return await apiService.request(url);
    } catch (error) {
      throw error;
    }
  }

  // Obtener estados de cotizaciones
  async getStatuses() {
    try {
      return await apiService.request('/quotation-statuses');
    } catch (error) {

      throw error;
    }
  }

  // Generar PDF de cotización usando webhook de n8n
  async generatePDF(id) {
    try {
      // Primero obtener los datos completos de la cotización
      console.log('📥 Obteniendo datos de cotización:', id);
      const quotationResponse = await this.getCotizacion(id);

      if (!quotationResponse.success || !quotationResponse.data) {
        throw new Error('No se pudieron obtener los datos de la cotización');
      }

      const quotation = quotationResponse.data;
      console.log('📦 Datos de cotización obtenidos:', quotation);

      // Transformar datos según la estructura requerida por el webhook
      const webhookPayload = this.transformQuotationForWebhook(quotation);
      console.log('📤 Payload transformado para webhook:', webhookPayload);

      // URL del webhook de n8n
      const webhookUrl = 'https://n8n.jhanky.online/webhook/propuesta';

      console.log('📤 Enviando datos al webhook de n8n:', { webhookUrl });

      // Obtener token de autenticación
      const token = localStorage.getItem('auth_token');

      // Hacer petición POST al webhook con todos los datos
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(webhookPayload)
      });

      console.log('📥 Respuesta recibida del webhook:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        contentType: response.headers.get('Content-Type')
      });

      if (!response.ok) {
        // Intentar leer el cuerpo del error
        let errorMessage = `Error al generar PDF: ${response.status}`;
        try {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('❌ Error del webhook (JSON):', errorData);
          } else {
            const errorText = await response.text();
            console.error('❌ Error del webhook (Text):', errorText);
            if (errorText) {
              errorMessage = errorText.substring(0, 200); // Limitar longitud
            }
          }
        } catch (parseError) {
          console.error('❌ No se pudo parsear el error:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Obtener el nombre del archivo del header Content-Disposition si existe
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `propuesta_${quotation.quotation_number || id}.pdf`;

      if (contentDisposition) {
        console.log('📎 Content-Disposition:', contentDisposition);
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          console.log('📝 Nombre de archivo extraído:', filename);
        }
      }

      // Devolver el blob y el nombre del archivo
      const blob = await response.blob();
      console.log('✅ Blob recibido del webhook:', { size: blob.size, type: blob.type });

      return { blob, filename };
    } catch (error) {
      console.error('❌ Error al generar PDF desde webhook:', error);
      throw error;
    }
  }

  // Transformar datos de cotización al formato requerido por el webhook
  transformQuotationForWebhook(quotation) {
    // Calcular datos financieros según algoritmo de calculos.md
    const potenciaKwp = parseFloat(quotation.power_kwp) || 0;
    const tarifaKwh = 1100; // Tarifa por defecto según documentación
    const inversionTotal = parseFloat(quotation.total_value) || 0;

    // Factor K: 133.75 kWh generados por cada kW instalado al mes
    const factorK = 133.75;
    const generacionMensual = potenciaKwp * factorK;
    const ahorroMensual = generacionMensual * tarifaKwh;
    const ahorroAnual = ahorroMensual * 12;
    const generacionAnual = generacionMensual * 12;

    // Calcular ROI (Retorno de Inversión)
    let ahorroAcumulado = 0;
    let retornoAnios = 0;
    let encontrado = false;
    let tarifaActual = tarifaKwh;

    const ahorrosProyectados = {
      ahorro_5y: 0,
      ahorro_10y: 0,
      ahorro_15y: 0,
      ahorro_20y: 0,
      ahorro_25y: 0
    };

    for (let anio = 1; anio <= 25; anio++) {
      const ahorroAnio = generacionAnual * tarifaActual;
      ahorroAcumulado += ahorroAnio;

      // Guardar proyecciones para gráfica
      if (anio === 5) ahorrosProyectados.ahorro_5y = Math.round(ahorroAcumulado);
      if (anio === 10) ahorrosProyectados.ahorro_10y = Math.round(ahorroAcumulado);
      if (anio === 15) ahorrosProyectados.ahorro_15y = Math.round(ahorroAcumulado);
      if (anio === 20) ahorrosProyectados.ahorro_20y = Math.round(ahorroAcumulado);
      if (anio === 25) ahorrosProyectados.ahorro_25y = Math.round(ahorroAcumulado);

      // Verificar si recuperamos la inversión
      if (!encontrado && ahorroAcumulado >= inversionTotal) {
        const faltante = inversionTotal - (ahorroAcumulado - ahorroAnio);
        const fraccion = faltante / ahorroAnio;
        retornoAnios = (anio - 1) + fraccion;
        encontrado = true;
      }

      // Incremento tarifario anual del 5%
      tarifaActual = tarifaActual * 1.05;
    }

    // Generar datos mensuales para gráfica (simulación con variación estacional)
    const hspMensual = [4.7, 4.6, 4.9, 4.2, 4.0, 4.1, 4.4, 4.8, 4.5, 4.1, 4.3, 4.8];
    const datosMensuales = hspMensual.map(hsp =>
      Math.round(potenciaKwp * hsp * 30.4 * 0.85)
    );

    // Formatear moneda
    const formatCurrency = (value) => {
      return `$ ${Math.round(value).toLocaleString('es-CO')}`;
    };

    // Obtener productos de la cotización
    const productos = quotation.products || [];
    const paneles = productos.filter(p => p.product_type === 'panel');
    const inversores = productos.filter(p => p.product_type === 'inverter');
    const baterias = productos.filter(p => p.product_type === 'battery');

    // Construir payload según estructura de webhook-propuesta.md
    return {
      meta_info: {
        numero_propuesta: quotation.quotation_number || `COT-${quotation.quotation_id}`,
        fecha_propuesta: new Date().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      },

      datos_cliente: {
        nombre_cliente: quotation.client?.name || 'Cliente',
        ubicacion_proyecto: `${quotation.client?.city?.name || ''}, ${quotation.client?.department?.name || ''}`.trim() || quotation.project_name
      },

      datos_tecnicos: {
        tipo_sistema_txt: this.getTipoSistemaTexto(quotation.system_type),
        potencia_kwp: potenciaKwp.toString(),
        cantidad_paneles: paneles.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0),
        tipo_paneles: paneles.length > 0 ? `${paneles[0].brand} ${paneles[0].model}` : 'Panel Solar',
        cantidad_inversor: inversores.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0),
        tipo_inversor: inversores.length > 0 ? `${inversores[0].brand} ${inversores[0].model}` : 'Inversor',
        cantidad_baterias: baterias.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0),
        tipo_baterias: baterias.length > 0 ? `${baterias[0].brand} ${baterias[0].model}` : 'Batería'
      },

      datos_graficas_raw: {
        datos_mensuales_str: datosMensuales.join(', '),
        valor_inversion_raw: Math.round(inversionTotal),
        ahorro_5y_raw: ahorrosProyectados.ahorro_5y,
        ahorro_10y_raw: ahorrosProyectados.ahorro_10y,
        ahorro_15y_raw: ahorrosProyectados.ahorro_15y,
        ahorro_20y_raw: ahorrosProyectados.ahorro_20y,
        ahorro_25y_raw: ahorrosProyectados.ahorro_25y
      },

      datos_financieros_display: {
        generacion_promedio: Math.round(generacionMensual).toLocaleString('es-CO'),
        tarifa_energia: formatCurrency(tarifaKwh),
        ahorro_mensual_pesos: formatCurrency(ahorroMensual),
        ahorro_anual_pesos: formatCurrency(ahorroAnual),
        ahorro_acumulado_25_anos: `$ ${(ahorroAcumulado / 1000000).toFixed(0)} Millones`,
        anos_retorno: retornoAnios.toFixed(1)
      },

      items_presupuesto: this.getItemsPresupuesto(quotation),

      totales_cierre: {
        subtotal: formatCurrency(quotation.subtotal || 0),
        imprevistos_valor: formatCurrency(quotation.commercial_management || 0),
        admin_valor: formatCurrency(quotation.administration || 0),
        utilidad_valor: formatCurrency(quotation.profit || 0),
        iva_utilidad_valor: formatCurrency(quotation.profit_iva || 0),
        subtotal_3_valor: formatCurrency(quotation.subtotal3 || 0),
        retenciones_valor: formatCurrency(quotation.withholdings || 0),
        total_proyecto: formatCurrency(quotation.total_value || 0)
      }
    };
  }

  // Obtener texto descriptivo del tipo de sistema
  getTipoSistemaTexto(tipoSistema) {
    const tipos = {
      'On-grid': 'Sistema Solar Interconectado',
      'Off-grid': 'Sistema Solar Aislado',
      'Híbrido': 'Sistema Solar Híbrido',
      'Interconectado': 'Sistema Solar Interconectado'
    };
    return tipos[tipoSistema] || tipoSistema;
  }

  // Obtener items del presupuesto formateados
  getItemsPresupuesto(quotation) {
    const formatCurrency = (value) => {
      return `$ ${Math.round(value).toLocaleString('es-CO')}`;
    };

    const productos = quotation.products || [];
    const items = quotation.quotation_items || [];

    // Agrupar productos por tipo
    const paneles = productos.filter(p => p.product_type === 'panel');
    const inversores = productos.filter(p => p.product_type === 'inverter');
    const baterias = productos.filter(p => p.product_type === 'battery');

    // Calcular totales de productos
    const totalPaneles = paneles.reduce((sum, p) => sum + parseFloat(p.total_value || 0), 0);
    const totalInversores = inversores.reduce((sum, p) => sum + parseFloat(p.total_value || 0), 0);
    const totalBaterias = baterias.reduce((sum, p) => sum + parseFloat(p.total_value || 0), 0);

    // Calcular precio unitario promedio
    const cantidadPaneles = paneles.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);
    const cantidadInversores = inversores.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);
    const cantidadBaterias = baterias.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);

    // Buscar items complementarios específicos
    const moItem = items.find(i => i.description?.toLowerCase().includes('mano de obra'));
    const materialItem = items.find(i => i.description?.toLowerCase().includes('material'));
    const estructuraItem = items.find(i => i.description?.toLowerCase().includes('estructura'));
    const ingItem = items.find(i => i.description?.toLowerCase().includes('ingenier'));

    return {
      v_unit_paneles: formatCurrency(cantidadPaneles > 0 ? totalPaneles / cantidadPaneles : 0),
      v_total_paneles: formatCurrency(totalPaneles),

      v_unit_inversor: formatCurrency(cantidadInversores > 0 ? totalInversores / cantidadInversores : 0),
      v_total_inversor: formatCurrency(totalInversores),

      v_unit_baterias: formatCurrency(cantidadBaterias > 0 ? totalBaterias / cantidadBaterias : 0),
      v_total_baterias: formatCurrency(totalBaterias),

      v_total_mo: formatCurrency(moItem?.total_value || 0),
      v_total_material: formatCurrency(materialItem?.total_value || 0),
      v_total_estructura: formatCurrency(estructuraItem?.total_value || 0),
      v_total_ing: formatCurrency(ingItem?.total_value || 0)
    };
  }

  // Generar PDF con PDFKit
  async generatePDFKit(id) {
    try {
      return await apiService.request(`/quotations/${id}/pdfkit`);
    } catch (error) {

      throw error;
    }
  }

  // Generar PDF simple con detalles de la cotización (desde el frontend)
  async generateSimplePDF(id) {
    try {
      console.log('📥 Generando PDF simple desde frontend para cotización:', id);

      // Obtener los datos de la cotización
      const quotationResponse = await this.getCotizacion(id);

      if (!quotationResponse.success || !quotationResponse.data) {
        throw new Error('No se pudieron obtener los datos de la cotización');
      }

      // Transformar los datos al formato esperado por la función de PDF
      const transformedData = this.transformDataForSimplePDF(quotationResponse.data);

      // Generar el PDF usando jsPDF (esta función debe ser llamada desde el componente)
      // Como estamos en un servicio, retornamos los datos para que el componente los use
      return {
        success: true,
        data: transformedData,
        message: 'Datos preparados para generar PDF'
      };
    } catch (error) {
      console.error('❌ Error al preparar datos para PDF simple:', error);
      throw error;
    }
  }

  // Transformar datos de cotización para el formato del PDF simple
  transformDataForSimplePDF(apiData) {
    if (!apiData) return null;

    return {
      id: apiData.quotation_id,
      numero: apiData.quotation_number || `COT-0000${apiData.quotation_id || '000'}`,
      cliente: {
        name: apiData.client?.name || 'Cliente no especificado',
        type: apiData.client?.client_type || 'desconocido',
        email: apiData.client?.email || 'No disponible',
        phone: apiData.client?.phone || 'No disponible',
        full_address: apiData.client?.address
          ? `${apiData.client.address}${apiData.client.city ? `, ${apiData.client.city.name}` : ''}${apiData.client.department ? `, ${apiData.client.department.name}` : ''}`
          : 'Dirección no disponible',
        city: apiData.client?.city ? { name: apiData.client.city.name } : null,
        department: apiData.client?.department ? { name: apiData.client.department.name } : null,
        monthly_consumption: parseFloat(apiData.client?.monthly_consumption) || 0
      },
      proyecto: apiData.project_name || 'Proyecto sin nombre',
      potencia_total: parseFloat(apiData.power_kwp) || 0,
      valor_total: parseFloat(apiData.total_value) || 0,
      estado: apiData.status?.name || 'Borrador',
      fecha_creacion: apiData.creation_date || apiData.created_at || new Date().toISOString(),
      fecha_vencimiento: apiData.expiration_date || apiData.updated_at || new Date().toISOString(),
      vendedor: apiData.user?.name || 'Vendedor no asignado',
      tipo_sistema: apiData.system_type || 'No especificado',
      tipo_red: apiData.grid_type || 'No especificado',
      requiere_financing: apiData.requires_financing || false,
      // Datos calculados del backend
      subtotal: parseFloat(apiData.subtotal) || 0,
      profit: parseFloat(apiData.profit) || 0,
      profit_iva: parseFloat(apiData.profit_iva) || 0,
      commercial_management: parseFloat(apiData.commercial_management) || 0,
      administration: parseFloat(apiData.administration) || 0,
      contingency: parseFloat(apiData.contingency) || 0,
      withholdings: parseFloat(apiData.withholdings) || 0,
      subtotal2: parseFloat(apiData.subtotal2) || 0,
      subtotal3: parseFloat(apiData.subtotal3) || 0,
      // Porcentajes
      porcentaje_gestion_comercial: parseFloat(apiData.commercial_management_percentage) * 100 || 3,
      porcentaje_administracion: parseFloat(apiData.administration_percentage) * 100 || 8,
      porcentaje_imprevistos: parseFloat(apiData.contingency_percentage) * 100 || 2,
      porcentaje_utilidad: parseFloat(apiData.profit_percentage) * 100 || 5,
      porcentaje_retencion: parseFloat(apiData.withholding_percentage) * 100 || 3.5,
      // Arrays de productos
      suministros: Array.isArray(apiData.products) ? apiData.products.map(product => ({
        tipo: this.formatProductType(product.product_type),
        descripcion: `${product.brand || ''} ${product.model || ''}`.trim() || product.description || this.getProductName(product.product_type, product.product_id) || 'Producto sin descripción',
        cantidad: parseInt(product.quantity) || 0,
        precio_unitario: parseFloat(product.unit_price) || 0,
        porcentaje_utilidad: parseFloat(product.profit_percentage) * 100 || 0,
        valor_parcial: parseFloat(product.partial_value) || 0,
        utilidad: parseFloat(product.profit) || 0,
        total: parseFloat(product.total_value) || 0
      })) : [],
      items_complementarios: Array.isArray(apiData.quotation_items) ? apiData.quotation_items.map(item => ({
        descripcion: item.description || 'Item sin descripción',
        cantidad: parseFloat(item.quantity) || 0,
        unidad: item.unit || 'unidad',
        precio_unitario: parseFloat(item.unit_price) || 0,
        porcentaje_utilidad: parseFloat(item.profit_percentage) * 100 || 0,
        valor_parcial: parseFloat(item.partial_value) || 0,
        utilidad: parseFloat(item.profit) || 0,
        total: parseFloat(item.total_value) || 0
      })) : []
    };
  }

  // Función auxiliar para formatear el tipo de producto
  formatProductType(productType) {
    if (!productType) return 'Producto';

    switch (productType.toLowerCase()) {
      case 'panel':
      case 'panels':
      case 'panel solar':
        return 'Panel Solar';
      case 'inverter':
      case 'inverters':
      case 'inversor':
        return 'Inversor';
      case 'battery':
      case 'batteries':
      case 'batería':
        return 'Batería';
      default:
        return productType.charAt(0).toUpperCase() + productType.slice(1);
    }
  }

  // Función auxiliar para obtener el nombre del producto
  getProductName(productType, productId) {
    if (!productType || !productId) return null;
    const typeNames = {
      panel: 'Panel',
      panels: 'Panel',
      inverter: 'Inversor',
      inverters: 'Inversor',
      battery: 'Batería',
      batteries: 'Batería'
    };
    const cleanType = productType.toLowerCase();
    return `${typeNames[cleanType] || productType} #${productId}`;
  }
}

export const cotizacionesService = new CotizacionesService();
export default cotizacionesService;
