import { AlertTriangle, X, Loader2, Users, FileText, FolderOpen, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClienteBulkDeleteModal = ({ show, onCancel, onConfirm, selectedClients, isDeleting }) => {
  if (!show || !selectedClients || selectedClients.length === 0) {
    return null;
  }

  const totalClients = selectedClients.length;

  // Calcular estadísticas de relaciones
  const stats = selectedClients.reduce((acc, client) => {
    if (client.relations) {
      acc.quotations += client.relations.quotations || 0;
      acc.projects += client.relations.projects || 0;
      acc.tickets += client.relations.tickets || 0;
    }
    return acc;
  }, { quotations: 0, projects: 0, tickets: 0 });

  const hasRelations = stats.quotations > 0 || stats.projects > 0 || stats.tickets > 0;

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
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                  Confirmar Eliminación en Grupo
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

              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.p
                  className="text-slate-600 dark:text-slate-400 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ¿Estás seguro de que deseas eliminar <strong className="text-slate-900 dark:text-slate-100">{totalClients}</strong> cliente{totalClients !== 1 ? 's' : ''}?
                  Esta acción no se puede deshacer.
                </motion.p>

                {hasRelations && (
                  <motion.div
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      Advertencia: Registros relacionados
                    </div>
                    <p className="text-amber-700 dark:text-amber-400 text-sm mb-3">
                      Los siguientes registros relacionados también serán eliminados:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {stats.quotations > 0 && (
                        <motion.div
                          className="flex items-center gap-2 text-amber-700 dark:text-amber-400"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{stats.quotations} cotización{stats.quotations !== 1 ? 'es' : ''}</span>
                        </motion.div>
                      )}
                      {stats.projects > 0 && (
                        <motion.div
                          className="flex items-center gap-2 text-amber-700 dark:text-amber-400"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-sm">{stats.projects} proyecto{stats.projects !== 1 ? 's' : ''}</span>
                        </motion.div>
                      )}
                      {stats.tickets > 0 && (
                        <motion.div
                          className="flex items-center gap-2 text-amber-700 dark:text-amber-400"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 }}
                        >
                          <Ticket className="w-4 h-4" />
                          <span className="text-sm">{stats.tickets} ticket{stats.tickets !== 1 ? 's' : ''}</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <motion.h3
                    className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <Users className="w-5 h-5" />
                    Clientes a eliminar ({totalClients})
                  </motion.h3>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedClients.map((client, index) => (
                        <motion.div
                          key={client.id}
                          className="flex items-center justify-between bg-white dark:bg-slate-600 rounded-lg p-3 border border-slate-200 dark:border-slate-500"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{client.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{client.email}</p>
                            </div>
                          </div>
                          {client.relations && (client.relations.quotations > 0 || client.relations.projects > 0 || client.relations.tickets > 0) && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                              Tiene relaciones
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex justify-end gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + selectedClients.length * 0.1 }}
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
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!isDeleting ? "hover" : "idle"}
                  whileTap={!isDeleting ? "tap" : "idle"}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    `Eliminar ${totalClients} Cliente${totalClients !== 1 ? 's' : ''}`
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

export default ClienteBulkDeleteModal;
