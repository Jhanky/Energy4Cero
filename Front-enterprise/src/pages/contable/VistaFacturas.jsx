import { Plus, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedPagination
} from '@/shared/ui';
import { useFacturas } from '@/features/facturas';
import FacturaFilters from '@/features/facturas/ui/FacturaFilters';
import FacturasTable from '@/features/facturas/components/FacturasTable';
import FacturaModal from '@/features/facturas/components/FacturaModal';
import FacturaDeleteModal from '@/features/facturas/components/FacturaDeleteModal';

const VistaFacturas = () => {
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
    facturas,
    loading,
    error,
    suppliers,
    costCenters,
    invoiceForm,
    formErrors,
    submitting,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedFactura,
    deleteConfirmation,
    setDeleteConfirmation,

    // Funciones
    handleFormChange,
    handleCreateSubmit,
    handleEditSubmit,
    handleCreateFactura,
    handleEditFactura,
    handleDeleteFactura,
    handleDeleteConfirm,
    handleDownloadFile,
    formatCurrency,
    formatDate,

    // Datos calculados
    estados,
    tiposPago,
    proveedoresList,
    centrosCostoList
  } = useFacturas();

  return (
    <>
      {/* Modal de Crear Factura */}
      <FacturaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isEdit={false}
        formData={invoiceForm}
        formErrors={formErrors}
        submitting={submitting}
        suppliers={suppliers}
        costCenters={costCenters}
        onFormChange={handleFormChange}
        onSubmit={handleCreateSubmit}
      />

      {/* Modal de Editar Factura */}
      <FacturaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEdit={true}
        formData={invoiceForm}
        formErrors={formErrors}
        submitting={submitting}
        suppliers={suppliers}
        costCenters={costCenters}
        onFormChange={handleFormChange}
        onSubmit={handleEditSubmit}
      />

      {/* Modal de Confirmación de Eliminación */}
      <FacturaDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        selectedFactura={selectedFactura}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
        onConfirmDelete={handleDeleteConfirm}
        formatCurrency={formatCurrency}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Facturas</h1>
            <p className="text-muted-foreground mt-1">Administra las facturas de proveedores</p>
          </div>
          <Button onClick={handleCreateFactura}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </div>

        {/* Estados de carga y error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Error al cargar facturas</h3>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Componentes de Búsqueda y Filtros */}
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
            <FacturaFilters
              filters={filters}
              onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              estados={estados}
              tiposPago={tiposPago}
              proveedoresList={proveedoresList}
              centrosCostoList={centrosCostoList}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando <span className="font-semibold">{facturas.length}</span> de <span className="font-semibold">{totalRecords}</span> facturas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Facturas */}
        <FacturasTable
          facturas={facturas}
          loading={loading}
          onEdit={handleEditFactura}
          onDelete={handleDeleteFactura}
          onDownload={handleDownloadFile}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        {/* Paginación */}
        {facturas.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <AdvancedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                perPage={perPage}
                onPerPageChange={setPerPage}
                totalRecords={totalRecords}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default VistaFacturas;
