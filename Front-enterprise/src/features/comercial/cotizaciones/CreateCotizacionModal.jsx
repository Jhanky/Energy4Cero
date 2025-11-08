import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ProductosItemsSection } from './index';

const CreateCotizacionModal = ({ isOpen, onClose, user, setMensajes, fetchCotizaciones }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    user_id: user?.id || '',
    project_name: '',
    system_type: '',
    power_kwp: '',
    panel_count: '',
    requires_financing: false,
    profit_percentage: 0.15,
    iva_profit_percentage: 0.19,
    commercial_management_percentage: 0.05,
    administration_percentage: 0.03,
    contingency_percentage: 0.02,
    withholding_percentage: 0.025,
    legalization_cost: 2500000,
    legalization_cost_percentage: 0.25,
    products: [],
    items: []
  });

  const [clients, setClients] = useState([]);
  const [panels, setPanels] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar clientes
      const clientsResponse = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const clientsData = await clientsResponse.json();
      setClients(clientsData.data?.data || []);

      // Cargar paneles
      const panelsResponse = await fetch('/api/panels', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const panelsData = await panelsResponse.json();
      setPanels(panelsData.data?.data || []);

      // Cargar inversores
      const invertersResponse = await fetch('/api/inverters', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const invertersData = await invertersResponse.json();
      setInverters(invertersData.data?.data || []);

      // Cargar baterías
      const batteriesResponse = await fetch('/api/batteries', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const batteriesData = await batteriesResponse.json();
      setBatteries(batteriesData.data?.data || []);

    } catch (error) {
      
      setMensajes([{ contenido: 'Error al cargar datos', tipo: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar user_id cuando el usuario cambie
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        user_id: user.id
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMensajes([{ contenido: 'Cotización creada exitosamente', tipo: 'success' }]);
        await fetchCotizaciones();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear cotización');
      }
    } catch (error) {
      setMensajes([{ contenido: error.message, tipo: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nueva Cotización</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Paso 1: Información Básica */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_id">Cliente *</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => setFormData({...formData, client_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.client_id} value={client.client_id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project_name">Nombre del Proyecto *</Label>
                    <Input
                      id="project_name"
                      value={formData.project_name}
                      onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                      placeholder="Ingrese el nombre del proyecto"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="system_type">Tipo de Sistema *</Label>
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
                    <Label htmlFor="power_kwp">Potencia (kWp) *</Label>
                    <Input
                      id="power_kwp"
                      type="number"
                      step="0.1"
                      value={formData.power_kwp}
                      onChange={(e) => setFormData({...formData, power_kwp: e.target.value})}
                      placeholder="Ej: 5.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="panel_count">Cantidad de Paneles *</Label>
                    <Input
                      id="panel_count"
                      type="number"
                      value={formData.panel_count}
                      onChange={(e) => setFormData({...formData, panel_count: e.target.value})}
                      placeholder="Ej: 12"
                      required
                    />
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
                </div>
              </div>
            )}

            {/* Paso 2: Configuración de Costos */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración de Costos</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profit_percentage">Porcentaje de Ganancia</Label>
                    <Input
                      id="profit_percentage"
                      type="number"
                      step="0.01"
                      value={formData.profit_percentage}
                      onChange={(e) => setFormData({...formData, profit_percentage: parseFloat(e.target.value)})}
                      placeholder="0.15"
                    />
                  </div>

                  <div>
                    <Label htmlFor="legalization_cost">Costo de Legalización</Label>
                    <Input
                      id="legalization_cost"
                      type="number"
                      value={formData.legalization_cost}
                      onChange={(e) => setFormData({...formData, legalization_cost: parseInt(e.target.value)})}
                      placeholder="2500000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Productos e Items Complementarios */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Productos e Items Complementarios</h3>
                <ProductosItemsSection 
                  formData={formData} 
                  setFormData={setFormData} 
                  panels={panels}
                  inverters={inverters}
                  batteries={batteries}
                />
              </div>
            )}

            {/* Navegación */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              >
                {step > 1 ? 'Anterior' : 'Cancelar'}
              </Button>
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && (!formData.client_id || !formData.project_name || !formData.system_type)}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Creando...' : 'Crear Cotización'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCotizacionModal;
