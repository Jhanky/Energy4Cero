import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DetalleCotizacion from '../../features/comercial/cotizaciones/DetalleCotizacion';
import { cotizacionesService } from '../../services/cotizacionesService';

const DetalleCotizacionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 [PADRE] Cargando cotización con ID:', id);
        const response = await cotizacionesService.getCotizacion(id);
        console.log('📥 [PADRE] Respuesta completa:', response);
        console.log('📊 [PADRE] Response.success:', response.success);
        console.log('📦 [PADRE] Response.data:', response.data);
        console.log('❌ [PADRE] Response.message:', response.message);

        if (response.success && response.data) {
          // Transformar los datos del backend a la estructura esperada
          const transformedCotizacion = transformCotizacionData(response.data);
          console.log('✅ [PADRE] Cotización transformada exitosamente:', transformedCotizacion);
          setCotizacion(transformedCotizacion);
        } else {
          const errorMsg = response.message || 'Error desconocido al cargar la cotización';
          console.error('❌ [PADRE] Error en respuesta del servicio:', errorMsg);
          setError(errorMsg);
        }
      } catch (error) {
        const errorMsg = error.message || 'Error de conexión al cargar la cotización';
        console.error('❌ [PADRE] Error de catch:', error);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCotizacion();
    } else {
      setError('No se proporcionó ID de cotización');
      setLoading(false);
    }
  }, [id]);

  // Función para transformar los datos del backend
  const transformCotizacionData = (apiData) => {
    if (!apiData) return null;

    return {
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
      estado: apiData.status?.name || 'Borrador',
      fecha_creacion: apiData.creation_date || apiData.created_at || new Date().toISOString(),
      fecha_vencimiento: apiData.expiration_date || apiData.updated_at || new Date().toISOString(),
      vendedor: apiData.user?.name || 'Vendedor no asignado',
      tipo_sistema: apiData.system_type || 'No especificado',
      tipo_red: apiData.grid_type || 'No especificado',
      suministros: Array.isArray(apiData.products) ? apiData.products.map(product => ({
        tipo: formatProductType(product.product_type),
        descripcion: `${product.brand || ''} ${product.model || ''}`.trim() || product.description || getProductName(product.product_type, product.product_id) || 'Producto sin descripción',
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
      })) : [],
      porcentaje_gestion_comercial: parseFloat(apiData.commercial_management_percentage) * 100 || 3,
      porcentaje_administracion: parseFloat(apiData.administration_percentage) * 100 || 8,
      porcentaje_imprevistos: parseFloat(apiData.contingency_percentage) * 100 || 2,
      porcentaje_utilidad: parseFloat(apiData.profit_percentage) * 100 || 5,
      porcentaje_retencion: parseFloat(apiData.withholding_percentage) * 100 || 3.5
    };
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

  const handleBack = () => {
    navigate('/cotizaciones');
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Detalle de Cotización</h1>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">Cargando datos...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error al cargar la cotización</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">Revisa la consola del navegador para más detalles.</p>
            </div>
          </div>
        </div>
      )}

      <DetalleCotizacion cotizacionId={id} cotizacion={cotizacion} />
    </div>
  );
};

export default DetalleCotizacionPage;
