import { Loader2, FileText, User, Building, Calendar, DollarSign, Zap, Plus, Trash2, Sun, Cpu, Battery, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog';
import { Checkbox } from '@/ui/checkbox';

const CotizacionModal = ({
  show,
  mode, // 'create', 'edit', 'view'
  cotizacion,
  onSubmit,
  onClose,
  isSubmitting,
  quotationStatuses // New prop
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    client_id: '',
    user_id: '', // El vendedor que crea la cotización
    project_name: '',
    system_type: '',
    network_type: '',
    power_kwp: '',
    panel_id: '',
    panel_count: 0,
    inverter_id: '',
    inverter_count: 1, // Cantidad de inversores
    battery_id: '', // Nuevo campo para baterías en sistemas híbridos
    battery_count: 0, // Nuevo campo para cantidad de baterías
    requires_financing: false,
    // Porcentajes
    profit_percentage: 0.05, // 5%
    iva_profit_percentage: 0.19, // 19% IVA
    commercial_management_percentage: 0.03, // 3%
    administration_percentage: 0.08, // 8%
    contingency_percentage: 0.02, // 2%
    withholding_percentage: 0.035, // 3.5%
    // Valores fijos
    labor_cost_per_kw: 250000, // Mano de obra por kW
    procedures_cost: 7000000, // Trámites
    support_structure_cost_per_panel: 110000, // Estructura de soporte por panel
    electrical_material_cost_per_kw: 280000, // Material eléctrico por kW
    overhead_structure_value: 0, // Valor de sobre estructura (opcional)
    // Campos calculados (se llenarán después de guardar)
    subtotal: 0,
    profit: 0,
    profit_iva: 0,
    commercial_management: 0,
    administration: 0,
    contingency: 0,
    withholdings: 0,
    total_value: 0,
    subtotal2: 0,
    subtotal3: 0,
    status_id: 1, // Por defecto: Borrador
    // Productos y items (se generarán automáticamente)
    products: [],
    items: []
  });
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [panels, setPanels] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [loadingInverters, setLoadingInverters] = useState(false);
  const [loadingBatteries, setLoadingBatteries] = useState(false);
  const [errorClients, setErrorClients] = useState(null);
  const [errorPanels, setErrorPanels] = useState(null);
  const [errorInverters, setErrorInverters] = useState(null);
  const [errorBatteries, setErrorBatteries] = useState(null);

  // Función para formatear números como moneda colombiana
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Función para convertir string formateado a número
  const parseCurrency = (value) => {
    return parseFloat(value.replace(/[^\d]/g, '')) || 0;
  };

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      // Fetch Clients
      setLoadingClients(true);
      try {
        const response = await apiService.getClients();
        if (response.success) {
          setClients(response.data.clients || []);
        }
        else {
          setErrorClients(response.message || 'Error al cargar clientes.');
        }
      }
      catch (err) {
        setErrorClients(err.message || 'Error de conexión al cargar clientes.');
      }
      finally {
        setLoadingClients(false);
      }

      // Fetch Panels
      setLoadingPanels(true);
      try {
        const response = await apiService.getPanels();
        if (response.success) {
          setPanels(response.data.panels || []);
        }
        else {
          setErrorPanels(response.message || 'Error al cargar paneles.');
        }
      }
      catch (err) {
        setErrorPanels(err.message || 'Error de conexión al cargar paneles.');
      }
      finally {
        setLoadingPanels(false);
      }

      // Fetch Inverters
      setLoadingInverters(true);
      try {
        const response = await apiService.getInverters();
        if (response.success) {
          setInverters(response.data.inverters || []);
        }
        else {
          setErrorInverters(response.message || 'Error al cargar inversores.');
        }
      }
      catch (err) {
        setErrorInverters(err.message || 'Error de conexión al cargar inversores.');
      }
      finally {
        setLoadingInverters(false);
      }

      // Fetch Batteries
      setLoadingBatteries(true);
      try {
        const response = await apiService.getBatteries();
        if (response.success) {
          setBatteries(response.data.batteries || []);
        }
        else {
          setErrorBatteries(response.message || 'Error al cargar baterías.');
        }
      }
      catch (err) {
        setErrorBatteries(err.message || 'Error de conexión al cargar baterías.');
      }
      finally {
        setLoadingBatteries(false);
      }
    };

    if (show) {
      fetchMasterData();
    }
  }, [show]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && cotizacion) {
      setFormData({
        client_id: cotizacion.client_id,
        user_id: cotizacion.user_id,
        project_name: cotizacion.project_name,
        system_type: cotizacion.system_type,
        network_type: cotizacion.network_type || '',
        power_kwp: cotizacion.power_kwp,
        panel_id: cotizacion.panel_id || '',
        panel_count: cotizacion.panel_count,
        inverter_id: cotizacion.inverter_id || '',
        requires_financing: cotizacion.requires_financing,
        profit_percentage: cotizacion.profit_percentage || 0.05,
        iva_profit_percentage: cotizacion.iva_profit_percentage || 0.19,
        commercial_management_percentage: cotizacion.commercial_management_percentage || 0.03,
        administration_percentage: cotizacion.administration_percentage || 0.08,
        contingency_percentage: cotizacion.contingency_percentage || 0.02,
        withholding_percentage: cotizacion.withholding_percentage || 0.035,
        labor_cost_per_kw: cotizacion.labor_cost_per_kw || 250000,
        procedures_cost: cotizacion.procedures_cost || 7000000,
        support_structure_cost_per_panel: cotizacion.support_structure_cost_per_panel || 110000,
        electrical_material_cost_per_kw: cotizacion.electrical_material_cost_per_kw || 280000,
        overhead_structure_value: cotizacion.overhead_structure_value || 0,
        // Campos calculados
        subtotal: cotizacion.subtotal || 0,
        profit: cotizacion.profit || 0,
        profit_iva: cotizacion.profit_iva || 0,
        commercial_management: cotizacion.commercial_management || 0,
        administration: cotizacion.administration || 0,
        contingency: cotizacion.contingency || 0,
        withholdings: cotizacion.withholdings || 0,
        total_value: cotizacion.total_value || 0,
        subtotal2: cotizacion.subtotal2 || 0,
        subtotal3: cotizacion.subtotal3 || 0,
        status_id: cotizacion.status_id,
        // Productos y items
        products: cotizacion.products || [],
        items: cotizacion.items || []
      });
    }
    else if (mode === 'create') {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData({
        client_id: '',
        user_id: currentUser.id || '', // Usuario actual que crea la cotización
        project_name: '',
        system_type: '',
        network_type: '',
        power_kwp: '',
        panel_id: '',
        panel_count: 0,
        inverter_id: '',
        inverter_count: 1,
        battery_id: '',
        battery_count: 0,
        requires_financing: false,
        profit_percentage: 0.10,
        iva_profit_percentage: 0.19,
        commercial_management_percentage: 0.03,
        administration_percentage: 0.10,
        contingency_percentage: 0.05,
        withholding_percentage: 0.035,
        labor_cost_per_kw: 350000,
        procedures_cost: 7000000,
        support_structure_cost_per_panel: 110000,
        electrical_material_cost_per_kw: 345000,
        overhead_structure_value: 0,
        subtotal: 0,
        profit: 0,
        profit_iva: 0,
        commercial_management: 0,
        administration: 0,
        contingency: 0,
        withholdings: 0,
        total_value: 0,
        subtotal2: 0,
        subtotal3: 0,
        status_id: 1,
        products: [],
        items: []
      });
    }
    else if (mode === 'create') {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData({
        client_id: '',
        user_id: currentUser.id || '', // Usuario actual que crea la cotización
        project_name: '',
        system_type: '',
        network_type: '',
        power_kwp: '',
        panel_id: '',
        panel_count: 0,
        inverter_id: '',
        inverter_count: 1,
        battery_id: '',
        battery_count: 0,
        requires_financing: false,
        profit_percentage: 0.05,
        iva_profit_percentage: 0.19,
        commercial_management_percentage: 0.03,
        administration_percentage: 0.08,
        contingency_percentage: 0.02,
        withholding_percentage: 0.035,
        labor_cost_per_kw: 250000,
        procedures_cost: 7000000,
        support_structure_cost_per_panel: 110000,
        electrical_material_cost_per_kw: 280000,
        overhead_structure_value: 0,
        subtotal: 0,
        profit: 0,
        profit_iva: 0,
        commercial_management: 0,
        administration: 0,
        contingency: 0,
        withholdings: 0,
        total_value: 0,
        subtotal2: 0,
        subtotal3: 0,
        status_id: 1,
        products: [],
        items: []
      });
    }
  }, [show, mode, cotizacion]);

  // Verificar si el modal debe mostrarse
  if (!show) return null;

  const titles = {
    create: '➕ Nueva Cotización',
    edit: '✏️ Editar Cotización',
    view: '👁️ Detalles de la Cotización'
  };

  // Filter inverters based on selected system type and network type
  const inversoresFiltrados = inverters.filter(inversor => {
    const cumpleSistema = !formData.system_type || inversor.system_type === formData.system_type;
    const cumpleRed = !formData.network_type || inversor.grid_type === formData.network_type;
    return cumpleSistema && cumpleRed;
  });


  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      };

      // Si cambia la potencia del sistema o el panel seleccionado, recalcular la cantidad de paneles
      if (field === 'power_kwp' || field === 'panel_id') {
        const newPower = field === 'power_kwp' ? value : prev.power_kwp;
        const newPanelId = field === 'panel_id' ? value : prev.panel_id;

        if (newPower && newPanelId) {
          const selectedPanel = panels.find(p => p.panel_id == newPanelId);
          if (selectedPanel && selectedPanel.power_output > 0) {
            // Calcular número de paneles: potencia total (en W) / potencia unitaria del panel (en W), redondeando hacia arriba
            const potenciaTotalW = parseFloat(newPower) * 1000;
            const panelesNecesarios = Math.ceil(potenciaTotalW / selectedPanel.power_output);
            updatedData.panel_count = panelesNecesarios;
          }
        }
      }

      return updatedData;
    });

    // Manejar búsqueda de clientes
    if (field === 'client_name') {
      if (value.length > 0) {
        const filtered = clients.filter(client => 
          client.name.toLowerCase().includes(value.toLowerCase()) ||
          client.email.toLowerCase().includes(value.toLowerCase()) ||
          client.type.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClients(filtered);
        setShowClientDropdown(true);
      } else {
        setShowClientDropdown(false);
        setFilteredClients([]);
      }
    }
  };

  // Función específica para manejar cambios en campos de moneda
  const handleCurrencyChange = (field, value) => {
    const numericValue = parseCurrency(value);
    handleInputChange(field, numericValue);
  };

  const handleClientSelect = (client) => {
    setFormData(prev => ({
      ...prev,
      client_name: client.name,
      client_id: client.client_id
    }));
    setShowClientDropdown(false);
    setFilteredClients([]);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.client_id && formData.project_name && formData.power_kwp && 
               formData.system_type && formData.network_type && formData.panel_id && 
               formData.inverter_id && formData.panel_count > 0;
      default:
        return true;
    }
  };

  // Funciones para manejar productos e items
  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Obtener la potencia del panel seleccionado
  const getSelectedPanelPower = () => {
    if (formData.panel_id) {
      const panel = panels.find(p => p.panel_id == formData.panel_id);
      if (panel) {
        return panel.power_output; // Potencia en vatios
      }
    }
    return 0;
  };

  // Calcular número de paneles basado en potencia y panel seleccionado
  const calcularPaneles = () => {
    if (formData.power_kwp && formData.panel_id) {
      const panel = panels.find(p => p.panel_id == formData.panel_id);
      if (panel) {
        const potenciaTotalW = parseFloat(formData.power_kwp) * 1000;
        return Math.ceil(potenciaTotalW / panel.power_output); // Using power_output field for panel wattage
      }
    }
    return 0;
  };

  // Función para transformar los datos antes de enviarlos
  const transformFormData = (data) => {
    // Crear array de productos basado en paneles, inversores y baterías
    const products = [];

    // Agregar panel al array de productos
    if (data.panel_id) {
      const selectedPanel = panels.find(p => p.panel_id == data.panel_id);
      if (selectedPanel) {
        products.push({
          product_type: 'panel',
          product_id: parseInt(data.panel_id),
          brand: selectedPanel.brand,
          model: selectedPanel.model,
          quantity: data.panel_count,
          unit_price: selectedPanel.price || 0,
          profit_percentage: 0.35  // 35% como especificaste
        });
      }
    }

    // Agregar inversor al array de productos
    if (data.inverter_id) {
      const selectedInverter = inverters.find(i => i.inverter_id == data.inverter_id);
      if (selectedInverter) {
        products.push({
          product_type: 'inverter',
          product_id: parseInt(data.inverter_id),
          brand: selectedInverter.brand,
          model: selectedInverter.model,
          quantity: data.inverter_count,
          unit_price: selectedInverter.price || 0,
          profit_percentage: 0.35  // 35% como especificaste
        });
      }
    }

    // Agregar batería al array de productos si es un sistema híbrido
    if (data.system_type === 'hibrido' && data.battery_id && data.battery_count > 0) {
      const selectedBattery = batteries.find(b => b.battery_id == data.battery_id);
      if (selectedBattery) {
        products.push({
          product_type: 'battery',
          product_id: parseInt(data.battery_id),
          brand: selectedBattery.brand,
          model: selectedBattery.model,
          quantity: data.battery_count,
          unit_price: selectedBattery.price || 0,
          profit_percentage: 0.35  // 35% como especificaste
        });
      }
    }

    // Crear array de items basado en la sección "Valores del Sistema"
    const items = [];

    // Mano de obra (cantidad por kW instalado)
    items.push({
      description: 'Mano de obra instalación',
      item_type: 'mano_obra',
      quantity: parseFloat(data.power_kwp) || 0,
      unit: 'kW',
      unit_price: data.labor_cost_per_kw || 0,
      profit_percentage: 0.35  // 35% como especificaste
    });

    // Material eléctrico (cantidad por kW instalado)
    items.push({
      description: 'Material eléctrico',
      item_type: 'material',
      quantity: parseFloat(data.power_kwp) || 0,
      unit: 'kW',
      unit_price: data.electrical_material_cost_per_kw || 0,
      profit_percentage: 0.35  // 35% como especificaste
    });

    // Estructura de soporte (cantidad por número de paneles)
    items.push({
      description: 'Estructura de soporte para paneles solares',
      item_type: 'material',
      quantity: data.panel_count || 0,
      unit: 'panel',
      unit_price: data.support_structure_cost_per_panel || 0,
      profit_percentage: 0.35  // 35% como especificaste
    });

    // Trámites (cantidad es 1)
    items.push({
      description: 'Trámites y permisos',
      item_type: 'servicio',
      quantity: 1,
      unit: 'trámite',
      unit_price: data.procedures_cost || 0,
      profit_percentage: 0.05  // 5% como especificaste para trámites
    });

    // Mapear tipo de sistema a la versión con la capitalización correcta
    const mapSystemType = (type) => {
      switch(type) {
        case 'on-grid':
          return 'On-grid';
        case 'off-grid':
          return 'Off-grid';
        case 'hibrido':
          return 'Híbrido';
        default:
          return type;
      }
    };

    // Retornar solo los datos específicamente requeridos
    return {
      client_id: data.client_id,
      user_id: data.user_id,
      project_name: data.project_name,
      system_type: mapSystemType(data.system_type),
      grid_type: data.network_type,
      power_kwp: parseFloat(data.power_kwp) || 0,
      panel_count: parseInt(data.panel_count) || 0,
      requires_financing: data.requires_financing || false,
      profit_percentage: parseFloat(data.profit_percentage) || 0,
      iva_profit_percentage: parseFloat(data.iva_profit_percentage) || 0,
      commercial_management_percentage: parseFloat(data.commercial_management_percentage) || 0,
      administration_percentage: parseFloat(data.administration_percentage) || 0,
      contingency_percentage: parseFloat(data.contingency_percentage) || 0,
      withholding_percentage: parseFloat(data.withholding_percentage) || 0,
      products,
      items
    };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Información Básica</h3>

              <div className="space-y-4">
                {/* Cliente - Ancho completo */}
                <div>
                  <Label htmlFor="client_id">Cliente *</Label>
                  <Select
                    value={formData.client_id?.toString() || ''}
                    onValueChange={(value) => handleInputChange('client_id', value ? parseInt(value) : '')}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.client_id} value={client.client_id.toString()}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Proyecto - Ancho completo */}
                <div>
                  <Label htmlFor="project_name">Nombre del Proyecto *</Label>
                  <Input
                    id="project_name"
                    type="text"
                    value={formData.project_name}
                    onChange={(e) => handleInputChange('project_name', e.target.value)}
                    placeholder="Nombre del proyecto"
                    required
                  />
                </div>

                {/* Potencia del Sistema - Ancho completo */}
                <div>
                  <Label htmlFor="power_kwp">Potencia del Sistema (kWp) *</Label>
                  <Input
                    id="power_kwp"
                    type="number"
                    value={formData.power_kwp}
                    onChange={(e) => handleInputChange('power_kwp', e.target.value)}
                    placeholder="Potencia del sistema en kWp"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Tipo de Sistema y Tipo de Red - 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="system_type">Tipo de Sistema *</Label>
                    <Select
                      value={formData.system_type}
                      onValueChange={(value) => handleInputChange('system_type', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione el tipo de sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-grid">On-grid</SelectItem>
                        <SelectItem value="off-grid">Off-grid</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="network_type">Tipo de Red *</Label>
                    <Select
                      value={formData.network_type}
                      onValueChange={(value) => handleInputChange('network_type', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione el tipo de red" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monofasico">Monofásico</SelectItem>
                        <SelectItem value="bifasico">Bifásico</SelectItem>
                        <SelectItem value="trifasico 220v">Trifásico 220V</SelectItem>
                        <SelectItem value="trifasico 440v">Trifásico 440V</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Panel e Inversor - 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="panel_id">Panel Solar *</Label>
                    <Select
                      value={formData.panel_id?.toString() || ''}
                      onValueChange={(value) => handleInputChange('panel_id', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione un panel" />
                      </SelectTrigger>
                      <SelectContent>
                        {panels.map(panel => (
                          <SelectItem key={panel.panel_id} value={panel.panel_id.toString()}>
                            {panel.brand} - {panel.model} ({panel.power_output} W)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="inverter_id">Inversor *</Label>
                    <Select
                      value={formData.inverter_id?.toString() || ''}
                      onValueChange={(value) => handleInputChange('inverter_id', value)}
                      disabled={!formData.system_type || !formData.network_type}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione un inversor" />
                      </SelectTrigger>
                      <SelectContent>
                        {inversoresFiltrados.map(inverter => (
                          <SelectItem key={inverter.inverter_id} value={inverter.inverter_id.toString()}>
                            {inverter.name} - {inverter.model} ({inverter.power_output_kw} kW)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Número de paneles e inversores - 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="panel_count">Número de Paneles *</Label>
                    <Input
                      id="panel_count"
                      type="number"
                      value={formData.panel_count}
                      min="1"
                      className="bg-muted"
                      required
                      readOnly
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Calculado automáticamente: {formData.power_kwp || 0}kW / {getSelectedPanelPower() || 0}W ≈ {formData.panel_count || 0} paneles
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="inverter_count">Cantidad de Inversores *</Label>
                    <Input
                      id="inverter_count"
                      type="number"
                      value={formData.inverter_count}
                      onChange={(e) => handleInputChange('inverter_count', parseInt(e.target.value) || 1)}
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Sección de baterías - Solo para sistemas híbridos */}
                {formData.system_type === 'hibrido' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="battery_id">Batería</Label>
                      <Select
                        value={formData.battery_id?.toString() || ''}
                        onValueChange={(value) => handleInputChange('battery_id', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccione una batería" />
                        </SelectTrigger>
                        <SelectContent>
                          {batteries.map(battery => (
                            <SelectItem key={battery.battery_id} value={battery.battery_id.toString()}>
                              {battery.brand} - {battery.model} ({battery.capacity} kWh)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="battery_count">Cantidad de Baterías</Label>
                      <Input
                        id="battery_count"
                        type="number"
                        value={formData.battery_count}
                        onChange={(e) => handleInputChange('battery_count', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                )}

                {/* Financiamiento */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_financing"
                    checked={formData.requires_financing}
                    onCheckedChange={(checked) => handleInputChange('requires_financing', checked)}
                  />
                  <Label htmlFor="requires_financing">Requiere Financiamiento</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Porcentajes de cálculo */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Porcentajes de Cálculo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="profit_percentage">% Utilidad</Label>
                  <Input
                    id="profit_percentage"
                    type="number"
                    value={formData.profit_percentage * 100}
                    onChange={(e) => handleInputChange('profit_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="iva_profit_percentage">% IVA sobre Utilidad</Label>
                  <Input
                    id="iva_profit_percentage"
                    type="number"
                    value={formData.iva_profit_percentage * 100}
                    onChange={(e) => handleInputChange('iva_profit_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="commercial_management_percentage">% Gestión Comercial</Label>
                  <Input
                    id="commercial_management_percentage"
                    type="number"
                    value={formData.commercial_management_percentage * 100}
                    onChange={(e) => handleInputChange('commercial_management_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="administration_percentage">% Administración</Label>
                  <Input
                    id="administration_percentage"
                    type="number"
                    value={formData.administration_percentage * 100}
                    onChange={(e) => handleInputChange('administration_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="contingency_percentage">% Contingencia</Label>
                  <Input
                    id="contingency_percentage"
                    type="number"
                    value={formData.contingency_percentage * 100}
                    onChange={(e) => handleInputChange('contingency_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="withholding_percentage">% Retenciones</Label>
                  <Input
                    id="withholding_percentage"
                    type="number"
                    value={parseFloat((formData.withholding_percentage * 100).toFixed(1))}
                    onChange={(e) => handleInputChange('withholding_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Valores del Sistema */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Valores del Sistema</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mano de obra */}
                <div className="bg-muted p-4 rounded-lg">
                  <Label htmlFor="labor_cost_per_kw" className="text-sm">
                    Mano de obra (* kW a instalar)
                  </Label>
                  <Input
                    id="labor_cost_per_kw"
                    type="number"
                    value={formData.labor_cost_per_kw}
                    onChange={(e) => handleInputChange('labor_cost_per_kw', parseFloat(e.target.value) || 0)}
                    placeholder="Ingrese el costo por kW"
                    min="0"
                  />
                  <div className="mt-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium ml-2">
                      {formData.power_kwp ? formatCurrency(formData.labor_cost_per_kw * parseFloat(formData.power_kwp)) : formatCurrency(0)}
                    </span>
                  </div>
                </div>

                {/* Trámites */}
                <div className="bg-muted p-4 rounded-lg">
                  <Label htmlFor="procedures_cost" className="text-sm">
                    Trámites
                  </Label>
                  <Input
                    id="procedures_cost"
                    type="number"
                    value={formData.procedures_cost}
                    onChange={(e) => handleInputChange('procedures_cost', parseFloat(e.target.value) || 0)}
                    placeholder="Ingrese el costo de trámites"
                    min="0"
                  />
                </div>

                {/* Estructura de soporte */}
                <div className="bg-muted p-4 rounded-lg">
                  <Label htmlFor="support_structure_cost_per_panel" className="text-sm">
                    Estructura de soporte (* número de paneles)
                  </Label>
                  <Input
                    id="support_structure_cost_per_panel"
                    type="number"
                    value={formData.support_structure_cost_per_panel}
                    onChange={(e) => handleInputChange('support_structure_cost_per_panel', parseFloat(e.target.value) || 0)}
                    placeholder="Ingrese el costo por panel"
                    min="0"
                  />
                  <div className="mt-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium ml-2">
                      {formData.panel_count ? formatCurrency(formData.support_structure_cost_per_panel * formData.panel_count) : formatCurrency(0)}
                    </span>
                  </div>
                </div>

                {/* Material eléctrico */}
                <div className="bg-muted p-4 rounded-lg">
                  <Label htmlFor="electrical_material_cost_per_kw" className="text-sm">
                    Material eléctrico (* kW a instalar)
                  </Label>
                  <Input
                    id="electrical_material_cost_per_kw"
                    type="number"
                    value={formData.electrical_material_cost_per_kw}
                    onChange={(e) => handleInputChange('electrical_material_cost_per_kw', parseFloat(e.target.value) || 0)}
                    placeholder="Ingrese el costo por kW"
                    min="0"
                  />
                  <div className="mt-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium ml-2">
                      {formData.power_kwp ? formatCurrency(formData.electrical_material_cost_per_kw * parseFloat(formData.power_kwp)) : formatCurrency(0)}
                    </span>
                  </div>
                </div>

                {/* Valor de sobre estructura */}
                <div className="md:col-span-2">
                  <Label htmlFor="overhead_structure_value" className="text-sm">
                    Valor de sobre estructura (opcional)
                  </Label>
                  <Input
                    id="overhead_structure_value"
                    type="number"
                    value={formData.overhead_structure_value}
                    onChange={(e) => handleInputChange('overhead_structure_value', parseFloat(e.target.value) || 0)}
                    placeholder="Ingrese el valor de sobre estructura"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>
            Complete la información requerida para {mode === 'create' ? 'crear' : mode === 'edit' ? 'editar' : 'ver'} la cotización.
          </DialogDescription>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step < currentStep
                    ? 'bg-muted text-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 2 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 2) {
            const transformedData = transformFormData(formData);
            onSubmit(transformedData);
          }
        }} className="space-y-6">
          {renderStepContent()}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevStep}
          >
            {currentStep === 1 ? 'Cancelar' : 'Volver'}
          </Button>

          {currentStep < 2 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!canProceedToNextStep()}
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                if (currentStep === 2) {
                  const transformedData = transformFormData(formData);
                  onSubmit(transformedData);
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Guardar Cotización'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CotizacionModal;
