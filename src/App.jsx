import React, { useState, useEffect } from 'react';
import './App.css';
import { INITIAL_SPEAKERS, CONVENTION_INFO } from './data/speakersData';
import { TimetableGrid } from './components/TimetableGrid';
import { DetailModal } from './components/DetailModal';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Sun, 
  Moon, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Eye,
  Calendar
} from 'lucide-react';

const STORAGE_KEY = 'ama2026_timetable_v2';
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

  const [highlightPendingOnly, setHighlightPendingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Convert array to map for instant lookup by ID in the timetable
  const speakersMap = React.useMemo(() => {
    const map = {};
    speakers.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [speakers]);

  // Quick 1-click status toggle directly from timetable
  const handleToggleStatus = (id) => {
    setSpeakers(prev => prev.map(item => {
      if (item.id === id) {
        const isNowSubmitted = item.status !== 'submitted';
        const now = new Date();
        const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const newStatus = isNowSubmitted ? 'submitted' : 'pending';
        showToast(
          isNowSubmitted 
            ? `✓ ${item.speakerName} [제출 완료] (${formatted})` 
            : `ℹ ${item.speakerName} [미제출]로 변경되었습니다.`
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
    showToast('저장되었습니다.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['구분', '세션 주제', '역할', '강사명', '소속/국가', '일자', '시간', '제출상태', '제출일시', '원고제목', '자료링크'];
    const rows = speakers.map(s => [
      `"${s.categoryLabel}"`,
      `"${s.sessionTitle}"`,
      `"${s.role}"`,
      `"${s.speakerName}"`,
      `"${s.affiliationOrCountry}"`,
      `"${s.dateLabel}"`,
      `"${s.time}"`,
      `"${s.status === 'submitted' ? '제출완료' : '미제출'}"`,
      `"${s.submittedAt || ''}"`,
      `"${(s.documentTitle || '').replace(/"/g, '""')}"`,
      `"${(s.documentUrl || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMA2026_발표자료_접수현황_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('CSV 다운로드가 완료되었습니다.');
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('기본 데이터로 초기화하시겠습니까?')) {
      setSpeakers(INITIAL_SPEAKERS);
      showToast('초기화되었습니다.');
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
          <h1 className="header-heading">발표자료 실시간 접수 모니터링 일정표</h1>
          <p className="header-subheading">
            {CONVENTION_INFO.theme} · 2026. 9. 14(월) ~ 9. 18(금)
          </p>
        </div>

        <div className="header-buttons">
          <button 
            className="btn-simple" 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="테마 전환"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? '라이트' : '다크'}</span>
          </button>
          <button className="btn-simple" onClick={handleExportCSV} title="Excel CSV 다운로드">
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span>CSV 저장</span>
          </button>
          <button className="btn-simple btn-muted" onClick={handleReset} title="초기화">
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Summary KPI & Action Bar */}
      <div className="summary-strip glass-panel">
        <div className="kpi-group">
          <div className="kpi-pill kpi-total">
            <span className="kpi-label">전체 대상</span>
            <strong className="kpi-val">{totalCount}명</strong>
          </div>
          <div className="kpi-pill kpi-submitted">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span className="kpi-label">제출 완료</span>
            <strong className="kpi-val text-emerald-400">{submittedCount}명</strong>
            <span className="kpi-badge">({percent}%)</span>
          </div>
          <div className="kpi-pill kpi-pending">
            <Clock size={15} className="text-rose-400" />
            <span className="kpi-label">미제출</span>
            <strong className="kpi-val text-rose-400">{pendingCount}명</strong>
          </div>
        </div>

        <div className="filter-controls">
          <button 
            className={`toggle-filter-btn ${highlightPendingOnly ? 'active' : ''}`}
            onClick={() => setHighlightPendingOnly(prev => !prev)}
          >
            <Eye size={14} />
            <span>{highlightPendingOnly ? '전체 보기' : '🔴 미제출자만 강조'}</span>
          </button>
        </div>
      </div>

      <div className="table-guide-notice">
        <span>💡 <strong>이용 안내:</strong> 일정표 각 칸의 강사 박스에서 <strong>[제출/미제출]</strong> 버튼을 누르면 즉시 상태가 바뀌고 날짜와 시간이 자동 저장됩니다. 박스를 클릭하면 세부 링크나 원고 제목을 입력할 수 있습니다.</span>
      </div>

      {/* Program Timetable Grid */}
      <TimetableGrid
        speakersMap={speakersMap}
        onToggleStatus={handleToggleStatus}
        onOpenEdit={(spk) => setSelectedSpeaker(spk)}
        highlightPendingOnly={highlightPendingOnly}
      />

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
