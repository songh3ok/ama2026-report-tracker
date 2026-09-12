import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  ExternalLink, 
  Edit3, 
  MessageSquareShare 
} from 'lucide-react';

export function SpeakerTable({ 
  speakers, 
  onQuickToggleStatus, 
  onOpenEditModal, 
  onOpenReminderModal 
}) {
  const getRoleBadgeClass = (role) => {
    if (role.includes('강사')) return 'role-badge-lecturer';
    if (role.includes('논찬')) return 'role-badge-respondent';
    return 'role-badge-reporter';
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="status-badge status-badge-submitted">
            <CheckCircle2 size={12} />
            제출 완료
          </span>
        );
      case 'reviewing':
        return (
          <span className="status-badge status-badge-reviewing">
            <FileCheck2 size={12} />
            검토 중
          </span>
        );
      case 'revision':
        return (
          <span className="status-badge status-badge-revision">
            <AlertTriangle size={12} />
            수정 요청
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="status-badge status-badge-pending">
            <AlertTriangle size={12} />
            미제출
          </span>
        );
    }
  };

  return (
    <div className="table-wrapper glass-panel">
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ width: '90px' }}>일자</th>
            <th style={{ width: '130px' }}>구분 / 역할</th>
            <th>세션 주제 / 소속</th>
            <th>강사/발표자명</th>
            <th style={{ width: '110px' }}>제출 상태</th>
            <th>접수 자료 / 비고</th>
            <th style={{ width: '140px', textAlign: 'center' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {speakers.map((s) => (
            <tr key={s.id} className={`table-row status-row-${s.status}`}>
              <td className="cell-date">
                <span className="date-tag">{s.dateLabel}</span>
                <span className="time-subtext">{s.time}</span>
              </td>

              <td className="cell-role">
                <span className={`role-badge ${getRoleBadgeClass(s.role)}`}>
                  {s.role}
                </span>
                <span className="category-micro">{s.categoryLabel}</span>
              </td>

              <td className="cell-session">
                <div className="session-title-strong">{s.sessionTitle}</div>
                <div className="affiliation-subtext">{s.affiliationOrCountry}</div>
              </td>

              <td className="cell-speaker">
                <div className="speaker-name-strong">{s.speakerName}</div>
                {s.contactEmail && (
                  <span className="email-subtext">{s.contactEmail}</span>
                )}
              </td>

              <td className="cell-status">
                {renderStatus(s.status)}
              </td>

              <td className="cell-doc">
                {s.status === 'submitted' ? (
                  <div className="doc-info-compact">
                    <span className="doc-title-compact">
                      {s.documentTitle || '자료 접수 완료'}
                    </span>
                    {s.documentUrl && (
                      <a
                        href={s.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-mini-link"
                      >
                        <ExternalLink size={12} />
                        자료열기
                      </a>
                    )}
                    {s.submittedAt && (
                      <span className="date-mini">({s.submittedAt})</span>
                    )}
                  </div>
                ) : (
                  <div className="pending-action-compact">
                    <span className="pending-micro-text">미접수</span>
                    <button
                      className="table-reminder-btn"
                      onClick={() => onOpenReminderModal(s)}
                      title="독촉 메시지 생성"
                    >
                      <MessageSquareShare size={12} />
                      독촉문구
                    </button>
                  </div>
                )}
              </td>

              <td className="cell-actions">
                <div className="table-actions-row">
                  <button
                    className={`btn-table-toggle ${s.status === 'submitted' ? 'is-submitted' : 'is-pending'}`}
                    onClick={() => onQuickToggleStatus(s.id)}
                    title="상태 빠른 토글"
                  >
                    {s.status === 'submitted' ? '미제출' : '제출완료'}
                  </button>
                  <button
                    className="btn-table-edit"
                    onClick={() => onOpenEditModal(s)}
                    title="상세 편집"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
