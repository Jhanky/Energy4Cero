import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';
import { useAuth } from '../../../hooks/useAuth';
import { taskModel } from '../model/taskModel';

const TaskList = ({ 
  tasks = [], 
  loading = false, 
  onTaskClick, 
  onEdit, 
  onDelete,
  onStatusChange,
  showFilters = true,
  showActions = true
}) => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('tasks.create');
  const canUpdate = hasPermission('tasks.update');
  const canDelete = hasPermission('tasks.delete');
  const canRead = hasPermission('tasks.read');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // Filtros
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.assignedTo?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Obtener estado de tarea con color
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

  // Verificar si la tarea está vencida
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No hay tareas</h3>
          <p className="text-slate-600">
            {searchTerm ? 'No se encontraron tareas que coincidan con tu búsqueda.' : 'No se han encontrado tareas.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.task_id} className={`hover:shadow-md transition-shadow ${isOverdue(task.due_date) && task.status !== 'completed' ? 'border-red-200 bg-red-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 
                        className={`font-medium text-slate-900 cursor-pointer hover:text-green-600 ${
                          task.status === 'completed' ? 'line-through text-slate-500' : ''
                        }`}
                        onClick={() => onTaskClick && onTaskClick(task)}
                      >
                        {task.title}
                      </h3>
                      {isOverdue(task.due_date) && task.status !== 'completed' && (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Asignada a: {task.assignedUsers?.length > 0 
                          ? task.assignedUsers.map(u => u.name).join(', ') 
                          : 'Nadie asignado'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Por: {task.assignedBy?.name || 'Desconocido'}</span>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Vence: {formatDate(task.due_date)}</span>
                        </div>
                      )}
                      {task.completed_at && task.status === 'completed' && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completada: {formatDate(task.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(task.status)}
                    {showActions && (
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStatusChange && onStatusChange(task)}
                            className="h-8 w-8 p-0"
                            title="Cambiar estado"
                          >
                            {task.status === 'completed' ? (
                              <Circle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit && onEdit(task)}
                            className="h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete && onDelete(task)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTaskClick && onTaskClick(task)}
                          className="h-8 px-3"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;