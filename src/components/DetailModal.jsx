import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle2, Clock, Laptop, FileCheck, Check } from 'lucide-react';

const OS_OPTIONS = ['Windows', 'Mac'];
const FILE_TYPE_OPTIONS = ['PPT', 'Keynote', 'PDF', 'DOCX', 'Image', 'MP4', 'MP3', 'Other'];

export function DetailModal({ speaker, isOpen, onClose, onSave }) {
  if (!isOpen || !speaker) return null;

  const [formData, setFormData] = useState({
    status: 'pending',
    computerOS: '',
    fileTypes: [],
    submittedAt: '',
    notes: ''
  });

  useEffect(() => {
    if (speaker) {
      setFormData({
        status: speaker.status || 'pending',
        computerOS: speaker.computerOS || '',
        fileTypes: Array.isArray(speaker.fileTypes) ? speaker.fileTypes : [],
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

  const handleToggleOS = (os) => {
    setFormData(prev => ({
      ...prev,
      computerOS: prev.computerOS === os ? '' : os
    }));
  };

  const handleToggleFileType = (type) => {
    setFormData(prev => {
      const exists = prev.fileTypes.includes(type);
      const updated = exists 
        ? prev.fileTypes.filter(t => t !== type)
        : [...prev.fileTypes, type];
      return { ...prev, fileTypes: updated };
    });
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

          {/* Computer Platform (Windows / Mac) */}
          <div className="form-group">
            <label className="form-label">
              <Laptop size={14} />
              <span>Computer Platform</span>
            </label>
            <div className="os-selector-grid">
              {OS_OPTIONS.map(os => {
                const isSelected = formData.computerOS === os;
                return (
                  <button
                    key={os}
                    type="button"
                    className={`os-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleOS(os)}
                  >
                    {isSelected && <Check size={14} className="text-blue-400" />}
                    <span>{os}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Types (PPT, Keynote, PDF, DOCX, Image, MP4, MP3, Other) */}
          <div className="form-group">
            <label className="form-label">
              <FileCheck size={14} />
              <span>Material Format Type</span>
            </label>
            <div className="file-types-chips-grid">
              {FILE_TYPE_OPTIONS.map(type => {
                const isSelected = formData.fileTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    className={`file-type-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleFileType(type)}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes / Remarks</label>
            <input
              type="text"
              className="form-input"
              placeholder="Additional details..."
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
