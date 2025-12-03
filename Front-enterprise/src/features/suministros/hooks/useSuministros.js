import { useState, useEffect, useCallback } from 'react';
import dataService from '../../../services/dataService';
import { toast } from 'sonner';

export const useSuministros = () => {
    // --- Estados Principales ---
    const [activeTab, setActiveTab] = useState('paneles');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        paneles: [],
        inversores: [],
        baterias: []
    });

    // --- Estados de Paginación ---
    const [pagination, setPagination] = useState({
        paneles: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: 0, to: 0 },
        inversores: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: 0, to: 0 },
        baterias: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: 0, to: 0 }
    });

    // --- Estados de Filtros y Búsqueda ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filters, setFilters] = useState({ is_active: '' });

    // --- Estados de Modales ---
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create', // 'create', 'edit', 'view'
        item: null,
    });
    const [deleteModalState, setDeleteModalState] = useState({
        isOpen: false,
        item: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Debounce de Búsqueda ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- Carga de Datos ---
    const loadData = useCallback(async (tab = activeTab, page = 1, perPage = pagination[activeTab].per_page) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                search: debouncedSearchTerm,
                page,
                per_page: perPage,
                ...filters
            };

            let response;
            switch (tab) {
                case 'paneles': response = await dataService.getPanels(params); break;
                case 'inversores': response = await dataService.getInverters(params); break;
                case 'baterias': response = await dataService.getBatteries(params); break;
                default: return;
            }

            if (response.success) {
                setData(prev => {
                    // Normalizar la respuesta para asegurar que siempre sea un array
                    let items = [];
                    if (tab === 'paneles') items = response.data.panels || response.data;
                    else if (tab === 'inversores') items = response.data.inverters || response.data;
                    else if (tab === 'baterias') items = response.data.batteries || response.data;

                    return { ...prev, [tab]: Array.isArray(items) ? items : [] };
                });

                setPagination(prev => ({
                    ...prev,
                    [tab]: response.data.pagination || prev[tab]
                }));
            } else {
                setError(response.message || 'Error al cargar datos');
                toast.error(response.message || 'Error al cargar datos');
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [activeTab, debouncedSearchTerm, filters, pagination]); // Dependencias controladas

    // Recargar al cambiar dependencias clave
    useEffect(() => {
        loadData(activeTab, 1); // Reset a página 1 al cambiar filtros/tab
    }, [activeTab, debouncedSearchTerm, filters]);

    // --- Manejadores de Modal ---
    const openModal = (mode, item = null) => {
        setModalState({ isOpen: true, mode, item });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: 'create', item: null });
    };

    const openDeleteModal = (item) => {
        setDeleteModalState({ isOpen: true, item });
    };

    const closeDeleteModal = () => {
        setDeleteModalState({ isOpen: false, item: null });
    };

    // --- CRUD Operations ---
    const handleSubmit = async (formData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            let response;
            const id = modalState.item?.id || modalState.item?.panel_id || modalState.item?.inverter_id || modalState.item?.battery_id;

            if (modalState.mode === 'create') {
                switch (activeTab) {
                    case 'paneles': response = await dataService.createPanel(formData); break;
                    case 'inversores': response = await dataService.createInverter(formData); break;
                    case 'baterias': response = await dataService.createBattery(formData); break;
                }
            } else {
                switch (activeTab) {
                    case 'paneles': response = await dataService.updatePanel(id, formData); break;
                    case 'inversores': response = await dataService.updateInverter(id, formData); break;
                    case 'baterias': response = await dataService.updateBattery(id, formData); break;
                }
            }

            if (response.success) {
                toast.success(`${modalState.mode === 'create' ? 'Creado' : 'Actualizado'} exitosamente`);
                loadData(activeTab, pagination[activeTab].current_page);
                closeModal();
            } else {
                // Manejo de errores de validación
                if (response.errors) {
                    const msgs = Object.values(response.errors).flat().join(', ');
                    toast.error(`Error: ${msgs}`);
                } else {
                    toast.error(response.message || 'Error al procesar');
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Error inesperado al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModalState.item) return;
        setIsSubmitting(true);
        try {
            const id = deleteModalState.item.id || deleteModalState.item.panel_id || deleteModalState.item.inverter_id || deleteModalState.item.battery_id;
            let response;
            switch (activeTab) {
                case 'paneles': response = await dataService.deletePanel(id); break;
                case 'inversores': response = await dataService.deleteInverter(id); break;
                case 'baterias': response = await dataService.deleteBattery(id); break;
            }

            if (response.success) {
                toast.success('Eliminado exitosamente');
                loadData(activeTab, pagination[activeTab].current_page);
                closeDeleteModal();
            } else {
                toast.error(response.message || 'Error al eliminar');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error de conexión al eliminar');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Helpers ---
    const handlePageChange = (page) => loadData(activeTab, page);
    const handlePerPageChange = (perPage) => {
        setPagination(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], per_page: perPage }
        }));
        // El useEffect disparará la recarga porque pagination cambió, pero mejor controlarlo explícitamente si es necesario
        // En este caso, loadData usa el estado actual, así que al cambiar el estado y llamar loadData podría haber condiciones de carrera
        // Mejor dejar que el efecto o una llamada explicita con el nuevo valor lo maneje.
        // Simplificación: llamamos loadData con el nuevo perPage
        loadData(activeTab, 1, perPage);
    };

    return {
        activeTab, setActiveTab,
        loading, error,
        data: data[activeTab],
        pagination: pagination[activeTab],
        searchTerm, setSearchTerm,
        filters, setFilters,
        modalState, openModal, closeModal,
        deleteModalState, openDeleteModal, closeDeleteModal,
        handleSubmit, handleDelete,
        isSubmitting,
        handlePageChange, handlePerPageChange
    };
};
