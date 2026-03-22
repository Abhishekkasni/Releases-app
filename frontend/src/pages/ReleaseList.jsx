import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReleases, createRelease, deleteRelease } from '../api/releases'

export default function ReleaseList() {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', additional_info: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchReleases = async () => {
    try {
      const res = await getReleases()
      setReleases(res.data)
    } catch {
      setError('Failed to load releases.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReleases() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createRelease(form)
      setForm({ name: '', date: '', additional_info: '' })
      setShowForm(false)
      fetchReleases()
    } catch {
      setError('Failed to create release.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this release?')) return
    try {
      await deleteRelease(id)
      setReleases(releases.filter(r => r.id !== id))
    } catch {
      setError('Failed to delete release.')
    }
  }

  const statusClass = (status) => `badge badge-${status}`

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Releases</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Release'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="card form-card" onSubmit={handleCreate}>
          <h3>Create New Release</h3>
          <div className="form-group">
            <label>Release Name *</label>
            <input
              type="text"
              placeholder="e.g. Version 1.0.1"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Additional Info</label>
            <textarea
              placeholder="Any notes about this release..."
              value={form.additional_info}
              onChange={e => setForm({ ...form, additional_info: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Release'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading releases...</div>
      ) : releases.length === 0 ? (
        <div className="empty-state">No releases yet. Create your first one!</div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Release</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {releases.map(r => (
                <tr key={r.id} onClick={() => navigate(`/releases/${r.id}`)} className="table-row-clickable">
                  <td>{r.name}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td><span className={statusClass(r.status)}>{r.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/releases/${r.id}`)}>View</button>
                    <button className="btn btn-sm btn-danger" onClick={(e) => handleDelete(e, r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}