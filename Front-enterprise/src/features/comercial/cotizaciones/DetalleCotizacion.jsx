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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cotizacionesService } from '../../../services/cotizacionesService';
import { productosService } from '../../../services/productosService';
import apiService from '../../../services/api';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Badge } from "@/ui/badge";
import { Separator } from "@/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Textarea } from "@/ui/textarea";
import { toast } from "sonner";
import { Notification } from '../../../shared/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";

const DetalleCotizacion = ({ cotizacionId, cotizacion: propCotizacion }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const effectiveId = cotizacionId || id;
  const [cotizacion, setCotizacion] = useState(null);
  const [cotizacionOriginal, setCotizacionOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'suministro' o 'complementario'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingPercentage, setEditingPercentage] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [productos, setProductos] = useState({
    panels: [],
    inverters: [],
    batteries: []
  });
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Función para cargar productos desde la API
  const loadProductos = async (cotizacionData = null) => {
    try {
      setLoadingProductos(true);

      // Cargar paneles
      const panelsResponse = await productosService.getPanels();
      if (panelsResponse.success) {
        setProductos(prev => ({ ...prev, panels: panelsResponse.data.panels || [] }));
      }

      // Cargar baterías
      const batteriesResponse = await productosService.getBatteries();
      if (batteriesResponse.success) {
        setProductos(prev => ({ ...prev, batteries: batteriesResponse.data.batteries || [] }));
      }

      // Cargar inversores filtrados por la cotización actual (si tenemos los datos)
      if (cotizacionData && cotizacionData.tipo_red && cotizacionData.tipo_sistema) {
        const invertersResponse = await productosService.getInvertersForQuotation(
          cotizacionData.tipo_red,
          cotizacionData.tipo_sistema
        );
        if (invertersResponse.success) {
          setProductos(prev => ({ ...prev, inverters: invertersResponse.data.inverters || [] }));
        }
      } else {
        // Si no tenemos datos de cotización, cargar todos los inversores
        const invertersResponse = await productosService.getInverters();
        if (invertersResponse.success) {
          setProductos(prev => ({ ...prev, inverters: invertersResponse.data.inverters || [] }));
        }
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar los productos disponibles');
    } finally {
      setLoadingProductos(false);
    }
  };

  useEffect(() => {
    const initializeCotizacion = async () => {
      try {
        setLoading(true);

        // Si tenemos cotización desde props (padre), usarla directamente
        if (propCotizacion) {
          console.log('🔄 [HIJO] Usando cotización desde props del padre');
          setCotizacion(propCotizacion);
          setCotizacionOriginal(JSON.parse(JSON.stringify(propCotizacion)));

          // Cargar productos después de tener la cotización
          await loadProductos(propCotizacion);
        } else {
          // Si no hay props, hacer fetch propio
          console.log('🔄 [HIJO] No hay cotización en props, haciendo fetch propio con ID:', effectiveId);
          const response = await cotizacionesService.getCotizacion(effectiveId);

          if (response.success) {
            // Transformar la respuesta del backend para que coincida con la estructura esperada
            const transformedCotizacion = transformCotizacionData(response.data);
            setCotizacion(transformedCotizacion);
            setCotizacionOriginal(JSON.parse(JSON.stringify(transformedCotizacion)));

            // Cargar productos después de tener la cotización
            await loadProductos(transformedCotizacion);
          } else {
            toast.error(response.message || 'Error al cargar la cotización');
          }
        }
      } catch (error) {
        toast.error(error.message || 'Error de conexión al cargar la cotización');
      } finally {
        setLoading(false);
      }
    };

    if (effectiveId || propCotizacion) {
      initializeCotizacion();
    } else {
      toast.error('No se proporcionó ID de cotización ni datos desde props');
      setLoading(false);
    }
  }, [effectiveId, propCotizacion]);

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
      panel_count: parseInt(apiData.panel_count) || 0,
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
    // Convertir a número y validar que no sea NaN
    const numericValue = parseFloat(value);
    const safeValue = isNaN(numericValue) ? 0 : Math.max(0, numericValue);

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
        valor_parcial: isNaN(valorParcial) ? 0 : valorParcial,
        utilidad: isNaN(utilidad) ? 0 : utilidad,
        total: isNaN(total) ? 0 : total
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
      updatedCotizacion.suministros[editingItem.originalIndex] = { ...editingItem };
    } else if (editingType === 'complementario') {
      updatedCotizacion.items_complementarios[editingItem.originalIndex] = { ...editingItem };
    }

    // Recalcular valor total de la cotización (todos los items, no solo los editados)
    const totalSuministros = updatedCotizacion.suministros.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalComplementarios = updatedCotizacion.items_complementarios.reduce((sum, item) => sum + (item.total || 0), 0);
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
    // Usar los valores más actualizados incluyendo cambios en edición
    const resumenCostos = getResumenCostos();
    console.log('🧮 Resumen de costos calculado:', resumenCostos);

    // Transformar productos utilizados (filtrar productos con cantidad <= 0)
    const usedProducts = frontendData.suministros
      .filter(item => parseInt(item.cantidad) > 0)
      .map((item, index) => {
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

        // Asegurar que descripcion sea una cadena antes de usar split
        const descripcion = String(item.descripcion || '');

        // Crear el objeto base
        const productData = {
          product_type: productType,
          product_id: productId,
          brand: descripcion.split(' ')[0] || 'Genérico',
          model: descripcion.split(' ').slice(1).join(' ') || 'Modelo',
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

    // Obtener el usuario actual para usar su ID
    const currentUser = apiService.getCurrentUserFromStorage();
    const userId = currentUser?.id || currentUser?.user_id;

    if (!userId) {
      console.error('❌ No se pudo obtener el ID del usuario actual');
      throw new Error('Usuario no autenticado o ID de usuario no disponible');
    }

    // Preparar datos para el backend
    const backendData = {
      client_id: frontendData.cliente.id,
      user_id: userId, // Usar el ID del usuario actual
      project_name: frontendData.proyecto,
      system_type: frontendData.tipo_sistema,
      grid_type: frontendData.tipo_red,
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
      console.log('🔄 ========== INICIANDO GUARDADO DE CAMBIOS ==========');
      console.log('📊 Estado actual de cotización:', {
        id: cotizacion.id,
        suministros_count: cotizacion.suministros.length,
        items_complementarios_count: cotizacion.items_complementarios.length
      });

      // Crear una COPIA PROFUNDA de la cotización actual para aplicar cambios pendientes
      // Esto es crucial para evitar problemas con referencias de arrays y objetos anidados
      let cotizacionToSave = JSON.parse(JSON.stringify(cotizacion));

      // Aplicar cualquier cambio pendiente antes de guardar
      if (editingItem && editingType) {
        console.log('📝 Aplicando cambios pendientes del item en edición');
        console.log('🔍 Item en edición:', editingItem);
        console.log('🔍 Tipo de edición:', editingType);

        // Actualizar en el array correspondiente
        if (editingType === 'suministro') {
          cotizacionToSave.suministros[editingItem.originalIndex] = { ...editingItem };
          console.log('✅ Suministro actualizado en índice:', editingItem.originalIndex);
        } else if (editingType === 'complementario') {
          cotizacionToSave.items_complementarios[editingItem.originalIndex] = { ...editingItem };
          console.log('✅ Item complementario actualizado en índice:', editingItem.originalIndex);
          console.log('📦 Item complementario actualizado:', cotizacionToSave.items_complementarios[editingItem.originalIndex]);
        }

        // Recalcular valor total de la cotización
        const totalSuministros = cotizacionToSave.suministros.reduce((sum, item) => sum + (item.total || 0), 0);
        const totalComplementarios = cotizacionToSave.items_complementarios.reduce((sum, item) => sum + (item.total || 0), 0);
        cotizacionToSave.valor_total = totalSuministros + totalComplementarios;
        console.log('💰 Totales recalculados:', { totalSuministros, totalComplementarios, valor_total: cotizacionToSave.valor_total });
      }

      console.log('📋 Items complementarios antes de transformar:', cotizacionToSave.items_complementarios);

      // Transformar los datos al formato que espera el backend
      const backendData = transformCotizacionForBackend(cotizacionToSave);

      console.log('📤 Items complementarios transformados para backend:', backendData.items);

      // Llamar al servicio para actualizar la cotización
      const response = await cotizacionesService.updateCotizacion(cotizacion.id, backendData);

      console.log('📥 Respuesta completa del backend:', response);
      console.log('📋 Items complementarios en respuesta:', response.data?.quotation_items);

      if (response.success) {
        // Transformar la respuesta del backend al formato del frontend
        const updatedCotizacion = transformCotizacionData(response.data);

        // Actualizar el estado de la UI con los datos del backend
        setCotizacion(updatedCotizacion);

        // Actualizar la cotización original para tracking de cambios
        setCotizacionOriginal(JSON.parse(JSON.stringify(updatedCotizacion)));
        setHasUnsavedChanges(false);

        // Limpiar el estado de edición
        setEditingItem(null);
        setEditingType(null);

        // Mostrar notificación de éxito
        // Mostrar notificación de éxito
        toast.success('Cotización actualizada exitosamente');
      } else {
        throw new Error(response.message || 'Error desconocido del backend');
      }

    } catch (error) {
      console.error('❌ Error al guardar los cambios:', error);

      toast.error(error.message || 'Error al guardar los cambios');
    }
  };

  // Función para cancelar todos los cambios (trigger)
  const handleCancelAllChanges = () => {
    setShowCancelConfirm(true);
  };

  // Función para confirmar la cancelación
  const confirmCancelChanges = () => {
    setCotizacion(JSON.parse(JSON.stringify(cotizacionOriginal)));
    setHasUnsavedChanges(false);
    setEditingItem(null);
    setEditingType(null);
    setEditingPercentage(null);
    setShowCancelConfirm(false);
  };

  // Función auxiliar para generar PDF con datos específicos
  const generateSimplePDFFromData = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Función auxiliar para formatear precios
    const formatPrice = (price) => {
      return `$ ${Math.round(price).toLocaleString('es-CO')}`;
    };

    // Función auxiliar para formatear fechas
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('DETALLES DE COTIZACIÓN', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cotización: ${data.numero}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Información del Cliente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('INFORMACIÓN DEL CLIENTE', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);

    const clientInfo = [
      ['Nombre:', data.cliente?.name || 'Cliente no especificado'],
      ['Tipo:', data.cliente?.type === 'empresa' ? 'Empresa' : 'Residencial'],
      ['Email:', data.cliente?.email || 'No disponible'],
      ['Teléfono:', data.cliente?.phone || 'No disponible'],
      ['Dirección:', data.cliente?.full_address || 'Dirección no disponible'],
      ['Ciudad:', data.cliente?.city?.name || 'No disponible'],
      ['Departamento:', data.cliente?.department?.name || 'No disponible'],
      ['Consumo mensual:', data.cliente?.monthly_consumption ? `${Math.round(data.cliente.monthly_consumption).toLocaleString('es-CO')} kWh` : 'No especificado']
    ];

    clientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Información del Proyecto
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('INFORMACIÓN DEL PROYECTO', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);

    const projectInfo = [
      ['Proyecto:', data.proyecto || 'Proyecto sin nombre'],
      ['Tipo de sistema:', getTipoSistemaTexto(data.tipo_sistema)],
      ['Tipo de red:', data.tipo_red || 'No especificado'],
      ['Potencia:', `${Math.round(data.potencia_total * 100) / 100} kW`],
      ['Requiere financiación:', data.requiere_financing ? 'Sí' : 'No']
    ];

    projectInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Información de la Cotización
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('INFORMACIÓN DE LA COTIZACIÓN', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);

    const quoteInfo = [
      ['Vendedor:', data.vendedor || 'Vendedor no asignado'],
      ['Estado:', data.estado || 'Borrador'],
      ['Fecha de creación:', formatDate(data.fecha_creacion)],
      ['Fecha de vencimiento:', data.fecha_vencimiento ? formatDate(data.fecha_vencimiento) : 'No definida']
    ];

    quoteInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 6;
    });

    yPosition += 15;

    // Tabla de Suministros
    if (data.suministros && data.suministros.length > 0) {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.text('SUMINISTROS', 15, yPosition);
      yPosition += 10;

      const suministrosData = data.suministros.map(item => [
        item.tipo,
        item.descripcion,
        Math.round(item.cantidad).toLocaleString('es-CO'),
        formatPrice(item.precio_unitario),
        `${Math.round(item.porcentaje_utilidad * 100) / 100}%`,
        formatPrice(item.total)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Tipo', 'Descripción', 'Cant.', 'Precio Unit.', '% Util.', 'Total']],
        body: suministrosData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          halign: 'center'
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: 51,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 25 },
          1: { halign: 'left', cellWidth: 60 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'right', cellWidth: 30 },
          4: { halign: 'center', cellWidth: 25 },
          5: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: 15, right: 15 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Tabla de Items Complementarios
    if (data.items_complementarios && data.items_complementarios.length > 0) {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.text('ITEMS COMPLEMENTARIOS', 15, yPosition);
      yPosition += 10;

      const complementariosData = data.items_complementarios.map(item => [
        item.descripcion,
        Math.round(item.cantidad * 100) / 100,
        item.unidad,
        formatPrice(item.precio_unitario),
        `${Math.round(item.porcentaje_utilidad * 100) / 100}%`,
        formatPrice(item.total)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Descripción', 'Cant.', 'Unidad', 'Precio Unit.', '% Util.', 'Total']],
        body: complementariosData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          halign: 'center'
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: 51,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 50 },
          1: { halign: 'center', cellWidth: 20 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'right', cellWidth: 30 },
          4: { halign: 'center', cellWidth: 25 },
          5: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: 15, right: 15 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Resumen de Costos
    // Verificar si necesitamos nueva página
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('RESUMEN DE COSTOS', 15, yPosition);
    yPosition += 15;

    // Calcular valores usando los datos reales de la cotización
    const subtotal = data.subtotal || 0;
    const profit = data.profit || 0;
    const profitIva = data.profit_iva || 0;
    const commercialManagement = data.commercial_management || 0;
    const administration = data.administration || 0;
    const contingency = data.contingency || 0;
    const withholdings = data.withholdings || 0;
    const subtotal2 = data.subtotal2 || 0;
    const subtotal3 = data.subtotal3 || 0;
    const totalValue = data.valor_total || 0;

    const resumenData = [
      ['Subtotal', formatPrice(subtotal)],
      [`Utilidad (${Math.round(data.porcentaje_utilidad * 100) / 100}%)`, formatPrice(profit)],
      ['IVA utilidad', formatPrice(profitIva)],
      [`Gestión comercial (${Math.round(data.porcentaje_gestion_comercial * 100) / 100}%)`, formatPrice(commercialManagement)],
      ['Subtotal 2', formatPrice(subtotal2)],
      [`Administración (${Math.round(data.porcentaje_administracion * 100) / 100}%)`, formatPrice(administration)],
      [`Imprevistos (${Math.round(data.porcentaje_imprevistos * 100) / 100}%)`, formatPrice(contingency)],
      ['Subtotal 3', formatPrice(subtotal3)],
      [`Retenciones (${Math.round(data.porcentaje_retencion * 100) / 100}%)`, formatPrice(withholdings)],
      ['', ''], // Espacio
      ['TOTAL COTIZACIÓN', formatPrice(totalValue)]
    ];

    autoTable(doc, {
      startY: yPosition,
      body: resumenData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: pageWidth * 0.65, fontStyle: 'bold' },
        1: { cellWidth: pageWidth * 0.25, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      didParseCell: function (data) {
        // Resaltar la fila final
        if (data.row.index === resumenData.length - 1) {
          data.cell.styles.fillColor = [232, 232, 232];
          data.cell.styles.fontSize = 10;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Generado por ENERGY 4.0 - Sistema de Gestión Empresarial', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, footerY + 5, { align: 'center' });

    // Descargar el PDF
    doc.save(`detalles_cotizacion_${data.numero}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Función auxiliar para obtener texto descriptivo del tipo de sistema
  const getTipoSistemaTexto = (tipoSistema) => {
    const tipos = {
      'On-grid': 'Sistema Solar Conectado a Red',
      'Off-grid': 'Sistema Solar Autónomo',
      'Híbrido': 'Sistema Solar Híbrido',
      'Interconectado': 'Sistema Solar Interconectado'
    };
    return tipos[tipoSistema] || 'Sistema Solar Fotovoltaico';
  };

  // Función para descargar PDF simple con detalles de la cotización
  const handleDownloadPDF = async () => {
    console.log('🔥 [DEBUG] handleDownloadPDF ejecutándose');
    console.log('🔥 [DEBUG] cotizacion:', cotizacion);
    console.log('🔥 [DEBUG] effectiveId:', effectiveId);

    try {
      let quotationId = cotizacion?.id;
      console.log('🔥 [DEBUG] quotationId inicial:', quotationId);

      // Si no tenemos el ID de la cotización, intentar obtenerlo desde props o URL
      if (!quotationId) {
        quotationId = effectiveId;
        console.log('🔥 [DEBUG] quotationId desde effectiveId:', quotationId);
      }

      if (!quotationId) {
        console.log('🔥 [DEBUG] No se pudo determinar el ID de la cotización');
        setNotification({
          type: 'error',
          message: 'No se pudo determinar el ID de la cotización para generar el PDF.'
        });
        return;
      }

      console.log('🔥 [DEBUG] Mostrando notificación de generación');
      setNotification({
        type: 'info',
        message: `Generando PDF con detalles de la cotización...`
      });

      console.log('🔥 [DEBUG] Llamando al servicio generateSimplePDF con ID:', quotationId);
      // Llamar al servicio para generar el PDF simple
      const serviceResponse = await cotizacionesService.generateSimplePDF(quotationId);
      console.log('🔥 [DEBUG] Respuesta del servicio:', serviceResponse);

      if (serviceResponse.success && serviceResponse.data) {
        console.log('🔥 [DEBUG] Datos obtenidos del servicio, llamando a generateSimplePDFFromData');
        // Generar el PDF con los datos obtenidos
        generateSimplePDFFromData(serviceResponse.data);

        setNotification({
          type: 'success',
          message: 'PDF con detalles descargado exitosamente'
        });

        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      } else {
        console.log('🔥 [DEBUG] Error en respuesta del servicio:', serviceResponse);
        throw new Error(serviceResponse.message || 'Error al obtener datos para el PDF');
      }
    } catch (error) {
      console.error('🔥 [DEBUG] Error en handleDownloadPDF:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Error al generar el PDF con detalles.'
      });

      // Ocultar notificación de error después de 5 segundos
      setTimeout(() => {
        setNotification(null);
      }, 5000);
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

    // Forzar re-renderizado para actualizar cálculos en tiempo real
    // Esto asegura que getResumenCostos() se recalcule con los nuevos porcentajes
    setTimeout(() => {
      // Pequeño delay para asegurar que el estado se actualice primero
    }, 0);
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
      case 'Panel Solar':
        return productos.panels.map(panel => ({
          id: panel.panel_id,
          name: `${panel.brand || ''} ${panel.model || ''}`.trim() || `Panel ${panel.panel_id}`,
          precio: parseFloat(panel.price) || 0
        }));
      case 'Inversor':
        return productos.inverters.map(inverter => ({
          id: inverter.inverter_id,
          name: `${inverter.name || ''} ${inverter.model || ''}`.trim() || `Inversor ${inverter.inverter_id}`,
          precio: parseFloat(inverter.price) || 0,
          potencia: parseFloat(inverter.power_output_kw) || 0
        }));
      case 'Batería':
        return productos.batteries.map(battery => ({
          id: battery.battery_id,
          name: `${battery.name || ''} ${battery.model || ''}`.trim() || `Batería ${battery.battery_id}`,
          precio: parseFloat(battery.price) || 0,
          capacidad: parseFloat(battery.ah_capacity) || 0
        }));
      default:
        return [];
    }
  };

  // Calcular valor total dinámicamente considerando todos los cambios
  const getValorTotalDinamico = () => {
    if (!cotizacion) return 0;

    let totalSuministros = 0;
    let totalComplementarios = 0;

    // Calcular total de suministros considerando cambios en tiempo real
    cotizacion.suministros.forEach((item, index) => {
      // Si hay un item siendo editado actualmente, usar sus valores calculados
      if (editingItem && editingItem.originalIndex === index && editingType === 'suministro') {
        totalSuministros += editingItem.total || 0;
      } else {
        // Usar el valor del item original, pero si hay cambios pendientes en editingItem, usar esos
        totalSuministros += item.total || 0;
      }
    });

    // Calcular total de items complementarios considerando cambios en tiempo real
    cotizacion.items_complementarios.forEach((item, index) => {
      // Si hay un item siendo editado actualmente, usar sus valores calculados
      if (editingItem && editingItem.originalIndex === index && editingType === 'complementario') {
        totalComplementarios += editingItem.total || 0;
      } else {
        // Usar el valor del item original
        totalComplementarios += item.total || 0;
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cotizaciones')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{cotizacion.numero}</h1>
            <p className="text-muted-foreground mt-1">Detalles de la cotización</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 gap-2 px-3 py-1.5">
              <Clock className="w-3 h-3" />
              Cambios sin guardar
            </Badge>
          )}

          <Badge variant="outline" className={`gap-1 px-3 py-1 ${getEstadoColor(cotizacion.estado)}`}>
            <EstadoIcon className="w-3 h-3" />
            {getEstadoLabel(cotizacion.estado)}
          </Badge>

          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveAllChanges}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelAllChanges}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownloadPDF}
            className="text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
            title="Descargar Detalles de Cotización PDF"
          >
            <Download className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
            title="Enviar al cliente"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                {cotizacion.cliente.type === 'empresa' ? (
                  <Building className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{cotizacion.cliente.name}</p>
                <p className="text-sm text-muted-foreground">{cotizacion.cliente.type === 'empresa' ? 'Empresa' : 'Residencial'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium text-foreground">{cotizacion.cliente.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Teléfono</Label>
                <p className="font-medium text-foreground">{cotizacion.cliente.phone}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Dirección</Label>
                <p className="font-medium text-foreground">{cotizacion.cliente.full_address}</p>
              </div>

              {cotizacion.cliente.monthly_consumption && cotizacion.cliente.monthly_consumption > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">Consumo Mensual</Label>
                  <p className="font-medium text-foreground">{formatMonthlyConsumption(cotizacion.cliente.monthly_consumption)}</p>
                </div>
              )}

              {cotizacion.cliente.document && (
                <div>
                  <Label className="text-muted-foreground text-xs">{cotizacion.cliente.document_type || (cotizacion.cliente.type === 'empresa' ? 'NIT' : 'Cédula')}</Label>
                  <p className="font-medium text-foreground">{cotizacion.cliente.document}</p>
                </div>
              )}

              {cotizacion.cliente.nit && !cotizacion.cliente.document && (
                <div>
                  <Label className="text-muted-foreground text-xs">NIT</Label>
                  <p className="font-medium text-foreground">{cotizacion.cliente.nit}</p>
                </div>
              )}

              {cotizacion.cliente.cedula && !cotizacion.cliente.document && (
                <div>
                  <Label className="text-muted-foreground text-xs">Cédula</Label>
                  <p className="font-medium text-foreground">{cotizacion.cliente.cedula}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información del Proyecto */}
        {/* Información del Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-xs">Proyecto</Label>
              <p className="font-semibold text-foreground">{cotizacion.proyecto}</p>
            </div>

            <div className="flex items-center gap-2">
              <TipoSistemaIcon className="w-5 h-5 text-green-600" />
              <div>
                <Label className="text-muted-foreground text-xs">Tipo de Sistema</Label>
                <p className="font-medium text-foreground">{getTipoSistemaLabel(cotizacion.tipo_sistema)}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Tipo de Red</Label>
              <p className="font-medium text-foreground">{cotizacion.tipo_red}</p>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Requiere Financiación</Label>
              <p className="font-medium text-foreground">{getFinancingText(cotizacion.requires_financing)}</p>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Potencia Total</Label>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cotizacion.potencia_total} kW</p>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Cotización 2 */}
        {/* Información de la Cotización 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Información de la Cotización</CardTitle>
            <Button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 gap-2 h-8 text-xs"
              title="Descargar detalles de la cotización en PDF"
            >
              <Download className="w-3 h-3" />
              Descargar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div>
              <Label className="text-muted-foreground text-xs">Vendedor</Label>
              <p className="font-medium text-foreground">{cotizacion.vendedor}</p>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Fecha de Creación</Label>
              <p className="font-medium text-foreground">{formatDate(cotizacion.fecha_creacion)}</p>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Fecha de Vencimiento</Label>
              <p className="font-medium text-foreground">{formatDate(cotizacion.fecha_vencimiento)}</p>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground text-xs">Valor Total</Label>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(getResumenCostos()?.cotizacionFinal || 0)}
                {(editingItem || editingPercentage) && (
                  <span className="text-sm text-orange-600 dark:text-orange-400 ml-2">(editando...)</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Suministros */}
      {/* Tabla de Suministros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <CardTitle>Suministros</CardTitle>
          <div className="flex items-center gap-3">
            {loadingProductos && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Cargando productos...
              </div>
            )}
            <p className="text-sm text-muted-foreground">💡 Doble clic en cualquier fila para editar</p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right w-[100px]">Cantidad</TableHead>
                <TableHead className="text-right w-[150px]">Precio Unitario</TableHead>
                <TableHead className="text-right w-[100px]">% Utilidad</TableHead>
                <TableHead className="text-right w-[150px]">Valor Parcial</TableHead>
                <TableHead className="text-right w-[150px]">Utilidad</TableHead>
                <TableHead className="text-right w-[150px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizacion.suministros.map((item, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-muted/50"
                  onDoubleClick={() => handleDoubleClick(item, index, 'suministro')}
                  title="Doble clic para editar"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.tipo === 'Panel Solar' && <Sun className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />}
                      {item.tipo === 'Inversor' && <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                      {item.tipo === 'Batería' && <Battery className="w-4 h-4 text-green-500 dark:text-green-400" />}
                      <span className="font-medium">{item.tipo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <Select
                        value={editingItem.descripcion}
                        onValueChange={(value) => {
                          const selectedSuministro = getSuministrosByType(item.tipo).find(s => s.name === value);
                          handleSuministroChange('descripcion', value);
                          if (selectedSuministro) {
                            handleSuministroChange('precio_unitario', selectedSuministro.precio);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {getSuministrosByType(item.tipo).map(suministro => (
                            <SelectItem key={suministro.id} value={suministro.name || `item-${suministro.id}`}>
                              {suministro.name || `Item #${suministro.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>{item.descripcion}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <Input
                        type="number"
                        value={editingItem.cantidad || 0}
                        onChange={(e) => handleSuministroChange('cantidad', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="h-8 text-right"
                      />
                    ) : (
                      <span className="font-medium">{item.cantidad.toLocaleString()}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <Input
                        type="number"
                        value={editingItem.precio_unitario || 0}
                        onChange={(e) => handleSuministroChange('precio_unitario', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="h-8 text-right"
                      />
                    ) : (
                      <span>{formatPrice(item.precio_unitario)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'suministro' ? (
                      <Input
                        type="number"
                        value={editingItem.porcentaje_utilidad || 0}
                        onChange={(e) => handleSuministroChange('porcentaje_utilidad', parseFloat(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        step="0.1"
                        className="h-8 text-right"
                      />
                    ) : (
                      <span>{item.porcentaje_utilidad}%</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'suministro'
                        ? editingItem.valor_parcial
                        : item.valor_parcial)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span>
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'suministro'
                        ? editingItem.utilidad
                        : item.utilidad)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'suministro'
                        ? editingItem.total
                        : item.total)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabla de Items Complementarios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <CardTitle>Items Complementarios</CardTitle>
          <p className="text-sm text-muted-foreground">💡 Doble clic en cualquier fila para editar</p>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right w-[100px]">Cantidad</TableHead>
                <TableHead className="w-[100px]">Unidad</TableHead>
                <TableHead className="text-right w-[150px]">Precio Unitario</TableHead>
                <TableHead className="text-right w-[100px]">% Utilidad</TableHead>
                <TableHead className="text-right w-[150px]">Valor Parcial</TableHead>
                <TableHead className="text-right w-[150px]">Utilidad</TableHead>
                <TableHead className="text-right w-[150px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizacion.items_complementarios.map((item, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-muted/50"
                  onDoubleClick={() => handleDoubleClick(item, index, 'complementario')}
                  title="Doble clic para editar"
                >
                  <TableCell>
                    <span className="font-medium">{item.descripcion}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'complementario' ? (
                      <Input
                        type="number"
                        value={editingItem.cantidad || 0}
                        onChange={(e) => handleSuministroChange('cantidad', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="h-8 text-right"
                      />
                    ) : (
                      <span className="font-medium">{item.cantidad.toLocaleString()}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span>{item.unidad}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'complementario' ? (
                      <Input
                        type="number"
                        value={editingItem.precio_unitario || 0}
                        onChange={(e) => handleSuministroChange('precio_unitario', parseInt(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        className="h-8 text-right"
                      />
                    ) : (
                      <span>{formatPrice(item.precio_unitario)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingItem && editingItem.originalIndex === index && editingType === 'complementario' ? (
                      <Input
                        type="number"
                        value={editingItem.porcentaje_utilidad || 0}
                        onChange={(e) => handleSuministroChange('porcentaje_utilidad', parseFloat(e.target.value) || 0)}
                        onBlur={handleFinishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                        min="0"
                        step="0.1"
                        className="h-8 text-right"
                      />
                    ) : (
                      <span>{item.porcentaje_utilidad}%</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'complementario'
                        ? editingItem.valor_parcial
                        : item.valor_parcial)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span>
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'complementario'
                        ? editingItem.utilidad
                        : item.utilidad)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatPrice(editingItem && editingItem.originalIndex === index && editingType === 'complementario'
                        ? editingItem.total
                        : item.total)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen de Costos */}
      {getResumenCostos() && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <CardTitle>Resumen de Costos</CardTitle>
            <p className="text-sm text-muted-foreground">💡 Doble clic en los porcentajes para editar</p>
          </CardHeader>

          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(getResumenCostos().subtotal)}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Gestión Comercial</span>
                {editingPercentage === 'porcentaje_gestion_comercial' ? (
                  <Input
                    type="number"
                    value={cotizacion.porcentaje_gestion_comercial || 3}
                    onChange={(e) => handlePercentageChange('porcentaje_gestion_comercial', e.target.value)}
                    onBlur={handlePercentageBlur}
                    onKeyDown={handlePercentageKeyDown}
                    min="0"
                    step="0.1"
                    className="w-20 h-8"
                  />
                ) : (
                  <span
                    className="text-muted-foreground cursor-pointer hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20 px-2 py-1 rounded"
                    onDoubleClick={() => handlePercentageDoubleClick('porcentaje_gestion_comercial')}
                    title="Doble clic para editar"
                  >
                    ({cotizacion.porcentaje_gestion_comercial || 3}%)
                  </span>
                )}
              </div>
              <span>{formatPrice(getResumenCostos().gestionComercial)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal 2</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">{formatPrice(getResumenCostos().subtotal2)}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Administración</span>
                {editingPercentage === 'porcentaje_administracion' ? (
                  <Input
                    type="number"
                    value={cotizacion.porcentaje_administracion || 8}
                    onChange={(e) => handlePercentageChange('porcentaje_administracion', e.target.value)}
                    onBlur={handlePercentageBlur}
                    onKeyDown={handlePercentageKeyDown}
                    min="0"
                    step="0.1"
                    className="w-20 h-8"
                  />
                ) : (
                  <span
                    className="text-muted-foreground cursor-pointer hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20 px-2 py-1 rounded"
                    onDoubleClick={() => handlePercentageDoubleClick('porcentaje_administracion')}
                    title="Doble clic para editar"
                  >
                    ({cotizacion.porcentaje_administracion || 8}%)
                  </span>
                )}
              </div>
              <span>{formatPrice(getResumenCostos().administracion)}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Imprevistos</span>
                {editingPercentage === 'porcentaje_imprevistos' ? (
                  <Input
                    type="number"
                    value={cotizacion.porcentaje_imprevistos || 2}
                    onChange={(e) => handlePercentageChange('porcentaje_imprevistos', e.target.value)}
                    onBlur={handlePercentageBlur}
                    onKeyDown={handlePercentageKeyDown}
                    min="0"
                    step="0.1"
                    className="w-20 h-8"
                  />
                ) : (
                  <span
                    className="text-muted-foreground cursor-pointer hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20 px-2 py-1 rounded"
                    onDoubleClick={() => handlePercentageDoubleClick('porcentaje_imprevistos')}
                    title="Doble clic para editar"
                  >
                    ({cotizacion.porcentaje_imprevistos || 2}%)
                  </span>
                )}
              </div>
              <span>{formatPrice(getResumenCostos().imprevistos)}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Utilidad</span>
                {editingPercentage === 'porcentaje_utilidad' ? (
                  <Input
                    type="number"
                    value={cotizacion.porcentaje_utilidad || 5}
                    onChange={(e) => handlePercentageChange('porcentaje_utilidad', e.target.value)}
                    onBlur={handlePercentageBlur}
                    onKeyDown={handlePercentageKeyDown}
                    min="0"
                    step="0.1"
                    className="w-20 h-8"
                  />
                ) : (
                  <span
                    className="text-muted-foreground cursor-pointer hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20 px-2 py-1 rounded"
                    onDoubleClick={() => handlePercentageDoubleClick('porcentaje_utilidad')}
                    title="Doble clic para editar"
                  >
                    ({cotizacion.porcentaje_utilidad || 5}%)
                  </span>
                )}
              </div>
              <span>{formatPrice(getResumenCostos().utilidad)}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
              <span className="text-muted-foreground">IVA sobre la utilidad (19%)</span>
              <span>{formatPrice(getResumenCostos().ivaUtilidad)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal 3</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">{formatPrice(getResumenCostos().subtotal3)}</span>
            </div>

            <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Retenciones</span>
                {editingPercentage === 'porcentaje_retencion' ? (
                  <Input
                    type="number"
                    value={cotizacion.porcentaje_retencion || 3.5}
                    onChange={(e) => handlePercentageChange('porcentaje_retencion', e.target.value)}
                    onBlur={handlePercentageBlur}
                    onKeyDown={handlePercentageKeyDown}
                    min="0"
                    step="0.1"
                    className="w-20 h-8"
                  />
                ) : (
                  <span
                    className="text-muted-foreground cursor-pointer hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/20 px-2 py-1 rounded"
                    onDoubleClick={() => handlePercentageDoubleClick('porcentaje_retencion')}
                    title="Doble clic para editar"
                  >
                    ({cotizacion.porcentaje_retencion || 3.5}%)
                  </span>
                )}
              </div>
              <span>{formatPrice(getResumenCostos().retenciones)}</span>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Cotización del proyecto</span>
                <span className="text-green-600 dark:text-green-400 font-bold text-xl">{formatPrice(getResumenCostos().cotizacionFinal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres descartar todos los cambios sin guardar? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelChanges}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notificación */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />

    </div>
  );
};

export default DetalleCotizacion;
