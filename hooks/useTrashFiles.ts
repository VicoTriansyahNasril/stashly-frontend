import { useQuery } from '@tanstack/react-query';
import { getTrashFiles } from '../lib/api';

export const useTrashFiles = (enabled = true) =>
  useQuery({
    queryKey: ['trash'],
    queryFn: getTrashFiles,
    staleTime: 10_000,
    enabled,
  });
