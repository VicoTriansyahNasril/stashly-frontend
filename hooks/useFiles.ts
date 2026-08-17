import { useQuery } from '@tanstack/react-query';
import { getFiles, getPublicFiles } from '../lib/api';
import { StashlyFile } from '../types/file';

export const useFiles = (username?: string) => {
  return useQuery<{ data: StashlyFile[] }, Error>({
    queryKey: ['files', username],
    queryFn: () => username ? getPublicFiles(username) : getFiles(),
    staleTime: 60000, // 1 minute
  });
};
