import React from 'react';
import { Search, X, LayoutGrid, List, Filter, Calendar, Tag } from 'lucide-react';

export function FilterToolbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDate,
  setSelectedDate,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  pendingCount
}) {
  return (
    <div className="toolbar-container glass-panel">
      {/* Search and View Mode Row */}
      <div className="toolbar-top-row">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="강사명, 세션 주제, 기관/국가명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="view-mode-switch">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="카드 뷰"
          >
            <LayoutGrid size={16} />
            <span>카드</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="테이블 목록 뷰"
          >
            <List size={16} />
            <span>테이블</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Rows */}
      <div className="toolbar-filters-grid">
        {/* Category Tabs */}
        <div className="filter-group">
          <div className="filter-group-label">
            <Tag size={13} />
            <span>분류</span>
          </div>
          <div className="filter-chips">
            <button
              className={`chip-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              전체
            </button>
            <button
              className={`chip-btn ${selectedCategory === 'plenary' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('plenary')}
            >
              플래너리 강의/논찬 (14)
            </button>
            <button
              className={`chip-btn ${selectedCategory === 'global_links' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('global_links')}
            >
              글로벌링크 (6)
            </button>
            <button
              className={`chip-btn ${selectedCategory === 'national_reports' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('national_reports')}
            >
              내셔널 리포트 (4)
            </button>
          </div>
        </div>

        {/* Date Tabs */}
        <div className="filter-group">
          <div className="filter-group-label">
            <Calendar size={13} />
            <span>일자</span>
          </div>
          <div className="filter-chips">
            <button
              className={`chip-btn ${selectedDate === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedDate('all')}
            >
              전체 일자
            </button>
            <button
              className={`chip-btn ${selectedDate === '2026-09-15' ? 'active' : ''}`}
              onClick={() => setSelectedDate('2026-09-15')}
            >
              9.15 (화)
            </button>
            <button
              className={`chip-btn ${selectedDate === '2026-09-16' ? 'active' : ''}`}
              onClick={() => setSelectedDate('2026-09-16')}
            >
              9.16 (수)
            </button>
            <button
              className={`chip-btn ${selectedDate === '2026-09-17' ? 'active' : ''}`}
              onClick={() => setSelectedDate('2026-09-17')}
            >
              9.17 (목)
            </button>
            <button
              className={`chip-btn ${selectedDate === '2026-09-18' ? 'active' : ''}`}
              onClick={() => setSelectedDate('2026-09-18')}
            >
              9.18 (금)
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="filter-group">
          <div className="filter-group-label">
            <Filter size={13} />
            <span>상태</span>
          </div>
          <div className="filter-chips">
            <button
              className={`chip-btn ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              전체
            </button>
            <button
              className={`chip-btn status-pending-chip ${selectedStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('pending')}
            >
              🔴 미제출 ({pendingCount})
            </button>
            <button
              className={`chip-btn status-submitted-chip ${selectedStatus === 'submitted' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('submitted')}
            >
              🟢 제출완료
            </button>
            <button
              className={`chip-btn status-review-chip ${selectedStatus === 'reviewing' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('reviewing')}
            >
              🟡 검토중/보완
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
