import { GOOGLE_API_KEY, GOOGLE_APP_ID } from './config';

export const FOLDER_MIME = 'application/vnd.google-apps.folder';
const GAPI_SRC = 'https://apis.google.com/js/api.js';

export type PickedItem = {
  id: string;
  name: string;
  mimeType: string;
  parentId: string | null;
};

let loader: Promise<void> | null = null;

/** Muat script Google API + modul picker sekali saja. */
export const loadPicker = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Picker hanya tersedia di browser'));
  if (window.google?.picker) return Promise.resolve();

  loader ??= new Promise<void>((resolve, reject) => {
    const fail = () => {
      loader = null;
      reject(new Error('Gagal memuat Google Picker. Periksa koneksi Anda lalu coba lagi.'));
    };
    const onScriptReady = () => window.gapi!.load('picker', { callback: () => resolve(), onerror: fail });

    if (window.gapi) return onScriptReady();
    const script = document.createElement('script');
    script.src = GAPI_SRC;
    script.async = true;
    script.onload = onScriptReady;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return loader;
};

declare global {
  interface Window {
    google?: { picker?: typeof google.picker };
  }
}

export type PickerOptions = {
  accessToken: string;
  mode: 'files' | 'folder';
  maxItems?: number;
};

/**
 * Buka Google Picker. Item yang dipilih otomatis memberi Stashly akses `drive.file`
 * ke item tersebut (dan hanya item tersebut). Resolve dengan array kosong jika dibatalkan.
 */
export const openDrivePicker = async ({ accessToken, mode, maxItems = 100 }: PickerOptions): Promise<PickedItem[]> => {
  await loadPicker();
  const picker = window.google!.picker!;

  const view =
    mode === 'folder'
      ? new picker.DocsView(picker.ViewId.FOLDERS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true)
          .setMimeTypes(FOLDER_MIME)
      : new picker.DocsView(picker.ViewId.DOCS).setIncludeFolders(true).setSelectFolderEnabled(false);

  return new Promise((resolve) => {
    const builder = new picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setAppId(GOOGLE_APP_ID)
      .setOrigin(window.location.origin)
      .setLocale('id')
      .setTitle(mode === 'folder' ? 'Pilih folder tujuan upload' : 'Pilih file untuk diimpor ke Stashly')
      .setCallback((data) => {
        if (data.action === picker.Action.PICKED) {
          resolve(
            (data.docs ?? []).map((doc) => ({
              id: doc.id,
              name: doc.name,
              mimeType: doc.mimeType,
              parentId: doc.parentId ?? null,
            })),
          );
        } else if (data.action === picker.Action.CANCEL) {
          resolve([]);
        }
      });

    if (mode === 'files') builder.enableFeature(picker.Feature.MULTISELECT_ENABLED).setMaxItems(maxItems);
    builder.build().setVisible(true);
  });
};
