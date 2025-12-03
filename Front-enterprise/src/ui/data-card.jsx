import * as React from "react"
import { cva } from "class-variance-authority"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const dataCardVariants = cva(
  "bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md dark:bg-slate-900 dark:border-slate-700",
  {
    variants: {
      variant: {
        default: "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700",
        primary: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
        success: "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800",
        warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800",
        danger: "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800",
        muted: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const iconVariants = {
  default: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  primary: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
  success: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
  danger: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
  muted: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
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
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">
              {typeof value === 'object' && value?.type === 'loading' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
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
