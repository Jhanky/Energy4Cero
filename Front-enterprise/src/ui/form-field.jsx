import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "./label"

const formFieldVariants = cva(
  "space-y-2",
  {
    variants: {
      size: {
        sm: "space-y-1",
        default: "space-y-2",
        lg: "space-y-3"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

function FormField({
  className,
  size = "default",
  label,
  required = false,
  error,
  children,
  ...props
}) {
  return (
    <div className={cn(formFieldVariants({ size }), className)} {...props}>
      {label && (
        <Label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export { FormField, formFieldVariants }
