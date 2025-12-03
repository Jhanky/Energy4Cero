import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { UploadCloud, FileText, ExternalLink } from 'lucide-react';

const ProductModal = ({
    isOpen,
    onClose,
    mode,
    item,
    activeTab,
    onSubmit,
    isSubmitting
}) => {
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);

    // Inicializar formulario
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            if (mode === 'create') {
                setFormData({});
            } else if (item) {
                setFormData({ ...item });
            }
        }
    }, [isOpen, mode, item]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFormData(prev => ({ ...prev, technical_sheet: selectedFile }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Crear FormData para envío
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'technical_sheet' && formData[key] instanceof File) {
                dataToSend.append(key, formData[key]);
            } else if (key !== 'technical_sheet' && key !== 'technical_sheet_path') {
                if (formData[key] !== null && formData[key] !== undefined) {
                    dataToSend.append(key, formData[key]);
                }
            }
        });

        onSubmit(dataToSend);
    };

    const getTitle = () => {
        const type = activeTab === 'paneles' ? 'Panel' : activeTab === 'inversores' ? 'Inversor' : 'Batería';
        return `${mode === 'create' ? 'Nuevo' : 'Editar'} ${type}`;
    };

    const renderFields = () => {
        const commonFields = (
            <>
                <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input id="brand" name="brand" value={formData.brand || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input id="model" name="model" value={formData.model || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Precio *</Label>
                    <Input id="price" name="price" type="number" value={formData.price || ''} onChange={handleChange} required />
                </div>
            </>
        );

        switch (activeTab) {
            case 'paneles':
                return (
                    <>
                        {commonFields}
                        <div className="space-y-2">
                            <Label htmlFor="power_output">Potencia (W) *</Label>
                            <Input id="power_output" name="power_output" type="number" value={formData.power_output || ''} onChange={handleChange} required />
                        </div>
                    </>
                );
            case 'inversores':
                return (
                    <>
                        {commonFields}
                        <div className="space-y-2">
                            <Label htmlFor="power_output_kw">Potencia (kW) *</Label>
                            <Input id="power_output_kw" name="power_output_kw" type="number" value={formData.power_output_kw || ''} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grid_type">Tipo de Red *</Label>
                            <Select
                                value={formData.grid_type || ''}
                                onValueChange={(value) => handleSelectChange('grid_type', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monofasico">Monofásico</SelectItem>
                                    <SelectItem value="bifasico">Bifásico</SelectItem>
                                    <SelectItem value="trifasico 220v">Trifásico 220V</SelectItem>
                                    <SelectItem value="trifasico 440v">Trifásico 440V</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="system_type">Tipo de Sistema *</Label>
                            <Select
                                value={formData.system_type || ''}
                                onValueChange={(value) => handleSelectChange('system_type', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="on-grid">On-Grid</SelectItem>
                                    <SelectItem value="off-grid">Off-Grid</SelectItem>
                                    <SelectItem value="hibrido">Híbrido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                );
            case 'baterias':
                return (
                    <>
                        {commonFields}
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo *</Label>
                            <Select
                                value={formData.type || ''}
                                onValueChange={(value) => handleSelectChange('type', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Litio">Litio</SelectItem>
                                    <SelectItem value="Gel">Gel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ah_capacity">Capacidad (Ah) *</Label>
                            <Input id="ah_capacity" name="ah_capacity" type="number" value={formData.ah_capacity || ''} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="voltage">Voltaje (V) *</Label>
                            <Input id="voltage" name="voltage" type="number" value={formData.voltage || ''} onChange={handleChange} required />
                        </div>
                    </>
                );
            default: return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderFields()}

                        {/* Campo de Archivo Común */}
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="technical_sheet">Ficha Técnica (PDF)</Label>
                            <Input
                                id="technical_sheet"
                                name="technical_sheet"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                            {formData.technical_sheet_path && !file && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="w-4 h-4" />
                                    <a
                                        href={`${import.meta.env.VITE_API_BASE_URL}/storage/${formData.technical_sheet_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                    >
                                        Ver Ficha Técnica Actual <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                            {file && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <UploadCloud className="w-4 h-4" />
                                    <span>{file.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        {mode !== 'view' && (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductModal;
