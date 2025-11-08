import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiService from '../../../services/api';

const EditarCliente = ({ cliente, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    client_type: 'residencial',
    email: '',
    phone: '',
    address: '',
    department: '',
    city: '',
    monthly_consumption: '',
    energy_rate: '',
    network_type: '',
    status: 'activo',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        name: cliente.name || '',
        nic: cliente.nic || '',
        client_type: cliente.client_type || 'residencial',
        email: cliente.email || '',
        phone: cliente.phone || '',
        address: cliente.address || '',
        department: cliente.department || '',
        city: cliente.city || '',
        monthly_consumption: cliente.monthly_consumption || '',
        energy_rate: cliente.energy_rate || '',
        network_type: cliente.network_type || '',
        status: cliente.status || 'activo',
        is_active: cliente.is_active !== undefined ? cliente.is_active : true
      });
    }
  }, [cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await apiService.updateClient(cliente.id, formData);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          
        }
      }
      
    } catch (error) {
      
      setFormErrors({ general: 'Error de conexión: ' + error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Editar Cliente: {cliente?.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {formErrors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{formErrors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Información Básica
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formErrors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NIC (Número de Identificación del Cliente)
                  </label>
                  <input
                    type="text"
                    value={formData.nic}
                    onChange={(e) => setFormData({...formData, nic: e.target.value})}
                    placeholder="Ej: CLI-001-2025"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Cliente *
                  </label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({...formData, client_type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="residencial">Residencial</option>
                    <option value="comercial">Comercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="prospecto">Prospecto</option>
                    <option value="potencial">Potencial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Red
                  </label>
                  <select
                    value={formData.network_type}
                    onChange={(e) => setFormData({...formData, network_type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="monofasico">Monofásico</option>
                    <option value="bifasico">Bifásico</option>
                    <option value="trifasico_220">Trifásico 220V</option>
                    <option value="trifasico_440">Trifásico 440V</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Información de Contacto
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formErrors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email[0]}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Atlántico"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Barranquilla"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Consumo Mensual (kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_consumption}
                  onChange={(e) => setFormData({...formData, monthly_consumption: e.target.value})}
                  placeholder="Ej: 150.50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Consumo promedio mensual en kilovatios hora
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tarifa Energética ($/kWh)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.energy_rate}
                  onChange={(e) => setFormData({...formData, energy_rate: e.target.value})}
                  placeholder="Ej: 0.8500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tarifa por kilovatio hora según el recibo
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Información adicional sobre el cliente..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  Cliente activo
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Actualizando...' : 'Actualizar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarCliente;