import { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Label } from '../../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Calendar, Clock, User, X } from 'lucide-react';
import { taskModel } from '../model/taskModel';
import { useAuth } from '../../../hooks/useAuth';

const TaskForm = ({ 
  task = null, 
  onSubmit, 
  onCancel, 
  users = [],
  loading = false 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_user_ids: [], // Cambiado a un array
    due_date: '',
    status: 'pending'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigned_user_ids: task.assignedUsers?.map(u => u.id.toString()) || [], // Mapear usuarios asignados
        due_date: task.due_date?.split('T')[0] || '',
        status: task.status || 'pending'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assigned_user_ids: [],
        due_date: '',
        status: 'pending'
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validación simple
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    if (!formData.assigned_user_ids || formData.assigned_user_ids.length === 0) {
      newErrors.assigned_user_ids = 'Debe asignar la tarea a al menos un usuario';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'La fecha límite es obligatoria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const taskData = {
        ...formData,
        assigned_user_ids: formData.assigned_user_ids.map(id => parseInt(id))
      };

      // Si es una edición, no se envía assigned_by_user_id ya que se toma del usuario actual
      if (task) {
        delete taskData.assigned_by_user_id;
      }

      await onSubmit(taskData, task?.task_id);
    } catch (error) {
      setErrors({ general: error.message || 'Error al guardar la tarea' });
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando se cambia el campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar selección de usuarios
  const handleUserSelect = (userId) => {
    if (!formData.assigned_user_ids.includes(userId)) {
      setFormData(prev => ({
        ...prev,
        assigned_user_ids: [...prev.assigned_user_ids, userId]
      }));
    }
  };

  // Eliminar usuario asignado
  const handleRemoveUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigned_user_ids: prev.assigned_user_ids.filter(id => id !== userId)
    }));
  };

  const getStatusOptions = () => [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{task ? 'Editar Tarea' : 'Crear Nueva Tarea'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ingrese el título de la tarea"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción detallada de la tarea"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assigned_user_ids">Asignar a *</Label>
              <div className="flex gap-2">
                <Select 
                  onValueChange={handleUserSelect}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuarios" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => !formData.assigned_user_ids.includes(user.id.toString()))
                      .map(user => (
                        <SelectItem key={user.id} value={user.id?.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.assigned_user_ids && <p className="text-red-500 text-sm mt-1">{errors.assigned_user_ids}</p>}
              
              {/* Mostrar usuarios seleccionados */}
              <div className="mt-2 space-y-1">
                {formData.assigned_user_ids.map(userId => {
                  const userObj = users.find(u => u.id.toString() === userId);
                  return userObj ? (
                    <div key={userId} className="flex items-center justify-between bg-slate-100 px-3 py-1 rounded text-sm">
                      <span>{userObj.name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveUser(userId)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="due_date">Fecha Límite *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
              />
              {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
            </div>
          </div>

          {task && (
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (task ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;