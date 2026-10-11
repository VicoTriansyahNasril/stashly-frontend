import { useQuery } from '@tanstack/react-query';
import { getFiles, getPublicFiles } from '../lib/api';
import { StashlyFile } from '../types/file';

export const useFiles = (
  username?: string, 
  page: number = 1, 
  limit: number = 50, 
  search: string = '', 
  type: string = '', 
  sort: string = 'newest'
) => {
  return useQuery<any, Error>({
    queryKey: ['files', username, page, limit, search, type, sort],
    queryFn: async () => {
      if (username) {
        const res = await getPublicFiles(username);
        return { data: { files: res.data as any as StashlyFile[], pagination: null } };
      } else {
        return getFiles(page, limit, search, type, sort);
      }
    },
    staleTime: 0, // Always refetch on window focus
    retry: false
  });
};
