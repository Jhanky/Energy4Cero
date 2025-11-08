import { useState, useEffect } from 'react';
import { Plus, Search, FileText, ExternalLink, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { usePanels } from '../../../hooks/usePanels';
import { useInverters } from '../../../hooks/useInverters';
import { useBatteries } from '../../../hooks/useBatteries';
import SuministrosTabs from './SuministrosTabs';
import SuministrosTable from './SuministrosTable';
import SuministrosFilters from './SuministrosFilters';
import SuministrosStats from './SuministrosStats';
import PanelModal from './PanelModal';
import InverterModal from './InverterModal';
import BatteryModal from './BatteryModal';
import SuministroDeleteModal from './SuministroDeleteModal';

const SuministrosManager = () => {
  const [activeTab, setActiveTab] = useState('paneles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Hooks para cada tipo de suministro
  const { 
    panels, 
    loading: panelsLoading, 
    error: panelsError, 
    refetch: refetchPanels,
    createPanel,
    updatePanel,
    deletePanel,
    togglePanelStatus
  } = usePanels({ search: searchTerm, ...filters });

  const { 
    inverters, 
    loading: invertersLoading, 
    error: invertersError, 
    refetch: refetchInverters,
    createInverter,
    updateInverter,
    deleteInverter,
    toggleInverterStatus
  } = useInverters({ search: searchTerm, ...filters });

  const { 
    batteries, 
    loading: batteriesLoading, 
    error: batteriesError, 
    refetch: refetchBatteries,
    createBattery,
    updateBattery,
    deleteBattery,
    toggleBatteryStatus
  } = useBatteries({ search: searchTerm, ...filters });

  // Estadísticas
  const [statistics, setStatistics] = useState({
    panels: { total: 0, averagePrice: 0 },
    inverters: { total: 0, averagePrice: 0 },
    batteries: { total: 0, averagePrice: 0 }
  });

  // Obtener estadísticas
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // En una implementación real, aquí se llamarían los servicios de estadísticas
        // Por ahora, calculamos estadísticas básicas de los datos existentes
        const panelsStats = {
          total: panels.length,
          averagePrice: panels.length > 0 
            ? Math.round(panels.reduce((sum, panel) => sum + parseFloat(panel.price || 0), 0) / panels.length)
            : 0
        };
        
        const invertersStats = {
          total: inverters.length,
          averagePrice: inverters.length > 0 
            ? Math.round(inverters.reduce((sum, inverter) => sum + parseFloat(inverter.price || 0), 0) / inverters.length)
            : 0
        };
        
        const batteriesStats = {
          total: batteries.length,
          averagePrice: batteries.length > 0 
            ? Math.round(batteries.reduce((sum, battery) => sum + parseFloat(battery.price || 0), 0) / batteries.length)
            : 0
        };
        
        setStatistics({
          panels: panelsStats,
          inverters: invertersStats,
          batteries: batteriesStats
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStatistics();
  }, [panels, inverters, batteries]);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'paneles':
        return panels;
      case 'inversores':
        return inverters;
      case 'baterias':
        return batteries;
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'paneles':
        return panelsLoading;
      case 'inversores':
        return invertersLoading;
      case 'baterias':
        return batteriesLoading;
      default:
        return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 'paneles':
        return panelsError;
      case 'inversores':
        return invertersError;
      case 'baterias':
        return batteriesError;
      default:
        return null;
    }
  };

  const refetchCurrentData = () => {
    switch (activeTab) {
      case 'paneles':
        refetchPanels();
        break;
      case 'inversores':
        refetchInverters();
        break;
      case 'baterias':
        refetchBatteries();
        break;
    }
  };

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

  const handleView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      console.log('🔧 Item a eliminar:', itemToDelete);
      console.log('🔧 Active tab:', activeTab);
      
      // Asegurarse de que itemToDelete es un objeto y no es null
      if (!itemToDelete || typeof itemToDelete !== 'object') {
        throw new Error('Item a eliminar no es válido');
      }
      
      let response;
      switch (activeTab) {
        case 'paneles':
          // Verificar qué propiedad de ID tiene el item
          const panelId = itemToDelete.panel_id || itemToDelete.id || itemToDelete;
          console.log('🔧 Panel ID:', panelId);
          if (!panelId) {
            throw new Error('ID de panel no encontrado');
          }
          // Verificar que el ID sea una cadena o número válido
          if (typeof panelId !== 'string' && typeof panelId !== 'number') {
            throw new Error('ID de panel no válido');
          }
          response = await deletePanel(panelId);
          break;
        case 'inversores':
          // Verificar qué propiedad de ID tiene el item
          const inverterId = itemToDelete.inverter_id || itemToDelete.id || itemToDelete;
          console.log('🔧 Inverter ID:', inverterId);
          if (!inverterId) {
            throw new Error('ID de inversor no encontrado');
          }
          // Verificar que el ID sea una cadena o número válido
          if (typeof inverterId !== 'string' && typeof inverterId !== 'number') {
            throw new Error('ID de inversor no válido');
          }
          response = await deleteInverter(inverterId);
          break;
        case 'baterias':
          // Verificar qué propiedad de ID tiene el item
          const batteryId = itemToDelete.battery_id || itemToDelete.id || itemToDelete;
          console.log('🔧 Battery ID:', batteryId);
          if (!batteryId) {
            throw new Error('ID de batería no encontrado');
          }
          // Verificar que el ID sea una cadena o número válido
          if (typeof batteryId !== 'string' && typeof batteryId !== 'number') {
            throw new Error('ID de batería no válido');
          }
          response = await deleteBattery(batteryId);
          break;
      }

      if (response?.success) {
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      // Mostrar mensaje de error al usuario
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      switch (activeTab) {
        case 'paneles':
          if (modalMode === 'create') {
            // Preparar FormData para paneles
            const panelFormData = new FormData();
            for (const key in formData) {
              if (key === 'technical_sheet' && formData[key] instanceof File) {
                panelFormData.append(key, formData[key]);
              } else if (key !== 'technical_sheet' || formData[key]) {
                panelFormData.append(key, formData[key]);
              }
            }
            await createPanel(panelFormData);
          } else {
            // Preparar FormData para paneles
            const panelFormData = new FormData();
            for (const key in formData) {
              if (key === 'technical_sheet' && formData[key] instanceof File) {
                panelFormData.append(key, formData[key]);
              } else if (key !== 'technical_sheet' || formData[key]) {
                panelFormData.append(key, formData[key]);
              }
            }
            const panelId = selectedItem.panel_id || selectedItem.id;
            await updatePanel(panelId, panelFormData);
          }
          break;
        case 'inversores':
          if (modalMode === 'create') {
            await createInverter(formData);
          } else {
            const inverterId = selectedItem.inverter_id || selectedItem.id;
            await updateInverter(inverterId, formData);
          }
          break;
        case 'baterias':
          if (modalMode === 'create') {
            await createBattery(formData);
          } else {
            const batteryId = selectedItem.battery_id || selectedItem.id;
            await updateBattery(batteryId, formData);
          }
          break;
      }
      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleRetry = () => {
    refetchCurrentData();
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Suministros</h1>
          <p className="text-slate-600 mt-1">Administra paneles, inversores y baterías para plantas fotovoltaicas</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Suministro
        </button>
      </div>

      {/* Estadísticas */}
      <SuministrosStats statistics={statistics} formatPrice={formatPrice} />

      {/* Tabs */}
      <SuministrosTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Filtros */}
      <SuministrosFilters
        activeTab={activeTab}
        searchTerm={searchTerm}
        filters={filters}
        onSearchChange={handleSearch}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={refetchCurrentData}
      />

      {/* Tabla de Datos */}
      <SuministrosTable
        activeTab={activeTab}
        data={getCurrentData()}
        loading={getCurrentLoading()}
        error={getCurrentError()}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={handleRetry}
        formatPrice={formatPrice}
        formatDate={formatDate}
      />

      {/* Modal para Paneles */}
      {activeTab === 'paneles' && showModal && (
        <PanelModal
          show={showModal}
          mode={modalMode}
          formData={selectedItem || {}}
          onFormChange={setSelectedItem}
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(selectedItem);
          }}
          onClose={() => setShowModal(false)}
          isSubmitting={false}
        />
      )}

      {/* Modal para Inversores */}
      {activeTab === 'inversores' && showModal && (
        <InverterModal
          show={showModal}
          mode={modalMode}
          formData={selectedItem || {}}
          onFormChange={setSelectedItem}
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(selectedItem);
          }}
          onClose={() => setShowModal(false)}
          isSubmitting={false}
        />
      )}

      {/* Modal para Baterías */}
      {activeTab === 'baterias' && showModal && (
        <BatteryModal
          show={showModal}
          mode={modalMode}
          formData={selectedItem || {}}
          onFormChange={setSelectedItem}
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(selectedItem);
          }}
          onClose={() => setShowModal(false)}
          isSubmitting={false}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      <SuministroDeleteModal
        show={showDeleteModal}
        activeTab={activeTab}
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default SuministrosManager;
