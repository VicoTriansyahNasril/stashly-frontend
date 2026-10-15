import { useCallback, useRef, useState } from 'react';
import { getDriveToken } from '../lib/api';
import { isDrivePickerConfigured } from '../lib/config';
import { openDrivePicker, type PickedItem, type PickerOptions } from '../lib/googlePicker';

const TOKEN_SAFETY_MARGIN_MS = 60_000;

/**
 * Buka Google Picker dengan token `drive.file` dari backend. Token disimpan di memori
 * (bukan localStorage) dan dipakai ulang sampai mendekati kedaluwarsa.
 */
export const useDrivePicker = () => {
  const tokenRef = useRef<{ accessToken: string; expiresAt: number } | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async (options: Omit<PickerOptions, 'accessToken'>): Promise<PickedItem[]> => {
    if (!isDrivePickerConfigured) {
      setError('Google Picker belum dikonfigurasi (NEXT_PUBLIC_GOOGLE_API_KEY / NEXT_PUBLIC_GOOGLE_APP_ID).');
      return [];
    }
    setError(null);
    setIsOpening(true);
    try {
      const cached = tokenRef.current;
      if (!cached || cached.expiresAt - TOKEN_SAFETY_MARGIN_MS <= Date.now()) {
        tokenRef.current = await getDriveToken();
      }
      setIsOpening(false);
      return await openDrivePicker({ ...options, accessToken: tokenRef.current!.accessToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuka Google Drive');
      return [];
    } finally {
      setIsOpening(false);
    }
  }, []);

  return { pick, isOpening, error, clearError: () => setError(null), isConfigured: isDrivePickerConfigured };
};
