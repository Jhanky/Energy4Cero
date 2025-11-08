import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <p className="text-slate-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

