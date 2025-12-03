import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dataService from '../../../services/dataService';
import { toast } from 'sonner';

export const useProyectos = () => {
    const navigate = useNavigate();

    // --- Estados Principales ---
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        in_progress: 0,
        total_value: 0
    });

    // --- Estados de Filtros y Búsqueda ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        client_id: 'all'
    });

    // --- Estados de Paginación ---
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0
    });

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

    // --- Estados de Formulario ---
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client_id: '',
        project_state_id: 1,
        contract_value: '',
        start_date: '',
        end_date: '',
        location: '',
        notes: ''
    });

    // --- Estados Auxiliares ---
    const [clientes, setClientes] = useState([]);
    const [users, setUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Debounce de Búsqueda ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- Función para obtener el estado del proyecto ---
    const getEstadoProyecto = (estadoId) => {
        // Convertir a número si es necesario
        const id = typeof estadoId === 'string' ? parseInt(estadoId, 10) : estadoId;

        const estadoMap = {
            1: 'preparacion-solicitud',
            2: 'solicitud-presentada',
            3: 'revision-completitud',
            4: 'revision-tecnica',
            5: 'concepto-viabilidad',
            6: 'instalacion-proceso',
            7: 'inspeccion-pendiente',
            8: 'inspeccion-realizada',
            9: 'observaciones-inspeccion',
            10: 'aprobacion-final',
            11: 'conectado-operando',
            12: 'suspendido',
            13: 'cancelado'
        };

        // Debug logging
        if (id === 1) {
            console.log('🔍 Debug estado ID 1:', {
                original: estadoId,
                tipo: typeof estadoId,
                convertido: id,
                mapeo: estadoMap[id],
                resultado: estadoMap[id] || 'estado-desconocido'
            });
        }

        return estadoMap[id] || 'estado-desconocido';
    };

    // --- Carga de Datos Principales ---
    const loadProyectos = useCallback(async (page = 1, perPage = pagination.per_page) => {
        try {
            setLoading(true);
            // Convertir 'all' a '' para la API (sin filtro)
            const apiFilters = {
                status: filters.status === 'all' ? '' : filters.status,
                client_id: filters.client_id === 'all' ? '' : filters.client_id
            };

            const params = {
                search: debouncedSearchTerm,
                page,
                per_page: perPage,
                ...apiFilters
            };

            const response = await dataService.getProjects(params);

            if (response.success) {
                let proyectosData = [];

                if (response.data && response.data.projects && Array.isArray(response.data.projects)) {
                    proyectosData = response.data.projects;
                } else if (response.data && Array.isArray(response.data)) {
                    proyectosData = response.data;
                }

                // Formatear proyectos
                const formattedProyectos = proyectosData.map(proyecto => ({
                    ...proyecto,
                    status: getEstadoProyecto(proyecto.project_state_id),
                    client: proyecto.client || null,
                    responsible_user: proyecto.responsible_user || null
                }));

                setProyectos(formattedProyectos);
                setStats(response.data.stats || {});
                setPagination(response.data.pagination || {
                    current_page: 1,
                    per_page: 15,
                    total: 0,
                    last_page: 1,
                    from: 0,
                    to: 0
                });
            } else {
                toast.error('Error al cargar proyectos: ' + response.message);
            }
        } catch (error) {
            toast.error('Error de conexión: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, filters, pagination.per_page]);

    // --- Carga de Datos Auxiliares ---
    const loadClientes = useCallback(async () => {
        try {
            const response = await dataService.getClients();
            if (response.success) {
                setClientes(response.data.data || response.data);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            const response = await dataService.getUsers();
            if (response.success) {
                setUsers(response.data.data || response.data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }, []);

    // --- Carga Inicial ---
    const loadData = useCallback(async () => {
        await Promise.all([loadProyectos(), loadClientes(), loadUsers()]);
    }, [loadProyectos, loadClientes, loadUsers]);

    // --- Efectos ---
    useEffect(() => {
        loadProyectos();
    }, [debouncedSearchTerm, filters]);

    // --- Manejadores de Modal ---
    const openModal = (mode, item = null) => {
        setModalState({ isOpen: true, mode, item });
        if (mode === 'edit' && item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                client_id: item.client_id || '',
                project_state_id: item.project_state_id || 1,
                contract_value: item.contract_value || '',
                start_date: item.start_date || '',
                end_date: item.end_date || '',
                location: item.location || '',
                notes: item.notes || ''
            });
        } else if (mode === 'create') {
            setFormData({
                name: '',
                description: '',
                client_id: '',
                project_state_id: 1,
                contract_value: '',
                start_date: '',
                end_date: '',
                location: '',
                notes: ''
            });
        }
    };

    const closeModal = () => {
        setModalState({ isOpen: false, mode: 'create', item: null });
        setFormData({
            name: '',
            description: '',
            client_id: '',
            project_state_id: 1,
            contract_value: '',
            start_date: '',
            end_date: '',
            location: '',
            notes: ''
        });
    };

    const openDeleteModal = (item) => {
        setDeleteModalState({ isOpen: true, item });
    };

    const closeDeleteModal = () => {
        setDeleteModalState({ isOpen: false, item: null });
    };

    // --- CRUD Operations ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validaciones
            if (!formData.name?.trim()) {
                throw new Error('El nombre del proyecto es obligatorio');
            }

            if (!formData.client_id) {
                throw new Error('Debe seleccionar un cliente');
            }

            let response;
            if (modalState.mode === 'create') {
                response = await dataService.createProject(formData);
            } else {
                response = await dataService.updateProject(modalState.item.id, formData);
            }

            if (response && response.success) {
                toast.success(modalState.mode === 'create' ? 'Proyecto creado exitosamente' : 'Proyecto actualizado exitosamente');
                closeModal();
                loadData();
            } else {
                throw new Error(response?.message || 'Error al procesar el proyecto');
            }
        } catch (error) {
            toast.error(error.message || 'Error al procesar el proyecto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModalState.item) return;

        setIsDeleting(true);
        try {
            const response = await dataService.deleteProject(deleteModalState.item.id);

            if (response && response.success) {
                toast.success('Proyecto eliminado exitosamente');
                closeDeleteModal();
                loadData();
            } else {
                throw new Error(response?.message || 'Error al eliminar el proyecto');
            }
        } catch (error) {
            toast.error(error.message || 'Error al eliminar el proyecto');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Navegación ---
    const handleView = (proyecto) => {
        navigate(`/proyectos/${proyecto.id}`);
    };

    // --- Helpers de Paginación ---
    const handlePageChange = (page) => loadProyectos(page);
    const handlePerPageChange = (perPage) => {
        setPagination(prev => ({
            ...prev,
            per_page: perPage
        }));
        loadProyectos(1, perPage);
    };

    return {
        // Datos
        proyectos,
        loading,
        error,
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
        handleView,

        // Utilidades
        loadData,
        loadProyectos
    };
};
