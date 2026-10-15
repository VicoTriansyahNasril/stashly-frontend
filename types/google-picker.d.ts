// Deklarasi minimal untuk Google Picker API (hanya bagian yang dipakai Stashly).
// Referensi: https://developers.google.com/drive/picker/reference
declare namespace google.picker {
  interface PickedDocument {
    id: string;
    name: string;
    mimeType: string;
    sizeBytes?: number;
    parentId?: string;
  }

  interface ResponseObject {
    action: string;
    docs?: PickedDocument[];
  }

  class DocsView {
    constructor(viewId?: string);
    setIncludeFolders(include: boolean): DocsView;
    setSelectFolderEnabled(enabled: boolean): DocsView;
    setMimeTypes(mimeTypes: string): DocsView;
    setOwnedByMe(ownedByMe: boolean): DocsView;
    setParent(parentId: string): DocsView;
  }

  class PickerBuilder {
    addView(view: DocsView | string): PickerBuilder;
    setOAuthToken(token: string): PickerBuilder;
    setDeveloperKey(key: string): PickerBuilder;
    setAppId(appId: string): PickerBuilder;
    setOrigin(origin: string): PickerBuilder;
    setLocale(locale: string): PickerBuilder;
    setTitle(title: string): PickerBuilder;
    setMaxItems(max: number): PickerBuilder;
    enableFeature(feature: string): PickerBuilder;
    setCallback(callback: (data: ResponseObject) => void): PickerBuilder;
    build(): { setVisible(visible: boolean): void; dispose(): void };
  }

  const ViewId: { DOCS: string; FOLDERS: string };
  const Feature: { MULTISELECT_ENABLED: string; NAV_HIDDEN: string };
  const Action: { PICKED: string; CANCEL: string };
}

interface Window {
  gapi?: {
    load(api: string, options: { callback: () => void; onerror?: () => void }): void;
  };
}
