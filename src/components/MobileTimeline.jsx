import React, { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Edit2, Calendar, ChevronRight } from 'lucide-react';

export function MobileTimeline({ 
  speakersMap, 
  onToggleStatus, 
  onOpenEdit,
  highlightPendingOnly 
}) {
  const [selectedDay, setSelectedDay] = useState('all');

  const DAYS = [
    { key: 'all', label: '전체' },
    { key: '2026-09-15', label: '9.15 (화)' },
    { key: '2026-09-16', label: '9.16 (수)' },
    { key: '2026-09-17', label: '9.17 (목)' },
    { key: '2026-09-18', label: '9.18 (금)' }
  ];

  // Grouped sessions by day
  const timelineSchedule = [
    {
      date: '2026-09-15',
      dateLabel: '9.15 (화)',
      sessions: [
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: AI (인공지능)',
          speakerIds: ['plenary-1-speaker', 'plenary-1-respondent']
        },
        {
          time: '11:10 - 12:00',
          category: 'plenary',
          title: 'PLENARY: Diaspora (디아스포라)',
          speakerIds: ['plenary-2-speaker', 'plenary-2-respondent']
        },
        {
          time: '13:40 - 14:10',
          category: 'global',
          title: 'GLOBAL LINKS REPORTS',
          speakerIds: ['global-1', 'global-2']
        },
        {
          time: '18:30 - 20:50',
          category: 'national',
          title: 'NATIONAL REPORTS',
          speakerIds: ['national-1', 'national-2']
        }
      ]
    },
    {
      date: '2026-09-16',
      dateLabel: '9.16 (수)',
      sessions: [
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: Religious Pluralism (종교다원주의)',
          speakerIds: ['plenary-3-speaker', 'plenary-3-respondent']
        },
        {
          time: '11:10 - 12:00',
          category: 'plenary',
          title: 'PLENARY: Justice (정의와 공의)',
          speakerIds: ['plenary-4-speaker', 'plenary-4-respondent']
        },
        {
          time: '13:40 - 14:10',
          category: 'global',
          title: 'GLOBAL LINKS REPORTS',
          speakerIds: ['global-3', 'global-4']
        }
      ]
    },
    {
      date: '2026-09-17',
      dateLabel: '9.17 (목)',
      sessions: [
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: Healing (치유와 회복)',
          speakerIds: ['plenary-5-speaker', 'plenary-5-respondent']
        },
        {
          time: '11:10 - 12:00',
          category: 'plenary',
          title: 'PLENARY: The Created World (창조세계)',
          speakerIds: ['plenary-6-speaker', 'plenary-6-respondent']
        },
        {
          time: '13:40 - 14:10',
          category: 'global',
          title: 'GLOBAL LINKS REPORTS',
          speakerIds: ['global-5', 'global-6']
        },
        {
          time: '18:30 - 20:50',
          category: 'national',
          title: 'NATIONAL REPORTS',
          speakerIds: ['national-3', 'national-4']
        }
      ]
    },
    {
      date: '2026-09-18',
      dateLabel: '9.18 (금)',
      sessions: [
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: The Next Generation (다음 세대)',
          speakerIds: ['plenary-7-speaker', 'plenary-7-respondent']
        }
      ]
    }
  ];

  const filteredDays = selectedDay === 'all' 
    ? timelineSchedule 
    : timelineSchedule.filter(d => d.date === selectedDay);

  const getCategoryClass = (cat) => {
    if (cat === 'plenary') return 'banner-plenary';
    if (cat === 'global') return 'banner-global';
    return 'banner-national';
  };

  return (
    <div className="mobile-timeline-wrapper">
      {/* Day selector tabs for quick phone tapping */}
      <div className="mobile-day-tabs">
        {DAYS.map(day => (
          <button
            key={day.key}
            className={`mobile-day-tab ${selectedDay === day.key ? 'active' : ''}`}
            onClick={() => setSelectedDay(day.key)}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Vertical Timeline List */}
      <div className="mobile-days-container">
        {filteredDays.map(dayGroup => (
          <div key={dayGroup.date} className="mobile-day-card glass-panel">
            <div className="mobile-day-header">
              <Calendar size={16} className="text-blue-400" />
              <h2 className="mobile-day-title">{dayGroup.dateLabel}</h2>
            </div>

            <div className="mobile-sessions-list">
              {dayGroup.sessions.map((session, sIdx) => {
                const speakers = session.speakerIds.map(id => speakersMap[id]).filter(Boolean);
                const hasPending = speakers.some(s => s.status === 'pending');

                if (highlightPendingOnly && !hasPending) {
                  return null; // Skip if user asked for pending only
                }

                return (
                  <div key={sIdx} className="mobile-session-block">
                    <div className="mobile-session-top">
                      <span className="mobile-time-badge">{session.time}</span>
                      <span className={`tt-session-banner ${getCategoryClass(session.category)}`}>
                        {session.title}
                      </span>
                    </div>

                    <div className="mobile-speakers-col">
                      {speakers.map(speaker => {
                        const isSubmitted = speaker.status === 'submitted';

                        if (highlightPendingOnly && isSubmitted) {
                          return null;
                        }

                        return (
                          <div 
                            key={speaker.id}
                            className={`mobile-speaker-card ${isSubmitted ? 'is-submitted' : 'is-pending'}`}
                            onClick={() => onOpenEdit(speaker)}
                          >
                            <div className="mobile-card-row-top">
                              <span className={`tt-role-pill ${speaker.role.includes('강사') ? 'role-lecturer' : speaker.role.includes('논찬') ? 'role-respondent' : 'role-reporter'}`}>
                                {speaker.role}
                              </span>
                              
                              <button
                                className={`mobile-toggle-btn ${isSubmitted ? 'btn-submitted' : 'btn-pending'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleStatus(speaker.id);
                                }}
                              >
                                {isSubmitted ? (
                                  <>
                                    <CheckCircle2 size={13} />
                                    <span>제출완료</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={13} />
                                    <span>미제출 (터치하여 제출)</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="mobile-speaker-name">
                              {speaker.speakerName}
                            </div>

                            <div className="mobile-speaker-affil">
                              {speaker.affiliationOrCountry}
                            </div>

                            <div className="mobile-card-footer">
                              <div className="mobile-time-record">
                                {isSubmitted ? (
                                  <span className="text-emerald-400 font-medium">
                                    ✓ 접수: {speaker.submittedAt || '완료'}
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-medium">
                                    🔴 보고 자료 아직 안 들어옴
                                  </span>
                                )}
                              </div>

                              <div className="mobile-card-actions">
                                {speaker.documentUrl && (
                                  <a 
                                    href={speaker.documentUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="mobile-link-badge"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink size={12} />
                                    자료
                                  </a>
                                )}
                                <button 
                                  className="mobile-edit-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenEdit(speaker);
                                  }}
                                >
                                  <Edit2 size={12} />
                                  상세
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
