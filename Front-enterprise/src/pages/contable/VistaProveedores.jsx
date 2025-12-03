import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import {
  AdvancedSearchBar,
  AdvancedPagination
} from '@/shared/ui';
import { useProveedores } from '@/features/proveedores';
import {
  ProveedoresTable,
  ProveedorModal,
  ProveedorDeleteModal,
  ProveedorAbonoModal
} from '@/features/proveedores';
import ProveedorFilters from '@/features/proveedores/ui/ProveedorFilters';

const VistaProveedores = () => {
  const {
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

    // Datos calculados
    categorias,
    departamentosList
  } = useProveedores();

  return (
    <>
      {/* Modales */}
      <ProveedorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isEdit={false}
        formData={supplierForm}
        formErrors={formErrors}
        submitting={submitting}
        modalDepartments={modalDepartments}
        modalCities={modalCities}
        loadingModalDepartments={loadingModalDepartments}
        loadingModalCities={loadingModalCities}
        onFormChange={handleFormChange}
        onSubmit={handleCreateSubmit}
      />

      <ProveedorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEdit={true}
        formData={supplierForm}
        formErrors={formErrors}
        submitting={submitting}
        modalDepartments={modalDepartments}
        modalCities={modalCities}
        loadingModalDepartments={loadingModalDepartments}
        loadingModalCities={loadingModalCities}
        onFormChange={handleFormChange}
        onSubmit={handleEditSubmit}
      />

      <ProveedorDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        selectedProveedor={selectedProveedor}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
        onConfirmDelete={handleDeleteConfirm}
        formatCurrency={formatCurrency}
      />

      <ProveedorAbonoModal
        isOpen={isAbonoModalOpen}
        onClose={() => setIsAbonoModalOpen(false)}
        selectedProveedor={selectedProveedor}
        abonoData={abonoData}
        setAbonoData={setAbonoData}
        onSubmit={handleAbonoSubmit}
        formatCurrency={formatCurrency}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Proveedores</h1>
            <p className="text-muted-foreground mt-1">Administra los proveedores y sus productos</p>
          </div>
          <button
            onClick={handleCreateProveedor}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
        </div>

        {/* Componentes de Búsqueda y Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar y Filtrar Proveedores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdvancedSearchBar
              placeholder="Buscar por nombre, NIT, contacto o categoría..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <ProveedorFilters
              filters={filters}
              onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              categorias={categorias}
              departamentosList={departamentosList}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando <span className="font-semibold">{proveedores.length}</span> de <span className="font-semibold">{totalRecords}</span> proveedores
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Estados de carga y error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-destructive" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">Error al cargar proveedores</h3>
                <div className="mt-2 text-sm text-destructive/80">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Proveedores */}
        <ProveedoresTable
          proveedores={proveedores}
          loading={loading}
          onEdit={handleEditProveedor}
          onDelete={handleDeleteProveedor}
          formatCurrency={formatCurrency}
        />

        {/* Paginación */}
        {proveedores.length > 0 && (
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
        )}
      </div>
    </>
  );
};

export default VistaProveedores;
