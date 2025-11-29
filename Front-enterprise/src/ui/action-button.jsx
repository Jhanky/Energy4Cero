import * as React from "react"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const actionButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        edit: "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200",
        delete: "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200",
        view: "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-700 border border-slate-200",
        success: "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-200",
        warning: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 border border-yellow-200",
        primary: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
      },
      size: {
        sm: "h-8 px-2 [&_svg]:size-3",
        default: "h-9 px-3 [&_svg]:size-4",
        lg: "h-10 px-4 [&_svg]:size-5"
      },
    },
    defaultVariants: {
      variant: "view",
      size: "default",
    },
  }
)

function ActionButton({
  className,
  variant,
  size,
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      data-slot="action-button"
      className={cn(actionButtonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}

export { ActionButton, actionButtonVariants }
