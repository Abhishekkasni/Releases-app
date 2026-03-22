import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRelease, updateRelease, deleteRelease } from '../api/releases'

const STEPS = [
  { key: 'step_1', label: 'All relevant GitHub pull requests have been merged' },
  { key: 'step_2', label: 'CHANGELOG.md has been updated' },
  { key: 'step_3', label: 'All tests are passing' },
  { key: 'step_4', label: 'Release created on GitHub' },
  { key: 'step_5', label: 'Deployed to staging' },
  { key: 'step_6', label: 'Tested thoroughly on staging' },
  { key: 'step_7', label: 'Deployed to production' },
  { key: 'step_8', label: 'Post-release monitoring completed' },
]

export default function ReleaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [release, setRelease] = useState(null)
  const [steps, setSteps] = useState({})
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRelease(id)
        setRelease(res.data)
        setSteps(res.data.steps_state || {})
        setAdditionalInfo(res.data.additional_info || '')
      } catch {
        setError('Failed to load release.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleStepToggle = async (key) => {
    const updated = { ...steps, [key]: !steps[key] }
    setSteps(updated)
    try {
      await updateRelease(id, { steps_state: updated })
    } catch {
      setError('Failed to update step.')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateRelease(id, { additional_info: additionalInfo, steps_state: steps })
      setRelease(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this release?')) return
    try {
      await deleteRelease(id)
      navigate('/')
    } catch {
      setError('Failed to delete.')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!release) return <div className="alert alert-error">Release not found.</div>

  const completedCount = STEPS.filter(s => steps[s.key]).length

  return (
    <div className="page">
      <div className="page-header">
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>All releases</span>
          <span className="breadcrumb-sep">›</span>
          <span>{release.name}</span>
        </div>
        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card detail-card">
        <div className="detail-meta">
          <div className="form-group">
            <label>Release</label>
            <div className="meta-value">{release.name}</div>
          </div>
          <div className="form-group">
            <label>Date</label>
            <div className="meta-value">{new Date(release.date).toLocaleDateString()}</div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <span className={`badge badge-${release.status}`}>{release.status}</span>
          </div>
        </div>

        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${(completedCount / STEPS.length) * 100}%` }} />
        </div>
        <div className="progress-label">{completedCount} / {STEPS.length} steps completed</div>

        <div className="steps-list">
          {STEPS.map(step => (
            <label key={step.key} className="step-item">
              <input
                type="checkbox"
                checked={!!steps[step.key]}
                onChange={() => handleStepToggle(step.key)}
              />
              <span className={steps[step.key] ? 'step-label done' : 'step-label'}>{step.label}</span>
            </label>
          ))}
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>Additional remarks / tasks</label>
          <textarea
            rows={4}
            placeholder="Please enter any other important notes for the release"
            value={additionalInfo}
            onChange={e => setAdditionalInfo(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}