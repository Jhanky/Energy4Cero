import { AlertTriangle, X, FileText, User, Building, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CotizacionDeleteModal = ({ show, cotizacion, onConfirm, onCancel, isDeleting = false }) => {
  if (!show || !cotizacion) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header con icono de advertencia */}
            <motion.div
              className="p-6 border-b border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
                  variants={iconVariants}
                  initial="hidden"
                  animate={["visible", "pulse"]}
                >
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Confirmar Eliminación
                  </motion.h3>
                  <motion.p
                    className="text-sm text-slate-600 dark:text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Esta acción no se puede deshacer
                  </motion.p>
                </div>
                <motion.button
                  onClick={onCancel}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!isDeleting ? "hover" : "idle"}
                  whileTap={!isDeleting ? "tap" : "idle"}
                  disabled={isDeleting}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Contenido */}
            <motion.div
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.p
                className="text-slate-700 dark:text-slate-300 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                ¿Estás seguro de que deseas eliminar la cotización{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{cotizacion.number}</span>?
              </motion.p>

              <motion.div
                className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="space-y-3">
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{cotizacion.number}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{cotizacion.project_name}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="text-sm space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      {cotizacion.client?.type === 'empresa' ? (
                        <Building className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>{cotizacion.client?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Creada: {formatDate(cotizacion.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <DollarSign className="w-4 h-4" />
                      <span>Valor: {formatPrice(cotizacion.total_value)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <FileText className="w-4 h-4" />
                      <span>Items: {cotizacion.items?.length || 0} productos</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
              >
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>⚠️ Advertencia:</strong> Al eliminar esta cotización, se perderán todos los datos, items y configuración asociada. Esta acción no se puede deshacer.
                </p>
              </motion.div>
            </motion.div>

            {/* Botones */}
            <motion.div
              className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <motion.button
                onClick={onCancel}
                className="px-6 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                variants={buttonVariants}
                initial="idle"
                whileHover={!isDeleting ? "hover" : "idle"}
                whileTap={!isDeleting ? "tap" : "idle"}
                disabled={isDeleting}
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[160px] justify-center"
                variants={buttonVariants}
                initial="idle"
                whileHover={!isDeleting ? "hover" : "idle"}
                whileTap={!isDeleting ? "tap" : "idle"}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Eliminar Cotización
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CotizacionDeleteModal;
