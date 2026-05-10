'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { BlogPost, BlogCategory, BlogStatus } from '@/lib/blog-types'
import { useRouter } from 'next/navigation'

const BlogEditor = dynamic(() => import('./BlogEditor'), { ssr: false, loading: () => <div className="editor-loading">Loading editor…</div> })

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

interface BlogPostFormProps {
  post?: BlogPost
  categories: BlogCategory[]
  mode: 'create' | 'edit'
}

export default function BlogPostForm({ post, categories, mode }: BlogPostFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const slugManuallyEdited = useRef(false)

  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    body: post?.body ?? '',
    cover_image_url: post?.cover_image_url ?? '',
    video_url: post?.video_url ?? '',
    category_id: post?.category_id ?? '',
    status: (post?.status ?? 'draft') as BlogStatus,
    seo_keywords: post?.seo_keywords ?? '',
    published_at: post?.published_at
      ? new Date(post.published_at).toISOString().slice(0, 16)
      : '',
  })

  function set(key: string, value: string) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      // Auto-generate slug from title unless manually edited
      if (key === 'title' && !slugManuallyEdited.current) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  async function save(publishNow?: boolean) {
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.body.trim() || form.body === '<p></p>') { setError('Post body cannot be empty.'); return }

    setSaving(true)
    setError('')
    setSuccess('')

    const payload: any = {
      ...form,
      status: publishNow ? 'published' : form.status,
      published_at: form.published_at?.trim()
        ? new Date(form.published_at).toISOString()
        : (publishNow ? new Date().toISOString() : null),
      category_id: form.category_id || null,
      video_url: form.video_url || null,
      cover_image_url: form.cover_image_url || null,
      seo_keywords: form.seo_keywords || null,
      excerpt: form.excerpt || null,
    }

    const url = mode === 'edit' ? `/api/admin/blog/${post!.id}` : '/api/admin/blog'
    const method = mode === 'edit' ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
      setSaving(false)
      return
    }

    setSuccess(publishNow ? 'Published!' : 'Saved as draft.')
    setSaving(false)

    // For create mode, always redirect to blog listing
    if (mode === 'create') {
      router.push('/admin/blog')
      return
    }

    // For edit mode:
    // - If publishing, redirect to blog listing with success
    // - If saving as draft, stay on same page
    if (publishNow) {
      setTimeout(() => {
        router.push('/admin/blog')
      }, 1500)
    }
  }

  return (
    <div className="post-form">
      <style>{`
        .post-form {
          max-width: 900px;
          margin: 0 auto;
          padding: 36px 24px 80px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .post-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .post-form-header h1 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #111; }

        .form-actions { display: flex; gap: 8px; align-items: center; }
        .btn {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .btn-ghost { background: #fff; border-color: #ddd; color: #444; }
        .btn-ghost:hover { background: #f3f4f6; }
        .btn-draft { background: #f3f4f6; border-color: #e5e7eb; color: #374151; }
        .btn-draft:hover { background: #e5e7eb; }
        .btn-publish { background: #0066ff; color: #fff; border-color: #0066ff; }
        .btn-publish:hover:not(:disabled) { background: #0052cc; }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .form-grid { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
        @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } }

        .form-main { display: flex; flex-direction: column; gap: 18px; }
        .form-sidebar { display: flex; flex-direction: column; gap: 16px; }

        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-field label { font-size: 0.8rem; font-weight: 600; color: #555; }
        .form-input, .form-textarea, .form-select {
          padding: 9px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          font-family: inherit;
          color: #111;
          background: #fff;
          transition: border-color 0.15s;
          width: 100%;
          box-sizing: border-box;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: #0066ff; }
        .form-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
        .form-input-hint { font-size: 0.75rem; color: #999; }

        .sidebar-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sidebar-card-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0; }

        .status-toggle { display: flex; gap: 4px; }
        .status-opt {
          flex: 1;
          padding: 7px 4px;
          border-radius: 7px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 0.8rem;
          font-weight: 500;
          color: #777;
          cursor: pointer;
          text-align: center;
          transition: all 0.12s;
        }
        .status-opt.active-draft { background: #f3f4f6; border-color: #6b7280; color: #374151; }
        .status-opt.active-published { background: #d1fae5; border-color: #059669; color: #065f46; }

        .form-alert {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 4px;
        }
        .form-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .form-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
        .editor-loading { padding: 40px; text-align: center; color: #aaa; font-size: 0.9rem; }
      `}</style>

      <div className="post-form-header">
        <h1>{mode === 'create' ? 'New Post' : 'Edit Post'}</h1>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/admin/blog')} disabled={saving}>
            ← Back
          </button>
          <button className="btn btn-draft" onClick={() => save(false)} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button className="btn btn-publish" onClick={() => save(true)} disabled={saving}>
            {saving ? 'Publishing…' : form.status === 'published' ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <div className="form-alert form-error">{error}</div>}
      {success && <div className="form-alert form-success">{success}</div>}

      <div className="form-grid">
        <div className="form-main">
          <div className="form-field">
            <label>Title *</label>
            <input
              className="form-input"
              placeholder="Post title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
            />
          </div>

          <div className="form-field">
            <label>Excerpt / Summary</label>
            <textarea
              className="form-textarea"
              placeholder="A short description shown on the blog listing page…"
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-field">
            <label>Post Body *</label>
            <BlogEditor
              value={form.body}
              onChange={(html) => setForm(prev => ({ ...prev, body: html }))}
              placeholder="Start writing your post. You can paste images directly into the editor."
            />
          </div>
        </div>

        <div className="form-sidebar">
          {/* Status */}
          <div className="sidebar-card">
            <p className="sidebar-card-title">Status</p>
            <div className="status-toggle">
              <button
                type="button"
                className={`status-opt${form.status === 'draft' ? ' active-draft' : ''}`}
                onClick={() => set('status', 'draft')}
              >
                Draft
              </button>
              <button
                type="button"
                className={`status-opt${form.status === 'published' ? ' active-published' : ''}`}
                onClick={() => set('status', 'published')}
              >
                Published
              </button>
            </div>
            <div className="form-field">
              <label>Publish Date (backdating allowed)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.published_at}
                onChange={e => set('published_at', e.target.value)}
              />
              <span className="form-input-hint">Leave blank to use current time when publishing</span>
            </div>
          </div>

          {/* Category */}
          <div className="sidebar-card">
            <p className="sidebar-card-title">Category</p>
            <select
              className="form-select"
              value={form.category_id}
              onChange={e => set('category_id', e.target.value)}
            >
              <option value="">Uncategorised</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Cover media */}
          <div className="sidebar-card">
            <p className="sidebar-card-title">Cover Image</p>
            <div className="form-field">
              <input
                className="form-input"
                placeholder="https://…"
                value={form.cover_image_url}
                onChange={e => set('cover_image_url', e.target.value)}
              />
              <span className="form-input-hint">Paste image URL or upload to Supabase Storage and copy the URL</span>
            </div>
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="cover preview" style={{ width: '100%', borderRadius: 6, objectFit: 'cover', aspectRatio: '16/9' }} />
            )}
          </div>

          {/* Video */}
          <div className="sidebar-card">
            <p className="sidebar-card-title">Video (optional)</p>
            <input
              className="form-input"
              placeholder="YouTube / Vimeo embed URL"
              value={form.video_url}
              onChange={e => set('video_url', e.target.value)}
            />
          </div>

          {/* SEO */}
          <div className="sidebar-card">
            <p className="sidebar-card-title">SEO (not shown publicly)</p>
            <div className="form-field">
              <label>Slug</label>
              <input
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                value={form.slug}
                onChange={e => { slugManuallyEdited.current = true; set('slug', e.target.value) }}
                placeholder="auto-generated-from-title"
              />
            </div>
            <div className="form-field">
              <label>Keywords</label>
              <input
                className="form-input"
                placeholder="scheduling, productivity, calendar"
                value={form.seo_keywords}
                onChange={e => set('seo_keywords', e.target.value)}
              />
              <span className="form-input-hint">Comma-separated. Not visible on the blog.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
