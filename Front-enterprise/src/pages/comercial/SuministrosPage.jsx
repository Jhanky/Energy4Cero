import React, { useMemo } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

// Hooks y Componentes
import { useSuministros } from '../../features/suministros/hooks/useSuministros';
import ProductModal from '../../features/suministros/components/ProductModal';
import SuministrosTable from '../../features/suministros/components/SuministrosTable';
import SuministrosTabs from '../../features/suministros/ui/SuministrosTabs';

import {
    Notification,
    AdvancedSearchBar,
    AdvancedFilters,
    AdvancedPagination
} from '../../shared/ui';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/ui/alert-dialog';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, isSubmitting, item }) => (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente: <strong>{item?.model || item?.name}</strong>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

const SuministrosPage = () => {
    const {
        activeTab, setActiveTab,
        loading, error,
        data, pagination,
        searchTerm, setSearchTerm,
        filters, setFilters,
        modalState, openModal, closeModal,
        deleteModalState, openDeleteModal, closeDeleteModal,
        handleSubmit, handleDelete,
        isSubmitting,
        handlePageChange, handlePerPageChange
    } = useSuministros();

    const getTabTitle = () => {
        if (activeTab === 'paneles') return 'Panel Solar';
        if (activeTab === 'inversores') return 'Inversor';
        return 'Batería';
    };

    // Generar opciones de filtros dinámicamente
    const filterOptions = useMemo(() => {
        const baseFilters = [
            {
                key: 'is_active',
                label: 'Estado',
                options: [
                    { value: '1', label: 'Activos' },
                    { value: '0', label: 'Inactivos' }
                ]
            }
        ];

        // Filtro de marca - obtener marcas únicas de los datos
        const brands = [...new Set(data.map(item => item.brand).filter(Boolean))];
        if (brands.length > 0) {
            baseFilters.push({
                key: 'brand',
                label: 'Marca',
                options: [
                    ...brands.map(brand => ({ value: brand, label: brand }))
                ]
            });
        }

        // Filtros específicos por pestaña
        if (activeTab === 'paneles') {
            baseFilters.push({
                key: 'power_range',
                label: 'Potencia',
                options: [
                    { value: '0-200', label: '0-200 W' },
                    { value: '200-400', label: '200-400 W' },
                    { value: '400-600', label: '400-600 W' },
                    { value: '600+', label: '600+ W' }
                ]
            });
        } else if (activeTab === 'inversores') {
            baseFilters.push({
                key: 'power_range',
                label: 'Potencia',
                options: [
                    { value: '0-5', label: '0-5 kW' },
                    { value: '5-10', label: '5-10 kW' },
                    { value: '10-20', label: '10-20 kW' },
                    { value: '20+', label: '20+ kW' }
                ]
            });
        } else if (activeTab === 'baterias') {
            baseFilters.push({
                key: 'capacity_range',
                label: 'Capacidad',
                options: [
                    { value: '0-50', label: '0-50 Ah' },
                    { value: '50-100', label: '50-100 Ah' },
                    { value: '100-200', label: '100-200 Ah' },
                    { value: '200+', label: '200+ Ah' }
                ]
            });
        }

        return baseFilters;
    }, [activeTab, data]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestión de Suministros</h1>
                        <p className="text-muted-foreground mt-1">Administra el inventario de productos fotovoltaicos</p>
                    </div>
                </div>
                <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nuevo {getTabTitle()}
                </Button>
            </div>

            {/* Tabs */}
            <SuministrosTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Contenido Principal */}
            <Card>
                <CardHeader>
                    <CardTitle>{getTabTitle()}s</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filtros */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <AdvancedSearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder={`Buscar ${getTabTitle().toLowerCase()}s...`}
                            loading={loading && searchTerm.length > 0}
                            className="flex-1 min-w-[200px]"
                        />
                        <AdvancedFilters
                            filters={filters}
                            onFilterChange={setFilters}
                            filterOptions={filterOptions}
                        />
                    </div>

                    {/* Tabla */}
                    <SuministrosTable
                        data={data}
                        loading={loading}
                        activeTab={activeTab}
                        onEdit={(item) => openModal('edit', item)}
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

            {/* Modales */}
            <ProductModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                mode={modalState.mode}
                item={modalState.item}
                activeTab={activeTab}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            <DeleteConfirmation
                isOpen={deleteModalState.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                isSubmitting={isSubmitting}
                item={deleteModalState.item}
            />
        </div>
    );
};

export default SuministrosPage;
