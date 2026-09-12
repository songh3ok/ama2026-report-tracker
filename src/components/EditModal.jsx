import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, User, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';

export function EditModal({ speaker, isOpen, onClose, onSave }) {
  if (!isOpen || !speaker) return null;

  const [formData, setFormData] = useState({
    status: 'pending',
    documentTitle: '',
    documentUrl: '',
    submittedAt: '',
    contactEmail: '',
    notes: ''
  });

  useEffect(() => {
    if (speaker) {
      setFormData({
        status: speaker.status || 'pending',
        documentTitle: speaker.documentTitle || '',
        documentUrl: speaker.documentUrl || '',
        submittedAt: speaker.submittedAt || '',
        contactEmail: speaker.contactEmail || '',
        notes: speaker.notes || ''
      });
    }
  }, [speaker]);

  const handleStatusChange = (newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'submitted' && !formData.submittedAt) {
      const now = new Date();
      updates.submittedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(speaker.id, formData);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">발표자 자료 접수 상태 편집</h2>
            <p className="modal-subtitle">
              {speaker.speakerName} · {speaker.sessionTitle}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Target Info Summary */}
          <div className="modal-info-card">
            <div className="info-card-row">
              <span className="info-label">일자 및 시간:</span>
              <span className="info-val">{speaker.dateLabel} {speaker.time}</span>
            </div>
            <div className="info-card-row">
              <span className="info-label">구분 및 역할:</span>
              <span className="info-val">{speaker.categoryLabel} / {speaker.role}</span>
            </div>
            <div className="info-card-row">
              <span className="info-label">소속 / 기관:</span>
              <span className="info-val">{speaker.affiliationOrCountry}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">자료 접수 상태</label>
            <div className="status-radio-grid">
              {[
                { key: 'pending', label: '🔴 미제출 (Pending)' },
                { key: 'submitted', label: '🟢 제출 완료 (Submitted)' },
                { key: 'reviewing', label: '🟡 검토 중 (Reviewing)' },
                { key: 'revision', label: '🟣 수정 요청 (Revision)' }
              ].map(opt => (
                <label 
                  key={opt.key} 
                  className={`status-radio-label ${formData.status === opt.key ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.key}
                    checked={formData.status === opt.key}
                    onChange={() => handleStatusChange(opt.key)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Document Title */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={14} />
              <span>발제/논찬 원고 제목</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="예: The Future of Mission in the Age of AI"
              value={formData.documentTitle}
              onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
            />
          </div>

          {/* Document URL */}
          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} />
              <span>자료 링크 (Google Drive / OneDrive / Dropbox 등)</span>
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://drive.google.com/..."
              value={formData.documentUrl}
              onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
            />
          </div>

          {/* Submitted At */}
          <div className="form-group">
            <label className="form-label">
              <Clock size={14} />
              <span>접수 일시</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="예: 2026-09-12 14:00"
              value={formData.submittedAt}
              onChange={(e) => setFormData({ ...formData, submittedAt: e.target.value })}
            />
          </div>

          {/* Contact Email */}
          <div className="form-group">
            <label className="form-label">
              <User size={14} />
              <span>강사 연락처 (이메일)</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="speaker@example.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">메모 및 특이사항</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="PPT 슬라이드만 제출됨, 핸드아웃 별도 등..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>변경사항 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
