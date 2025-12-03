import * as React from "react"
import { cva } from "class-variance-authority"


import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        // Estados de cliente
        active: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        inactive: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",

        // Estados de proyecto específicos
        "preparacion-solicitud": "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        "solicitud-presentada": "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        "revision-completitud": "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
        "revision-tecnica": "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
        "concepto-viabilidad": "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
        "instalacion-proceso": "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        "inspeccion-pendiente": "bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800",
        "inspeccion-realizada": "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800",
        "observaciones-inspeccion": "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
        "aprobacion-final": "bg-lime-100 text-lime-800 border border-lime-200 dark:bg-lime-900/20 dark:text-lime-400 dark:border-lime-800",
        "conectado-operando": "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        "suspendido": "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        "cancelado": "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",

        // Estados de proyecto genéricos (para compatibilidad)
        "en-proceso": "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        "pendiente": "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
        "completado": "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",

        // Tipos de cliente
        residencial: "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        comercial: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
        industrial: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",

        // Estados genéricos
        success: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
        error: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        info: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        neutral: "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
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
