import { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api';
import { toast } from 'sonner';

export const useUsuarios = () => {
    // --- Estados Principales ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados de Paginación ---
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0
    });

    // --- Estados de Filtros y Búsqueda ---
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        role_id: '',
        is_active: ''
    });

    // --- Estados de Modales ---
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create', // 'create', 'edit'
        item: null,
    });
    const [deleteModalState, setDeleteModalState] = useState({
        isOpen: false,
        item: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Estados de Formulario ---
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        phone: '',
        position: '',
        is_active: true
    });

    // --- Estados de Opciones ---
    const [options, setOptions] = useState({
        roles: []
    });

    // --- Estados de Estadísticas ---
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        administrators: 0,
        managers: 0,
        technicians: 0,
        others: 0
    });

    // --- Debounce de Búsqueda ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- Carga de Datos ---
    const loadUsers = useCallback(async (page = 1, perPage = pagination.per_page) => {
        try {
            setLoading(true);
            const params = {
                search: debouncedSearchTerm,
                page,
                per_page: perPage,
                ...filters
            };

            console.log('🔍 Cargando usuarios con params:', params);

            const response = await api.get('/users', { params });

            console.log('📡 Respuesta completa:', response);
            console.log('📊 Datos de respuesta:', response.data);

            // Verificar que la respuesta tenga la estructura esperada
            let usersData = [];
            let statsData = {};
            let paginationData = {};

            if (response.data && response.data.data) {
                // Estructura esperada: {success: true, data: {users: [...], pagination: {...}, stats: {...}}, message: '...'}
                console.log('✅ Estructura esperada encontrada');
                usersData = response.data.data.users || [];
                statsData = response.data.data.stats || {};
                paginationData = response.data.data.pagination || {};
            } else if (response.data && response.data.users) {
                // Estructura alternativa: {users: [...], pagination: {...}, stats: {...}}
                console.log('✅ Estructura alternativa encontrada (datos directos)');
                usersData = response.data.users || [];
                statsData = response.data.stats || {};
                paginationData = response.data.pagination || {};
            } else {
                console.error('❌ Respuesta inesperada del servidor:', response.data);
                // En caso de respuesta inesperada, limpiar los datos
                setUsers([]);
                setStats({});
                setPagination({});
                return;
            }

            console.log('📊 Datos procesados:', {
                users: usersData.length,
                stats: statsData,
                pagination: paginationData
            });

            setUsers(usersData);
            setStats(statsData);
            setPagination(paginationData);
        } catch (error) {
            console.error('❌ Error loading users:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status
            });
            // En caso de error, limpiar los datos para evitar crashes
            setUsers([]);
            setStats({});
            setPagination({});
            setError(error.message);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, filters, pagination.per_page]);

    // --- Carga de Opciones ---
    const loadOptions = useCallback(async () => {
        try {
            const response = await api.get('/users/options');
            setOptions(response.data.options);
        } catch (error) {
            console.error('Error loading options:', error);
            toast.error('Error al cargar opciones');
        }
    }, []);

    // --- Efectos ---
    useEffect(() => {
        loadUsers(1); // Reset to page 1 when search/filters change
    }, [debouncedSearchTerm, filters, loadUsers]);

    useEffect(() => {
        loadOptions();
    }, [loadOptions]);

    // --- Reset Formulario ---
    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role_id: '',
            phone: '',
            position: '',
            is_active: true
        });
    }, []);

    // --- Manejadores de Modal ---
    const openModal = useCallback((mode, item = null) => {
        if (mode === 'edit' && item) {
            setFormData({
                name: item.name,
                email: item.email,
                password: '',
                password_confirmation: '',
                role_id: item.role_id,
                phone: item.phone || '',
                position: item.position || '',
                is_active: item.is_active
            });
        } else {
            resetForm();
        }
        setModalState({ isOpen: true, mode, item });
    }, [resetForm]);

    const closeModal = useCallback(() => {
        setModalState({ isOpen: false, mode: 'create', item: null });
        resetForm();
    }, [resetForm]);

    const openDeleteModal = useCallback((item) => {
        setDeleteModalState({ isOpen: true, item });
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteModalState({ isOpen: false, item: null });
    }, []);

    // --- CRUD Operations ---
    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            let response;
            if (modalState.mode === 'create') {
                response = await api.post('/users', formData);
            } else {
                response = await api.put(`/users/${modalState.item.id}`, formData);
            }

            if (response.data && response.data.success !== false) {
                toast.success(`Usuario ${modalState.mode === 'create' ? 'creado' : 'actualizado'} exitosamente`);
                loadUsers(pagination.current_page);
                closeModal();
            } else {
                toast.error(response.data?.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error submitting user:', error);
            const message = error.response?.data?.message || error.message || 'Error inesperado';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, modalState, formData, loadUsers, pagination.current_page, closeModal]);

    const handleDelete = useCallback(async () => {
        if (!deleteModalState.item || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await api.delete(`/users/${deleteModalState.item.id}`);

            if (response.data && response.data.success !== false) {
                toast.success('Usuario eliminado exitosamente');
                loadUsers(pagination.current_page);
                closeDeleteModal();
            } else {
                toast.error(response.data?.message || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            const message = error.response?.data?.message || error.message || 'Error al eliminar usuario';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [deleteModalState.item, isSubmitting, loadUsers, pagination.current_page, closeDeleteModal]);

    // --- Toggle Status ---
    const handleToggleStatus = useCallback(async (user) => {
        try {
            const response = await api.patch(`/users/${user.id}/toggle-status`);

            if (response.data && response.data.success !== false) {
                toast.success(`Usuario ${user.is_active ? 'desactivado' : 'activado'} exitosamente`);
                loadUsers(pagination.current_page);
            } else {
                toast.error(response.data?.message || 'Error al cambiar estado');
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            const message = error.response?.data?.message || error.message || 'Error al cambiar estado';
            toast.error(message);
        }
    }, [loadUsers, pagination.current_page]);

    // --- Helpers ---
    const handlePageChange = useCallback((page) => loadUsers(page), [loadUsers]);
    const handlePerPageChange = useCallback((perPage) => {
        setPagination(prev => ({ ...prev, per_page: perPage }));
        loadUsers(1, perPage);
    }, [loadUsers]);

    const updateFormData = useCallback((updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    // --- Obtener nombre del rol ---
    const getRoleName = useCallback((roleId) => {
        const role = options.roles?.find(r => r.role_id === roleId);
        return role ? role.name : 'Sin rol';
    }, [options.roles]);

    // --- Obtener color del rol ---
    const getRoleColor = useCallback((roleId) => {
        const role = options.roles?.find(r => r.role_id === roleId);
        if (!role) return 'gray';

        const colors = {
            'administrador': 'red',
            'gerente': 'blue',
            'contador': 'purple',
            'ingeniero': 'green',
            'tecnico': 'orange'
        };

        return colors[role.slug] || 'gray';
    }, [options.roles]);

    return {
        // Estados
        users,
        loading,
        error,
        pagination,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        stats,
        options,

        // Modales
        modalState,
        deleteModalState,
        isSubmitting,

        // Formulario
        formData,
        updateFormData,

        // Acciones
        openModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
        handleSubmit,
        handleDelete,
        handleToggleStatus,
        handlePageChange,
        handlePerPageChange,

        // Helpers
        getRoleName,
        getRoleColor
    };
};
