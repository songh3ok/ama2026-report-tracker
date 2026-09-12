import React, { useState, useEffect } from 'react';
import './App.css';
import { INITIAL_SPEAKERS, CONVENTION_INFO } from './data/speakersData';
import { TimetableGrid } from './components/TimetableGrid';
import { MobileTimeline } from './components/MobileTimeline';
import { DetailModal } from './components/DetailModal';
import { Download, RotateCcw, Sun, Moon, CheckCircle2, ListOrdered, LayoutGrid } from 'lucide-react';

const STORAGE_KEY = 'ama2026_timetable_en_v1';
const THEME_KEY = 'ama2026_theme';

export function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  const [speakers, setSpeakers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedMap = {};
          parsed.forEach(p => { savedMap[p.id] = p; });
          return INITIAL_SPEAKERS.map(item => {
            const savedItem = savedMap[item.id];
            if (!savedItem) return item;
            return {
              ...item,
              status: savedItem.status || 'pending',
              submittedAt: savedItem.submittedAt || null,
              computerOS: savedItem.computerOS || '',
              fileTypes: savedItem.fileTypes || [],
              notes: savedItem.notes || ''
            };
          });
        }
      }
    } catch (e) {
      console.error('Local storage load error:', e);
    }
    return INITIAL_SPEAKERS;
  });

  // View Mode: 'mobile' (touch timeline) vs 'desktop' (full PDF grid)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return 'mobile';
    }
    return 'desktop';
  });

  const [highlightPendingOnly, setHighlightPendingOnly] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(speakers));
  }, [speakers]);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Convert array to map for fast lookup
  const speakersMap = React.useMemo(() => {
    const map = {};
    speakers.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [speakers]);

  // Handle status actions: Undo reverts to pending; pending triggers questionnaire modal
  const handleToggleStatus = (id) => {
    const target = speakers.find(s => s.id === id);
    if (!target) return;

    if (target.status === 'submitted') {
      // Undo (↺) wipes the recorded platform/formats, so always ask first
      const confirmed = window.confirm(
        `정말 되돌릴까요?\n\n${target.speakerName}의 제출 기록과 입력한 컴퓨터·파일 정보가 지워지고 '미제출' 상태가 됩니다.\n\nRevert ${target.speakerName} to Not Received?`
      );
      if (!confirmed) return;

      setSpeakers(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'pending',
            submittedAt: '',
            computerOS: '',
            fileTypes: []
          };
        }
        return item;
      }));
      showToast(`ℹ ${target.speakerName} reverted to Not Received.`);
    } else {
      // Opening modal for mandatory questions before submitting
      setSelectedSpeaker(target);
    }
  };

  // Save changes from modal
  const handleSaveModal = (id, formData) => {
    setSpeakers(prev => prev.map(s => (s.id === id ? { ...s, ...formData } : s)));
    const target = speakers.find(s => s.id === id);
    const name = target ? target.speakerName : 'Session';
    showToast(`✓ ${name} Submitted (${formData.computerOS} · ${(formData.fileTypes || []).join(', ')})`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Session Topic', 'Role', 'Speaker Name', 'Affiliation / Country', 'Date', 'Time', 'Status', 'Received Timestamp', 'Computer Platform', 'Material Formats', 'Notes'];
    const rows = speakers.map(s => [
      `"${s.categoryLabel}"`,
      `"${s.sessionTitle}"`,
      `"${s.role}"`,
      `"${s.speakerName}"`,
      `"${s.affiliationOrCountry}"`,
      `"${s.dateLabel}"`,
      `"${s.time}"`,
      `"${s.status === 'submitted' ? 'Submitted' : 'Pending'}"`,
      `"${s.submittedAt || ''}"`,
      `"${s.computerOS || ''}"`,
      `"${(s.fileTypes || []).join(', ')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMA2026_Submission_Tracker_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('CSV downloaded successfully.');
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('Reset all submission data to default?')) {
      setSpeakers(INITIAL_SPEAKERS);
      showToast('Data reset to default.');
    }
  };

  // Calculations
  const totalCount = speakers.length;
  const submittedCount = speakers.filter(s => s.status === 'submitted').length;
  const pendingCount = totalCount - submittedCount;
  const percent = Math.round((submittedCount / totalCount) * 100);

  return (
    <div className="app">
      {toastMsg && (
        <div className="toast" role="status">
          <CheckCircle2 size={15} />
          <span>{toastMsg}</span>
        </div>
      )}

      <header className="masthead">
        <div className="masthead-text">
          <div className="eyebrow">The 15th AMA Triennial Convention · Incheon 2026</div>
          <h1 className="masthead-title">
            Report &amp; Presentation <em>Tracker</em>
          </h1>
          <p className="masthead-sub">
            {CONVENTION_INFO.theme} · {CONVENTION_INFO.period}
          </p>
        </div>

        <div className="masthead-actions">
          <button className="btn" onClick={handleExportCSV} title="Export CSV spreadsheet">
            <Download size={14} />
            <span className="hide-on-mobile">Export CSV</span>
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            className="btn btn-icon btn-danger"
            onClick={handleReset}
            title="Reset data"
            aria-label="Reset data"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Summary */}
      <section className="overview" aria-label="Submission summary">
        <div className="overview-main">
          <div className="overview-label">Materials submitted</div>
          <div className="overview-figure">
            <span className="figure-num">{submittedCount}</span>
            <span className="figure-total">/ {totalCount}</span>
            <span className="figure-pct">{percent}%</span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-bar" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="overview-stats">
          <div className="stat">
            <span className="stat-dot is-ok" />
            <span className="stat-label">Submitted</span>
            <span className="stat-val">{submittedCount}</span>
          </div>
          <div className="stat">
            <span className="stat-dot is-warn" />
            <span className="stat-label">Not received</span>
            <span className="stat-val">{pendingCount}</span>
          </div>
          <div className="stat">
            <span className="stat-dot" />
            <span className="stat-label">Target</span>
            <span className="stat-val">{totalCount}</span>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="segmented" role="tablist" aria-label="View mode">
          <button
            role="tab"
            aria-selected={viewMode === 'mobile'}
            className={viewMode === 'mobile' ? 'active' : ''}
            onClick={() => setViewMode('mobile')}
            title="Day-by-day timeline"
          >
            <ListOrdered size={14} />
            <span>Timeline</span>
          </button>
          <button
            role="tab"
            aria-selected={viewMode === 'desktop'}
            className={viewMode === 'desktop' ? 'active' : ''}
            onClick={() => setViewMode('desktop')}
            title="Full PDF timetable grid"
          >
            <LayoutGrid size={14} />
            <span>Full grid</span>
          </button>
        </div>

        <button
          className={`toggle ${highlightPendingOnly ? 'on' : ''}`}
          aria-pressed={highlightPendingOnly}
          onClick={() => setHighlightPendingOnly(prev => !prev)}
        >
          <span className="toggle-track" aria-hidden="true">
            <span className="toggle-thumb" />
          </span>
          <span>Not received only</span>
        </button>
      </div>

      <p className="hint">
        Click <strong>Start</strong> on a speaker to record platform and file formats. Click any card to view or edit.
      </p>

      {viewMode === 'mobile' ? (
        <MobileTimeline
          speakersMap={speakersMap}
          onToggleStatus={handleToggleStatus}
          onOpenEdit={(spk) => setSelectedSpeaker(spk)}
          highlightPendingOnly={highlightPendingOnly}
        />
      ) : (
        <TimetableGrid
          speakersMap={speakersMap}
          onToggleStatus={handleToggleStatus}
          onOpenEdit={(spk) => setSelectedSpeaker(spk)}
          highlightPendingOnly={highlightPendingOnly}
        />
      )}

      <DetailModal
        speaker={selectedSpeaker}
        isOpen={Boolean(selectedSpeaker)}
        onClose={() => setSelectedSpeaker(null)}
        onSave={handleSaveModal}
      />

      <footer className="footer">
        The 15th AMA Triennial Convention Incheon 2026 · Organizing Committee
      </footer>
    </div>
  );
}

export default App;
