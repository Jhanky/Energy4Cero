import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { cn } from "@/lib/utils"
import { ActionButton } from "./action-button"

function DataTable({
  className,
  columns,
  data,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  onRowClick,
  onEdit,
  onDelete,
  onView,
  selectionMode = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  showActions = true,
  actions = [],
  ...props
}) {
  const hasActions = actions.length > 0 || onEdit || onDelete || onView
  
  // Filtrar columnas si están configuradas para mostrar
  const visibleColumns = columns.filter(col => col.show !== false)
  
  // Crear columnas con acciones si es necesario
  const tableColumns = hasActions 
    ? [...visibleColumns, ...(actions.length > 0 ? [{ key: 'actions', title: 'Acciones', show: true }] : [])]
    : visibleColumns

  const handleRowClick = (row, event) => {
    if (onRowClick && !event.target.closest('button') && !event.target.closest('input[type="checkbox"]')) {
      onRowClick(row, event)
    }
  }

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row)
    }
    
    if (column.format) {
      return column.format(row[column.key], row)
    }
    
    return row[column.key]
  }

  return (
    <div className={cn("rounded-md border bg-white", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectionMode && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                </TableHead>
              )}
              {tableColumns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium whitespace-nowrap",
                    column.className
                  )}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={tableColumns.length + (selectionMode ? 1 : 0)} 
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-slate-600">Cargando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={tableColumns.length + (selectionMode ? 1 : 0)} 
                  className="text-center py-8 text-slate-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow 
                  key={row.id || index}
                  className={cn(
                    "transition-all duration-200 hover:bg-slate-50",
                    onRowClick && "cursor-pointer",
                    selectedRows.includes(row.id) && "bg-blue-50"
                  )}
                  onClick={(e) => handleRowClick(row, e)}
                >
                  {selectionMode && (
                    <TableCell className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => onSelectRow?.(row.id)}
                        className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {tableColumns.map((column) => (
                    <TableCell 
                      key={column.key}
                      className={cn("px-4 py-3 align-middle whitespace-nowrap", column.className)}
                    >
                      {column.key === 'actions' && hasActions ? (
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {onView && (
                            <ActionButton
                              variant="view"
                              size="sm"
                              onClick={() => onView(row)}
                              title="Ver detalles"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </ActionButton>
                          )}
                          {onEdit && (
                            <ActionButton
                              variant="edit"
                              size="sm"
                              onClick={() => onEdit(row)}
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </ActionButton>
                          )}
                          {onDelete && (
                            <ActionButton
                              variant="delete"
                              size="sm"
                              onClick={() => onDelete(row)}
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </ActionButton>
                          )}
                          {actions.map((action, actionIndex) => (
                            <ActionButton
                              key={actionIndex}
                              variant={action.variant || "view"}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              title={action.title || action.label}
                            >
                              {action.icon}
                            </ActionButton>
                          ))}
                        </div>
                      ) : (
                        renderCell(row, column)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export { DataTable }
