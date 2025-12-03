import React from 'react';
import { Plus, Shield } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

// Hooks y Componentes
import { useRoles } from '../../features/administrativa/roles/hooks/useRoles';
import RolModal from '../../features/administrativa/roles/components/RolModal';
import RolTable from '../../features/administrativa/roles/components/RolTable';
import RolDeleteModal from '../../features/administrativa/roles/components/RolDeleteModal';
import RolStats from '../../features/administrativa/roles/ui/RolStats';
import RolFilters from '../../features/administrativa/roles/ui/RolFilters';

// Componentes compartidos
import { AdvancedPagination } from '../../shared/ui';

const RolesPage = () => {
    const {
        roles,
        loading,
        pagination,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        stats,
        availablePermissions,
        modalState,
        deleteModalState,
        isSubmitting,
        formData,
        updateFormData,
        openModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
        handleSubmit,
        handleDelete,
        handleToggleStatus,
        handlePageChange,
        handlePerPageChange,
        handleNameChange,
        handlePermissionChange,
        getPermissionLabel,
        getGroupedPermissions
    } = useRoles();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Roles</h1>
                    <p className="text-muted-foreground mt-1">Administra los roles y permisos del sistema</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Rol
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <RolStats stats={stats} />

            {/* Filtros y Tabla */}
            <Card>
                <CardHeader>
                    <CardTitle>Roles</CardTitle>
                </CardHeader>
                <CardContent>
                    <RolFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        filters={filters}
                        onFilterChange={setFilters}
                        loading={loading}
                    />

                    <RolTable
                        roles={roles}
                        loading={loading}
                        pagination={pagination}
                        onEdit={(role) => openModal('edit', role)}
                        onToggleStatus={handleToggleStatus}
                        onDelete={openDeleteModal}
                        getPermissionLabel={getPermissionLabel}
                    />

                    <AdvancedPagination
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onPerPageChange={handlePerPageChange}
                        loading={loading}
                    />
                </CardContent>
            </Card>

            {/* Modales */}
            <RolModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                mode={modalState.mode}
                formData={formData}
                onFormChange={updateFormData}
                availablePermissions={availablePermissions}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                handleNameChange={handleNameChange}
                handlePermissionChange={handlePermissionChange}
                getGroupedPermissions={getGroupedPermissions}
            />

            <RolDeleteModal
                isOpen={deleteModalState.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                isSubmitting={isSubmitting}
                role={deleteModalState.item}
            />
        </div>
    );
};

export default RolesPage;
