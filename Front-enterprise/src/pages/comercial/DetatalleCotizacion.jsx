import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DetalleCotizacion from '../../features/comercial/cotizaciones/DetalleCotizacion';

const DetalleCotizacionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/cotizaciones');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Detalle de Cotización</h1>
      </div>

      <DetalleCotizacion cotizacionId={id} />
    </div>
  );
};

export default DetalleCotizacionPage;
