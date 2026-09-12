import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle2, Clock, Link as LinkIcon, FileText } from 'lucide-react';

export function DetailModal({ speaker, isOpen, onClose, onSave }) {
  if (!isOpen || !speaker) return null;

  const [formData, setFormData] = useState({
    status: 'pending',
    documentTitle: '',
    documentUrl: '',
    submittedAt: '',
    notes: ''
  });

  useEffect(() => {
    if (speaker) {
      setFormData({
        status: speaker.status || 'pending',
        documentTitle: speaker.documentTitle || '',
        documentUrl: speaker.documentUrl || '',
        submittedAt: speaker.submittedAt || '',
        notes: speaker.notes || ''
      });
    }
  }, [speaker]);

  const handleToggleStatus = () => {
    const isNowSubmitted = formData.status !== 'submitted';
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      status: isNowSubmitted ? 'submitted' : 'pending',
      submittedAt: isNowSubmitted ? (prev.submittedAt || formatted) : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(speaker.id, formData);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-container glass-panel modal-compact" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{speaker.speakerName}</h2>
            <p className="modal-subtitle">
              {speaker.sessionTitle} · {speaker.dateLabel} {speaker.time}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Quick Status Bar */}
          <div className="status-toggle-box">
            <span className="status-toggle-label">Status:</span>
            <div className="status-toggle-right">
              <span className={`tt-status-tag ${formData.status === 'submitted' ? 'tag-submitted' : 'tag-pending'}`}>
                {formData.status === 'submitted' ? 'Submitted' : 'Pending'}
              </span>
              <button
                type="button"
                className={`modal-action-btn ${formData.status === 'submitted' ? 'btn-undo' : 'btn-submit'}`}
                onClick={handleToggleStatus}
              >
                {formData.status === 'submitted' ? 'Undo Submission' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Submission Timestamp */}
          <div className="form-group">
            <label className="form-label">
              <Clock size={14} />
              <span>Received Timestamp</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2026-09-12 14:30 (Auto-recorded on submit)"
              value={formData.submittedAt}
              onChange={(e) => setFormData({ ...formData, submittedAt: e.target.value })}
            />
          </div>

          {/* Document Title */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={14} />
              <span>Paper / Presentation Title</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter presentation or paper title..."
              value={formData.documentTitle}
              onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
            />
          </div>

          {/* Document URL */}
          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} />
              <span>Material Link (Google Drive / OneDrive / Dropbox)</span>
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://drive.google.com/..."
              value={formData.documentUrl}
              onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="Additional notes or memos..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
