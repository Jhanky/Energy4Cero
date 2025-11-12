import { useState, useEffect, useCallback } from 'react';
import { Download, Upload, X, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, XCircle, Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';
import invoiceService from '../../services/invoiceService';
import supplierService from '../../services/supplierService';
import costCenterService from '../../services/costCenterService';

const VistaFacturas = () => {
  // Estados para búsqueda y filtros avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado: '',
    tipoPago: '',
    proveedor: '',
    centroCosto: ''
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Estados para datos
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState({});

  // Estados para notificaciones
  const [notification, setNotification] = useState(null);

  // Estados para formularios
  const [invoiceForm, setInvoiceForm] = useState({
    supplier_id: '',
    cost_center_id: '',
    invoice_number: '',
    amount_before_iva: '',
    total_value: '',
    status: 'pendiente',
    payment_type: 'total',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    file: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para recargar datos cuando cambian los filtros o búsqueda
  useEffect(() => {
    loadInvoices();
  }, [debouncedSearchTerm, filters, currentPage, perPage]);

  // Cargar datos iniciales
  useEffect(() => {
    loadSuppliers();
    loadCostCenters();
    loadInvoiceOptions();
  }, []);

  // Cargar facturas con paginación del servidor
  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: perPage,
        search: debouncedSearchTerm,
        ...filters
      };

      const response = await invoiceService.getInvoices(params);
      if (response.success) {
        // Transformar datos del backend al formato del frontend
        const transformedInvoices = response.data.invoices.map(invoice => ({
          id: invoice.id,
          numeroFactura: invoice.invoice_number,
          proveedor: invoice.supplier?.name || 'Proveedor no encontrado',
          centroCosto: invoice.cost_center?.name || 'Centro de costo no encontrado',
          montoAntesIva: parseFloat(invoice.amount_before_iva),
          valorTotal: parseFloat(invoice.total_value),
          estado: invoice.status,
          tipoPago: invoice.payment_type,
          fechaEmision: invoice.issue_date,
          fechaVencimiento: invoice.due_date,
          notas: invoice.notes,
          archivo: invoice.file_path,
          fechaRegistro: invoice.created_at,
          estaVencida: invoice.is_overdue,
          diasHastaVencimiento: invoice.days_until_due
        }));

        setFacturas(transformedInvoices);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotalRecords(response.data.pagination?.total || 0);
      } else {
        setError(response.message || 'Error al cargar facturas');
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, debouncedSearchTerm, filters]);

  // Cargar proveedores
  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getSuppliers();
      if (response.success) {
        setSuppliers(response.data.suppliers || []);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  // Cargar centros de costo
  const loadCostCenters = async () => {
    try {
      const response = await costCenterService.getCostCenters();
      if (response.success) {
        setCostCenters(response.data.cost_centers || []);
      }
    } catch (error) {
      console.error('Error loading cost centers:', error);
    }
  };

  // Cargar opciones de facturas
  const loadInvoiceOptions = async () => {
    try {
      const response = await invoiceService.getInvoiceOptions();
      if (response.success) {
        setInvoiceOptions(response.data.options || {});
      }
    } catch (error) {
      console.error('Error loading invoice options:', error);
    }
  };

  // Filtrar facturas
  const facturasFiltradas = facturas.filter(factura => {
    const cumpleBusqueda =
      factura.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.centroCosto.toLowerCase().includes(searchTerm.toLowerCase());

    const cumpleEstado = !filters.estado || factura.estado === filters.estado;
    const cumpleTipoPago = !filters.tipoPago || factura.tipoPago === filters.tipoPago;
    const cumpleProveedor = !filters.proveedor || factura.proveedor === filters.proveedor;
    const cumpleCentroCosto = !filters.centroCosto || factura.centroCosto === filters.centroCosto;

    return cumpleBusqueda && cumpleEstado && cumpleTipoPago && cumpleProveedor && cumpleCentroCosto;
  });

  const estados = [...new Set(facturas.map(f => f.estado))];
  const tiposPago = [...new Set(facturas.map(f => f.tipoPago))];
  const proveedoresList = [...new Set(facturas.map(f => f.proveedor))];
  const centrosCostoList = [...new Set(facturas.map(f => f.centroCosto))];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'anulada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'pagada':
        return <CheckCircle className="w-4 h-4" />;
      case 'anulada':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  // Funciones para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setInvoiceForm(prev => ({ ...prev, [field]: value }));
  };

  // Función para crear factura
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!invoiceForm.invoice_number || !invoiceForm.supplier_id || !invoiceForm.cost_center_id ||
        !invoiceForm.amount_before_iva || !invoiceForm.total_value) {
      setFormErrors({
        invoice_number: !invoiceForm.invoice_number ? 'El número de factura es obligatorio' : '',
        supplier_id: !invoiceForm.supplier_id ? 'El proveedor es obligatorio' : '',
        cost_center_id: !invoiceForm.cost_center_id ? 'El centro de costos es obligatorio' : '',
        amount_before_iva: !invoiceForm.amount_before_iva ? 'El monto antes de IVA es obligatorio' : '',
        total_value: !invoiceForm.total_value ? 'El valor total es obligatorio' : ''
      });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await invoiceService.createInvoice(invoiceForm);

      if (response.success) {
        // Recargar la lista de facturas
        await loadInvoices();

        // Cerrar modal y resetear formulario
        setIsCreateModalOpen(false);
        setInvoiceForm({
          supplier_id: '',
          cost_center_id: '',
          invoice_number: '',
          amount_before_iva: '',
          total_value: '',
          status: 'pendiente',
          payment_type: 'total',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: '',
          notes: '',
          file: null
        });

        console.log('Factura creada exitosamente:', response.data.invoice);
      } else {
        // Manejar errores del backend
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          setFormErrors({ general: response.message || 'Error al crear la factura' });
        }
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setFormErrors({ general: 'Error al conectar con el servidor' });
    } finally {
      setSubmitting(false);
    }
  };

  // Función para editar factura
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFactura) return;

    // Validación básica
    if (!invoiceForm.invoice_number || !invoiceForm.supplier_id || !invoiceForm.cost_center_id ||
        !invoiceForm.amount_before_iva || !invoiceForm.total_value) {
      setFormErrors({
        invoice_number: !invoiceForm.invoice_number ? 'El número de factura es obligatorio' : '',
        supplier_id: !invoiceForm.supplier_id ? 'El proveedor es obligatorio' : '',
        cost_center_id: !invoiceForm.cost_center_id ? 'El centro de costos es obligatorio' : '',
        amount_before_iva: !invoiceForm.amount_before_iva ? 'El monto antes de IVA es obligatorio' : '',
        total_value: !invoiceForm.total_value ? 'El valor total es obligatorio' : ''
      });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await invoiceService.updateInvoice(selectedFactura.id, invoiceForm);

      if (response.success) {
        // Recargar la lista de facturas
        await loadInvoices();

        // Cerrar modal
        setIsEditModalOpen(false);
        setSelectedFactura(null);

        console.log('Factura actualizada exitosamente:', response.data.invoice);
      } else {
        // Manejar errores del backend
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          setFormErrors({ general: response.message || 'Error al actualizar la factura' });
        }
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      setFormErrors({ general: 'Error al conectar con el servidor' });
    } finally {
      setSubmitting(false);
    }
  };

  // Funciones para manejar modales
  const handleCreateFactura = () => {
    // Resetear formulario cuando se abre el modal
    setInvoiceForm({
      supplier_id: '',
      cost_center_id: '',
      invoice_number: '',
      amount_before_iva: '',
      total_value: '',
      status: 'pendiente',
      payment_type: 'total',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: '',
      file: null
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleEditFactura = (factura) => {
    setSelectedFactura(factura);

    // Cargar datos de la factura en el formulario
    setInvoiceForm({
      supplier_id: suppliers.find(s => s.name === factura.proveedor)?.id || '',
      cost_center_id: costCenters.find(c => c.name === factura.centroCosto)?.id || '',
      invoice_number: factura.numeroFactura,
      amount_before_iva: factura.montoAntesIva.toString(),
      total_value: factura.valorTotal.toString(),
      status: factura.estado,
      payment_type: factura.tipoPago,
      issue_date: factura.fechaEmision,
      due_date: factura.fechaVencimiento || '',
      notes: factura.notas || '',
      file: null
    });

    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleDeleteFactura = (factura) => {
    setSelectedFactura(factura);
    setDeleteConfirmation('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation === 'Eliminar') {
      try {
        const response = await invoiceService.deleteInvoice(selectedFactura.id);
        if (response.success) {
          setFacturas(prev => prev.filter(f => f.id !== selectedFactura.id));
          setIsDeleteModalOpen(false);
        } else {
          console.error('Error deleting invoice:', response.message);
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleUploadFile = (factura) => {
    setSelectedFactura(factura);
    setUploadFile(null);
    setIsUploadModalOpen(true);
  };

  const handleFileUploadSubmit = async () => {
    if (!uploadFile || !selectedFactura) return;

    try {
      const response = await invoiceService.uploadInvoiceFile(selectedFactura.id, uploadFile);
      if (response.success) {
        await loadInvoices();
        setIsUploadModalOpen(false);
        setUploadFile(null);
        console.log('Archivo subido exitosamente');
      } else {
        console.error('Error uploading file:', response.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDownloadFile = (factura) => {
    console.log('🔽 INICIO: handleDownloadFile llamado');
    console.log('📄 Datos de factura:', factura);

    // Verificar que la factura tenga archivo
    if (!factura.archivo) {
      console.warn('⚠️ La factura no tiene archivo adjunto');
      alert('Esta factura no tiene archivo adjunto');
      return;
    }

    try {
      console.log('📡 Llamando al servicio de descarga...');
      invoiceService.downloadInvoiceFile(factura.id);
      console.log('✅ Servicio llamado exitosamente');
    } catch (error) {
      console.error('❌ Error en handleDownloadFile:', error);
      alert('Error al descargar el archivo: ' + error.message);
    }
  };

  return (
    <>
      {/* Modal de Crear Factura */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Registrar Nueva Factura</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Número de Factura *</label>
                    <input
                      type="text"
                      value={invoiceForm.invoice_number}
                      onChange={(e) => handleFormChange('invoice_number', e.target.value)}
                      placeholder="Ej: FAC-001-2025"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                    <select
                      value={invoiceForm.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagada">Pagada</option>
                      <option value="anulada">Anulada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Proveedor *</label>
                    <select
                      value={invoiceForm.supplier_id}
                      onChange={(e) => handleFormChange('supplier_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar proveedor</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Centro de Costos *</label>
                    <select
                      value={invoiceForm.cost_center_id}
                      onChange={(e) => handleFormChange('cost_center_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar centro de costos</option>
                      {costCenters.map(costCenter => (
                        <option key={costCenter.id} value={costCenter.id}>{costCenter.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Pago</label>
                    <select
                      value={invoiceForm.payment_type}
                      onChange={(e) => handleFormChange('payment_type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="total">Pago Total</option>
                      <option value="parcial">Pago Parcial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Emisión *</label>
                    <input
                      type="date"
                      value={invoiceForm.issue_date}
                      onChange={(e) => handleFormChange('issue_date', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Monto Antes de IVA *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.amount_before_iva}
                      onChange={(e) => handleFormChange('amount_before_iva', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Valor Total *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.total_value}
                      onChange={(e) => handleFormChange('total_value', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => handleFormChange('due_date', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Notas adicionales..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Archivo de la Factura</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFormChange('file', e.target.files[0])}
                      className="hidden"
                      id="create-invoice-file"
                    />
                    <label htmlFor="create-invoice-file" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 text-center">
                        {invoiceForm.file ? invoiceForm.file.name : 'Seleccionar PDF o imagen de la factura'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Máx. 5MB (Opcional)</p>
                    </label>
                  </div>
                </div>

                {/* Mostrar errores generales */}
                {formErrors.general && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{formErrors.general}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      'Registrar Factura'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Factura */}
      {isEditModalOpen && selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Editar Factura</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Número de Factura *</label>
                    <input
                      type="text"
                      value={invoiceForm.invoice_number}
                      onChange={(e) => handleFormChange('invoice_number', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                    <select
                      value={invoiceForm.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagada">Pagada</option>
                      <option value="anulada">Anulada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Proveedor *</label>
                    <select
                      value={invoiceForm.supplier_id}
                      onChange={(e) => handleFormChange('supplier_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar proveedor</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Centro de Costos *</label>
                    <select
                      value={invoiceForm.cost_center_id}
                      onChange={(e) => handleFormChange('cost_center_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar centro de costos</option>
                      {costCenters.map(costCenter => (
                        <option key={costCenter.id} value={costCenter.id}>{costCenter.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Pago</label>
                    <select
                      value={invoiceForm.payment_type}
                      onChange={(e) => handleFormChange('payment_type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="total">Pago Total</option>
                      <option value="parcial">Pago Parcial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Emisión *</label>
                    <input
                      type="date"
                      value={invoiceForm.issue_date}
                      onChange={(e) => handleFormChange('issue_date', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Monto Antes de IVA *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.amount_before_iva}
                      onChange={(e) => handleFormChange('amount_before_iva', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Valor Total *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.total_value}
                      onChange={(e) => handleFormChange('total_value', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => handleFormChange('due_date', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Mostrar errores generales */}
                {formErrors.general && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{formErrors.general}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Factura'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-600">Confirmar Eliminación</h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">¿Eliminar factura?</p>
                    <p className="text-sm text-slate-600">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg mb-4">
                  <p className="text-sm font-medium text-slate-900">{selectedFactura.numeroFactura}</p>
                  <p className="text-sm text-slate-600">Proveedor: {selectedFactura.proveedor}</p>
                  <p className="text-sm text-slate-600">Valor: {formatCurrency(selectedFactura.valorTotal)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Para confirmar, escriba <span className="font-bold text-red-600">"Eliminar"</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Escriba aquí..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmation !== 'Eliminar'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Eliminar Factura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subida de Archivo */}
      {isUploadModalOpen && selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Subir Archivo de Factura</h3>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900">{selectedFactura.numeroFactura}</p>
                <p className="text-sm text-slate-600">Proveedor: {selectedFactura.proveedor}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Archivo</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="hidden"
                    id="invoice-file"
                  />
                  <label htmlFor="invoice-file" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 text-center">
                      {uploadFile ? uploadFile.name : 'Seleccionar PDF o imagen'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Máx. 5MB</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFileUploadSubmit}
                  disabled={!uploadFile}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Subir Archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Facturas</h1>
            <p className="text-slate-600 mt-1">Administra las facturas de proveedores</p>
          </div>
          <button
            onClick={handleCreateFactura}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Factura
          </button>
        </div>

        {/* Componentes Avanzados de Búsqueda y Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar y Filtrar Facturas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdvancedSearchBar
              placeholder="Buscar por número, proveedor o centro de costo..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <AdvancedFilters
              filters={[
                {
                  key: 'estado',
                  label: 'Estado',
                  value: filters.estado,
                  options: [
                    { value: '', label: 'Todos los estados' },
                    ...estados.map(estado => ({
                      value: estado,
                      label: estado.charAt(0).toUpperCase() + estado.slice(1)
                    }))
                  ]
                },
                {
                  key: 'tipoPago',
                  label: 'Tipo de Pago',
                  value: filters.tipoPago,
                  options: [
                    { value: '', label: 'Todos los tipos' },
                    ...tiposPago.map(tipo => ({
                      value: tipo,
                      label: tipo === 'total' ? 'Pago Total' : 'Pago Parcial'
                    }))
                  ]
                },
                {
                  key: 'proveedor',
                  label: 'Proveedor',
                  value: filters.proveedor,
                  options: [
                    { value: '', label: 'Todos los proveedores' },
                    ...proveedoresList.map(proveedor => ({
                      value: proveedor,
                      label: proveedor
                    }))
                  ]
                },
                {
                  key: 'centroCosto',
                  label: 'Centro de Costo',
                  value: filters.centroCosto,
                  options: [
                    { value: '', label: 'Todos los centros' },
                    ...centrosCostoList.map(centro => ({
                      value: centro,
                      label: centro
                    }))
                  ]
                }
              ]}
              onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              onClear={() => setFilters({
                estado: '',
                tipoPago: '',
                proveedor: '',
                centroCosto: ''
              })}
            />
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Mostrando <span className="font-semibold">{facturas.length}</span> de <span className="font-semibold">{totalRecords}</span> facturas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Estados de carga y error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error al cargar facturas</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={loadInvoices}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Facturas Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable columns={7} rows={perPage} />
            ) : facturas.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No hay facturas</h3>
                <p className="mt-1 text-sm text-slate-500">Comienza registrando tu primera factura.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateFactura}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Factura
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factura</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Centro de Costos</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{factura.numeroFactura}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(factura.fechaEmision)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">{factura.proveedor}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">{factura.centroCosto}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-slate-900">{formatCurrency(factura.valorTotal)}</div>
                          <div className="text-sm text-slate-500">{formatCurrency(factura.montoAntesIva)} antes IVA</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEstadoIcon(factura.estado)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(factura.estado)}`}>
                              {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">
                            {factura.fechaVencimiento ? formatDate(factura.fechaVencimiento) : 'No definida'}
                          </div>
                          {factura.estaVencida && (
                            <div className="text-sm text-red-600 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Vencida
                            </div>
                          )}
                          {factura.diasHastaVencimiento !== null && factura.diasHastaVencimiento > 0 && !factura.estaVencida && (
                            <div className="text-sm text-orange-600">
                              {factura.diasHastaVencimiento} días
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditFactura(factura)}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar factura"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {factura.archivo ? (
                              <button
                                onClick={() => handleDownloadFile(factura)}
                                className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Descargar archivo"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUploadFile(factura)}
                                className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Subir archivo"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteFactura(factura)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar factura"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginación Avanzada */}
                <div className="mt-6">
                  <AdvancedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                    totalRecords={totalRecords}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Componente de Notificaciones */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </>
  );
};

export default VistaFacturas;
