import { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, ExternalLink } from 'lucide-react';

const PanelModal = ({
  show,
  mode,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isSubmitting,
}) => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Reset file input when modal opens
    if (show) {
      setFile(null);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormChange({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // Solo actualizar el formData si hay un archivo seleccionado
    if (selectedFile) {
      onFormChange({ ...formData, technical_sheet: selectedFile });
    }
  };

  const prepareFormData = (data) => {
    const formData = new FormData();
    for (const key in data) {
      // No incluir la ficha técnica si es null o undefined
      if (key === 'technical_sheet' && !data[key]) continue;
      formData.append(key, data[key]);
    }
    return formData;
  };

  const renderForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Marca *</label>
        <input 
          type="text" 
          name="brand" 
          value={formData.brand || ''} 
          onChange={handleInputChange} 
          className="w-full px-3 py-2 border border-slate-300 rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Modelo *</label>
        <input 
          type="text" 
          name="model" 
          value={formData.model || ''} 
          onChange={handleInputChange} 
          className="w-full px-3 py-2 border border-slate-300 rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Potencia (W) *</label>
        <input 
          type="number" 
          name="power_output" 
          value={formData.power_output || ''} 
          onChange={handleInputChange} 
          className="w-full px-3 py-2 border border-slate-300 rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Precio *</label>
        <input 
          type="number" 
          name="price" 
          value={formData.price || ''} 
          onChange={handleInputChange} 
          className="w-full px-3 py-2 border border-slate-300 rounded-md" 
          required 
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Ficha Técnica (PDF)</label>
        <input 
          type="file" 
          name="technical_sheet" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="w-full px-3 py-2 border border-slate-300 rounded-md" 
        />
        {formData.technical_sheet_path && !file && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <FileText className="w-4 h-4" />
            <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${formData.technical_sheet_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
              Ver Ficha Técnica Actual <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {file && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <UploadCloud className="w-4 h-4" />
            <span>{file.name}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'create' ? 'Nuevo Panel' : mode === 'edit' ? 'Editar Panel' : 'Ver Panel'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {renderForm()}

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              {mode !== 'view' && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PanelModal;
