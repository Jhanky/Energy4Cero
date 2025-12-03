import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { AdvancedPagination } from '../../shared/ui';
import {
  useProyectos,
  ProyectoStats,
  ProyectosTable,
  ProyectoModal,
  ProyectoFilters,
  ProyectoSearchBar
} from '../../features/proyectos';
import ProyectoDeleteModal from './ProyectoDeleteModal';

const VistaProyectos = () => {
  const {
    // Datos
    proyectos,
    loading,
    stats,
    clientes,
    users,

    // Filtros y búsqueda
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,

    // Paginación
    pagination,
    handlePageChange,
    handlePerPageChange,

    // Modales
    modalState,
    openModal,
    closeModal,
    deleteModalState,
    openDeleteModal,
    closeDeleteModal,

    // Formulario
    formData,
    setFormData,
    handleSubmit,
    isSubmitting,

    // CRUD
    handleDelete,
    isDeleting,

    // Navegación
    handleView
  } = useProyectos();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Proyectos</h1>
          <p className="text-muted-foreground mt-1">Administra los proyectos de la empresa</p>
        </div>
        <Button onClick={() => openModal('create')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Estadísticas */}
      <ProyectoStats stats={stats} loading={loading} />

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <ProyectoSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar proyectos..."
              loading={loading && searchTerm.length > 0}
              className="flex-1 min-w-[200px]"
            />
            <ProyectoFilters
              filters={filters}
              onFilterChange={setFilters}
              clientes={clientes}
            />
          </div>

          {/* Tabla */}
          <ProyectosTable
            proyectos={proyectos}
            loading={loading}
            pagination={pagination}
            onView={handleView}
            onEdit={(proyecto) => openModal('edit', proyecto)}
            onDelete={openDeleteModal}
          />

          {/* Paginación */}
          <AdvancedPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modal de Creación/Edición */}
      <ProyectoModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        formData={formData}
        onFormChange={setFormData}
        clientes={clientes}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ProyectoDeleteModal
        show={deleteModalState.isOpen}
        proyecto={deleteModalState.item}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default VistaProyectos;
