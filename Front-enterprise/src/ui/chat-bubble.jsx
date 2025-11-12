import * as React from "react"
import { cn } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"

export function ChatBubble({
  variant = "received",
  layout = "default",
  className,
  children,
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 mb-4",
        variant === "sent" && "flex-row-reverse",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ChatBubbleMessage({
  variant = "received",
  isLoading,
  isError = false,
  className,
  children,
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-3 max-w-[70%]",
        variant === "sent"
          ? "bg-green-600 text-white"
          : isError
            ? "bg-red-50 text-red-900 border border-red-200"
            : "bg-gray-100 text-gray-900",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export function ChatBubbleAvatar({
  src,
  fallback = "AI",
  className,
}) {
  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback className={cn(
        fallback === "AI" ? "bg-green-100 text-green-600" : "bg-green-600 text-white"
      )}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  )
}

export function ChatBubbleAction({
  icon,
  onClick,
  className,
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={onClick}
    >
      {icon}
    </Button>
  )
}

export function ChatBubbleActionWrapper({
  className,
  children,
}) {
  return (
    <div className={cn("flex items-center gap-1 mt-2", className)}>
      {children}
    </div>
  )
}

// Loading component for typing indicator
function MessageLoading() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-500"
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="spinner_qFRN.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  );
}
