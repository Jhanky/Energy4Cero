import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full hidden md:flex md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-[300px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      <div className="flex flex-col h-full">
        {children}
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-sidebar text-sidebar-foreground border-b border-sidebar-border w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-sidebar-foreground cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-sidebar text-sidebar-foreground p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-sidebar-foreground cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}) => {
  const { open, animate } = useSidebar();
  return (
    <NavLink
      to={link.href}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-start gap-2 group/sidebar py-2",
          isActive
            ? "text-sidebar-primary bg-sidebar-accent rounded-lg px-3"
            : "text-sidebar-foreground hover:bg-sidebar-accent rounded-lg px-3",
          className
        )
      }
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sidebar-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
};

export const SidebarSection = ({
  title,
  icon: Icon,
  children,
  open: externalOpen,
  onToggle,
  defaultOpen = false,
  isActive = false,
  className,
}) => {
  const { open: sidebarOpen, animate } = useSidebar();
  const [manualOpen, setManualOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);

  // Use external open state if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? (externalOpen || hovered) : (manualOpen || hovered);

  return (
    <div
      className={cn("mb-2", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => {
          if (onToggle) {
            onToggle();
          } else {
            setManualOpen(!manualOpen);
          }
        }}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors",
          isActive
            ? "text-green-600 bg-green-50 hover:bg-green-100"
            : "text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <motion.span
            animate={{
              display: animate ? (sidebarOpen ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (sidebarOpen ? 1 : 0) : 1,
            }}
            className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0"
          >
            {title}
          </motion.span>
        </div>
        <motion.div
          animate={{
            display: animate ? (sidebarOpen ? "block" : "none") : "block",
            opacity: animate ? (sidebarOpen ? 1 : 0) : 1,
          }}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-sidebar-foreground/70" />
          ) : (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground/70" />
          )}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarSectionItem = ({
  link,
  className,
  ...props
}) => {
  const { open, animate } = useSidebar();
  return (
    <NavLink
      to={link.href}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-start gap-3 group/sidebar py-1.5 px-3 text-sm rounded-md transition-colors",
          isActive
            ? "text-green-600 bg-green-50 font-medium border-l-2 border-green-500"
            : "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
          className
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          <span className={cn(
            "flex-shrink-0",
            isActive ? "text-green-600" : "text-sidebar-foreground/90"
          )}>
            {link.icon}
          </span>
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="whitespace-pre inline-block !p-0 !m-0"
          >
            {link.label}
          </motion.span>
        </>
      )}
    </NavLink>
  );
};
