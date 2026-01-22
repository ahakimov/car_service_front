import { useState, useMemo } from 'react';

type UseSearchOptions<T> = {
  searchFields: (item: T) => (string | number | null | undefined)[];
  caseSensitive?: boolean;
};

export function useSearch<T>(
  data: T[],
  options: UseSearchOptions<T>
) {
  const { searchFields, caseSensitive = false } = options;
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const searchLower = caseSensitive ? searchQuery : searchQuery.toLowerCase();

    return data.filter((item) => {
      const fields = searchFields(item);
      return fields.some((field) => {
        if (field === null || field === undefined) {
          return false;
        }
        const fieldStr = String(field);
        const fieldLower = caseSensitive ? fieldStr : fieldStr.toLowerCase();
        return fieldLower.includes(searchLower);
      });
    });
  }, [data, searchQuery, searchFields, caseSensitive]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filtered,
    clearSearch,
    hasSearchQuery: searchQuery.trim().length > 0,
  };
}
