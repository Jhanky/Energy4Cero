import React, { useState } from "react"

const Collapsible = ({ children, open, onOpenChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(open || false)
  
  const handleToggle = () => {
    const newOpen = !isOpen
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <div {...props}>
      {React.Children.map(children, child => {
        if (child.type === CollapsibleTrigger) {
          return React.cloneElement(child, { onClick: handleToggle, isOpen })
        }
        if (child.type === CollapsibleContent) {
          return React.cloneElement(child, { isOpen })
        }
        return child
      })}
    </div>
  )
}

const CollapsibleTrigger = ({ children, onClick, isOpen, ...props }) => {
  return (
    <div onClick={onClick} {...props}>
      {typeof children === 'function' ? children({ isOpen }) : children}
    </div>
  )
}

const CollapsibleContent = ({ children, isOpen, ...props }) => {
  if (!isOpen) return null
  
  return (
    <div {...props}>
      {children}
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }