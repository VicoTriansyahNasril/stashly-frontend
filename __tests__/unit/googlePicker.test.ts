import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/config')>()),
  GOOGLE_API_KEY: 'test-api-key',
  GOOGLE_APP_ID: '123456789',
}));

const { openDrivePicker, FOLDER_MIME } = await import('../../lib/googlePicker');

type Callback = (data: { action: string; docs?: unknown[] }) => void;

/** Picker palsu yang merekam konfigurasi builder. */
const installFakePicker = () => {
  const calls: Record<string, unknown[]> = {};
  let callback: Callback = () => {};
  const record = (name: string) =>
    function (this: unknown, ...args: unknown[]) {
      calls[name] = args;
      return this;
    };

  class DocsView {
    viewId: string;
    constructor(viewId: string) {
      this.viewId = viewId;
      calls.viewId = [viewId];
    }
    setIncludeFolders = record('setIncludeFolders');
    setSelectFolderEnabled = record('setSelectFolderEnabled');
    setMimeTypes = record('setMimeTypes');
  }
  class PickerBuilder {
    addView = record('addView');
    setOAuthToken = record('setOAuthToken');
    setDeveloperKey = record('setDeveloperKey');
    setAppId = record('setAppId');
    setOrigin = record('setOrigin');
    setLocale = record('setLocale');
    setTitle = record('setTitle');
    setMaxItems = record('setMaxItems');
    enableFeature = record('enableFeature');
    setCallback(cb: Callback) {
      callback = cb;
      return this;
    }
    build() {
      return { setVisible: (v: boolean) => (calls.visible = [v]), dispose: () => {} };
    }
  }

  (window as unknown as { google: unknown }).google = {
    picker: {
      DocsView,
      PickerBuilder,
      ViewId: { DOCS: 'all', FOLDERS: 'folders' },
      Feature: { MULTISELECT_ENABLED: 'multiselect' },
      Action: { PICKED: 'picked', CANCEL: 'cancel' },
    },
  };
  return { calls, respond: (data: Parameters<Callback>[0]) => callback(data) };
};

describe('openDrivePicker', () => {
  let fake: ReturnType<typeof installFakePicker>;
  beforeEach(() => {
    fake = installFakePicker();
  });
  afterEach(() => {
    delete (window as unknown as { google?: unknown }).google;
  });

  it('memakai token dari backend, API key, App ID, dan origin aplikasi', async () => {
    const promise = openDrivePicker({ accessToken: 'ya29.token', mode: 'files' });
    await vi.waitFor(() => expect(fake.calls.visible).toEqual([true]));
    expect(fake.calls.setOAuthToken).toEqual(['ya29.token']);
    expect(fake.calls.setDeveloperKey).toEqual(['test-api-key']);
    expect(fake.calls.setAppId).toEqual(['123456789']);
    expect(fake.calls.setOrigin).toEqual([window.location.origin]);
    expect(fake.calls.enableFeature).toEqual(['multiselect']);

    fake.respond({
      action: 'picked',
      docs: [{ id: 'f1', name: 'a.pdf', mimeType: 'application/pdf', parentId: 'p1', url: 'x' }],
    });
    await expect(promise).resolves.toEqual([{ id: 'f1', name: 'a.pdf', mimeType: 'application/pdf', parentId: 'p1' }]);
  });

  it('mode folder hanya menampilkan folder dan tidak multiselect', async () => {
    const promise = openDrivePicker({ accessToken: 't', mode: 'folder' });
    await vi.waitFor(() => expect(fake.calls.visible).toBeDefined());
    expect(fake.calls.viewId).toEqual(['folders']);
    expect(fake.calls.setMimeTypes).toEqual([FOLDER_MIME]);
    expect(fake.calls.enableFeature).toBeUndefined();
    fake.respond({ action: 'cancel' });
    await expect(promise).resolves.toEqual([]);
  });
});
