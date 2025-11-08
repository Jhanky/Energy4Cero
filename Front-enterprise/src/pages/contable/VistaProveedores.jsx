import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, MapPin, CreditCard, FileText, Upload, X, DollarSign, Loader2 } from 'lucide-react';
import supplierService from '../../services/supplierService';
import { getDepartments, getCitiesByDepartment } from '../../services/locationService';

const VistaProveedores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    departamento: ''
  });

  // Estados para datos
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);

  // Estados para formularios
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    supplier_type: 'empresa',
    email: '',
    phone: '',
    nit: '',
    department_id: '',
    city_id: '',
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

  // Cargar datos iniciales
  useEffect(() => {
    loadSuppliers();
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

  // Cargar proveedores
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.getSuppliers();
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
      } else {
        setError(response.message || 'Error al cargar proveedores');
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

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

  // Filtrar proveedores
  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const cumpleBusqueda =
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const cumpleCategoria = !filters.categoria || proveedor.categoria === filters.categoria;
    const cumpleEstado = !filters.estado || proveedor.estado === filters.estado;
    const cumpleDepartamento = !filters.departamento || proveedor.departamento === filters.departamento;

    return cumpleBusqueda && cumpleCategoria && cumpleEstado && cumpleDepartamento;
  });

  const categorias = [...new Set(proveedores.map(p => p.categoria))];
  const departamentosList = [...new Set(proveedores.map(p => p.departamento))];

  const getEstadoColor = (estado) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
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
        setSupplierForm({
          name: '',
          supplier_type: 'empresa',
          email: '',
          phone: '',
          nit: '',
          department_id: '',
          city_id: '',
          address: '',
          notes: '',
          is_active: true
        });

        // Aquí podrías mostrar un toast de éxito
        console.log('Proveedor creado exitosamente:', response.data.supplier);
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

        // Aquí podrías mostrar un toast de éxito
        console.log('Proveedor actualizado exitosamente:', response.data.supplier);
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
    // Resetear formulario cuando se abre el modal
    setSupplierForm({
      name: '',
      supplier_type: 'empresa',
      email: '',
      phone: '',
      nit: '',
      department_id: '',
      city_id: '',
      address: '',
      notes: '',
      is_active: true
    });
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
      department_id: '', // Se cargará dinámicamente
      city_id: '', // Se cargará dinámicamente
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
    }
  };

  return (
    <>
      {/* Modal de Abono */}
      {isAbonoModalOpen && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Registrar Abono</h3>
                <button
                  onClick={() => setIsAbonoModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900">{selectedProveedor.nombre}</p>
                <p className="text-sm text-slate-600">Deuda actual: {formatCurrency(selectedProveedor.deudaPendiente)}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valor del Abono *</label>
                  <input
                    type="number"
                    value={abonoData.valor}
                    onChange={(e) => setAbonoData(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    max={selectedProveedor.deudaPendiente}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha del Pago *</label>
                  <input
                    type="date"
                    value={abonoData.fecha}
                    onChange={(e) => setAbonoData(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago *</label>
                  <select
                    value={abonoData.metodoPago}
                    onChange={(e) => setAbonoData(prev => ({ ...prev, metodoPago: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar método</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta de Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Referencia/Número</label>
                  <input
                    type="text"
                    value={abonoData.referencia}
                    onChange={(e) => setAbonoData(prev => ({ ...prev, referencia: e.target.value }))}
                    placeholder="Número de transferencia, cheque, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Soporte de Pago</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="soporte-abono"
                    />
                    <label htmlFor="soporte-abono" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 text-center">
                        {abonoData.soporteArchivo ? abonoData.soporteArchivo.name : 'Seleccionar imagen o PDF'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Máx. 5MB</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
                  <textarea
                    value={abonoData.notas}
                    onChange={(e) => setAbonoData(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Notas adicionales..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsAbonoModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAbonoSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Registrar Abono
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear Proveedor */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Registrar Nuevo Proveedor</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Proveedor *</label>
                  <select
                    value={supplierForm.supplier_type}
                    onChange={(e) => handleFormChange('supplier_type', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="empresa">Empresa</option>
                    <option value="persona">Persona Natural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <select
                    value={supplierForm.is_active ? 'activo' : 'inactivo'}
                    onChange={(e) => handleFormChange('is_active', e.target.value === 'activo')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre/Razón Social *</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Nombre del proveedor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">NIT *</label>
                  <input
                    type="text"
                    value={supplierForm.nit}
                    onChange={(e) => handleFormChange('nit', e.target.value)}
                    placeholder="900123456-7"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
                  <input
                    type="text"
                    value={supplierForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Notas adicionales"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="contacto@proveedor.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Dirección *</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder="Dirección completa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Departamento *</label>
                  <select
                    value={supplierForm.department_id}
                    onChange={(e) => handleFormChange('department_id', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={loadingModalDepartments}
                  >
                    <option value="">{loadingModalDepartments ? 'Cargando...' : 'Seleccionar departamento'}</option>
                    {modalDepartments.map(dep => (
                      <option key={dep.department_id} value={dep.department_id}>{dep.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ciudad *</label>
                  <select
                    value={supplierForm.city_id}
                    onChange={(e) => handleFormChange('city_id', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!supplierForm.department_id || loadingModalCities}
                  >
                    <option value="">{loadingModalCities ? 'Cargando...' : 'Seleccionar ciudad'}</option>
                    {modalCities.map(city => (
                      <option key={city.city_id} value={city.city_id}>{city.name}</option>
                    ))}
                  </select>
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
                  type="button"
                  onClick={handleCreateSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar Proveedor'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Proveedor */}
      {isEditModalOpen && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Editar Proveedor</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Proveedor *</label>
                  <select
                    value={supplierForm.supplier_type}
                    onChange={(e) => handleFormChange('supplier_type', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="empresa">Empresa</option>
                    <option value="persona">Persona Natural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <select
                    value={supplierForm.is_active ? 'activo' : 'inactivo'}
                    onChange={(e) => handleFormChange('is_active', e.target.value === 'activo')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre/Razón Social *</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">NIT *</label>
                  <input
                    type="text"
                    value={supplierForm.nit}
                    onChange={(e) => handleFormChange('nit', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
                  <input
                    type="text"
                    value={supplierForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Dirección *</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Departamento *</label>
                  <select
                    value={supplierForm.department_id}
                    onChange={(e) => handleFormChange('department_id', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={loadingModalDepartments}
                  >
                    <option value="">{loadingModalDepartments ? 'Cargando...' : 'Seleccionar departamento'}</option>
                    {modalDepartments.map(dep => (
                      <option key={dep.department_id} value={dep.department_id}>{dep.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ciudad *</label>
                  <select
                    value={supplierForm.city_id}
                    onChange={(e) => handleFormChange('city_id', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!supplierForm.department_id || loadingModalCities}
                  >
                    <option value="">{loadingModalCities ? 'Cargando...' : 'Seleccionar ciudad'}</option>
                    {modalCities.map(city => (
                      <option key={city.city_id} value={city.city_id}>{city.name}</option>
                    ))}
                  </select>
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
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Proveedor'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && selectedProveedor && (
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
                    <p className="text-sm font-medium text-slate-900">¿Eliminar proveedor?</p>
                    <p className="text-sm text-slate-600">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg mb-4">
                  <p className="text-sm font-medium text-slate-900">{selectedProveedor.nombre}</p>
                  <p className="text-sm text-slate-600">NIT: {selectedProveedor.nit}</p>
                  {selectedProveedor.deudaPendiente > 0 && (
                    <p className="text-sm text-red-600 font-medium mt-1">
                      ⚠️ Tiene deuda pendiente: {formatCurrency(selectedProveedor.deudaPendiente)}
                    </p>
                  )}
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
                  Eliminar Proveedor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Advertencia de Deuda */}
      {isDeudaWarningModalOpen && selectedProveedor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-600">No se puede eliminar</h3>
                <button
                  onClick={() => setIsDeudaWarningModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Proveedor con deuda pendiente</p>
                    <p className="text-sm text-slate-600">Debe liquidar la deuda antes de eliminar</p>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                  <p className="text-sm font-medium text-slate-900">{selectedProveedor.nombre}</p>
                  <p className="text-sm text-slate-600">NIT: {selectedProveedor.nit}</p>
                  <p className="text-sm text-orange-700 font-medium mt-2">
                    💰 Deuda pendiente: {formatCurrency(selectedProveedor.deudaPendiente)}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Solución:</strong> Realice abonos para liquidar la deuda completamente antes de intentar eliminar el proveedor.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeudaWarningModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Entendido
                </button>
                {selectedProveedor.deudaPendiente > 0 && (
                  <button
                    onClick={() => {
                      setIsDeudaWarningModalOpen(false);
                      handleAbonoProveedor(selectedProveedor);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Hacer Abono
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Proveedores</h1>
          <p className="text-slate-600 mt-1">Administra los proveedores y sus productos</p>
        </div>
        <button
          onClick={handleCreateProveedor}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nombre, NIT, contacto o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Filtro Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <select
              value={filters.categoria}
              onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{proveedoresFiltrados.length}</span> de <span className="font-semibold">{proveedores.length}</span> proveedores
          </p>
        </div>
      </div>

      {/* Estados de carga y error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar proveedores</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadSuppliers}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Proveedores */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-slate-600">Cargando proveedores...</span>
          </div>
        ) : proveedores.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No hay proveedores</h3>
            <p className="mt-1 text-sm text-slate-500">Comienza registrando tu primer proveedor.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateProveedor}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Proveedor
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {proveedoresFiltrados.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{proveedor.nombre}</div>
                        <div className="text-sm text-slate-500">NIT: {proveedor.nit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {proveedor.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{proveedor.contacto}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {proveedor.telefono}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {proveedor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {proveedor.departamento}
                      </div>
                      <div className="text-sm text-slate-500">{proveedor.ciudad}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(proveedor.estado)}`}>
                        {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProveedor(proveedor)}
                          className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Editar proveedor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProveedor(proveedor)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar proveedor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default VistaProveedores;
