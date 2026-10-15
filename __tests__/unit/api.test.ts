import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fileUrls, getFiles, getPublicFiles } from '../../lib/api';
import { USERNAME_PATTERN } from '../../lib/config';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('lib/api', () => {
  it('melempar ApiError dengan pesan string dari backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { success: false, message: 'Unauthorized', error: { code: 401 } })));
    const error = await getFiles({ page: 1, limit: 12, search: '', type: '', sort: 'newest' }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('body error non-JSON tetap menghasilkan pesan yang aman', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>502</html>', { status: 502 })));
    const error = await getFiles({ page: 1, limit: 12, search: '', type: '', sort: 'newest' }).catch((e) => e);
    expect(error.message).toBe('Terjadi kesalahan, silakan coba lagi.');
  });

  it('parameter query di-encode (tidak bisa menyisipkan parameter lain)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: { files: [], pagination: {} } }));
    vi.stubGlobal('fetch', fetchMock);
    await getPublicFiles('budi&page=999', 1, 12);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('username')).toBe('budi&page=999');
    expect(url.searchParams.get('page')).toBe('1');
    expect(fetchMock.mock.calls[0][1].credentials).toBe('omit');
  });

  it('request ke API memakai cookie sesi', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: { files: [], pagination: {} } }));
    vi.stubGlobal('fetch', fetchMock);
    await getFiles({ page: 2, limit: 12, search: 'a b', type: 'pdf', sort: 'oldest' });
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3001/files/list?page=2&limit=12&search=a+b&type=pdf&sort=oldest');
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });

  it('URL stream publik meng-encode token', () => {
    expect(fileUrls.publicStream('id', { token: 'a&b', download: true })).toBe(
      'http://localhost:3001/files/public/id/stream?download=1&token=a%26b',
    );
  });
});

describe('USERNAME_PATTERN', () => {
  it.each(['budi', 'budi_s', 'a-1', 'abc123'])('menerima %s', (name) => expect(USERNAME_PATTERN.test(name)).toBe(true));
  it.each(['ab', 'Budi', '-budi', 'budi-', 'budi santoso', '../x', '<script>'])('menolak %s', (name) =>
    expect(USERNAME_PATTERN.test(name)).toBe(false),
  );
});
