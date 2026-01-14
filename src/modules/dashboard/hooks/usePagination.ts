import { useState, useMemo, useCallback } from 'react';

type UsePaginationOptions<T> = {
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
};

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions<T> = {}
) {
  const { itemsPerPage = 10, onPageChange } = options;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(data.length / itemsPerPage),
    [data.length, itemsPerPage]
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
      onPageChange?.(validPage);
    },
    [totalPages, onPageChange]
  );

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Reset to first page when data changes significantly
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    setCurrentPage: goToPage,
    totalPages,
    paginatedData,
    itemsPerPage,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    resetPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
