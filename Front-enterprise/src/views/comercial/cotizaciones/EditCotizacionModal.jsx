import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const EditCotizacionModal = ({ isOpen, onClose, selectedCotizacion, setMensajes, fetchCotizaciones, user }) => {
  const [formData, setFormData] = useState({
    project_name: '',
    system_type: '',
    power_kwp: '',
    panel_count: '',
    requires_financing: false,
    profit_percentage: 0.15,
    legalization_cost: 2500000
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedCotizacion) {
      setFormData({
        project_name: selectedCotizacion.project_name || '',
        system_type: selectedCotizacion.system_type || '',
        power_kwp: selectedCotizacion.power_kwp?.toString() || '',
        panel_count: selectedCotizacion.panel_count?.toString() || '',
        requires_financing: selectedCotizacion.requires_financing || false,
        profit_percentage: selectedCotizacion.profit_percentage || 0.15,
        legalization_cost: selectedCotizacion.legalization_cost || 2500000
      });
    }
  }, [isOpen, selectedCotizacion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch(`/api/quotations/${selectedCotizacion.quotation_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMensajes([{ contenido: 'Cotización actualizada exitosamente', tipo: 'success' }]);
        await fetchCotizaciones();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar cotización');
      }
    } catch (error) {
      setMensajes([{ contenido: error.message, tipo: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !selectedCotizacion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Editar Cotización</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_name">Nombre del Proyecto</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="system_type">Tipo de Sistema</Label>
                <Select
                  value={formData.system_type}
                  onValueChange={(value) => setFormData({...formData, system_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interconectado">Interconectado</SelectItem>
                    <SelectItem value="Aislado">Aislado</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="power_kwp">Potencia (kWp)</Label>
                <Input
                  id="power_kwp"
                  type="number"
                  step="0.1"
                  value={formData.power_kwp}
                  onChange={(e) => setFormData({...formData, power_kwp: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="panel_count">Cantidad de Paneles</Label>
                <Input
                  id="panel_count"
                  type="number"
                  value={formData.panel_count}
                  onChange={(e) => setFormData({...formData, panel_count: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="profit_percentage">Porcentaje de Ganancia</Label>
                <Input
                  id="profit_percentage"
                  type="number"
                  step="0.01"
                  value={formData.profit_percentage}
                  onChange={(e) => setFormData({...formData, profit_percentage: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="legalization_cost">Costo de Legalización</Label>
                <Input
                  id="legalization_cost"
                  type="number"
                  value={formData.legalization_cost}
                  onChange={(e) => setFormData({...formData, legalization_cost: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requires_financing"
                checked={formData.requires_financing}
                onChange={(e) => setFormData({...formData, requires_financing: e.target.checked})}
              />
              <Label htmlFor="requires_financing">Requiere Financiamiento</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Actualizando...' : 'Actualizar Cotización'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCotizacionModal;