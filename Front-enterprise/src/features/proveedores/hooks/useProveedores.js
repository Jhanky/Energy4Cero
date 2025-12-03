import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import supplierService from '../../../services/supplierService';
import { getDepartments, getCitiesByDepartment } from '../../../services/locationService';

export const useProveedores = () => {
  // Estados para búsqueda y filtros avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    departamento: ''
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Estados para datos
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supplierOptions, setSupplierOptions] = useState({});
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);

  // Estados para formularios
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    supplier_type: 'empresa',
    email: '',
    phone: '',
    nit: '',
    department_id: undefined,
    city_id: undefined,
    address: '',
    notes: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estados para ubicación
  const [modalDepartments, setModalDepartments] = useState([]);
  const [modalCities, setModalCities] = useState([]);
  const [loadingModalDepartments, setLoadingModalDepartments] = useState(false);
  const [loadingModalCities, setLoadingModalCities] = useState(false);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeudaWarningModalOpen, setIsDeudaWarningModalOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [abonoData, setAbonoData] = useState({
    valor: '',
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: '',
    referencia: '',
    soporteArchivo: null,
    notas: ''
  });

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para recargar datos cuando cambian los filtros o búsqueda
  useEffect(() => {
    loadSuppliers();
  }, [debouncedSearchTerm, filters, currentPage, perPage]);

  // Cargar datos iniciales
  useEffect(() => {
    loadDepartments();
    loadSupplierOptions();
  }, []);

  // Cargar departamentos y ciudades para el modal cuando se abre
  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      const fetchDepartments = async () => {
        setLoadingModalDepartments(true);
        try {
          const response = await getDepartments();
          if (response.success) {
            const uniqueDepartments = Array.from(new Map(response.data.map(dep => [dep.department_id, dep])).values());
            setModalDepartments(uniqueDepartments);
          } else {
            console.error('Error al obtener departamentos:', response.message);
          }
        } catch (error) {
          console.error('Error en fetchDepartments:', error);
        } finally {
          setLoadingModalDepartments(false);
        }
      };
      fetchDepartments();
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  // Cargar ciudades cuando se selecciona un departamento en el modal
  useEffect(() => {
    if (supplierForm.department_id) {
      const fetchCities = async () => {
        setLoadingModalCities(true);
        try {
          const response = await getCitiesByDepartment(supplierForm.department_id);
          if (response.success) {
            const uniqueCities = Array.from(new Map(response.data.map(city => [city.city_id, city])).values());
            setModalCities(uniqueCities);
          } else {
            console.error('Error al obtener ciudades:', response.message);
          }
        } catch (error) {
          console.error('Error en fetchCities:', error);
        } finally {
          setLoadingModalCities(false);
        }
      };
      fetchCities();
    } else {
      setModalCities([]);
    }
  }, [supplierForm.department_id]);

  // Cargar proveedores con paginación del servidor
  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: perPage,
        search: debouncedSearchTerm,
        ...filters
      };

      const response = await supplierService.getSuppliers(params);
      if (response.success) {
        // Transformar datos del backend al formato del frontend
        const transformedSuppliers = response.data.suppliers.map(supplier => ({
          id: supplier.id,
          nombre: supplier.name,
          nit: supplier.nit,
          categoria: supplier.supplier_type === 'empresa' ? 'Empresa' : 'Persona Natural',
          contacto: supplier.responsibleUser?.name || 'Sin asignar',
          telefono: supplier.phone || '',
          email: supplier.email,
          direccion: supplier.address || '',
          departamento: supplier.department?.name || '',
          ciudad: supplier.city?.name || '',
          estado: supplier.is_active ? 'activo' : 'inactivo',
          fechaRegistro: supplier.created_at,
          productos: [], // Por ahora vacío, se puede agregar después
          totalComprado: 0, // Por ahora 0, se puede agregar después
          deudaPendiente: 0 // Por ahora 0, se puede agregar después
        }));

        setProveedores(transformedSuppliers);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotalRecords(response.data.pagination?.total || 0);
      } else {
        setError(response.message || 'Error al cargar proveedores');
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, debouncedSearchTerm, filters]);

  // Cargar departamentos
  const loadDepartments = async () => {
    try {
      const response = await getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Cargar opciones de proveedores
  const loadSupplierOptions = async () => {
    try {
      const response = await supplierService.getSupplierOptions();
      if (response.success) {
        setSupplierOptions(response.data.options || {});
      }
    } catch (error) {
      console.error('Error loading supplier options:', error);
    }
  };

  // Funciones para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setSupplierForm(prev => ({ ...prev, [field]: value }));
  };

  // Función para crear proveedor
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!supplierForm.name || !supplierForm.email || !supplierForm.nit) {
      setFormErrors({
        name: !supplierForm.name ? 'El nombre es obligatorio' : '',
        email: !supplierForm.email ? 'El email es obligatorio' : '',
        nit: !supplierForm.nit ? 'El NIT es obligatorio' : ''
      });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await supplierService.createSupplier(supplierForm);

      if (response.success) {
        // Recargar la lista de proveedores
        await loadSuppliers();

        // Cerrar modal y resetear formulario
        setIsCreateModalOpen(false);
        resetSupplierForm();

        toast.success('Proveedor creado exitosamente');
      } else {
        // Manejar errores del backend
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          setFormErrors({ general: response.message || 'Error al crear el proveedor' });
        }
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      setFormErrors({ general: 'Error al conectar con el servidor' });
    } finally {
      setSubmitting(false);
    }
  };

  // Función para editar proveedor
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProveedor) return;

    // Validación básica
    if (!supplierForm.name || !supplierForm.email || !supplierForm.nit) {
      setFormErrors({
        name: !supplierForm.name ? 'El nombre es obligatorio' : '',
        email: !supplierForm.email ? 'El email es obligatorio' : '',
        nit: !supplierForm.nit ? 'El NIT es obligatorio' : ''
      });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await supplierService.updateSupplier(selectedProveedor.id, supplierForm);

      if (response.success) {
        // Recargar la lista de proveedores
        await loadSuppliers();

        // Cerrar modal
        setIsEditModalOpen(false);
        setSelectedProveedor(null);

        toast.success('Proveedor actualizado exitosamente');
      } else {
        // Manejar errores del backend
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          setFormErrors({ general: response.message || 'Error al actualizar el proveedor' });
        }
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      setFormErrors({ general: 'Error al conectar con el servidor' });
    } finally {
      setSubmitting(false);
    }
  };

  // Funciones para manejar modales
  const handleCreateProveedor = () => {
    resetSupplierForm();
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleEditProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);

    // Cargar datos del proveedor en el formulario
    setSupplierForm({
      name: proveedor.nombre,
      supplier_type: proveedor.categoria === 'Empresa' ? 'empresa' : 'persona',
      email: proveedor.email,
      phone: proveedor.telefono,
      nit: proveedor.nit,
      department_id: undefined, // Se cargará dinámicamente
      city_id: undefined, // Se cargará dinámicamente
      address: proveedor.direccion,
      notes: '',
      is_active: proveedor.estado === 'activo'
    });

    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleAbonoProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
    setAbonoData({
      valor: '',
      fecha: new Date().toISOString().split('T')[0],
      metodoPago: '',
      referencia: '',
      soporteArchivo: null,
      notas: ''
    });
    setIsAbonoModalOpen(true);
  };

  const handleAbonoSubmit = () => {
    // Aquí iría la lógica para procesar el abono
    console.log('Procesando abono:', abonoData);
    // Actualizar deuda pendiente del proveedor
    setProveedores(prev => prev.map(p =>
      p.id === selectedProveedor.id
        ? { ...p, deudaPendiente: Math.max(0, p.deudaPendiente - parseFloat(abonoData.valor)) }
        : p
    ));
    setIsAbonoModalOpen(false);
    toast.success('Abono registrado exitosamente');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAbonoData(prev => ({ ...prev, soporteArchivo: file }));
    }
  };

  const handleDeleteProveedor = (proveedor) => {
    if (proveedor.deudaPendiente > 0) {
      // No permitir eliminar si tiene deuda pendiente - mostrar modal de advertencia
      setSelectedProveedor(proveedor);
      setIsDeudaWarningModalOpen(true);
      return;
    }
    setSelectedProveedor(proveedor);
    setDeleteConfirmation('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation === 'Eliminar') {
      // Aquí iría la lógica para eliminar el proveedor
      console.log('Eliminando proveedor:', selectedProveedor);
      setProveedores(prev => prev.filter(p => p.id !== selectedProveedor.id));
      setIsDeleteModalOpen(false);
      toast.success('Proveedor eliminado exitosamente');
    }
  };

  // Función para resetear formulario
  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      supplier_type: 'empresa',
      email: '',
      phone: '',
      nit: '',
      department_id: undefined,
      city_id: undefined,
      address: '',
      notes: '',
      is_active: true
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

  const getEstadoColor = (estado) => {
    return estado === 'activo'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  // Calcular estadísticas
  const categorias = [...new Set(proveedores.map(p => p.categoria))].filter(categoria => categoria && categoria.trim() !== '');
  const departamentosList = [...new Set(proveedores.map(p => p.departamento))].filter(departamento => departamento && departamento.trim() !== '');

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
    proveedores,
    loading,
    error,
    supplierOptions,
    departments,
    cities,
    supplierForm,
    formErrors,
    submitting,
    modalDepartments,
    modalCities,
    loadingModalDepartments,
    loadingModalCities,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isAbonoModalOpen,
    setIsAbonoModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeudaWarningModalOpen,
    setIsDeudaWarningModalOpen,
    selectedProveedor,
    deleteConfirmation,
    setDeleteConfirmation,
    abonoData,
    setAbonoData,

    // Funciones
    handleFormChange,
    handleCreateSubmit,
    handleEditSubmit,
    handleCreateProveedor,
    handleEditProveedor,
    handleAbonoProveedor,
    handleAbonoSubmit,
    handleFileChange,
    handleDeleteProveedor,
    handleDeleteConfirm,
    formatCurrency,
    getEstadoColor,

    // Datos calculados
    categorias,
    departamentosList
  };
};
