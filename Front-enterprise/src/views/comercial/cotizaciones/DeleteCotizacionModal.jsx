import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';

const DeleteCotizacionModal = ({ isOpen, onClose, selectedCotizacion, onConfirm }) => {
  if (!isOpen || !selectedCotizacion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-red-600">Eliminar Cotización</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              ¿Está seguro de que desea eliminar la cotización "{selectedCotizacion.project_name}"?
              Esta acción no se puede deshacer.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Proyecto:</strong> {selectedCotizacion.project_name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Sistema:</strong> {selectedCotizacion.system_type}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Potencia:</strong> {selectedCotizacion.power_kwp} kWp
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Cotización
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteCotizacionModal;