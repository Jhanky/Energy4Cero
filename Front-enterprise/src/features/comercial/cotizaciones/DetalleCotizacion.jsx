import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
  Download,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Sun,
  Zap,
  Battery,
  Edit,
  Save,
  X
} from 'lucide-react';
import { cotizacionesService } from '../../../services/cotizacionesService';

const DetalleCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [cotizacionOriginal, setCotizacionOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'suministro' o 'complementario'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingPercentage, setEditingPercentage] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        setLoading(true);
        const response = await cotizacionesService.getCotizacion(id);
        
        if (response.success) {
          // Transformar la respuesta del backend para que coincida con la estructura esperada
          const transformedCotizacion = transformCotizacionData(response.data);
          setCotizacion(transformedCotizacion);
          setCotizacionOriginal(JSON.parse(JSON.stringify(transformedCotizacion)));
        } else {
          setNotification({
            type: 'error',
            message: response.message || 'Error al cargar la cotización'
          });
        }
      } catch (error) {
        setNotification({
          type: 'error',
          message: error.message || 'Error de conexión al cargar la cotización'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCotizacion();
    } else {
      setNotification({
        type: 'error',
        message: 'No se proporcionó ID de cotización'
      });
      setLoading(false);
    }
  }, [id]);

  // Función para transformar los datos del backend a la estructura esperada
  const transformCotizacionData = (apiData) => {
    console.log('🔄 Iniciando transformación de datos en el archivo correcto');
    console.log('📦 Datos recibidos para productos:', apiData.products);
    
    // Verificar que los datos requeridos estén presentes
    if (!apiData) {
      return null;
    }
    
    // Transformar los datos del backend a la estructura que espera el frontend
    const transformedData = {
      id: apiData.quotation_id,
      numero: apiData.quotation_number || `COT-0000${apiData.quotation_id || '000'}`,
      cliente: {
        id: apiData.client?.client_id,
        name: apiData.client?.name || 'Cliente no especificado',
        email: apiData.client?.email || 'No disponible',
        phone: apiData.client?.phone || 'No disponible',
        address: `${apiData.client?.address || ''}`.trim() || 'Dirección no disponible',
        monthly_consumption: parseFloat(apiData.client?.monthly_consumption) || 0,
        department: apiData.client?.department ? {
          id: apiData.client.department.department_id,
          name: apiData.client.department.name,
          region: apiData.client.department.region
        } : null,
        city: apiData.client?.city ? {
          id: apiData.client.city.city_id,
          name: apiData.client.city.name,
          department_id: apiData.client.city.department_id
        } : null,
        full_address: apiData.client?.address 
          ? `${apiData.client.address}${apiData.client.city ? `, ${apiData.client.city.name}` : ''}${apiData.client.department ? `, ${apiData.client.department.name}` : ''}` 
          : 'Dirección no disponible',
        type: apiData.client?.client_type || 'desconocido',
        document: apiData.client?.nic || apiData.client?.document || 'Documento no disponible',
        document_type: apiData.client?.client_type === 'empresa' ? 'NIT' : (apiData.client?.client_type === 'comercial' ? 'NIT' : 'Cédula')
      },
      proyecto: apiData.project_name || 'Proyecto sin nombre',
      potencia_total: parseFloat(apiData.power_kwp) || 0,
      valor_total: parseFloat(apiData.total_value) || 0,
      requires_financing: apiData.requires_financing ? 1 : 0,
      estado: apiData.status?.name || 'Borrador',
      fecha_creacion: apiData.creation_date || apiData.created_at || new Date().toISOString(),
      fecha_vencimiento: apiData.expiration_date || apiData.updated_at || new Date().toISOString(),
      vendedor: apiData.user?.name || 'Vendedor no asignado',
      tipo_sistema: apiData.system_type || 'No especificado',
      tipo_red: apiData.grid_type || 'No especificado',
      suministros: Array.isArray(apiData.products) ? apiData.products.map(product => {
        console.log('🔍 Producto recibido para transformación:', product);
        const descripcionFinal = `${product.brand || ''} ${product.model || ''}`.trim() || product.description || getProductName(product.product_type, product.product_id) || 'Producto sin descripción';
        console.log('📝 Descripción generada:', descripcionFinal);
        return {
          used_product_id: product.used_product_id, // Agregar el ID del producto utilizado
          tipo: formatProductType(product.product_type),
          descripcion: descripcionFinal,
          cantidad: parseInt(product.quantity) || 0,
          precio_unitario: parseFloat(product.unit_price) || 0,
          porcentaje_utilidad: parseFloat(product.profit_percentage) * 100 || 0,
          valor_parcial: parseFloat(product.partial_value) || 0,
          utilidad: parseFloat(product.profit) || 0,
          total: parseFloat(product.total_value) || 0
        };
      }) : [],
      items_complementarios: Array.isArray(apiData.quotation_items) ? apiData.quotation_items.map(item => ({
        item_id: item.item_id, // Agregar el ID del item adicional
        descripcion: item.description || 'Item sin descripción',
        cantidad: parseFloat(item.quantity) || 0,
        unidad: item.unit || 'unidad',
        precio_unitario: parseFloat(item.unit_price) || 0,
        porcentaje_utilidad: parseFloat(item.profit_percentage) * 100 || 0,
        valor_parcial: parseFloat(item.partial_value) || 0,
        utilidad: parseFloat(item.profit) || 0,
        total: parseFloat(item.total_value) || 0
      })) : [],
      porcentaje_gestion_comercial: parseFloat(apiData.commercial_management_percentage) * 100 || 3,
      porcentaje_administracion: parseFloat(apiData.administration_percentage) * 100 || 8,
      porcentaje_imprevistos: parseFloat(apiData.contingency_percentage) * 100 || 2,
      porcentaje_utilidad: parseFloat(apiData.profit_percentage) * 100 || 5,
      porcentaje_retencion: parseFloat(apiData.withholding_percentage) * 100 || 3.5
    };
    
    console.log('🔄 Transformación completada, suministros:', transformedData.suministros);
    return transformedData;
  };

  // Función auxiliar para formatear el tipo de producto
  const formatProductType = (productType) => {
    if (!productType) return 'Producto';
    
    switch(productType.toLowerCase()) {
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
  };

  // Función auxiliar para obtener el nombre del producto
  const getProductName = (productType, productId) => {
    if (!productType || !productId) return null;
    
    // En una implementación real, esto debería obtener el nombre del producto desde una API
    // Aquí devolvemos un nombre genérico basado en el tipo e ID
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
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'enviada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aceptada': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200';
      case 'borrador': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'contratada': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'enviada': return CheckCircle;
      case 'pendiente': return Clock;
      case 'aceptada': return CheckCircle;
      case 'rechazada': return XCircle;
      case 'borrador': return FileText;
      case 'contratada': return CheckCircle;
      default: return FileText;
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'enviada': return 'Enviada';
      case 'pendiente': return 'Pendiente';
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'borrador': return 'Borrador';
      case 'contratada': return 'Contratada';
      default: return estado;
    }
  };

  const getTipoSistemaIcon = (tipo) => {
    switch (tipo) {
      case 'on-grid': return Sun;
      case 'off-grid': return Battery;
      case 'hibrido': return Zap;
      default: return Sun;
    }
  };

  const getTipoSistemaLabel = (tipo) => {
    switch (tipo) {
      case 'on-grid': return 'Conectado a la Red';
      case 'off-grid': return 'Aislado de la Red';
      case 'hibrido': return 'Híbrido';
      default: return tipo;
    }
  };

  // Función para obtener el texto de financiación
  const getFinancingText = (requiresFinancing) => {
    return requiresFinancing ? 'Sí' : 'No';
  };

  // Función para formatear el consumo mensual de manera segura
  const formatMonthlyConsumption = (consumption) => {
    // Verificar que el consumo sea un número válido
    const value = typeof consumption === 'string' ? parseFloat(consumption) : consumption;
    
    if (!value || isNaN(value) || value <= 0) {
      return 'No especificado';
    }
    
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'unit',
        unit: 'kilowatt-hour',
        unitDisplay: 'short',
        maximumFractionDigits: 0
      }).format(value);
    } catch (error) {
      // Si hay un error con la API de internacionalización, usar formato manual
      return `${Math.round(value)} kWh`;
    }
  };

  // Funciones para edición de suministros
  const handleDoubleClick = (item, index, type) => {
    setEditingItem({ ...item, originalIndex: index });
    setEditingType(type);
  };

  const handleSuministroChange = (field, value) => {
    // Asegurar que los valores nunca sean negativos
    const safeValue = Math.max(0, value);
    
    setEditingItem(prev => {
      const updated = {
        ...prev,
        [field]: safeValue
      };
      
      // Recalcular valores dinámicamente usando los valores actualizados
      const porcentajeUtilidad = Math.max(0, updated.porcentaje_utilidad || 5);
      const cantidad = Math.max(0, updated.cantidad || 0);
      const precioUnitario = Math.max(0, updated.precio_unitario || 0);
      
      const valorParcial = cantidad * precioUnitario;
      const utilidad = valorParcial * (porcentajeUtilidad / 100);
      const total = valorParcial + utilidad;
      
      return {
        ...updated,
        cantidad: cantidad,
        precio_unitario: precioUnitario,
        porcentaje_utilidad: porcentajeUtilidad,
        valor_parcial: valorParcial,
        utilidad: utilidad,
        total: total
      };
    });
    
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true);
  };

  const handleSaveSuministro = () => {
    if (!editingItem || !editingType) return;

    const updatedCotizacion = { ...cotizacion };

    // Actualizar en el array correspondiente
    if (editingType === 'suministro') {
      updatedCotizacion.suministros[editingItem.originalIndex] = editingItem;
    } else if (editingType === 'complementario') {
      updatedCotizacion.items_complementarios[editingItem.originalIndex] = editingItem;
    }

    // Recalcular valor total de la cotización
    const totalSuministros = updatedCotizacion.suministros.reduce((sum, item) => sum + item.total, 0);
    const totalComplementarios = updatedCotizacion.items_complementarios.reduce((sum, item) => sum + item.total, 0);
    updatedCotizacion.valor_total = totalSuministros + totalComplementarios;

    setCotizacion(updatedCotizacion);
    setEditingItem(null);
    setEditingType(null);
    setHasUnsavedChanges(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingType(null);
  };

  // Función para finalizar la edición de un item
  const handleFinishEditing = () => {
    if (!editingItem || !editingType) return;

    const updatedCotizacion = { ...cotizacion };

    // Actualizar en el array correspondiente
    if (editingType === 'suministro') {
      updatedCotizacion.suministros[editingItem.originalIndex] = editingItem;
    } else if (editingType === 'complementario') {
      updatedCotizacion.items_complementarios[editingItem.originalIndex] = editingItem;
    }

    // Recalcular valor total de la cotización
    const totalSuministros = updatedCotizacion.suministros.reduce((sum, item) => sum + item.total, 0);
    const totalComplementarios = updatedCotizacion.items_complementarios.reduce((sum, item) => sum + item.total, 0);
    updatedCotizacion.valor_total = totalSuministros + totalComplementarios;

    setCotizacion(updatedCotizacion);
    setEditingItem(null);
    setEditingType(null);
  };

  // Función para transformar datos del frontend al formato del backend
  const transformCotizacionForBackend = (frontendData) => {
    console.log('💾 Iniciando proceso de guardado');
    console.log('📊 Cotización con cambios aplicados:', frontendData);

    // Calcular resumen de costos para obtener los valores calculados
    const resumenCostos = getResumenCostos();
    console.log('🧮 Resumen de costos calculado:', resumenCostos);

    // Transformar productos utilizados
    const usedProducts = frontendData.suministros.map((item, index) => {
      console.log(`🔄 Transformando producto ${index}:`, item);

      // Determinar el tipo de producto basado en la descripción del frontend
      let productType = 'panel';
      let productId = null;

      if (item.tipo === 'Panel Solar') {
        productType = 'panel';
        // En una implementación real, esto debería buscar el ID del producto
        // Por ahora usamos un ID genérico
        productId = 1;
      } else if (item.tipo === 'Inversor') {
        productType = 'inverter';
        productId = 1;
      } else if (item.tipo === 'Batería') {
        productType = 'battery';
        productId = 1;
      }

      // Crear el objeto base
      const productData = {
        product_type: productType,
        product_id: productId,
        brand: item.descripcion.split(' ')[0] || 'Genérico',
        model: item.descripcion.split(' ').slice(1).join(' ') || 'Modelo',
        quantity: parseInt(item.cantidad) || 0,
        unit_price: parseFloat(item.precio_unitario) || 0,
        profit_percentage: parseFloat(item.porcentaje_utilidad) / 100 || 0, // Convertir de porcentaje a decimal
        partial_value: parseFloat(item.valor_parcial) || 0,
        profit: parseFloat(item.utilidad) || 0,
        total_value: parseFloat(item.total) || 0
      };

      // Solo incluir used_product_id si existe y es válido (para actualizaciones)
      if (item.used_product_id && item.used_product_id !== null && item.used_product_id !== undefined) {
        productData.used_product_id = item.used_product_id;
        console.log(`📝 Producto ${index} es una actualización (ID: ${item.used_product_id})`);
      } else {
        console.log(`📝 Producto ${index} es nuevo (sin ID)`);
      }

      return productData;
    });

    // Transformar items complementarios
    const items = frontendData.items_complementarios.map((item, index) => {
      console.log(`🔄 Transformando item complementario ${index}:`, item);

      // Crear el objeto base
      const itemData = {
        description: item.descripcion || '',
        item_type: item.descripcion || 'Complementario',
        quantity: parseFloat(item.cantidad) || 0,
        unit: item.unidad || 'unidad',
        unit_price: parseFloat(item.precio_unitario) || 0,
        profit_percentage: parseFloat(item.porcentaje_utilidad) / 100 || 0, // Convertir de porcentaje a decimal
        partial_value: parseFloat(item.valor_parcial) || 0,
        profit: parseFloat(item.utilidad) || 0,
        total_value: parseFloat(item.total) || 0
      };

      // Solo incluir item_id si existe y es válido (para actualizaciones)
      if (item.item_id && item.item_id !== null && item.item_id !== undefined) {
        itemData.item_id = item.item_id;
        console.log(`📝 Item complementario ${index} es una actualización (ID: ${item.item_id})`);
      } else {
        console.log(`📝 Item complementario ${index} es nuevo (sin ID)`);
      }

      return itemData;
    });

    // Preparar datos para el backend
    const backendData = {
      client_id: frontendData.cliente.id,
      user_id: frontendData.id, // Usar el ID de la cotización como user_id por ahora
      project_name: frontendData.proyecto,
      system_type: frontendData.tipo_sistema,
      power_kwp: parseFloat(frontendData.potencia_total) || 0,
      panel_count: parseInt(frontendData.suministros.find(s => s.tipo === 'Panel Solar')?.cantidad || 0),
      requires_financing: frontendData.requires_financing ? 1 : 0,
      profit_percentage: parseFloat(frontendData.porcentaje_utilidad) / 100 || 0,
      iva_profit_percentage: 0.19, // IVA 19%
      commercial_management_percentage: parseFloat(frontendData.porcentaje_gestion_comercial) / 100 || 0.03,
      administration_percentage: parseFloat(frontendData.porcentaje_administracion) / 100 || 0.08,
      contingency_percentage: parseFloat(frontendData.porcentaje_imprevistos) / 100 || 0.02,
      withholding_percentage: parseFloat(frontendData.porcentaje_retencion) / 100 || 0.035,
      subtotal: resumenCostos?.subtotal || 0,
      profit: resumenCostos?.utilidad || 0,
      profit_iva: resumenCostos?.ivaUtilidad || 0,
      commercial_management: resumenCostos?.gestionComercial || 0,
      administration: resumenCostos?.administracion || 0,
      contingency: resumenCostos?.imprevistos || 0,
      withholdings: resumenCostos?.retenciones || 0,
      total_value: resumenCostos?.cotizacionFinal || 0,
      subtotal2: resumenCostos?.subtotal2 || 0,
      subtotal3: resumenCostos?.subtotal3 || 0,
      status_id: 1, // Mantener como borrador por defecto
      used_products: usedProducts,
      items: items
    };

    console.log('📤 Enviando datos transformados al backend:', JSON.stringify(backendData, null, 2));

    return backendData;
  };

  // Función para guardar todos los cambios
  const handleSaveAllChanges = async () => {
    try {
      console.log('🔄 Llamando a cotizacionesService.updateCotizacion');

      // Transformar los datos al formato que espera el backend
      const backendData = transformCotizacionForBackend(cotizacion);

      // Llamar al servicio para actualizar la cotización
      const response = await cotizacionesService.updateCotizacion(cotizacion.id, backendData);

      console.log('📥 Respuesta completa del backend:', response);

      if (response.success) {
        // Actualizar la cotización original con los cambios actuales
        setCotizacionOriginal(JSON.parse(JSON.stringify(cotizacion)));
        setHasUnsavedChanges(false);

        // Mostrar notificación de éxito
        setNotification({
          type: 'success',
          message: 'Cotización actualizada exitosamente'
        });

        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } else {
        throw new Error(response.message || 'Error desconocido del backend');
      }

    } catch (error) {
      console.error('❌ Error al guardar los cambios:', error);

      setNotification({
        type: 'error',
        message: error.message || 'Error al guardar los cambios'
      });

      // Ocultar notificación de error después de 5 segundos
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Función para cancelar todos los cambios
  const handleCancelAllChanges = () => {
    if (window.confirm('¿Estás seguro de que quieres descartar todos los cambios sin guardar?')) {
      setCotizacion(JSON.parse(JSON.stringify(cotizacionOriginal)));
      setHasUnsavedChanges(false);
      setEditingItem(null);
      setEditingType(null);
      setEditingPercentage(null);
    }
  };

  // Funciones para edición de porcentajes
  const handlePercentageDoubleClick = (percentageType) => {
    setEditingPercentage(percentageType);
    setHasUnsavedChanges(true);
  };

  const handlePercentageChange = (percentageType, value) => {
    const safeValue = Math.max(0, parseFloat(value) || 0);
    
    setCotizacion(prev => ({
      ...prev,
      [percentageType]: safeValue
    }));
    
    setHasUnsavedChanges(true);
  };

  const handlePercentageBlur = () => {
    setEditingPercentage(null);
  };

  const handlePercentageKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditingPercentage(null);
    }
  };

  const getSuministrosByType = (tipo) => {
    switch (tipo) {
      case 'Panel Solar': return [
        { id: 1, name: 'Panel Jinko 415W Monocristalino', precio: 850000, potencia: 415 },
        { id: 2, name: 'Panel Canadian Solar 395W Monocristalino', precio: 780000, potencia: 395 },
        { id: 3, name: 'Panel Trina Solar 400W Monocristalino', precio: 820000, potencia: 400 },
        { id: 4, name: 'Panel Longi Solar 420W Monocristalino', precio: 880000, potencia: 420 }
      ];
      case 'Inversor': return [
        { id: 1, name: 'Inversor SMA Sunny Tripower 10kW', precio: 4500000, potencia: 10000 },
        { id: 2, name: 'Inversor Fronius Symo 8.2kW', precio: 3800000, potencia: 8200 },
        { id: 3, name: 'Inversor Huawei SUN2000 5kW', precio: 2800000, potencia: 5000 },
        { id: 4, name: 'Inversor ABB UNO-DM-6.0-TL-PLUS', precio: 3500000, potencia: 6000 }
      ];
      case 'Batería': return [
        { id: 1, name: 'Batería Tesla Powerwall 13.5kWh', precio: 15000000, capacidad: 13.5 },
        { id: 2, name: 'Batería LG Chem RESU 9.8kWh', precio: 12000000, capacidad: 9.8 },
        { id: 3, name: 'Batería BYD B-Box 10.24kWh', precio: 11000000, capacidad: 10.24 },
        { id: 4, name: 'Batería Sonnen 10kWh', precio: 13000000, capacidad: 10 }
      ];
      default: return [];
    }
  };

  // Calcular valor total dinámicamente
  const getValorTotalDinamico = () => {
    if (!cotizacion) return 0;
    
    let totalSuministros = 0;
    let totalComplementarios = 0;
    
    // Calcular total de suministros
    cotizacion.suministros.forEach((item, index) => {
      if (editingItem && editingItem.originalIndex === index && editingType === 'suministro') {
        totalSuministros += editingItem.total;
      } else {
        totalSuministros += item.total;
      }
    });
    
    // Calcular total de items complementarios
    cotizacion.items_complementarios.forEach((item, index) => {
      if (editingItem && editingItem.originalIndex === index && editingType === 'complementario') {
        totalComplementarios += editingItem.total;
      } else {
        totalComplementarios += item.total;
      }
    });
    
    return totalSuministros + totalComplementarios;
  };

  // Calcular resumen de costos
  const getResumenCostos = () => {
    if (!cotizacion) return null;
    
    const subtotal = getValorTotalDinamico();
    const gestionComercial = subtotal * (cotizacion.porcentaje_gestion_comercial || 3) / 100;
    const subtotal2 = subtotal + gestionComercial;
    const administracion = subtotal2 * (cotizacion.porcentaje_administracion || 8) / 100;
    const imprevistos = subtotal2 * (cotizacion.porcentaje_imprevistos || 2) / 100;
    const utilidad = subtotal2 * (cotizacion.porcentaje_utilidad || 5) / 100;
    const ivaUtilidad = utilidad * 19 / 100; // IVA 19% sobre la utilidad
    const subtotal3 = subtotal2 + administracion + imprevistos + utilidad + ivaUtilidad;
    const retenciones = subtotal3 * (cotizacion.porcentaje_retencion || 3.5) / 100;
    const cotizacionFinal = subtotal3 + retenciones; // CORREGIDO: Se suma en lugar de restar
    
    return {
      subtotal,
      gestionComercial,
      subtotal2,
      administracion,
      imprevistos,
      utilidad,
      ivaUtilidad,
      subtotal3,
      retenciones,
      cotizacionFinal
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando detalles de la cotización #{id}...</p>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cotización no encontrada</h2>
          <p className="text-slate-600 mb-4">La cotización #{id} no existe o ha sido eliminada.</p>
          <button
            onClick={() => navigate('/cotizaciones')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Volver a Cotizaciones
          </button>
        </div>
      </div>
    );
  }

  const EstadoIcon = getEstadoIcon(cotizacion.estado);
  const TipoSistemaIcon = getTipoSistemaIcon(cotizacion.tipo_sistema);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cotizaciones')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{cotizacion.numero}</h1>
            <p className="text-slate-600 mt-1">Detalles de la cotización</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Cambios sin guardar</span>
            </div>
          )}
          
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(cotizacion.estado)}`}>
            <EstadoIcon className="w-4 h-4" />
            {getEstadoLabel(cotizacion.estado)}
          </span>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAllChanges}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
              <button
                onClick={handleCancelAllChanges}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          )}
          
          <button className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Descargar PDF">
            <Download className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Enviar al cliente">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Cliente</h3>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              {cotizacion.cliente.type === 'empresa' ? (
                <Building className="w-6 h-6 text-slate-600" />
              ) : (
                <User className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{cotizacion.cliente.name}</p>
              <p className="text-sm text-slate-600">{cotizacion.cliente.type === 'empresa' ? 'Empresa' : 'Residencial'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="font-medium text-slate-900">{cotizacion.cliente.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Teléfono</p>
              <p className="font-medium text-slate-900">{cotizacion.cliente.phone}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Dirección</p>
              <p className="font-medium text-slate-900">{cotizacion.cliente.full_address}</p>
            </div>
            
            {cotizacion.cliente.monthly_consumption && cotizacion.cliente.monthly_consumption > 0 && (
              <div>
                <p className="text-sm text-slate-600">Consumo Mensual</p>
                <p className="font-medium text-slate-900">{formatMonthlyConsumption(cotizacion.cliente.monthly_consumption)}</p>
              </div>
            )}
            
            {cotizacion.cliente.document && (
              <div>
                <p className="text-sm text-slate-600">{cotizacion.cliente.document_type || (cotizacion.cliente.type === 'empresa' ? 'NIT' : 'Cédula')}</p>
                <p className="font-medium text-slate-900">{cotizacion.cliente.document}</p>
              </div>
            )}
            
            {cotizacion.cliente.nit && !cotizacion.cliente.document && (
              <div>
                <p className="text-sm text-slate-600">NIT</p>
                <p className="font-medium text-slate-900">{cotizacion.cliente.nit}</p>
              </div>
            )}
            
            {cotizacion.cliente.cedula && !cotizacion.cliente.document && (
              <div>
                <p className="text-sm text-slate-600">Cédula</p>
                <p className="font-medium text-slate-900">{cotizacion.cliente.cedula}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información del Proyecto */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Proyecto</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Proyecto</p>
              <p className="font-semibold text-slate-900">{cotizacion.proyecto}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <TipoSistemaIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Tipo de Sistema</p>
                <p className="font-medium text-slate-900">{getTipoSistemaLabel(cotizacion.tipo_sistema)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Tipo de Red</p>
              <p className="font-medium text-slate-900">{cotizacion.tipo_red}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Requiere Financiación</p>
              <p className="font-medium text-slate-900">{getFinancingText(cotizacion.requires_financing)}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Potencia Total</p>
              <p className="text-2xl font-bold text-green-600">{cotizacion.potencia_total} kW</p>
            </div>
          </div>
        </div>

        {/* Información de la Cotización 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Información de la Cotización</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Vendedor</p>
              <p className="font-medium text-slate-900">{cotizacion.vendedor}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Fecha de Creación</p>
              <p className="font-medium text-slate-900">{formatDate(cotizacion.fecha_creacion)}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-600">Fecha de Vencimiento</p>
              <p className="font-medium text-slate-900">{formatDate(cotizacion.fecha_vencimiento)}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(getResumenCostos()?.cotizacionFinal || 0)}
                {(editingItem || editingPercentage) && (
                  <span className="text-sm text-orange-600 ml-2">(editando...)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Suministros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Suministros</h3>
            <p className="text-sm text-slate-500">💡 Doble clic en cualquier fila para editar</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Descripción</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Cantidad</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Precio Unitario</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">% Utilidad</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Valor Parcial</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Utilidad</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cotizacion.suministros.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onDoubleClick={() => handleDoubleClick(item, index, 'suministro')}
                  title="Doble clic para editar"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.tipo === 'Panel Solar' && <Sun className="w-4 h-4 text-yellow-500" />}
                      {item.tipo === 'Inversor' && <Zap className="w-4 h-4 text-blue-500" />}
                      {item.tipo === 'Batería' && <Battery className="w-4 h-4 text-green-500" />}
                      <span className="font-medium text-slate-900">{item.tipo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <select
                        value={editingItem.descripcion}
                        onChange={(e) => {
                          const selectedSuministro = getSuministrosByType(item.tipo).find(s => s.name === e.target.value);
                          handleSuministroChange('descripcion', e.target.value);
                          if (selectedSuministro) {
                            handleSuministroChange('precio_unitario', selectedSuministro.precio);
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {getSuministrosByType(item.tipo).map(suministro => (
                          <option key={suministro.id} value={suministro.name}>
                            {suministro.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-900">{item.descripcion}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <input
                        type="number"
                        value={editingItem.cantidad || 0}
                        onChange={(e) => handleSuministroChange('cantidad', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{item.cantidad.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <input
                        type="number"
                        value={editingItem.precio_unitario || 0}
                        onChange={(e) => handleSuministroChange('precio_unitario', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                      />
                    ) : (
                      <span className="text-slate-900">{formatPrice(item.precio_unitario)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <input
                        type="number"
                        value={editingItem.porcentaje_utilidad || 0}
                        onChange={(e) => handleSuministroChange('porcentaje_utilidad', parseFloat(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        step="0.1"
                        className="w-16 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                      />
                    ) : (
                      <span className="text-slate-900">{item.porcentaje_utilidad}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-slate-900">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'suministro' 
                        ? editingItem.valor_parcial 
                        : item.valor_parcial)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-slate-900">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'suministro' 
                        ? editingItem.utilidad 
                        : item.utilidad)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-green-600">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'suministro' 
                        ? editingItem.total 
                        : item.total)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Items Complementarios */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Items Complementarios</h3>
            <p className="text-sm text-slate-500">💡 Doble clic en cualquier fila para editar</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Descripción</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Cantidad</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Unidad</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Precio Unitario</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">% Utilidad</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Valor Parcial</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Utilidad</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cotizacion.items_complementarios.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onDoubleClick={() => handleDoubleClick(item, index, 'complementario')}
                  title="Doble clic para editar"
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{item.descripcion}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'complementario' ? (
                      <input
                        type="number"
                        value={editingItem.cantidad || 0}
                        onChange={(e) => handleSuministroChange('cantidad', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{item.cantidad.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900">{item.unidad}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'complementario' ? (
                      <input
                        type="number"
                        value={editingItem.precio_unitario || 0}
                        onChange={(e) => handleSuministroChange('precio_unitario', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                      />
                    ) : (
                      <span className="text-slate-900">{formatPrice(item.precio_unitario)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'complementario' ? (
                      <input
                        type="number"
                        value={editingItem.porcentaje_utilidad || 0}
                        onChange={(e) => handleSuministroChange('porcentaje_utilidad', parseFloat(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        step="0.1"
                        className="w-16 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                      />
                    ) : (
                      <span className="text-slate-900">{item.porcentaje_utilidad}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-slate-900">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'complementario' 
                        ? editingItem.valor_parcial 
                        : item.valor_parcial)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-slate-900">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'complementario' 
                        ? editingItem.utilidad 
                        : item.utilidad)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-green-600">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'complementario' 
                        ? editingItem.total 
                        : item.total)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Costos */}
      {getResumenCostos() && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Resumen de Costos</h3>
              <p className="text-sm text-slate-500">💡 Doble clic en los porcentajes para editar</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900 font-medium">{formatPrice(getResumenCostos().subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Gestión Comercial</span>
                  {editingPercentage === 'porcentaje_gestion_comercial' ? (
                    <input
                      type="number"
                      value={cotizacion.porcentaje_gestion_comercial || 3}
                      onChange={(e) => handlePercentageChange('porcentaje_gestion_comercial', e.target.value)}
                      onBlur={handlePercentageBlur}
                      onKeyDown={handlePercentageKeyDown}
                      min="0"
                      step="0.1"
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <span 
                      className="text-slate-600 cursor-pointer hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded"
                      onDoubleClick={() => handlePercentageDoubleClick('porcentaje_gestion_comercial')}
                      title="Doble clic para editar"
                    >
                      ({cotizacion.porcentaje_gestion_comercial || 3}%)
                    </span>
                  )}
                </div>
                <span className="text-slate-900">{formatPrice(getResumenCostos().gestionComercial)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Subtotal 2</span>
                <span className="text-green-600 font-semibold">{formatPrice(getResumenCostos().subtotal2)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Administración</span>
                  {editingPercentage === 'porcentaje_administracion' ? (
                    <input
                      type="number"
                      value={cotizacion.porcentaje_administracion || 8}
                      onChange={(e) => handlePercentageChange('porcentaje_administracion', e.target.value)}
                      onBlur={handlePercentageBlur}
                      onKeyDown={handlePercentageKeyDown}
                      min="0"
                      step="0.1"
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <span 
                      className="text-slate-600 cursor-pointer hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded"
                      onDoubleClick={() => handlePercentageDoubleClick('porcentaje_administracion')}
                      title="Doble clic para editar"
                    >
                      ({cotizacion.porcentaje_administracion || 8}%)
                    </span>
                  )}
                </div>
                <span className="text-slate-900">{formatPrice(getResumenCostos().administracion)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Imprevistos</span>
                  {editingPercentage === 'porcentaje_imprevistos' ? (
                    <input
                      type="number"
                      value={cotizacion.porcentaje_imprevistos || 2}
                      onChange={(e) => handlePercentageChange('porcentaje_imprevistos', e.target.value)}
                      onBlur={handlePercentageBlur}
                      onKeyDown={handlePercentageKeyDown}
                      min="0"
                      step="0.1"
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <span 
                      className="text-slate-600 cursor-pointer hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded"
                      onDoubleClick={() => handlePercentageDoubleClick('porcentaje_imprevistos')}
                      title="Doble clic para editar"
                    >
                      ({cotizacion.porcentaje_imprevistos || 2}%)
                    </span>
                  )}
                </div>
                <span className="text-slate-900">{formatPrice(getResumenCostos().imprevistos)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Utilidad</span>
                  {editingPercentage === 'porcentaje_utilidad' ? (
                    <input
                      type="number"
                      value={cotizacion.porcentaje_utilidad || 5}
                      onChange={(e) => handlePercentageChange('porcentaje_utilidad', e.target.value)}
                      onBlur={handlePercentageBlur}
                      onKeyDown={handlePercentageKeyDown}
                      min="0"
                      step="0.1"
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <span 
                      className="text-slate-600 cursor-pointer hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded"
                      onDoubleClick={() => handlePercentageDoubleClick('porcentaje_utilidad')}
                      title="Doble clic para editar"
                    >
                      ({cotizacion.porcentaje_utilidad || 5}%)
                    </span>
                  )}
                </div>
                <span className="text-slate-900">{formatPrice(getResumenCostos().utilidad)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg">
                <span className="text-slate-600">IVA sobre la utilidad (19%)</span>
                <span className="text-slate-900">{formatPrice(getResumenCostos().ivaUtilidad)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Subtotal 3</span>
                <span className="text-green-600 font-semibold">{formatPrice(getResumenCostos().subtotal3)}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Retenciones</span>
                  {editingPercentage === 'porcentaje_retencion' ? (
                    <input
                      type="number"
                      value={cotizacion.porcentaje_retencion || 3.5}
                      onChange={(e) => handlePercentageChange('porcentaje_retencion', e.target.value)}
                      onBlur={handlePercentageBlur}
                      onKeyDown={handlePercentageKeyDown}
                      min="0"
                      step="0.1"
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <span 
                      className="text-slate-600 cursor-pointer hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded"
                      onDoubleClick={() => handlePercentageDoubleClick('porcentaje_retencion')}
                      title="Doble clic para editar"
                    >
                      ({cotizacion.porcentaje_retencion || 3.5}%)
                    </span>
                  )}
                </div>
                <span className="text-slate-900">{formatPrice(getResumenCostos().retenciones)}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-semibold text-lg">Cotización del proyecto</span>
                  <span className="text-green-600 font-bold text-xl">{formatPrice(getResumenCostos().cotizacionFinal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 p-4 border rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <XCircle className="w-3 h-3 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleCotizacion;
