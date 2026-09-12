import React from 'react';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Edit3, 
  MessageSquareShare, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck2
} from 'lucide-react';

export function SpeakerCard({ 
  speaker, 
  onQuickToggleStatus, 
  onOpenEditModal, 
  onOpenReminderModal 
}) {
  const getRoleBadgeClass = (role) => {
    if (role.includes('강사')) return 'role-badge-lecturer';
    if (role.includes('논찬')) return 'role-badge-respondent';
    return 'role-badge-reporter';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="status-badge status-badge-submitted">
            <CheckCircle2 size={13} />
            제출 완료
          </span>
        );
      case 'reviewing':
        return (
          <span className="status-badge status-badge-reviewing">
            <FileCheck2 size={13} />
            검토 중
          </span>
        );
      case 'revision':
        return (
          <span className="status-badge status-badge-revision">
            <AlertTriangle size={13} />
            수정 요청
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="status-badge status-badge-pending">
            <AlertTriangle size={13} />
            미제출
          </span>
        );
    }
  };

  return (
    <div className={`speaker-card glass-panel status-border-${speaker.status}`}>
      {/* Top Meta Bar */}
      <div className="card-header">
        <div className="card-badge-group">
          <span className={`role-badge ${getRoleBadgeClass(speaker.role)}`}>
            {speaker.role}
          </span>
          <span className="category-subtag">
            {speaker.categoryLabel}
          </span>
        </div>
        <div>
          {getStatusBadge(speaker.status)}
        </div>
      </div>

      {/* Main Info */}
      <div className="card-main">
        <h3 className="speaker-name">{speaker.speakerName}</h3>
        <p className="session-title-text">{speaker.sessionTitle}</p>
        <p className="affiliation-text">{speaker.affiliationOrCountry}</p>
      </div>

      {/* Schedule Info */}
      <div className="card-schedule-strip">
        <div className="schedule-item">
          <Calendar size={13} />
          <span>{speaker.dateLabel}</span>
        </div>
        <div className="schedule-item">
          <Clock size={13} />
          <span>{speaker.time}</span>
        </div>
      </div>

      {/* Submission Info Area */}
      <div className="card-submission-area">
        {speaker.status === 'submitted' ? (
          <div className="submission-submitted-box">
            <div className="doc-title-row">
              <FileText size={15} className="text-emerald-400" />
              <span className="doc-title">
                {speaker.documentTitle || '발표 자료 접수 완료'}
              </span>
            </div>
            {speaker.documentUrl && (
              <a 
                href={speaker.documentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="doc-link-btn"
                title="등록된 자료 바로가기"
              >
                <ExternalLink size={13} />
                <span>자료 확인</span>
              </a>
            )}
            {speaker.submittedAt && (
              <span className="submitted-time-stamp">
                접수: {speaker.submittedAt}
              </span>
            )}
          </div>
        ) : (
          <div className="submission-pending-box">
            <span className="pending-notice-text">
              {speaker.status === 'pending' ? '원고 및 슬라이드 미접수 상태' : '내용 보완/검토 진행중'}
            </span>
            <button
              className="reminder-trigger-btn"
              onClick={() => onOpenReminderModal(speaker)}
              title="독촉/안내 메시지 템플릿 생성"
            >
              <MessageSquareShare size={13} />
              <span>독촉 메시지 생성</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="card-footer">
        <button
          className={`quick-toggle-btn ${speaker.status === 'submitted' ? 'toggle-submitted' : 'toggle-pending'}`}
          onClick={() => onQuickToggleStatus(speaker.id)}
          title="제출완료 ↔ 미제출 빠른 전환"
        >
          {speaker.status === 'submitted' ? '미제출로 변경' : '✓ 제출완료로 변경'}
        </button>

        <button
          className="edit-details-btn"
          onClick={() => onOpenEditModal(speaker)}
          title="상세 정보 및 링크 입력/수정"
        >
          <Edit3 size={15} />
          <span>상세</span>
        </button>
      </div>
    </div>
  );
}
