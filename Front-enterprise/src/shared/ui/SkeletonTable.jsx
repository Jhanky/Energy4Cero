import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Skeleton } from '../../ui/skeleton';

const SkeletonTable = ({
  columns = 5,
  rows = 10,
  showHeader = true,
  className = "",
  asRows = false
}) => {
  // Componente para skeleton de fila
  const SkeletonRow = ({ colCount }) => (
    <TableRow>
      {Array.from({ length: colCount }, (_, index) => (
        <TableCell key={`skeleton-cell-${index}`}>
          <Skeleton className="h-4 w-full max-w-48" />
        </TableCell>
      ))}
    </TableRow>
  );

  // Componente para skeleton de header
  const SkeletonHeader = ({ colCount }) => (
    <TableRow>
      {Array.from({ length: colCount }, (_, index) => (
        <TableHead key={`skeleton-header-${index}`}>
          <Skeleton className="h-4 w-20" />
        </TableHead>
      ))}
    </TableRow>
  );

  // Si se usa como filas dentro de una tabla existente
  if (asRows) {
    return (
      <>
        {showHeader && <SkeletonHeader colCount={columns} />}
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonRow key={`skeleton-row-${index}`} colCount={columns} />
        ))}
      </>
    );
  }

  // Comportamiento por defecto: tabla completa
  return (
    <div className={`rounded-md border transition-opacity duration-300 ${className}`}>
      <Table>
        {showHeader && (
          <TableHeader>
            <SkeletonHeader colCount={columns} />
          </TableHeader>
        )}
        <TableBody className="transition-opacity duration-300 opacity-50">
          {Array.from({ length: rows }, (_, index) => (
            <SkeletonRow key={`skeleton-row-${index}`} colCount={columns} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SkeletonTable;
