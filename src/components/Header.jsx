import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RefreshCw, 
  Moon, 
  Sun, 
  Radio, 
  Calendar, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { CONVENTION_INFO } from '../data/speakersData';

export function Header({ 
  theme, 
  toggleTheme, 
  onExportCSV, 
  onExportJSON, 
  onImportJSON, 
  onResetData 
}) {
  const fileInputRef = React.useRef(null);

  return (
    <header className="header-container">
      <div className="header-top">
        <div className="badge-pill">
          <span className="live-dot animate-pulse"></span>
          <Radio size={14} className="live-icon" />
          <span>실시간 모니터링 시스템</span>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span className="btn-label">{theme === 'dark' ? '라이트' : '다크'}</span>
          </button>

          <button 
            className="action-btn"
            onClick={onExportCSV}
            title="현재 현황을 Excel / CSV로 다운로드"
          >
            <FileSpreadsheet size={17} className="text-emerald-400" />
            <span className="btn-label">CSV 내보내기</span>
          </button>

          <div className="dropdown-wrapper">
            <button 
              className="action-btn"
              onClick={onExportJSON}
              title="데이터 JSON 백업"
            >
              <Download size={17} />
              <span className="btn-label">백업</span>
            </button>
          </div>

          <button 
            className="action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="백업 JSON 파일 복원"
          >
            <Upload size={17} />
            <span className="btn-label">복원</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onImportJSON} 
            accept=".json" 
            style={{ display: 'none' }} 
          />

          <button 
            className="action-btn text-muted-hover"
            onClick={onResetData}
            title="기본 24명 데이터로 초기화"
          >
            <RefreshCw size={15} />
            <span className="btn-label">초기화</span>
          </button>
        </div>
      </div>

      <div className="header-banner glass-panel">
        <div className="banner-content">
          <div className="banner-title-group">
            <span className="edition-tag">
              <Sparkles size={13} className="text-blue-400" />
              Incheon, Korea 2026
            </span>
            <h1 className="main-title">{CONVENTION_INFO.title}</h1>
            <p className="theme-subtitle">{CONVENTION_INFO.theme}</p>
          </div>

          <div className="meta-info-strip">
            <div className="meta-item">
              <Calendar size={15} />
              <span>{CONVENTION_INFO.period}</span>
            </div>
            <div className="meta-divider">•</div>
            <div className="meta-item">
              <MapPin size={15} />
              <span>{CONVENTION_INFO.location}</span>
            </div>
            <div className="meta-divider">•</div>
            <div className="meta-item text-highlight">
              <span>관리 대상: 플래너리(강의/논찬) · 글로벌링크 · 내셔널 리포트 (총 24명)</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
