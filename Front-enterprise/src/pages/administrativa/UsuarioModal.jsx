import { Loader2, User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog';

const UsuarioModal = ({
  show,
  mode, // 'create', 'edit', 'view'
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isSubmitting,
  roles = []
}) => {
  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const titles = {
    create: 'Nuevo Usuario',
    edit: 'Editar Usuario',
    view: 'Detalles del Usuario'
  };

  const descriptions = {
    create: 'Complete la información para crear un nuevo usuario en el sistema.',
    edit: 'Modifique la información del usuario según sea necesario.',
    view: 'Información detallada del usuario.'
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>{descriptions[mode]}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              <User className="w-4 h-4 inline mr-2 text-muted-foreground" />
              Nombre Completo *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Carlos Mendoza"
              disabled={mode === 'view'}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="w-4 h-4 inline mr-2 text-muted-foreground" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="carlos.mendoza@enterprise.com"
              disabled={mode === 'view'}
              required
            />
          </div>

          {/* Contraseña (solo para crear y editar) */}
          {mode !== 'view' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña {mode === 'create' ? '*' : ''}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  required={mode === 'create'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  Confirmar Contraseña {mode === 'create' ? '*' : ''}
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                  placeholder="••••••••"
                  required={mode === 'create'}
                />
              </div>
            </div>
          )}

          {/* Teléfono y Posición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="3001234567"
                disabled={mode === 'view'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">
                <User className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Posición/Cargo
              </Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ej: Gerente General"
                disabled={mode === 'view'}
              />
            </div>
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="role_id">
              <Shield className="w-4 h-4 inline mr-2 text-muted-foreground" />
              Rol *
            </Label>
            <Select
              value={formData.role_id?.toString() || ''}
              onValueChange={(value) => handleInputChange('role_id', value ? parseInt(value) : '')}
              disabled={mode === 'view'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.role_id} value={role.role_id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado (solo para editar y ver) */}
          {mode !== 'create' && (
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={mode === 'view'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fecha de creación (solo para ver) */}
          {mode === 'view' && formData.created_at && (
            <div className="space-y-2">
              <Label htmlFor="created_at">
                <Calendar className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Fecha de Creación
              </Label>
              <Input
                id="created_at"
                type="text"
                value={new Date(formData.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                disabled
                className="bg-muted"
              />
            </div>
          )}
        </form>

        <DialogFooter>
          {mode !== 'view' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'
                )}
              </Button>
            </>
          )}

          {mode === 'view' && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsuarioModal;
