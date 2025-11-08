import { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import dataService from '../../services/dataService';

// Componentes comunes
import { Notification, LoadingSpinner } from '../../shared/ui';

// Componentes específicos de suministros
import { 
  SuministrosTabs,
  SuministrosFilters,
  SuministrosTable,
  SuministroDeleteModal,
  PanelModal,
  InverterModal,
  BatteryModal
} from '../../features/suministros/ui';

const SuministrosView = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('paneles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    is_active: '',
  });

  // Estados del modal principal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    brand: '',
    technical_sheet: null, // Para el archivo PDF
    // is_active no se incluye aquí ya que se establece por defecto en el backend
  });

  // Estados del modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Estados de notificación y envío
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

      // Estados de datos
  const [data, setData] = useState({
    paneles: [],
    inversores: [],
    baterias: []
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (activeTab) {
        case 'paneles':
          response = await dataService.getPanels({
            search: searchTerm,
          });
          break;
        case 'inversores':
          response = await dataService.getInverters({
            search: searchTerm,
          });
          break;
        case 'baterias':
          response = await dataService.getBatteries({
            search: searchTerm,
          });
          break;
        default:
          return;
      }

      if (response.success) {
        // Usar función de actualización de estado para garantizar actualización atómica
        setData(prevData => {
          const newData = { ...prevData };
          // Extraer los elementos de la respuesta paginada
          // El backend devuelve la estructura data.panels, data.inverters o data.batteries
          // pero las pestañas se llaman paneles, inversores y baterias
          let tabData = [];
          
          // Mapear el nombre de la pestaña al nombre del campo en la respuesta
          const responseFieldMap = {
            'paneles': 'panels',
            'inversores': 'inverters', 
            'baterias': 'batteries'
          };
          
          const responseField = responseFieldMap[activeTab];
          
          if (response.data && response.data[responseField]) {
            tabData = Array.isArray(response.data[responseField]) ? response.data[responseField] : [];
          } else {
            // Si no está en la estructura paginada, usar directamente response.data (si es array)
            tabData = Array.isArray(response.data) ? response.data : [];
          }
          
          newData[activeTab] = tabData;
          return newData;
        });
      } else {
        setError(response.message || 'Error al cargar datos');
      }
    } catch (error) {
      console.error('Error en loadData:', error);
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  // Manejo de notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Manejo de modal principal
  const openModal = (mode, item = null) => {
    setModalMode(mode);
    
    if (mode === 'create') {
      setSelectedItem(null); // No item for creation
      // Determinar el estado inicial según el tipo de suministro
      if (activeTab === 'paneles') {
        setFormData({
          model: '',
          brand: '',
          power_output: '',
          price: '',
          technical_sheet: null, // Para el archivo PDF
          // is_active no se incluye aquí ya que se establece por defecto en el backend
        });
      } else if (activeTab === 'inversores') {
        setFormData({
          name: '',
          model: '',
          power_output_kw: '',
          grid_type: '',
          system_type: '',
          price: '',
          technical_sheet: null,
          // is_active no se incluye aquí ya que se establece por defecto en el backend
        });
      } else if (activeTab === 'baterias') {
        setFormData({
          name: '',
          model: '',
          type: '',
          ah_capacity: '',
          voltage: '',
          price: '',
          technical_sheet: null,
          // is_active no se incluye aquí ya que se establece por defecto en el backend
        });
      }
    } else if (item) {
      // Determinar el ID correcto según el tipo de suministro
      const itemId = item.id || item.panel_id || item.inverter_id || item.battery_id;
      setSelectedItem({ ...item, id: itemId });
      
      // Determinar el estado inicial según el tipo de suministro
      if (activeTab === 'paneles') {
        setFormData({
          model: item.model || '',
          brand: item.brand || '',
          power_output: item.power_output || '',
          price: item.price || '',
          technical_sheet_path: item.technical_sheet_path || '', // Path to existing PDF
          // is_active no se incluye aquí ya que se establece por defecto en el backend
          technical_sheet: null, // File input is always null initially for edit
        });
      } else if (activeTab === 'inversores') {
        setFormData({
          name: item.name || '',
          model: item.model || '',
          power_output_kw: item.power_output_kw || '',
          grid_type: item.grid_type || '',
          system_type: item.system_type || '',
          price: item.price || '',
          technical_sheet_path: item.technical_sheet_path || '', // Path to existing PDF
          // is_active no se incluye aquí ya que se establece por defecto en el backend
          technical_sheet: null, // File input is always null initially for edit
        });
      } else if (activeTab === 'baterias') {
        setFormData({
          name: item.name || '',
          model: item.model || '',
          type: item.type || '',
          ah_capacity: item.ah_capacity || '',
          voltage: item.voltage || '',
          price: item.price || '',
          technical_sheet_path: item.technical_sheet_path || '', // Path to existing PDF
          // is_active no se incluye aquí ya que se establece por defecto en el backend
          technical_sheet: null, // File input is always null initially for edit
        });
      }
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setIsSubmitting(false);
  };

  // Manejo de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Log para debug: mostrar qué datos se están enviando
      console.log('🔄 Modo de formulario:', modalMode);
      console.log('🔄 Pestaña activa:', activeTab);
      // Filtrar formData para excluir name si está presente
      const filteredFormData = { ...formData };
      if ('name' in filteredFormData) {
        delete filteredFormData.name;
        console.log('⚠️ Campo "name" filtrado de formData para evitar conflictos');
      }
      console.log('🔄 Datos del formulario:', filteredFormData);
      console.log('🔄 Selected item ID:', selectedItem?.id);
      
      let response;
      const dataToSend = new FormData();

      // Añadir datos al FormData con logs
      for (const key in formData) {
        // Excluir campos que no deben enviarse explícitamente
        if (key !== 'technical_sheet_path' && key !== 'is_active' && key !== 'name') { // Don't send path if new file is uploaded, don't send is_active as it's set by default in backend, and don't send name as it was removed
          if (key === 'technical_sheet' && formData[key] instanceof File) {
            // Solo enviar el archivo si realmente existe
            dataToSend.append(key, formData[key]);
            console.log(`📁 Añadido al FormData: ${key} = ${formData[key].name} (${formData[key].size} bytes)`);
          } else if (key === 'technical_sheet') {
            // No enviar technical_sheet si no es un archivo válido
            console.log(`⚠️  No se añade technical_sheet al FormData: no es un archivo válido`);
          } else if (key !== 'technical_sheet') {
            if (formData[key] !== null && formData[key] !== undefined) {
              // Convertir los campos numéricos a tipo adecuado
              let value = formData[key];
              if (key === 'power_output' || key === 'price') {
                // Intentar convertir a número
                const numericValue = parseFloat(formData[key]);
                if (!isNaN(numericValue)) {
                  value = numericValue.toString(); // FormData requiere strings
                } else {
                  value = formData[key].toString(); // Si no es número válido, usar como string
                }
              } else {
                value = formData[key];
              }
              dataToSend.append(key, value);
              console.log(`📄 Añadido al FormData: ${key} = ${value}`);
            }
          }
        }
      }
      // Si no se incluyó technical_sheet pero es necesario para satisfacer la validación del backend, agregarlo como vacío
      // Pero solo si realmente se requiere, actualmente se omite intencionalmente
      if (dataToSend.has('technical_sheet')) {
        console.log('📄 El FormData ya contiene technical_sheet, no se modifica');
      } else {
        console.log('📄 No se añade technical_sheet vacío (se omite intencionalmente)');
      }
      // Si no se incluyó technical_sheet, agregarlo como vacío para satisfacer la validación del backend
      // Pero solo si realmente se requiere, actualmente se omite intencionalmente
      if (!dataToSend.has('technical_sheet')) {
        // dataToSend.append('technical_sheet', '');
        console.log('📄 No se añade technical_sheet vacío (se omite intencionalmente)');
      }
      
      // Log para ver qué método se va a usar
      console.log('🔧 Llamando API para:', modalMode === 'create' ? 'crear' : 'editar', activeTab);
      
      if (modalMode === 'create') {
        switch (activeTab) {
          case 'paneles':
            console.log('🔧 Llamando a createPanel con FormData:', Array.from(dataToSend.entries()));
            response = await dataService.createPanel(dataToSend);
            break;
          case 'inversores':
            response = await dataService.createInverter(dataToSend);
            break;
          case 'baterias':
            response = await dataService.createBattery(dataToSend);
            break;
        }
      } else if (modalMode === 'edit') {
        switch (activeTab) {
          case 'paneles':
            console.log('🔧 Llamando a updatePanel con ID:', selectedItem.id, 'y FormData:', Array.from(dataToSend.entries()));
            response = await dataService.updatePanel(selectedItem.id, dataToSend);
            break;
          case 'inversores':
            response = await dataService.updateInverter(selectedItem.id, dataToSend);
            break;
          case 'baterias':
            response = await dataService.updateBattery(selectedItem.id, dataToSend);
            break;
        }
      }
      
      console.log('📡 Respuesta de la API:', response);
      
      if (response.success) {
        const action = modalMode === 'create' ? 'creado' : 'actualizado';
        showNotification('success', `${getTabTitle()} ${action} exitosamente`);
        loadData();
        closeModal();
      } else {
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat().join(', ');
          console.error('❌ Errores de validación:', response.errors);
          showNotification('error', `Errores de validación: ${errorMessages}`);
        } else {
          console.error('❌ Error general:', response.message);
          showNotification('error', response.message || 'Error al procesar solicitud');
        }
      }
    } catch (error) {
      console.error('🚨 Error en handleSubmit:', error);
      console.error('🚨 Mensaje de error:', error.message);
      console.error('🚨 Stack:', error.stack);
      showNotification('error', `Error de conexión o de procesamiento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de modal de eliminación
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        let response;
        switch (activeTab) {
          case 'paneles':
            response = await dataService.deletePanel(itemToDelete.id);
            break;
          case 'inversores':
            response = await dataService.deleteInverter(itemToDelete.id);
            break;
          case 'baterias':
            response = await dataService.deleteBattery(itemToDelete.id);
            break;
        }
        
        if (response.success) {
          showNotification('success', `${getTabTitle()} eliminado exitosamente`);
          loadData();
        } else {
          showNotification('error', response.message || 'Error al eliminar');
        }
      } catch (error) {
        
        showNotification('error', 'Error de conexión');
      }
      
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Manejo de filtros
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    loadData();
  };

  const clearFilters = () => {
    setFilters({
      is_active: '',
    });
    setSearchTerm('');
    loadData();
  };

  // Funciones helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
  };

  const getTabTitle = () => {
    const titles = {
      paneles: 'Panel Solar',
      inversores: 'Inversor',
      baterias: 'Batería'
    };
    return titles[activeTab] || 'Producto';
  };

  const getCurrentData = () => {
    // Validar que activeTab sea un valor válido
    const validTabs = ['paneles', 'inversores', 'baterias'];
    const currentData = validTabs.includes(activeTab) ? (data[activeTab] || []) : [];
    
    // Asegurar que siempre devuelva un array
    return Array.isArray(currentData) ? currentData : [];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notificaciones */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Suministros</h1>
              <p className="text-sm text-slate-600">Administra paneles, inversores y baterías para plantas fotovoltaicas</p>
            </div>
          </div>
          <button
            onClick={() => openModal('create')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo {getTabTitle()}
          </button>
        </div>
      </div>


      {/* Tabs */}
      <SuministrosTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Filtros */}
      <SuministrosFilters
        activeTab={activeTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />

      {/* Tabla de datos */}
      <SuministrosTable
        activeTab={activeTab}
        data={getCurrentData()}
        loading={loading}
        error={error}
        onView={(item) => openModal('view', item)}
        onEdit={(item) => openModal('edit', item)}
        onDelete={openDeleteModal}
        onRetry={loadData}
        formatPrice={formatPrice}
        formatDate={formatDate}
      />

      {/* Modal específico según el tipo de suministro */}
      {activeTab === 'paneles' && (
        <PanelModal
          show={showModal}
          mode={modalMode}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isSubmitting={isSubmitting}
        />
      )}

      {activeTab === 'inversores' && (
        <InverterModal
          show={showModal}
          mode={modalMode}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isSubmitting={isSubmitting}
        />
      )}

      {activeTab === 'baterias' && (
        <BatteryModal
          show={showModal}
          mode={modalMode}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <SuministroDeleteModal
        show={showDeleteModal}
        activeTab={activeTab}
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default SuministrosView;
