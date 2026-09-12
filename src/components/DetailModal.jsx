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
            <span className="status-toggle-label">제출 상태:</span>
            <button
              type="button"
              className={`status-pill-toggle ${formData.status === 'submitted' ? 'is-submitted' : 'is-pending'}`}
              onClick={handleToggleStatus}
            >
              {formData.status === 'submitted' ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>제출 완료됨 (클릭시 미제출로 변경)</span>
                </>
              ) : (
                <>
                  <Clock size={16} />
                  <span>미제출 상태 (클릭시 제출완료로 변경)</span>
                </>
              )}
            </button>
          </div>

          {/* Submission Timestamp */}
          <div className="form-group">
            <label className="form-label">
              <Clock size={14} />
              <span>제출 기록 일시 (날짜 및 시간)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="예: 2026-09-12 14:30 (제출완료 시 자동입력)"
              value={formData.submittedAt}
              onChange={(e) => setFormData({ ...formData, submittedAt: e.target.value })}
            />
          </div>

          {/* Document Title */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={14} />
              <span>원고 / 발표자료 제목</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="발표 주제나 원고 제목 입력..."
              value={formData.documentTitle}
              onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
            />
          </div>

          {/* Document URL */}
          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} />
              <span>자료 링크 (구글드라이브 / 클라우드 URL)</span>
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
            <label className="form-label">메모 / 특이사항</label>
            <input
              type="text"
              className="form-input"
              placeholder="참고사항..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              닫기
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
