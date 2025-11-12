import * as React from "react"
import { cn } from "../lib/utils"

export function ChatMessageList({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("flex flex-col w-full h-full p-4 overflow-y-auto", className)}
      {...props}
    >
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  )
}
