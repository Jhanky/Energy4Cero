import { Eye, Edit, Trash2, Users } from 'lucide-react';

const ClientesTable = ({ clientes }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">NIC</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo Cliente</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Departamento</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ciudad</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Dirección</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Consumo</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Fecha de Creación</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Responsable</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-900">
                    {cliente.nic || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {cliente.client_type || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{cliente.name}</p>
                    <p className="text-sm text-slate-600">{cliente.email}</p>
                    <p className="text-sm text-slate-600">{cliente.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-900">
                    {cliente.department ? cliente.department.name : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-900">
                    {cliente.city ? cliente.city.name : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {cliente.address || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-900">
                    {cliente.monthly_consumption_kwh ? `${cliente.monthly_consumption_kwh} kWh/mes` : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('es-CO') : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {cliente.responsibleUser ? cliente.responsibleUser.name : 'Sistema'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {/* Acciones */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {clientes.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-2">No hay clientes registrados</p>
            <p className="text-sm text-slate-500">Comienza agregando tu primer cliente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientesTable;

