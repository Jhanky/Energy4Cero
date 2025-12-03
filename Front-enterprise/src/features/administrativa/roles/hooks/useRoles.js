import { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api';
import { toast } from 'sonner';

export const useRoles = () => {
    // --- Estados Principales ---
    const [roles, setRoles] = useState([]);
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
        slug: '',
        description: '',
        permissions: [],
        is_active: true
    });

    // --- Estados de Opciones ---
    const [availablePermissions, setAvailablePermissions] = useState({});

    // --- Estados de Estadísticas ---
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    // --- Debounce de Búsqueda ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 200);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // --- Carga de Datos ---
    const loadRoles = useCallback(async (page = 1, perPage = pagination.per_page) => {
        try {
            setLoading(true);
            const params = {
                search: debouncedSearchTerm,
                page,
                per_page: perPage,
                ...filters
            };

            console.log('🔍 Cargando roles con params:', params);

            const response = await api.get('/roles', { params });

            console.log('📡 Respuesta de roles:', response);

            // Verificar que la respuesta tenga la estructura esperada
            let rolesData = [];
            let statsData = {};
            let paginationData = {};

            if (response.data && response.data.data) {
                // Estructura esperada: {success: true, data: {roles: [...], pagination: {...}, stats: {...}}, message: '...'}
                rolesData = response.data.data.roles || [];
                statsData = response.data.data.stats || {};
                paginationData = response.data.data.pagination || {};
            } else if (response.data && response.data.roles) {
                // Estructura alternativa: {roles: [...], pagination: {...}, stats: {...}}
                rolesData = response.data.roles || [];
                statsData = response.data.stats || {};
                paginationData = response.data.pagination || {};
            } else {
                console.error('❌ Respuesta inesperada del servidor:', response.data);
                setRoles([]);
                setStats({});
                setPagination({});
                return;
            }

            console.log('📊 Datos procesados:', {
                roles: rolesData.length,
                stats: statsData,
                pagination: paginationData
            });

            setRoles(rolesData);
            setStats(statsData);
            setPagination(paginationData);
        } catch (error) {
            console.error('❌ Error loading roles:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status
            });
            setRoles([]);
            setStats({});
            setPagination({});
            setError(error.message);
            toast.error('Error al cargar roles');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, filters, pagination.per_page]);

    // --- Carga de Permisos ---
    const loadPermissions = useCallback(async () => {
        try {
            console.log('🔐 Cargando permisos disponibles...');
            const response = await api.get('/roles/permissions');
            console.log('📡 Respuesta de permisos:', response);

            let permissionsData = {};
            let modulesData = [];
            let flatPermissionsData = {};

            // Verificar diferentes estructuras de respuesta posibles
            if (response.data && response.data.data) {
                // Estructura esperada: {success: true, data: {permissions: {...}, modules: [...], flat_permissions: {...}}}
                ({ permissions: permissionsData, modules: modulesData, flat_permissions: flatPermissionsData } = response.data.data);
            } else if (response.data && response.data.permissions) {
                // Estructura alternativa: {permissions: {...}, modules: [...], flat_permissions: {...}}
                ({ permissions: permissionsData, modules: modulesData, flat_permissions: flatPermissionsData } = response.data);
            } else if (response.data && typeof response.data === 'object' && 'flat_permissions' in response.data) {
                // Estructura directa: {flat_permissions: {...}, modules: [...], permissions: {...}}
                ({ permissions: permissionsData, modules: modulesData, flat_permissions: flatPermissionsData } = response.data);
            } else {
                console.error('❌ Estructura de respuesta inesperada:', response.data);
                setAvailablePermissions({});
                return;
            }

            console.log('✅ Permisos cargados:', {
                permissionsCount: Object.keys(permissionsData || {}).length,
                modules: modulesData || [],
                flatPermissionsCount: Object.keys(flatPermissionsData || {}).length
            });

            setAvailablePermissions(permissionsData || {});
        } catch (error) {
            console.error('❌ Error loading permissions:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setAvailablePermissions({});
            toast.error('Error al cargar permisos');
        }
    }, []);

    // --- Efectos ---
    useEffect(() => {
        loadRoles(1); // Reset to page 1 when search/filters change
    }, [debouncedSearchTerm, filters, loadRoles]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    // --- Reset Formulario ---
    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            permissions: [],
            is_active: true
        });
    }, []);

    // --- Manejadores de Modal ---
    const openModal = useCallback((mode, item = null) => {
        if (mode === 'edit' && item) {
            setFormData({
                name: item.name,
                slug: item.slug,
                description: item.description || '',
                permissions: item.permissions || [],
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
                response = await api.post('/roles', formData);
            } else {
                response = await api.put(`/roles/${modalState.item.role_id}`, formData);
            }

            if (response.data && response.data.success !== false) {
                toast.success(`Rol ${modalState.mode === 'create' ? 'creado' : 'actualizado'} exitosamente`);
                loadRoles(pagination.current_page);
                closeModal();
            } else {
                toast.error(response.data?.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error submitting role:', error);
            const message = error.response?.data?.message || error.message || 'Error inesperado';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, modalState, formData, loadRoles, pagination.current_page, closeModal]);

    const handleDelete = useCallback(async () => {
        if (!deleteModalState.item || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await api.delete(`/roles/${deleteModalState.item.role_id}`);

            if (response.data && response.data.success !== false) {
                toast.success('Rol eliminado exitosamente');
                loadRoles(pagination.current_page);
                closeDeleteModal();
            } else {
                toast.error(response.data?.message || 'Error al eliminar rol');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            const message = error.response?.data?.message || error.message || 'Error al eliminar rol';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [deleteModalState.item, isSubmitting, loadRoles, pagination.current_page, closeDeleteModal]);

    // --- Toggle Status ---
    const handleToggleStatus = useCallback(async (role) => {
        try {
            const response = await api.patch(`/roles/${role.role_id}/toggle-status`);

            if (response.data && response.data.success !== false) {
                toast.success(`Rol ${role.is_active ? 'desactivado' : 'activado'} exitosamente`);
                loadRoles(pagination.current_page);
            } else {
                toast.error(response.data?.message || 'Error al cambiar estado');
            }
        } catch (error) {
            console.error('Error toggling role status:', error);
            const message = error.response?.data?.message || error.message || 'Error al cambiar estado';
            toast.error(message);
        }
    }, [loadRoles, pagination.current_page]);

    // --- Helpers ---
    const handlePageChange = useCallback((page) => loadRoles(page), [loadRoles]);
    const handlePerPageChange = useCallback((perPage) => {
        setPagination(prev => ({ ...prev, per_page: perPage }));
        loadRoles(1, perPage);
    }, [loadRoles]);

    const updateFormData = useCallback((updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    // --- Generar slug automáticamente ---
    const generateSlug = useCallback((name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }, []);

    const handleNameChange = useCallback((name) => {
        updateFormData({
            name,
            slug: generateSlug(name)
        });
    }, [updateFormData, generateSlug]);

    // --- Manejar cambios en permisos ---
    const handlePermissionChange = useCallback((permission) => {
        const newPermissions = formData.permissions.includes(permission)
            ? formData.permissions.filter(p => p !== permission)
            : [...formData.permissions, permission];

        updateFormData({ permissions: newPermissions });
    }, [formData.permissions, updateFormData]);

    // --- Obtener etiqueta de permiso ---
    const getPermissionLabel = useCallback((permission) => {
        const labels = {
            // Usuarios
            'users.create': 'Crear usuarios',
            'users.read': 'Ver usuarios',
            'users.update': 'Editar usuarios',
            'users.delete': 'Eliminar usuarios',
            'users.manage_roles': 'Gestionar roles de usuarios',

            // Roles
            'roles.create': 'Crear roles',
            'roles.read': 'Ver roles',
            'roles.update': 'Editar roles',
            'roles.delete': 'Eliminar roles',

            // Clientes
            'clients.create': 'Crear clientes',
            'clients.read': 'Ver clientes',
            'clients.update': 'Editar clientes',
            'clients.delete': 'Eliminar clientes',
            'clients.export': 'Exportar clientes',

            // Cotizaciones
            'quotations.create': 'Crear cotizaciones',
            'quotations.read': 'Ver cotizaciones',
            'quotations.update': 'Editar cotizaciones',
            'quotations.delete': 'Eliminar cotizaciones',
            'quotations.approve': 'Aprobar cotizaciones',
            'quotations.export': 'Exportar cotizaciones',

            // Proyectos
            'projects.create': 'Crear proyectos',
            'projects.read': 'Ver proyectos',
            'projects.update': 'Editar proyectos',
            'projects.delete': 'Eliminar proyectos',

            // Inventario
            'inventory.create': 'Crear elementos de inventario',
            'inventory.read': 'Ver inventario',
            'inventory.update': 'Editar inventario',
            'inventory.delete': 'Eliminar elementos de inventario',

            // Soporte
            'support.create': 'Crear tickets de soporte',
            'support.read': 'Ver soporte',
            'support.update': 'Editar soporte',
            'support.delete': 'Eliminar soporte',

            // Financiero
            'financial.read': 'Ver finanzas',
            'financial.update': 'Editar finanzas',
            'financial.reports': 'Reportes financieros',

            // Comercial
            'commercial.read': 'Ver comercial',
            'commercial.update': 'Editar comercial',
            'commercial.reports': 'Reportes comerciales',

            // Configuración
            'settings.read': 'Ver configuración',
            'settings.update': 'Editar configuración',

            // Reportes
            'reports.create': 'Crear reportes',
            'reports.read': 'Ver reportes',
            'reports.update': 'Editar reportes',
            'reports.delete': 'Eliminar reportes',

            // Baterías
            'batteries.create': 'Crear baterías',
            'batteries.read': 'Ver baterías',
            'batteries.update': 'Editar baterías',
            'batteries.delete': 'Eliminar baterías'
        };
        return labels[permission] || permission;
    }, []);

    // --- Obtener permisos agrupados por módulo ---
    const getGroupedPermissions = useCallback(() => {
        const grouped = {};
        Object.entries(availablePermissions).forEach(([module, permissions]) => {
            if (permissions && Array.isArray(permissions)) {
                if (!grouped[module]) grouped[module] = [];
                permissions.forEach((permission) => {
                    if (permission && typeof permission === 'object' && permission.key) {
                        grouped[module].push({
                            key: permission.key,
                            label: permission.label || getPermissionLabel(permission.key)
                        });
                    }
                });
            }
        });
        return grouped;
    }, [availablePermissions, getPermissionLabel]);

    return {
        // Estados
        roles,
        loading,
        error,
        pagination,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        stats,
        availablePermissions,

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
        handleNameChange,
        handlePermissionChange,
        getPermissionLabel,
        getGroupedPermissions,
        generateSlug
    };
};
