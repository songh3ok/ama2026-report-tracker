import React from 'react';
import { CheckCircle2, Clock, AlertCircle, FileCheck, Layers, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export function StatsOverview({ speakers }) {
  const total = speakers.length;
  const submitted = speakers.filter(s => s.status === 'submitted').length;
  const pending = speakers.filter(s => s.status === 'pending').length;
  const reviewing = speakers.filter(s => s.status === 'reviewing').length;
  const revision = speakers.filter(s => s.status === 'revision').length;

  const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;

  // Category counts
  const plenaryTotal = speakers.filter(s => s.category === 'plenary').length;
  const plenarySubmitted = speakers.filter(s => s.category === 'plenary' && s.status === 'submitted').length;

  const globalTotal = speakers.filter(s => s.category === 'global_links').length;
  const globalSubmitted = speakers.filter(s => s.category === 'global_links' && s.status === 'submitted').length;

  const nationalTotal = speakers.filter(s => s.category === 'national_reports').length;
  const nationalSubmitted = speakers.filter(s => s.category === 'national_reports' && s.status === 'submitted').length;

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  React.useEffect(() => {
    if (total > 0 && submitted === total) {
      handleCelebrate();
    }
  }, [submitted, total]);

  return (
    <section className="stats-section">
      {/* Top Grid KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrap icon-blue">
            <Layers size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">관리 대상 전체</span>
            <div className="stat-number-row">
              <span className="stat-value">{total}</span>
              <span className="stat-unit">명</span>
            </div>
          </div>
        </div>

        <div className="stat-card glass-panel stat-submitted">
          <div className="stat-icon-wrap icon-emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">제출 완료</span>
            <div className="stat-number-row">
              <span className="stat-value text-emerald-400">{submitted}</span>
              <span className="stat-unit">/ {total}명</span>
              <span className="stat-badge-percent">{percentage}%</span>
            </div>
          </div>
        </div>

        <div className="stat-card glass-panel stat-pending">
          <div className="stat-icon-wrap icon-rose">
            <Clock size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">미제출 (대기중)</span>
            <div className="stat-number-row">
              <span className="stat-value text-rose-400">{pending}</span>
              <span className="stat-unit">명</span>
              {pending > 0 && <span className="stat-badge-alert">독촉 필요</span>}
            </div>
          </div>
        </div>

        <div className="stat-card glass-panel stat-review">
          <div className="stat-icon-wrap icon-amber">
            <AlertCircle size={22} />
          </div>
          <div className="stat-body">
            <span className="stat-label">검토 및 보완</span>
            <div className="stat-number-row">
              <span className="stat-value text-amber-400">{reviewing + revision}</span>
              <span className="stat-unit">명</span>
              <span className="stat-subdetail">(검토 {reviewing} · 보완 {revision})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Category Bar */}
      <div className="progress-panel glass-panel">
        <div className="progress-header">
          <div className="progress-title-group">
            <FileCheck size={18} className="text-blue-400" />
            <span className="progress-title">전체 제출 달성률</span>
            <span className="progress-percent-large">{percentage}%</span>
          </div>
          <button 
            className="celebrate-btn" 
            onClick={handleCelebrate}
            title="축하 효과 보기"
          >
            <Award size={16} />
            <span>응원 효과</span>
          </button>
        </div>

        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          >
            <div className="progress-bar-glow"></div>
          </div>
        </div>

        {/* Category breakdown chips */}
        <div className="category-breakdown-row">
          <div className="breakdown-chip">
            <span className="chip-name">플래너리 세션 (강의/논찬)</span>
            <span className="chip-stat">
              <strong>{plenarySubmitted}</strong> / {plenaryTotal}명
              <span className="chip-pct">({Math.round((plenarySubmitted / plenaryTotal) * 100 || 0)}%)</span>
            </span>
          </div>

          <div className="breakdown-chip">
            <span className="chip-name">글로벌링크 리포트</span>
            <span className="chip-stat">
              <strong>{globalSubmitted}</strong> / {globalTotal}명
              <span className="chip-pct">({Math.round((globalSubmitted / globalTotal) * 100 || 0)}%)</span>
            </span>
          </div>

          <div className="breakdown-chip">
            <span className="chip-name">내셔널 리포트</span>
            <span className="chip-stat">
              <strong>{nationalSubmitted}</strong> / {nationalTotal}명
              <span className="chip-pct">({Math.round((nationalSubmitted / nationalTotal) * 100 || 0)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
