import * as React from "react"
import { cva } from "class-variance-authority"


import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        // Estados de cliente
        active: "bg-green-100 text-green-800 border border-green-200",
        inactive: "bg-red-100 text-red-800 border border-red-200",

        // Estados de proyecto específicos
        "preparacion-solicitud": "bg-slate-100 text-slate-800 border border-slate-200",
        "solicitud-presentada": "bg-blue-100 text-blue-800 border border-blue-200",
        "revision-completitud": "bg-yellow-100 text-yellow-800 border border-yellow-200",
        "revision-tecnica": "bg-orange-100 text-orange-800 border border-orange-200",
        "concepto-viabilidad": "bg-purple-100 text-purple-800 border border-purple-200",
        "instalacion-proceso": "bg-blue-100 text-blue-800 border border-blue-200",
        "inspeccion-pendiente": "bg-cyan-100 text-cyan-800 border border-cyan-200",
        "inspeccion-realizada": "bg-teal-100 text-teal-800 border border-teal-200",
        "observaciones-inspeccion": "bg-orange-100 text-orange-800 border border-orange-200",
        "aprobacion-final": "bg-lime-100 text-lime-800 border border-lime-200",
        "conectado-operando": "bg-green-100 text-green-800 border border-green-200",
        "suspendido": "bg-red-100 text-red-800 border border-red-200",
        "cancelado": "bg-red-100 text-red-800 border border-red-200",

        // Estados de proyecto genéricos (para compatibilidad)
        "en-proceso": "bg-blue-100 text-blue-800 border border-blue-200",
        "pendiente": "bg-yellow-100 text-yellow-800 border border-yellow-200",
        "completado": "bg-green-100 text-green-800 border border-green-200",

        // Tipos de cliente
        residencial: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        comercial: "bg-purple-100 text-purple-800 border border-purple-200",
        industrial: "bg-blue-100 text-blue-800 border border-blue-200",

        // Estados genéricos
        success: "bg-green-100 text-green-800 border border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        error: "bg-red-100 text-red-800 border border-red-200",
        info: "bg-blue-100 text-blue-800 border border-blue-200",
        neutral: "bg-slate-100 text-slate-800 border border-slate-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm"
      }
    },
    defaultVariants: {
      variant: "neutral",
      size: "default"
    }
  }
)

function StatusBadge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}) {
  const IconComponent = icon

  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {IconComponent && <IconComponent className="w-3 h-3" />}
      {children}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants }
