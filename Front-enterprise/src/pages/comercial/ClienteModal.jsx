import { useEffect, useState } from 'react';
import {
  Building,
  Home,
  Mail,
  Phone,
  User,
  Loader2
} from 'lucide-react';
import { getDepartments, getCitiesByDepartment } from '../../services/locationService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Textarea } from '@/ui/textarea';
import { Checkbox } from '@/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog';

const ClienteModal = ({ show, mode, formData, onFormChange, onSubmit, onClose, isSubmitting, users }) => {
  const { user: loggedInUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Asegurar que formData tenga valores por defecto si es undefined
  const safeFormData = formData || {
    name: '',
    client_type: 'residencial',
    email: '',
    phone: '',
    nic: '',
    responsible_user_id: '',
    department_id: '',
    city_id: '',
    address: '',
    monthly_consumption: '',
    tarifa: '',
    notes: '',
    is_active: true
  };

  useEffect(() => {
    if (show) {
      const fetchDepartments = async () => {
        setLoadingDepartments(true);
        try {
          const response = await getDepartments();
          if (response.success) {
            const uniqueDepartments = Array.from(new Map(response.data.map(dep => [dep.department_id, dep])).values());
            setDepartments(uniqueDepartments);
          } else {
            console.error('Error al obtener departamentos:', response.message);
          }
        } catch (error) {
          console.error('Error en fetchDepartments:', error);
        } finally {
          setLoadingDepartments(false);
        }
      };
      fetchDepartments();
    }
  }, [show]);

  useEffect(() => {
    if (safeFormData.department_id) {
      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          const response = await getCitiesByDepartment(safeFormData.department_id);
          if (response.success) {
            const uniqueCities = Array.from(new Map(response.data.map(city => [city.city_id, city])).values());
            setCities(uniqueCities);
          } else {
            console.error('Error al obtener ciudades:', response.message);
          }
        } catch (error) {
          console.error('Error en fetchCities:', error);
        } finally {
          setLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [safeFormData.department_id]);

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const titles = {
    create: 'Nuevo Cliente',
    edit: 'Editar Cliente'
  };

  const descriptions = {
    create: 'Complete la información para registrar un nuevo cliente en el sistema.',
    edit: 'Modifique la información del cliente según sea necesario.'
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>{descriptions[mode]}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del Cliente */}
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Nombre del Cliente *
              </Label>
              <Input
                id="name"
                type="text"
                value={safeFormData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            {/* Tipo de Cliente */}
            <div className="space-y-2">
              <Label htmlFor="client_type">
                <Building className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Tipo de Cliente
              </Label>
              <Select
                value={safeFormData.client_type}
                onValueChange={(value) => handleInputChange('client_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
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
                value={safeFormData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="juan.perez@example.com"
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                value={safeFormData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="300 123 4567"
              />
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="department_id">
                <Home className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Departamento
              </Label>
              <Select
                value={safeFormData.department_id?.toString() || ''}
                onValueChange={(value) => handleInputChange('department_id', value)}
                disabled={loadingDepartments}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingDepartments ? 'Cargando...' : 'Seleccione un departamento'} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dep => (
                    <SelectItem key={dep.department_id} value={dep.department_id.toString()}>
                      {dep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <Label htmlFor="city_id">
                <Building className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Ciudad
              </Label>
              <Select
                value={safeFormData.city_id?.toString() || ''}
                onValueChange={(value) => handleInputChange('city_id', value)}
                disabled={!safeFormData.department_id || loadingCities}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCities ? 'Cargando...' : 'Seleccione una ciudad'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.city_id} value={city.city_id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">
                <Home className="w-4 h-4 inline mr-2 text-muted-foreground" />
                Dirección
              </Label>
              <Input
                id="address"
                type="text"
                value={safeFormData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Calle 123 # 45 - 67"
              />
            </div>

            {/* NIC */}
            <div className="space-y-2">
              <Label htmlFor="nic">
                NIC (Número de Identificación de Contrato)
              </Label>
              <Input
                id="nic"
                type="text"
                value={safeFormData.nic}
                onChange={(e) => handleInputChange('nic', e.target.value)}
                placeholder="1234567"
              />
            </div>

            {/* Consumo Mensual */}
            <div className="space-y-2">
              <Label htmlFor="monthly_consumption">
                Consumo Mensual (kW/h)
              </Label>
              <Input
                id="monthly_consumption"
                type="number"
                value={safeFormData.monthly_consumption}
                onChange={(e) => handleInputChange('monthly_consumption', e.target.value)}
                placeholder="500"
                min="0"
              />
            </div>

            {/* Tarifa */}
            <div className="space-y-2">
              <Label htmlFor="tarifa">
                Tarifa ($)
              </Label>
              <Input
                id="tarifa"
                type="number"
                step="0.01"
                value={safeFormData.tarifa}
                onChange={(e) => handleInputChange('tarifa', e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>

            {/* Campo oculto para usuario logueado */}
            <input
              type="hidden"
              value={loggedInUser?.id || ''}
            />

            {/* Notas */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="notes">
                Notas
              </Label>
              <Textarea
                id="notes"
                value={safeFormData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Información adicional sobre el cliente..."
              />
            </div>

            {/* Cliente activo */}
            <div className="md:col-span-2 flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={safeFormData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active" className="text-sm font-medium">
                Cliente activo
              </Label>
            </div>
          </div>
        </form>

        <DialogFooter>
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
                Guardando...
              </>
            ) : (
              mode === 'create' ? 'Crear Cliente' : 'Actualizar Cliente'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteModal;
