import React from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

// Hooks y Componentes
import { useUsuarios } from '../../features/administrativa/usuarios/hooks/useUsuarios';
import UsuarioModal from '../../features/administrativa/usuarios/components/UsuarioModal';
import UsuarioTable from '../../features/administrativa/usuarios/components/UsuarioTable';
import UsuarioDeleteModal from '../../features/administrativa/usuarios/components/UsuarioDeleteModal';
import UsuarioStats from '../../features/administrativa/usuarios/ui/UsuarioStats';
import UsuarioFilters from '../../features/administrativa/usuarios/ui/UsuarioFilters';

// Componentes compartidos
import { AdvancedPagination } from '../../shared/ui';

const UsuariosPage = () => {
    const {
        users,
        loading,
        pagination,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        stats,
        options,
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
        getRoleName,
        getRoleColor
    } = useUsuarios();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-1">Administra los usuarios del sistema</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Usuario
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <UsuarioStats stats={stats} />

            {/* Filtros y Tabla */}
            <Card>
                <CardHeader>
                    <CardTitle>Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <UsuarioFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        filters={filters}
                        onFilterChange={setFilters}
                        options={options}
                        loading={loading}
                    />

                    <UsuarioTable
                        users={users}
                        loading={loading}
                        pagination={pagination}
                        onEdit={(user) => openModal('edit', user)}
                        onToggleStatus={handleToggleStatus}
                        getRoleName={getRoleName}
                        getRoleColor={getRoleColor}
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
            <UsuarioModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                mode={modalState.mode}
                formData={formData}
                onFormChange={updateFormData}
                options={options}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            <UsuarioDeleteModal
                isOpen={deleteModalState.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                isSubmitting={isSubmitting}
                user={deleteModalState.item}
            />
        </div>
    );
};

export default UsuariosPage;
