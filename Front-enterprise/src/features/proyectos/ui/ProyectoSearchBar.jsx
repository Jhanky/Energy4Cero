import { Search, Loader2 } from 'lucide-react';
import { Input } from '../../../ui/input';

const ProyectoSearchBar = ({
  value,
  onChange,
  placeholder = "Buscar proyectos...",
  loading = false,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
      )}
    </div>
  );
};

export default ProyectoSearchBar;
