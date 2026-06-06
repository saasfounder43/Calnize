'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface LogoUploadProps {
  currentLogoUrl: string | null;
  userId: string;
  onUpload: (url: string) => void;
}

export default function LogoUpload({ currentLogoUrl, userId, onUpload }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const MAX_SIZE = 400;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_SIZE) { height = (height * MAX_SIZE) / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width = (width * MAX_SIZE) / height; height = MAX_SIZE; }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Max 2MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const compressed = await compressImage(file);
      const filePath = `${userId}/logo.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('branding-assets')
        .upload(filePath, compressed, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('branding-assets')
        .getPublicUrl(filePath);

      // Add cache-busting param
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await supabase.storage.from('branding-assets').remove([`${userId}/logo.jpg`]);
      setPreview(null);
      onUpload('');
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  return (
    <div>
      <label
        style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}
      >
        Logo
      </label>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        Appears at the top of your booking page. PNG, JPG or SVG. Max 2MB.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Preview */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Logo preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={() => setPreview(null)}
            />
          ) : (
            <span style={{ fontSize: '28px', color: 'var(--color-text-muted)' }}>🏢</span>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary btn-sm"
          >
            {uploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="btn-danger btn-sm"
              style={{ fontSize: '12px' }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && (
        <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '8px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
