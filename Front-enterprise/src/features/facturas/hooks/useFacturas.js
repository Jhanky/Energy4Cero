import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import invoiceService from '../../../services/invoiceService';
import supplierService from '../../../services/supplierService';
import costCenterService from '../../../services/costCenterService';

export const useFacturas = () => {
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
        resetInvoiceForm();

        toast.success('Factura creada exitosamente');
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

        toast.success('Factura actualizada exitosamente');
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
    resetInvoiceForm();
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
          toast.success('Factura eliminada exitosamente');
        } else {
          toast.error('Error al eliminar la factura');
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error('Error al eliminar la factura');
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
        toast.success('Archivo subido exitosamente');
      } else {
        toast.error('Error al subir el archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo');
    }
  };

  const handleDownloadFile = (factura) => {
    if (!factura.archivo) {
      toast.error('Esta factura no tiene archivo adjunto');
      return;
    }

    try {
      invoiceService.downloadInvoiceFile(factura.id);
    } catch (error) {
      console.error('Error en handleDownloadFile:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  // Función para resetear formulario
  const resetInvoiceForm = () => {
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
  };

  // Funciones de utilidad
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

  // Calcular estadísticas
  const estados = [...new Set(facturas.map(f => f.estado))];
  const tiposPago = [...new Set(facturas.map(f => f.tipoPago))];
  const proveedoresList = [...new Set(facturas.map(f => f.proveedor))];
  const centrosCostoList = [...new Set(facturas.map(f => f.centroCosto))];

  return {
    // Estados
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    totalPages,
    totalRecords,
    facturas,
    loading,
    error,
    suppliers,
    costCenters,
    invoiceOptions,
    invoiceForm,
    formErrors,
    submitting,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    selectedFactura,
    deleteConfirmation,
    setDeleteConfirmation,
    uploadFile,
    setUploadFile,

    // Funciones
    handleFormChange,
    handleCreateSubmit,
    handleEditSubmit,
    handleCreateFactura,
    handleEditFactura,
    handleDeleteFactura,
    handleDeleteConfirm,
    handleUploadFile,
    handleFileUploadSubmit,
    handleDownloadFile,
    formatCurrency,
    formatDate,

    // Datos calculados
    estados,
    tiposPago,
    proveedoresList,
    centrosCostoList
  };
};
