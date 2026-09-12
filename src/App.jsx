import React, { useState, useEffect } from 'react';
import './App.css';
import { INITIAL_SPEAKERS, CONVENTION_INFO } from './data/speakersData';
import { TimetableGrid } from './components/TimetableGrid';
import { MobileTimeline } from './components/MobileTimeline';
import { DetailModal } from './components/DetailModal';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Clock,
  Eye,
  Calendar,
  Smartphone,
  LayoutGrid
} from 'lucide-react';

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
          return parsed;
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

  // 1-click status toggle directly from timetable: Submit <-> Pending
  const handleToggleStatus = (id) => {
    setSpeakers(prev => prev.map(item => {
      if (item.id === id) {
        const isNowSubmitted = item.status !== 'submitted';
        const now = new Date();
        const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const newStatus = isNowSubmitted ? 'submitted' : 'pending';
        showToast(
          isNowSubmitted 
            ? `✓ ${item.speakerName} marked as Submitted (${formatted})` 
            : `ℹ ${item.speakerName} reverted to Pending.`
        );

        return {
          ...item,
          status: newStatus,
          submittedAt: isNowSubmitted ? (item.submittedAt || formatted) : ''
        };
      }
      return item;
    }));
  };

  // Save changes from modal
  const handleSaveModal = (id, formData) => {
    setSpeakers(prev => prev.map(s => (s.id === id ? { ...s, ...formData } : s)));
    showToast('Changes saved.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Session Topic', 'Role', 'Speaker Name', 'Affiliation / Country', 'Date', 'Time', 'Status', 'Received Timestamp', 'Document Title', 'Material Link'];
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
      `"${(s.documentTitle || '').replace(/"/g, '""')}"`,
      `"${(s.documentUrl || '').replace(/"/g, '""')}"`
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
    <div className="simple-app-wrapper">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="simple-toast animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Convention Header */}
      <header className="simple-header glass-panel">
        <div className="header-info">
          <div className="convention-badge">
            <Calendar size={13} />
            <span>The 15th AMA Triennial Convention, Incheon 2026</span>
          </div>
          <h1 className="header-heading">Report & Presentation Submission Tracker</h1>
          <p className="header-subheading">
            {CONVENTION_INFO.theme} · Sep 14 (Mon) – Sep 18 (Fri), 2026
          </p>
        </div>

        <div className="header-buttons">
          <button 
            className="btn-simple" 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="btn-simple" onClick={handleExportCSV} title="Export CSV spreadsheet">
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span className="hide-on-mobile">Export CSV</span>
          </button>
          <button className="btn-simple btn-muted" onClick={handleReset} title="Reset data">
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Summary KPI & Action Bar */}
      <div className="summary-strip glass-panel">
        <div className="kpi-group">
          <div className="kpi-pill kpi-total">
            <span className="kpi-label">Target</span>
            <strong className="kpi-val">{totalCount}</strong>
          </div>
          <div className="kpi-pill kpi-submitted">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span className="kpi-label">Submitted</span>
            <strong className="kpi-val text-emerald-400">{submittedCount}</strong>
            <span className="kpi-badge">({percent}%)</span>
          </div>
          <div className="kpi-pill kpi-pending">
            <Clock size={15} className="text-rose-400" />
            <span className="kpi-label">Pending</span>
            <strong className="kpi-val text-rose-400">{pendingCount}</strong>
          </div>
        </div>

        <div className="filter-controls">
          {/* View mode switcher */}
          <div className="view-mode-pill">
            <button
              className={`view-pill-btn ${viewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewMode('mobile')}
              title="Mobile Day-by-Day Timeline"
            >
              <Smartphone size={14} />
              <span>Timeline</span>
            </button>
            <button
              className={`view-pill-btn ${viewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewMode('desktop')}
              title="Full PDF Timetable Grid"
            >
              <LayoutGrid size={14} />
              <span>Full Grid</span>
            </button>
          </div>

          <button 
            className={`toggle-filter-btn ${highlightPendingOnly ? 'active' : ''}`}
            onClick={() => setHighlightPendingOnly(prev => !prev)}
          >
            <Eye size={14} />
            <span>{highlightPendingOnly ? 'Show All' : '🔴 Pending Only'}</span>
          </button>
        </div>
      </div>

      <div className="table-guide-notice">
        <span>💡 <strong>Real-time Guide:</strong> Click <strong>[Submit]</strong> on any speaker card to record submission status with date & time. Click the card body to add material links or edit titles.</span>
      </div>

      {/* Main Content: Mobile Timeline or PDF Grid */}
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

      {/* Detail Edit Modal */}
      <DetailModal
        speaker={selectedSpeaker}
        isOpen={Boolean(selectedSpeaker)}
        onClose={() => setSelectedSpeaker(null)}
        onSave={handleSaveModal}
      />

      {/* Footer */}
      <footer className="simple-footer">
        <p>The 15th AMA Triennial Convention Incheon 2026 Organizing Committee</p>
      </footer>
    </div>
  );
}

export default App;
