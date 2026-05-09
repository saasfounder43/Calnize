'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BlogPost, BlogCategory } from '@/lib/blog-types'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [loading, setLoading] = useState(true)
  const [catLoading, setCatLoading] = useState(false)
  const [tab, setTab] = useState<'posts' | 'categories'>('posts')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [pr, cr] = await Promise.all([
      fetch('/api/admin/blog').then(r => r.json()),
      fetch('/api/admin/blog/categories').then(r => r.json()),
    ])
    setPosts(Array.isArray(pr) ? pr : [])
    setCategories(Array.isArray(cr) ? cr : [])
    setLoading(false)
  }

  async function addCategory() {
    if (!newCatName.trim()) return
    setCatLoading(true)
    await fetch('/api/admin/blog/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName }),
    })
    setNewCatName('')
    await fetchData()
    setCatLoading(false)
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return
    await fetch('/api/admin/blog/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await fetchData()
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post permanently?')) return
    setDeleting(id)
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    await fetchData()
    setDeleting(null)
  }

  async function togglePublish(post: BlogPost) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await fetchData()
  }

  const draftPosts = posts.filter(p => p.status === 'draft')
  const publishedPosts = posts.filter(p => p.status === 'published')

  return (
    <div className="admin-page">
      <style>{`
        .admin-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #111;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .admin-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
        .btn-primary {
          background: #0066ff;
          color: #fff;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #0052cc; }

        .admin-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid #eee;
          margin-bottom: 28px;
        }
        .admin-tab {
          padding: 10px 20px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #888;
          cursor: pointer;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: color 0.15s, border-color 0.15s;
        }
        .admin-tab.active { color: #0066ff; border-bottom-color: #0066ff; }

        .section-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #999;
          margin: 24px 0 10px;
        }
        .posts-table { width: 100%; border-collapse: collapse; }
        .posts-table th {
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #999;
          padding: 8px 12px;
          border-bottom: 1px solid #eee;
        }
        .posts-table td {
          padding: 12px;
          border-bottom: 1px solid #f4f4f4;
          font-size: 0.9rem;
          vertical-align: middle;
        }
        .posts-table tr:hover td { background: #fafafa; }
        .post-title-cell { font-weight: 500; color: #fff; background: #1a1a2e; padding: 12px; border-radius: 6px; max-width: 300px; }
        .post-title-link { color: inherit; text-decoration: none; }
        .post-title-link:hover { color: #0066ff; }
        .status-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-published { background: #d1fae5; color: #065f46; }
        .status-draft { background: #f3f4f6; color: #6b7280; }
        .table-actions { display: flex; gap: 8px; align-items: center; }
        .btn-link {
          background: none;
          border: none;
          color: #0066ff;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0;
          text-decoration: underline;
        }
        .btn-link:hover { opacity: 0.7; }
        .btn-danger { color: #dc2626; }
        .btn-toggle { color: #059669; }

        .cat-section { max-width: 500px; }
        .cat-form { display: flex; gap: 8px; margin-bottom: 20px; }
        .cat-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
        }
        .cat-input:focus { border-color: #0066ff; }
        .cat-list { display: flex; flex-direction: column; gap: 8px; }
        .cat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border: 1px solid #eee;
          border-radius: 8px;
          background: #fafafa;
        }
        .cat-item-name { font-size: 0.9rem; font-weight: 500; }
        .cat-item-slug { font-size: 0.75rem; color: #999; font-family: monospace; }

        .empty-state { text-align: center; padding: 60px 0; color: #aaa; font-size: 0.9rem; }
      `}</style>

      <div className="admin-header">
        <h1>📝 Blog Admin</h1>
        <Link href="/admin/blog/new" className="btn-primary">+ New Post</Link>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'posts' ? ' active' : ''}`} onClick={() => setTab('posts')}>
          Posts ({posts.length})
        </button>
        <button className={`admin-tab${tab === 'categories' ? ' active' : ''}`} onClick={() => setTab('categories')}>
          Categories ({categories.length})
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : tab === 'posts' ? (
        <>
          {posts.length === 0 ? (
            <div className="empty-state">No posts yet. <Link href="/admin/blog/new" className="btn-link">Create your first post →</Link></div>
          ) : (
            <>
              {publishedPosts.length > 0 && (
                <>
                  <div className="section-label">Published ({publishedPosts.length})</div>
                  <PostsTable posts={publishedPosts} onDelete={deletePost} onToggle={togglePublish} deleting={deleting} categories={categories} />
                </>
              )}
              {draftPosts.length > 0 && (
                <>
                  <div className="section-label">Drafts ({draftPosts.length})</div>
                  <PostsTable posts={draftPosts} onDelete={deletePost} onToggle={togglePublish} deleting={deleting} categories={categories} />
                </>
              )}
            </>
          )}
        </>
      ) : (
        <div className="cat-section">
          <div className="cat-form">
            <input
              className="cat-input"
              placeholder="Category name (e.g. Productivity)"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <button className="btn-primary" onClick={addCategory} disabled={catLoading}>
              {catLoading ? 'Adding…' : 'Add'}
            </button>
          </div>
          <div className="cat-list">
            {categories.length === 0 ? (
              <div className="empty-state">No categories yet.</div>
            ) : categories.map(cat => (
              <div key={cat.id} className="cat-item">
                <div>
                  <div className="cat-item-name">{cat.name}</div>
                  <div className="cat-item-slug">{cat.slug}</div>
                </div>
                <button className="btn-link btn-danger" onClick={() => deleteCategory(cat.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PostsTable({
  posts,
  onDelete,
  onToggle,
  deleting,
  categories,
}: {
  posts: BlogPost[]
  onDelete: (id: string) => void
  onToggle: (post: BlogPost) => void
  deleting: string | null
  categories: BlogCategory[]
}) {
  return (
    <table className="posts-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {posts.map(post => (
          <tr key={post.id}>
            <td className="post-title-cell">
              <Link href={`/admin/blog/${post.id}/edit`} className="post-title-link">
                {post.title}
              </Link>
            </td>
            <td style={{ color: '#888', fontSize: '0.85rem' }}>
              {post.blog_categories?.name ?? '—'}
            </td>
            <td>
              <span className={`status-badge status-${post.status}`}>
                {post.status}
              </span>
            </td>
            <td style={{ color: '#888', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </td>
            <td>
              <div className="table-actions">
                <Link href={`/admin/blog/${post.id}/edit`} className="btn-link">Edit</Link>
                <button
                  className={`btn-link btn-toggle`}
                  onClick={() => onToggle(post)}
                >
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                {post.status === 'published' && (
                  <Link href={`/blog/${post.slug}`} target="_blank" className="btn-link">View</Link>
                )}
                <button
                  className="btn-link btn-danger"
                  onClick={() => onDelete(post.id)}
                  disabled={deleting === post.id}
                >
                  {deleting === post.id ? '…' : 'Delete'}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
