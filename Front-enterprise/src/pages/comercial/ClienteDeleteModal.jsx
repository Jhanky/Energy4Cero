
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClienteDeleteModal = ({ show, onCancel, onConfirm, cliente, isDeleting }) => {
  if (!show) {
    return null;
  }

  // Variantes de animación para el modal
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  // Variantes para el overlay
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Variantes para el ícono de advertencia
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        delay: 0.1
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Variantes para los botones
  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-6">
              <motion.div
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.h2
                  className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    variants={iconVariants}
                    initial="hidden"
                    animate={["visible", "pulse"]}
                  >
                    <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
                  </motion.div>
                  Confirmar Eliminación
                </motion.h2>
                <motion.button
                  onClick={onCancel}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!isDeleting ? "hover" : "idle"}
                  whileTap={!isDeleting ? "tap" : "idle"}
                  disabled={isDeleting}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </motion.div>

              <motion.p
                className="text-slate-600 dark:text-slate-400 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                ¿Estás seguro de que deseas eliminar al cliente "<strong className="text-slate-900 dark:text-slate-100">{cliente?.name}</strong>"?
                Esta acción no se puede deshacer.
              </motion.p>

              <motion.div
                className="flex justify-end gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!isDeleting ? "hover" : "idle"}
                  whileTap={!isDeleting ? "tap" : "idle"}
                  disabled={isDeleting}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onConfirm}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!isDeleting ? "hover" : "idle"}
                  whileTap={!isDeleting ? "tap" : "idle"}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar Cliente'
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClienteDeleteModal;
