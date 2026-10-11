import { describe, it, expect } from 'vitest';
import { formatFileSize, getFileIcon, formatDate } from '../../lib/utils';

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1500000)).toBe('1.43 MB');
  });
});

describe('getFileIcon', () => {
  it('returns correct icon string based on mimetype', () => {
    expect(getFileIcon('image/jpeg')).toBe('image');
    expect(getFileIcon('image/png')).toBe('image');
    expect(getFileIcon('application/pdf')).toBe('pdf');
    expect(getFileIcon('application/vnd.android.package-archive')).toBe('apk');
    expect(getFileIcon('application/json')).toBe('file');
  });
});

describe('formatDate', () => {
  it('formats recent dates correctly', () => {
    const now = new Date();
    
    // Baru saja
    expect(formatDate(new Date(now.getTime() - 10 * 1000).toISOString())).toBe('Baru saja');
    
    // Menit yang lalu
    expect(formatDate(new Date(now.getTime() - 120 * 1000).toISOString())).toBe('2 menit yang lalu');
    
    // Jam yang lalu
    expect(formatDate(new Date(now.getTime() - 7200 * 1000).toISOString())).toBe('2 jam yang lalu');
  });
});
