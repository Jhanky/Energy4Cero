import { X, User, Mail, Phone, MapPin, Building, Globe, Calendar, UserCheck, UserX } from 'lucide-react';

const VerCliente = ({ cliente, onClose }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      case 'prospecto': return 'bg-blue-100 text-blue-800';
      case 'potencial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeLabel = (type) => {
    switch (type) {
      case 'comercial': return 'Comercial';
      case 'residencial': return 'Residencial';
      case 'industrial': return 'Industrial';
      default: return 'No especificado';
    }
  };

  const getNetworkTypeLabel = (networkType) => {
    switch (networkType) {
      case 'monofasico': return 'Monofásico';
      case 'bifasico': return 'Bifásico';
      case 'trifasico_220': return 'Trifásico 220V';
      case 'trifasico_440': return 'Trifásico 440V';
      default: return 'No especificado';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value, decimals = 2) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Detalles del Cliente: {cliente?.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Información Básica
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Nombre</p>
                    <p className="font-medium text-slate-900">{cliente?.name || 'N/A'}</p>
                  </div>
                </div>

                {cliente?.nic && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">NIC</p>
                      <p className="font-medium text-slate-900">{cliente.nic}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Tipo de Cliente</p>
                    <p className="font-medium text-slate-900">
                      {getClientTypeLabel(cliente?.client_type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {cliente?.is_active ? (
                    <UserCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <UserX className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cliente?.status)}`}>
                      {cliente?.status || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Tipo de Red</p>
                    <p className="font-medium text-slate-900">
                      {getNetworkTypeLabel(cliente?.network_type)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Información de Contacto
              </h3>
              
              <div className="space-y-3">
                {cliente?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-900">{cliente.email}</p>
                    </div>
                  </div>
                )}

                {cliente?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Teléfono</p>
                      <p className="font-medium text-slate-900">{cliente.phone}</p>
                    </div>
                  </div>
                )}

                {cliente?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Dirección</p>
                      <p className="font-medium text-slate-900">{cliente.address}</p>
                    </div>
                  </div>
                )}

                {(cliente?.city?.name || cliente?.city) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Ubicación</p>
                      <p className="font-medium text-slate-900">
                        {cliente.city?.name || cliente.city}
                        {cliente.department?.name && `, ${cliente.department.name}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información Técnica */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Información Técnica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Consumo Mensual</p>
                <p className="text-lg font-semibold text-slate-900">
                  {cliente?.monthly_consumption_kwh ? 
                    `${formatNumber(cliente.monthly_consumption_kwh)} kWh/mes` : 
                    'N/A'
                  }
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Tarifa Energética</p>
                <p className="text-lg font-semibold text-slate-900">
                  {cliente?.energy_rate ? 
                    `$${formatNumber(cliente.energy_rate, 4)} /kWh` : 
                    'N/A'
                  }
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Costo Mensual Estimado</p>
                <p className="text-lg font-semibold text-slate-900">
                  {cliente?.monthly_consumption_kwh && cliente?.energy_rate ? 
                    formatCurrency(cliente.monthly_consumption_kwh * cliente.energy_rate) : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {cliente?.description && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Descripción
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700">{cliente.description}</p>
              </div>
            </div>
          )}

          {/* Información del Sistema */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Información del Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Fecha de Creación</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(cliente?.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Registrado por</p>
                  <p className="font-medium text-slate-900">
                    {cliente?.createdBy?.name || 'Sistema'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Cerrar */}
          <div className="flex justify-end mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCliente;
