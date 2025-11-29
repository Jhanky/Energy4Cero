import * as React from "react"
import { cva } from "class-variance-authority"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const dataCardVariants = cva(
  "bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-white border-slate-200",
        primary: "bg-blue-50 border-blue-200",
        success: "bg-green-50 border-green-200", 
        warning: "bg-yellow-50 border-yellow-200",
        danger: "bg-red-50 border-red-200",
        muted: "bg-slate-50 border-slate-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const iconVariants = {
  default: "bg-slate-100 text-slate-600",
  primary: "bg-blue-100 text-blue-600",
  success: "bg-green-100 text-green-600", 
  warning: "bg-yellow-100 text-yellow-600",
  danger: "bg-red-100 text-red-600",
  muted: "bg-slate-100 text-slate-600"
}

function DataCard({
  className,
  variant = "default",
  title,
  value,
  icon: Icon,
  iconVariant = "default",
  children,
  ...props
}) {
  return (
    <div
      data-slot="data-card"
      className={cn(dataCardVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">
              {typeof value === 'object' && value?.type === 'loading' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
              ) : (
                value
              )}
            </p>
            {children}
          </div>
        </div>
        {Icon && (
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            iconVariants[iconVariant] || iconVariants.default
          )}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

export { DataCard, dataCardVariants }
