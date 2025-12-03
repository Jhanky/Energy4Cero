import { FileText, History, Paperclip } from 'lucide-react';
import { Button } from '@/ui/button';

const ProyectoTabs = ({ vistaActiva, onCambiarVista }) => {
  const tabs = [
    {
      id: 'general',
      label: 'Información General',
      icon: FileText
    },
    {
      id: 'hitos',
      label: 'Hitos y Eventos',
      icon: History
    },
    {
      id: 'documentos',
      label: 'Documentación',
      icon: Paperclip
    }
  ];

  return (
    <div className="flex gap-2 border-t border-border pt-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={vistaActiva === tab.id ? "default" : "outline"}
            onClick={() => onCambiarVista(tab.id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ProyectoTabs;
