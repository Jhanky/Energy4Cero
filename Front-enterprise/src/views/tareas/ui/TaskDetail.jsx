import { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
  Edit,
  Eye
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';
import { taskModel } from '../model/taskModel';
import { taskEvidenceService } from '../../../services/taskService';
import { useAuth } from '../../../hooks/useAuth';

const TaskDetail = ({ 
  task, 
  onEdit, 
  onBack, 
  onChangeStatus,
  onEvidenceUpload,
  onEvidenceDelete
}) => {
  const { hasPermission, user } = useAuth();
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(null);

  useEffect(() => {
    if (task) {
      fetchEvidences();
    }
  }, [task]);

  const fetchEvidences = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      const response = await taskEvidenceService.getTaskEvidences(task.task_id);
      if (response.success) {
        setEvidences(response.data.evidences);
      }
    } catch (error) {
      console.error('Error al obtener evidencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido (jpeg, png, jpg, gif, webp)');
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no debe superar los 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedFile || !task) return;

    try {
      setUploadLoading(true);
      const response = await taskEvidenceService.uploadEvidence(task.task_id, selectedFile);
      if (response.success) {
        setEvidences(prev => [response.data.evidence, ...prev]);
        setSelectedFile(null);
        // Resetear el input de archivo
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        
        if (onEvidenceUpload) {
          onEvidenceUpload(response.data.evidence);
        }
      } else {
        alert(response.message || 'Error al subir evidencia');
      }
    } catch (error) {
      console.error('Error al subir evidencia:', error);
      alert('Error al subir evidencia: ' + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta evidencia?')) {
      return;
    }

    try {
      const response = await taskEvidenceService.deleteEvidence(task.task_id, evidenceId);
      if (response.success) {
        setEvidences(prev => prev.filter(e => e.evidence_id !== evidenceId));
        if (onEvidenceDelete) {
          onEvidenceDelete(evidenceId);
        }
      } else {
        alert(response.message || 'Error al eliminar evidencia');
      }
    } catch (error) {
      console.error('Error al eliminar evidencia:', error);
      alert('Error al eliminar evidencia: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const canEdit = user && (task?.assigned_by_user_id === user.id || task?.assigned_to_user_id === user.id);

  if (!task) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay tarea seleccionada</h3>
        <p className="text-slate-600">Seleccione una tarea para ver su detalle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de la tarea */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{task.title}</CardTitle>
          <div className="flex items-center gap-2">
            {isOverdue(task.due_date) && task.status !== 'completed' && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            {getStatusBadge(task.status)}
            {canEdit && onEdit && (
              <Button onClick={() => onEdit(task)} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {task.description && (
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Descripción</h4>
              <p className="text-slate-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <div className="text-slate-600">Asignada a</div>
                <div className="font-medium">
                  {task.assignedUsers?.length > 0 
                    ? task.assignedUsers.map(u => u.name).join(', ') 
                    : 'Nadie asignado'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <div className="text-slate-600">Asignada por</div>
                <div className="font-medium">{task.assignedBy?.name || 'Desconocido'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <div className="text-slate-600">Fecha Límite</div>
                <div className={`${isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-600 font-medium' : 'font-medium'}`}>
                  {formatDate(task.due_date) || 'No definida'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <div className="text-slate-600">Fecha Creación</div>
                <div className="font-medium">{formatDate(task.created_at)}</div>
              </div>
            </div>
            {task.completed_at && task.status === 'completed' && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-slate-600">Fecha Finalización</div>
                  <div className="font-medium">{formatDate(task.completed_at)}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de evidencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Evidencias Fotográficas</span>
            <div className="flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById('file-upload').click()}
                disabled={uploadLoading}
                variant="outline"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadLoading ? 'Subiendo...' : 'Subir Evidencia'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFile && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadEvidence}
                    disabled={uploadLoading}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {uploadLoading ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.getElementById('file-upload');
                      if (fileInput) fileInput.value = '';
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : evidences.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No hay evidencias fotográficas para esta tarea.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidences.map((evidence) => (
                <div key={evidence.evidence_id} className="border rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={`${evidence.file_path}`}
                      alt={`Evidencia ${evidence.evidence_id}`}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowFilePreview(evidence)}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-red-600"
                        onClick={() => handleDeleteEvidence(evidence.evidence_id)}
                        title="Eliminar evidencia"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50">
                    <div className="text-xs text-slate-600 mb-1">
                      {formatDate(evidence.created_at)}
                    </div>
                    <div className="text-sm font-medium truncate">
                      {evidence.file_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de vista previa de imagen */}
      {showFilePreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowFilePreview(null)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={`${showFilePreview.file_path}`}
              alt={`Vista previa de evidencia ${showFilePreview.evidence_id}`}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-800"
              onClick={() => setShowFilePreview(null)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;