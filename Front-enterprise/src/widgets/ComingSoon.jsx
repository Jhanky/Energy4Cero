import { Leaf } from 'lucide-react';

function ComingSoon({ pageName }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Página en Desarrollo</h2>
        <p className="text-slate-600 mb-4">
          Esta funcionalidad está siendo desarrollada y estará disponible próximamente.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">
            <strong>Próximamente:</strong> {pageName}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;
