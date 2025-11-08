import { useState } from 'react';
import { X, MessageSquare, User, Calendar, Clock, CheckCircle, Star, Reply } from 'lucide-react';
import { 
  tiposPQR,
  obtenerNombreTipoPQR,
  obtenerColorTipoPQR,
  calcularTiempoTranscurrido
} from '../../../data/tickets';

const DetallePQR = ({ pqr, onClose, onUpdate }) => {
  const [respuesta, setRespuesta] = useState(pqr.respuesta || '');
  const [estado, setEstado] = useState(pqr.estado);
  const [accionesTomadas, setAccionesTomadas] = useState(pqr.accionesTomadas.join('\n') || '');
  const [satisfaccion, setSatisfaccion] = useState(pqr.satisfaccionRespuesta || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const accionesTomadasArray = accionesTomadas.split('\n').filter(acc => acc.trim() !== '');
    
    const pqrActualizado = {
      ...pqr,
      respuesta,
      accionesTomadas: accionesTomadasArray,
      estado: parseInt(estado),
      satisfaccionRespuesta: satisfaccion,
      fechaRespuesta: pqr.fechaRespuesta || new Date().toISOString().split('T')[0],
      fechaCierre: estado === 5 ? new Date().toISOString().split('T')[0] : pqr.fechaCierre
    };
    
    onUpdate(pqrActualizado);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{pqr.titulo}</h2>
              <p className="text-sm text-slate-600">{pqr.id} • {pqr.proyectoNombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Cliente</span>
              </div>
              <p className="text-sm text-slate-900">{pqr.cliente}</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Tipo</span>
              </div>
              <span 
                className={`text-xs px-2 py-1 rounded-full ${obtenerColorTipoPQR(pqr.tipo)} text-white`}
              >
                {obtenerNombreTipoPQR(pqr.tipo)}
              </span>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Creado</span>
              </div>
              <p className="text-sm text-slate-900">{calcularTiempoTranscurrido(pqr.fechaCreacion)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>Abierto</option> 
                <option value={2}>En Proceso</option>
                <option value={3}>Esperando Cliente</option>
                <option value={4}>Esperando Autorización</option>
                <option value={5}>Cerrado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Responsable</label>
              <input
                type="text"
                value={pqr.responsable}
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                readOnly
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <span className="text-sm text-slate-900">{pqr.categoria}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-900">{pqr.descripcion}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Respuesta</label>
            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={4}
              className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escribe la respuesta al cliente..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Acciones Tomadas</label>
            <textarea
              value={accionesTomadas}
              onChange={(e) => setAccionesTomadas(e.target.value)}
              rows={3}
              className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Lista de acciones tomadas (una por línea)..."
            />
            <p className="text-xs text-slate-500 mt-1">Escribe cada acción en una línea separada</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Satisfacción del Cliente
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((estrella) => (
                <button
                  key={estrella}
                  type="button"
                  onClick={() => setSatisfaccion(estrella)}
                  className={`${
                    estrella <= satisfaccion ? 'text-yellow-400' : 'text-slate-300'
                  } hover:text-yellow-400`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-600">
                {satisfaccion > 0 ? `${satisfaccion} de 5 estrellas` : 'Sin calificar'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePQR;