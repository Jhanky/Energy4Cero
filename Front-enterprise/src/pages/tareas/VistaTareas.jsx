import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  FolderKanban, 
  Plus, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  Edit,
  Trash2,
  Download,
  Filter
} from 'lucide-react';
import { taskModel } from '../../features/tareas/model/taskModel';
import { useAuth } from '../../hooks/useAuth';
import TaskList from '../../features/tareas/ui/TaskList';
import TaskForm from '../../features/tareas/ui/TaskForm';
import TaskDetail from '../../features/tareas/ui/TaskDetail';
import dataService from '../../services/dataService';

const VistaTareas = () => {
  const { hasPermission, user } = useAuth();
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [stats, setStats] = useState(null);

  const canCreate = hasPermission('tasks.create');
  const canUpdate = hasPermission('tasks.update');
  const canDelete = hasPermission('tasks.delete');
  const canRead = hasPermission('tasks.read');

  useEffect(() => {
    if (canRead) {
      fetchTasks();
      fetchUsers();
      fetchStats();
    }
  }, [myTasksOnly, canRead]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let result;
      if (myTasksOnly) {
        result = await taskModel.actions.fetchMyTasks();
      } else {
        result = await taskModel.actions.fetchTasks();
      }
      
      if (result.success) {
        setTasks(result.data || []);
      } else {
        console.error('Error al obtener tareas:', result.message);
      }
    } catch (error) {
      console.error('Error al obtener tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await taskModel.actions.getTaskStatistics();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await dataService.getUsers();
      if (result.success) {
        setUsers(result.data.users || []);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleCreateTask = async () => {
    setCurrentTask(null);
    setView('form');
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setView('form');
  };

  const handleViewTask = (task) => {
    setCurrentTask(task);
    setView('detail');
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la tarea "${task.title}"?`)) {
      try {
        const result = await taskModel.actions.deleteTask(task.task_id);
        if (result.success) {
          setTasks(prev => prev.filter(t => t.task_id !== task.task_id));
          if (view === 'detail' && currentTask?.task_id === task.task_id) {
            setView('list');
            setCurrentTask(null);
          }
        } else {
          alert(result.message || 'Error al eliminar tarea');
        }
      } catch (error) {
        alert('Error al eliminar tarea: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const result = await taskModel.actions.updateTaskStatus(task.task_id, newStatus);
      if (result.success) {
        setTasks(prev => 
          prev.map(t => 
            t.task_id === task.task_id 
              ? { ...t, status: result.data.status, completed_at: result.data.completed_at }
              : t
          )
        );
        if (currentTask?.task_id === task.task_id) {
          setCurrentTask(result.data);
        }
      } else {
        alert(result.message || 'Error al actualizar estado');
      }
    } catch (error) {
      alert('Error al actualizar estado: ' + error.message);
    }
  };

  const handleFormSubmit = async (taskData, taskId = null) => {
    try {
      let result;
      if (taskId) {
        result = await taskModel.actions.updateTask(taskId, taskData);
        if (result.success) {
          setTasks(prev => 
            prev.map(t => 
              t.task_id === taskId ? result.data : t
            )
          );
          setCurrentTask(result.data);
        }
      } else {
        result = await taskModel.actions.createTask(taskData);
        if (result.success) {
          setTasks(prev => [result.data, ...prev]);
          setCurrentTask(result.data);
        }
      }

      if (result.success) {
        setView('detail');
      } else {
        alert(result.message || 'Error al guardar tarea');
      }
    } catch (error) {
      alert('Error al guardar tarea: ' + error.message);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setCurrentTask(null);
  };

  const handleBackToDetail = () => {
    setView('detail');
  };

  // Obtener estadísticas formateadas
  const getFormattedStats = () => {
    if (!stats) return null;
    return {
      total: stats.total_tasks || 0,
      pending: stats.pending_tasks || 0,
      in_progress: stats.in_progress_tasks || 0,
      completed: stats.completed_tasks || 0,
      overdue: stats.overdue_tasks || 0,
      my_tasks: stats.my_tasks || 0
    };
  };

  const statsData = getFormattedStats();

  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Acceso denegado</h3>
          <p className="text-slate-600">No tiene permiso para ver las tareas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FolderKanban className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Tareas</h1>
            <p className="text-slate-600">Administre y realice seguimiento de las tareas asignadas</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={myTasksOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setMyTasksOnly(!myTasksOnly)}
            >
              <User className="w-4 h-4 mr-2" />
              Mis Tareas
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {canCreate && (
            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{statsData.total}</div>
              <div className="text-sm text-slate-600">Total</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{statsData.pending}</div>
              <div className="text-sm text-slate-600">Pendientes</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{statsData.in_progress}</div>
              <div className="text-sm text-slate-600">En Progreso</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{statsData.completed}</div>
              <div className="text-sm text-slate-600">Completadas</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{statsData.overdue}</div>
              <div className="text-sm text-slate-600">Vencidas</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-indigo-600">{statsData.my_tasks}</div>
              <div className="text-sm text-slate-600">Mis Tareas</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenido principal */}
      {view === 'list' && (
        <TaskList
          tasks={tasks}
          loading={loading}
          onTaskClick={handleViewTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          showActions={canUpdate || canDelete}
        />
      )}

      {view === 'form' && (
        <TaskForm
          task={currentTask}
          onSubmit={handleFormSubmit}
          onCancel={handleBackToList}
          users={users}
        />
      )}

      {view === 'detail' && (
        <TaskDetail
          task={currentTask}
          onEdit={handleEditTask}
          onBack={handleBackToList}
          onChangeStatus={handleStatusChange}
          onEvidenceUpload={() => {}}
          onEvidenceDelete={() => {}}
        />
      )}
    </div>
  );
};

export default VistaTareas;