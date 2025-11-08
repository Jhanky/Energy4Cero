import { useState, useEffect } from 'react';
import { X, Plus, Calendar, User, MessageSquare, FolderKanban } from 'lucide-react';
import { 
  tiposPQR,
  categoriasPQR,
  obtenerNombreTipoPQR
} from '../../../data/tickets';
import proyectosService from '../../../services/proyectosService';

const FormPQR = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    proyectoId: '',
    cliente: '',
    tipo: '',
    categoria: '',
    titulo: '',
    descripcion: '',
    responsable: '',
    canalRecepcion: ''
  });
  
  const [proyectos, setProyectos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(false);

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      setLoadingProyectos(true);
      const response = await proyectosService.getProjects({ per_page: 1000 }); // Obtener todos los proyectos
      if (response.success && response.data && Array.isArray(response.data.data)) {
        // La respuesta sigue la estructura de paginación de Laravel: { data: [...] }
        setProyectos(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        setProyectos(response.data);
      } else {
        console.warn('La respuesta de proyectos no contiene datos válidos:', response);
        setProyectos([]);
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setProyectos([]); // Usar array vacío como fallback
    } finally {
      setLoadingProyectos(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'proyectoId') {
      console.log('Valor del proyecto seleccionado (PQR):', value, typeof value);
      console.log('Lista de proyectos actual (PQR):', proyectos);
      console.log('IDs de proyectos en la lista (PQR):', proyectos.map(p => p.id));
      
      // Intentar encontrar el proyecto con conversión de tipos
      let proyectoSeleccionado = proyectos.find(p => p.id === value);
      if (!proyectoSeleccionado) {
        proyectoSeleccionado = proyectos.find(p => p.id == value); // Comparación flexible
      }
      if (!proyectoSeleccionado) {
        proyectoSeleccionado = proyectos.find(p => String(p.id) === value); // Convertir a string
      }
      
      console.log('Proyecto seleccionado (PQR):', proyectoSeleccionado);
      if (proyectoSeleccionado) {
        console.log('Cliente del proyecto (PQR):', proyectoSeleccionado.client);
        console.log('Nombre del cliente (PQR):', proyectoSeleccionado.client?.name);
        console.log('Nombre del cliente (PQR alternativo):', proyectoSeleccionado.client_name);
      } else {
        console.log('No se encontró el proyecto en la lista (PQR)');
      }
      
      const nombreCliente = proyectoSeleccionado ? 
        (proyectoSeleccionado.client?.name || 
         proyectoSeleccionado.client_name || 
         '') : '';
         
      console.log('Nombre final del cliente a asignar (PQR):', nombreCliente);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        cliente: nombreCliente
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const proyectoSeleccionado = proyectos.find(p => p.id === formData.proyectoId);
    
    const newPQR = {
      ...formData,
      id: `PQR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      proyectoId: formData.proyectoId,
      proyectoNombre: proyectoSeleccionado ? proyectoSeleccionado.name : '',
      cliente: formData.cliente || (proyectoSeleccionado ? proyectoSeleccionado.client?.name || proyectoSeleccionado.client_name || '' : ''),
      estado: 1, // Abierto
      prioridad: formData.tipo === '2' || formData.tipo === '3' ? 3 : 2, // Prioridad según tipo (queja/reclamo = alta)
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaRespuesta: null,
      fechaCierre: null,
      respuesta: '',
      accionesTomadas: [],
      satisfaccionRespuesta: null
    };
    onSubmit(newPQR);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Crear Nueva PQR</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proyecto
              </label>
              {loadingProyectos ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-xs text-slate-500">Cargando...</span>
                </div>
              ) : (
                <select
                  name="proyectoId"
                  value={formData.proyectoId}
                  onChange={handleChange}
                  required
                  className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar proyecto</option>
                  {proyectos.map(proyecto => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.name} ({proyecto.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cliente
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del cliente"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                {tiposPQR.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {formData.tipo && (
                <div className="mt-1">
                  <span 
                    className={`inline-block w-3 h-3 rounded-full mr-2`}
                    style={{ backgroundColor: tiposPQR.find(t => t.id == formData.tipo)?.color }}
                  ></span>
                  <span className="text-xs text-slate-500">
                    {tiposPQR.find(t => t.id == formData.tipo)?.nombre}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoría
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar categoría</option>
                {categoriasPQR.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Responsable
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                required
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del responsable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Canal de Recepción
              </label>
              <input
                type="text"
                name="canalRecepcion"
                value={formData.canalRecepcion}
                onChange={handleChange}
                required
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Correo, llamada, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título de la PQR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={4}
              className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción detallada de la petición, queja, reclamo, sugerencia o felicitación"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear PQR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPQR;