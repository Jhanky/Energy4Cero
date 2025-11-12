import { useEffect, useState } from 'react';
import { 
  Building, 
  Home, 
  Mail, 
  Phone, 
  User, 
  X
} from 'lucide-react';
import { getDepartments, getCitiesByDepartment } from '../../services/locationService';
import { useAuth } from '../../contexts/AuthContext';

const ClienteModal = ({ show, mode, formData, onFormChange, onSubmit, onClose, isSubmitting, users }) => {
  const { user: loggedInUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Asegurar que formData tenga valores por defecto si es undefined
  const safeFormData = formData || {
    name: '',
    client_type: 'residencial',
    email: '',
    phone: '',
    nic: '',
    responsible_user_id: '',
    department_id: '',
    city_id: '',
    address: '',
    monthly_consumption: '',
    notes: '',
    is_active: true
  };

  useEffect(() => {
    if (show) {
      const fetchDepartments = async () => {
        setLoadingDepartments(true);
        try {
          const response = await getDepartments();
          if (response.success) {
            const uniqueDepartments = Array.from(new Map(response.data.map(dep => [dep.department_id, dep])).values());
            setDepartments(uniqueDepartments);
          } else {
            console.error('Error al obtener departamentos:', response.message);
          }
        } catch (error) {
          console.error('Error en fetchDepartments:', error);
        } finally {
          setLoadingDepartments(false);
        }
      };
      fetchDepartments();
    }
  }, [show]);

  useEffect(() => {
    if (safeFormData.department_id) {
      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          const response = await getCitiesByDepartment(safeFormData.department_id);
          if (response.success) {
            const uniqueCities = Array.from(new Map(response.data.map(city => [city.city_id, city])).values());
            setCities(uniqueCities);
          } else {
            console.error('Error al obtener ciudades:', response.message);
          }
        } catch (error) {
          console.error('Error en fetchCities:', error);
        } finally {
          setLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [safeFormData.department_id]);

  if (!show) {
    return null;
  }

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'create' && 'Nuevo Cliente'}
              {mode === 'edit' && 'Editar Cliente'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={safeFormData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Cliente
                </label>
                <select
                  value={safeFormData.client_type}
                  onChange={(e) => handleInputChange('client_type', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={safeFormData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="juan.perez@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={safeFormData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="300 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Departamento
                </label>
                <select
                  value={safeFormData.department_id}
                  onChange={(e) => handleInputChange('department_id', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loadingDepartments}
                >
                  <option value="">{loadingDepartments ? 'Cargando...' : 'Seleccione un departamento'}</option>
                  {departments.map(dep => (
                    <option key={dep.department_id} value={dep.department_id}>{dep.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ciudad
                </label>
                <select
                  value={safeFormData.city_id}
                  onChange={(e) => handleInputChange('city_id', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={!safeFormData.department_id || loadingCities}
                >
                  <option value="">{loadingCities ? 'Cargando...' : 'Seleccione una ciudad'}</option>
                  {cities.map(city => (
                    <option key={city.city_id} value={city.city_id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={safeFormData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Calle 123 # 45 - 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  NIC (Número de Identificación de Contrato)
                </label>
                <input
                  type="text"
                  value={safeFormData.nic}
                  onChange={(e) => handleInputChange('nic', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Consumo Mensual (kW/h)
                </label>
                <input
                  type="number"
                  value={safeFormData.monthly_consumption}
                  onChange={(e) => handleInputChange('monthly_consumption', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="500"
                />
              </div>

              <input
                type="hidden"
                value={loggedInUser?.id || ''}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={safeFormData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Información adicional sobre el cliente..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={safeFormData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Cliente activo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Cliente' : 'Actualizar Cliente')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClienteModal;
