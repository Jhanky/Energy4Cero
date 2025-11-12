import React from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const AdvancedPagination = ({
  pagination,
  onPageChange,
  onPerPageChange,
  loading = false,
  showInfo = true,
  className = ""
}) => {
  if (!pagination || pagination.total <= 0) {
    return null;
  }

  const {
    current_page = 1,
    per_page = 15,
    total = 0,
    last_page = 1,
    from = 0,
    to = 0
  } = pagination;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= last_page && !loading) {
      onPageChange(page);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    if (!loading) {
      onPerPageChange(parseInt(newPerPage));
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (last_page <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas numeradas con ellipsis
      if (current_page <= 3) {
        // Principio: 1, 2, 3, 4, 5, ..., último
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (current_page >= last_page - 2) {
        // Final: primero, ..., último-4, último-3, último-2, último-1, último
        for (let i = last_page - 4; i <= last_page; i++) {
          pages.push(i);
        }
      } else {
        // Medio: primero, ..., actual-2, actual-1, actual, actual+1, actual+2, ..., último
        pages.push(current_page - 2, current_page - 1, current_page, current_page + 1, current_page + 2);
      }
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 ${className}`}>
      {/* Información de paginación */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          Mostrando {from}-{to} de {total} elementos
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex items-center gap-4">
        {/* Selector de elementos por página */}
        <div className="flex items-center gap-2">
          <Label htmlFor="page-size" className="text-sm">Elementos por página:</Label>
          <Select
            value={per_page.toString()}
            onValueChange={handlePerPageChange}
            disabled={loading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Paginación */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(current_page - 1)}
                className={`${current_page <= 1 || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              />
            </PaginationItem>

            {/* Números de página */}
            {getPageNumbers().map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === current_page}
                  className={`cursor-pointer ${loading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(current_page + 1)}
                className={`${current_page >= last_page || loading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default AdvancedPagination;
