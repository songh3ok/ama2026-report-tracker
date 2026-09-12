import React, { useState, useEffect } from 'react';
import './App.css';
import { INITIAL_SPEAKERS, CONVENTION_INFO } from './data/speakersData';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterToolbar } from './components/FilterToolbar';
import { SpeakerCard } from './components/SpeakerCard';
import { SpeakerTable } from './components/SpeakerTable';
import { EditModal } from './components/EditModal';
import { ReminderModal } from './components/ReminderModal';
import { CheckCircle, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'ama2026_speakers_v1';
const THEME_KEY = 'ama2026_theme';

export function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  // Speakers database state
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
      console.error('Failed to load local storage data:', e);
    }
    return INITIAL_SPEAKERS;
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Modals
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [reminderSpeaker, setReminderSpeaker] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Sync speakers to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(speakers));
  }, [speakers]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Quick 1-click status toggle
  const handleQuickToggleStatus = (id) => {
    setSpeakers(prev => prev.map(item => {
      if (item.id === id) {
        const isNowSubmitted = item.status !== 'submitted';
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const newStatus = isNowSubmitted ? 'submitted' : 'pending';
        showToast(
          isNowSubmitted 
            ? `✓ ${item.speakerName} 님 [제출 완료] 처리되었습니다.` 
            : `ℹ ${item.speakerName} 님 [미제출]로 전환되었습니다.`
        );

        return {
          ...item,
          status: newStatus,
          submittedAt: isNowSubmitted ? (item.submittedAt || formattedDate) : null
        };
      }
      return item;
    }));
  };

  // Save detailed edits from modal
  const handleSaveEdit = (id, updatedFields) => {
    setSpeakers(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    }));
    showToast('저장되었습니다.');
  };

  // Export to Excel-compatible CSV (with UTF-8 BOM)
  const handleExportCSV = () => {
    const headers = [
      'ID', '구분', '세션 주제', '역할', '강사/발표자명', 
      '소속/국가', '일자', '시간', '제출상태', '원고/자료제목', 
      '접수일시', '자료링크', '연락처', '비고'
    ];

    const rows = speakers.map(s => [
      s.id,
      `"${s.categoryLabel.replace(/"/g, '""')}"`,
      `"${s.sessionTitle.replace(/"/g, '""')}"`,
      `"${s.role.replace(/"/g, '""')}"`,
      `"${s.speakerName.replace(/"/g, '""')}"`,
      `"${s.affiliationOrCountry.replace(/"/g, '""')}"`,
      `"${s.dateLabel}"`,
      `"${s.time}"`,
      `"${s.status === 'submitted' ? '제출완료' : s.status === 'pending' ? '미제출' : s.status === 'reviewing' ? '검토중' : '수정요청'}"`,
      `"${(s.documentTitle || '').replace(/"/g, '""')}"`,
      `"${s.submittedAt || ''}"`,
      `"${(s.documentUrl || '').replace(/"/g, '""')}"`,
      `"${(s.contactEmail || '').replace(/"/g, '""')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AMA2026_발표자료_접수현황_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV 파일이 다운로드되었습니다.');
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(speakers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ama2026_speakers_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON 백업 파일이 다운로드되었습니다.');
  };

  // Import JSON backup
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported) && imported.length > 0) {
          setSpeakers(imported);
          showToast(`총 ${imported.length}건의 데이터를 성공적으로 복원했습니다.`);
        } else {
          alert('올바른 JSON 데이터 형식이 아닙니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to initial 24 speakers
  const handleResetData = () => {
    if (window.confirm('모든 변경사항을 초기화하고 기본 24명 데이터로 되돌리시겠습니까?')) {
      setSpeakers(INITIAL_SPEAKERS);
      showToast('기본 데이터로 초기화되었습니다.');
    }
  };

  // Filter logic
  const filteredSpeakers = speakers.filter(item => {
    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.speakerName.toLowerCase().includes(q);
      const matchSession = item.sessionTitle.toLowerCase().includes(q);
      const matchAffiliation = item.affiliationOrCountry.toLowerCase().includes(q);
      const matchRole = item.role.toLowerCase().includes(q);
      if (!matchName && !matchSession && !matchAffiliation && !matchRole) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Date filter
    if (selectedDate !== 'all' && item.date !== selectedDate) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'reviewing') {
        if (item.status !== 'reviewing' && item.status !== 'revision') return false;
      } else if (item.status !== selectedStatus) {
        return false;
      }
    }

    return true;
  });

  const pendingCount = speakers.filter(s => s.status === 'pending').length;

  return (
    <div className="app-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <CheckCircle size={17} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onResetData={handleResetData}
      />

      {/* Stats KPI Overview */}
      <StatsOverview speakers={speakers} />

      {/* Filter and Search Bar */}
      <FilterToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        pendingCount={pendingCount}
      />

      {/* Main Speakers List: Grid or Table */}
      {filteredSpeakers.length === 0 ? (
        <div className="empty-state-panel glass-panel">
          <div className="empty-icon">🔍</div>
          <h3>조건에 맞는 발표자를 찾을 수 없습니다.</h3>
          <p>검색어나 선택된 필터 조건을 확인해 주세요.</p>
          <button 
            className="empty-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDate('all');
              setSelectedStatus('all');
            }}
          >
            모든 필터 초기화
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="cards-grid-layout">
          {filteredSpeakers.map(speaker => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              onQuickToggleStatus={handleQuickToggleStatus}
              onOpenEditModal={setEditingSpeaker}
              onOpenReminderModal={setReminderSpeaker}
            />
          ))}
        </div>
      ) : (
        <SpeakerTable
          speakers={filteredSpeakers}
          onQuickToggleStatus={handleQuickToggleStatus}
          onOpenEditModal={setEditingSpeaker}
          onOpenReminderModal={setReminderSpeaker}
        />
      )}

      {/* Modals */}
      <EditModal
        speaker={editingSpeaker}
        isOpen={Boolean(editingSpeaker)}
        onClose={() => setEditingSpeaker(null)}
        onSave={handleSaveEdit}
      />

      <ReminderModal
        speaker={reminderSpeaker}
        isOpen={Boolean(reminderSpeaker)}
        onClose={() => setReminderSpeaker(null)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>The 15th AMA Triennial Convention Incheon 2026 Organizing Committee</p>
        <p>Asia Missions Association (AMA) · 실시간 발표자료 접수 현황 모니터링 시스템</p>
      </footer>
    </div>
  );
}

export default App;
