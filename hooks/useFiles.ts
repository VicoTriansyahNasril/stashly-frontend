import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getFiles, getPublicFiles } from '../lib/api';
import type { FileSort, FileTypeFilter } from '../types/file';

export const useFiles = (params: { page: number; limit: number; search: string; type: FileTypeFilter; sort: FileSort }) =>
  useQuery({
    queryKey: ['files', params],
    queryFn: () => getFiles(params),
    placeholderData: keepPreviousData,
  });

export const usePublicFiles = (username: string, page: number, limit: number) =>
  useQuery({
    queryKey: ['public-files', username, page, limit],
    queryFn: () => getPublicFiles(username, page, limit),
    placeholderData: keepPreviousData,
    retry: false,
  });
