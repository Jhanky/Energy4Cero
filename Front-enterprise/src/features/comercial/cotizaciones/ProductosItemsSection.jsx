import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Wrench } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const ProductosItemsSection = ({ 
  formData, 
  setFormData, 
  panels = [], 
  inverters = [], 
  batteries = [] 
}) => {
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

  // Agregar producto
  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product_type: 'panel',
          product_id: '',
          quantity: 1,
          unit_price: 0,
          profit_percentage: 0.05
        }
      ]
    }));
  };

  // Actualizar producto
  const updateProduct = (index, field, value) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: field === 'unit_price' || field === 'profit_percentage' ? 
          (field === 'unit_price' ? parseCurrency(value) : parseFloat(value)) : 
          value
      };

      // Calcular valores automáticamente
      const product = updatedProducts[index];
      if (product.quantity && product.unit_price) {
        const partialValue = product.quantity * product.unit_price;
        const profit = partialValue * product.profit_percentage;
        const totalValue = partialValue + profit;
        
        updatedProducts[index] = {
          ...updatedProducts[index],
          partial_value: partialValue,
          profit: profit,
          total_value: totalValue
        };
      }

      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  // Eliminar producto
  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  // Agregar item complementario
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          item_type: 'material',
          quantity: 1,
          unit: 'unidad',
          unit_price: 0,
          profit_percentage: 0.05
        }
      ]
    }));
  };

  // Actualizar item
  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'unit_price' || field === 'profit_percentage' || field === 'quantity' ? 
          (field === 'unit_price' || field === 'quantity' ? parseCurrency(value) : parseFloat(value)) : 
          value
      };

      // Calcular valores automáticamente
      const item = updatedItems[index];
      if (item.quantity && item.unit_price) {
        const partialValue = item.quantity * item.unit_price;
        const profit = partialValue * item.profit_percentage;
        const totalValue = partialValue + profit;
        
        updatedItems[index] = {
          ...updatedItems[index],
          partial_value: partialValue,
          profit: profit,
          total_value: totalValue
        };
      }

      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  // Eliminar item
  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Obtener nombre del producto basado en tipo e ID
  const getProductName = (productType, productId) => {
    switch (productType) {
      case 'panel':
        const panel = panels.find(p => p.panel_id == productId);
        return panel ? `${panel.brand} - ${panel.model}` : '';
      case 'inverter':
        const inverter = inverters.find(i => i.inverter_id == productId);
        return inverter ? `${inverter.name} - ${inverter.model}` : '';
      case 'battery':
        const battery = batteries.find(b => b.battery_id == productId);
        return battery ? `${battery.name} - ${battery.model}` : '';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Sección de Productos (Panel e Inversor) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos (Panel e Inversor)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.products.map((product, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-3">
                  <Label>Tipo de Producto</Label>
                  <Select
                    value={product.product_type}
                    onValueChange={(value) => updateProduct(index, 'product_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="panel">Panel Solar</SelectItem>
                      <SelectItem value="inverter">Inversor</SelectItem>
                      <SelectItem value="battery">Batería</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3">
                  <Label>Producto</Label>
                  <Select
                    value={product.product_id}
                    onValueChange={(value) => updateProduct(index, 'product_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.product_type === 'panel' && panels.map(panel => (
                        <SelectItem key={panel.panel_id} value={panel.panel_id.toString()}>
                          {panel.brand} - {panel.model} ({panel.power_output} W)
                        </SelectItem>
                      ))}
                      {product.product_type === 'inverter' && inverters.map(inverter => (
                        <SelectItem key={inverter.inverter_id} value={inverter.inverter_id.toString()}>
                          {inverter.name} - {inverter.model} ({inverter.power_output_kw} kW)
                        </SelectItem>
                      ))}
                      {product.product_type === 'battery' && batteries.map(battery => (
                        <SelectItem key={battery.battery_id} value={battery.battery_id.toString()}>
                          {battery.name} - {battery.model} ({battery.nominal_voltage} V)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Precio Unitario</Label>
                  <Input
                    type="text"
                    value={formatCurrency(product.unit_price)}
                    onChange={(e) => updateProduct(index, 'unit_price', e.target.value)}
                  />
                </div>

                <div className="md:col-span-1">
                  <Label>% Utilidad</Label>
                  <Input
                    type="number"
                    value={product.profit_percentage * 100}
                    onChange={(e) => updateProduct(index, 'profit_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                  />
                </div>

                <div className="md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Valores calculados (solo para visualización) */}
                <div className="md:col-span-12 grid grid-cols-3 gap-4 pt-2 border-t">
                  <div>
                    <Label>Valor Parcial</Label>
                    <div className="font-medium">
                      {formatCurrency(product.partial_value || 0)}
                    </div>
                  </div>
                  <div>
                    <Label>Utilidad</Label>
                    <div className="font-medium">
                      {formatCurrency(product.profit || 0)}
                    </div>
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="font-medium">
                      {formatCurrency(product.total_value || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={addProduct}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sección de Items Complementarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Items Complementarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-3">
                  <Label>Descripción</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Descripción del item"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Tipo</Label>
                  <Select
                    value={item.item_type}
                    onValueChange={(value) => updateItem(index, 'item_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="mano_obra">Mano de Obra</SelectItem>
                      <SelectItem value="servicio">Servicio</SelectItem>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0.01"
                  />
                </div>

                <div className="md:col-span-1">
                  <Label>Unidad</Label>
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    placeholder="unidad"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Precio Unitario</Label>
                  <Input
                    type="text"
                    value={formatCurrency(item.unit_price)}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                  />
                </div>

                <div className="md:col-span-1">
                  <Label>% Utilidad</Label>
                  <Input
                    type="number"
                    value={item.profit_percentage * 100}
                    onChange={(e) => updateItem(index, 'profit_percentage', parseFloat(e.target.value)/100 || 0)}
                    step="0.1"
                    min="0"
                  />
                </div>

                <div className="md:col-span-1">
                  <Label>Total</Label>
                  <div className="font-medium pt-2">
                    {formatCurrency(item.total_value || 0)}
                  </div>
                </div>

                <div className="md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={addItem}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Item Complementario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductosItemsSection;
