import React, { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Edit2, Calendar } from 'lucide-react';

export function MobileTimeline({ 
  speakersMap, 
  onToggleStatus, 
  onOpenEdit,
  highlightPendingOnly 
}) {
  const [selectedDay, setSelectedDay] = useState('all');

  const DAYS = [
    { key: 'all', label: 'All Days' },
    { key: '2026-09-15', label: 'Sep 15 (Tue)' },
    { key: '2026-09-16', label: 'Sep 16 (Wed)' },
    { key: '2026-09-17', label: 'Sep 17 (Thu)' },
    { key: '2026-09-18', label: 'Sep 18 (Fri)' }
  ];

  // Grouped sessions by day including Biblical Exegesis
  const timelineSchedule = [
    {
      date: '2026-09-15',
      dateLabel: 'Sep 15 (Tue)',
      sessions: [
        {
          time: '08:50 - 09:30',
          category: 'biblical',
          title: 'BIBLICAL EXEGESIS (DAY 1)',
          speakerIds: ['biblical-15']
        },
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: AI (Artificial Intelligence)',
          speakerIds: ['plenary-1-speaker', 'plenary-1-respondent']
        },
        {
          time: '11:10 - 12:00',
          category: 'plenary',
          title: 'PLENARY: Diaspora',
          speakerIds: ['plenary-2-speaker', 'plenary-2-respondent']
        },
        {
          time: '13:40 - 13:55 (15m)',
          category: 'global',
          title: 'GLOBAL LINKS: Lausanne Movement',
          speakerIds: ['global-1']
        },
        {
          time: '13:55 - 14:10 (15m)',
          category: 'global',
          title: 'GLOBAL LINKS: MANI',
          speakerIds: ['global-2']
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
      dateLabel: 'Sep 16 (Wed)',
      sessions: [
        {
          time: '08:50 - 09:30',
          category: 'biblical',
          title: 'BIBLICAL EXEGESIS (DAY 2)',
          speakerIds: ['biblical-16']
        },
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: Religious Pluralism',
          speakerIds: ['plenary-3-speaker', 'plenary-3-respondent']
        },
        {
          time: '11:10 - 12:00',
          category: 'plenary',
          title: 'PLENARY: Justice',
          speakerIds: ['plenary-4-speaker', 'plenary-4-respondent']
        },
        {
          time: '13:40 - 13:55 (15m)',
          category: 'global',
          title: 'GLOBAL LINKS: WEA-MC',
          speakerIds: ['global-3']
        },
        {
          time: '13:55 - 14:10 (15m)',
          category: 'global',
          title: 'GLOBAL LINKS: COMIBAM',
          speakerIds: ['global-4']
        }
      ]
    },
    {
      date: '2026-09-17',
      dateLabel: 'Sep 17 (Thu)',
      sessions: [
        {
          time: '08:50 - 09:30',
          category: 'biblical',
          title: 'BIBLICAL EXEGESIS (DAY 3)',
          speakerIds: ['biblical-17']
        },
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: Healing',
          speakerIds: ['plenary-5-speaker', 'plenary-5-respondent']
        },
        {
          time: '11:10 - 12:00',
          category: 'plenary',
          title: 'PLENARY: The Created World',
          speakerIds: ['plenary-6-speaker', 'plenary-6-respondent']
        },
        {
          time: '13:40 - 13:55 (15m)',
          category: 'global',
          title: 'GLOBAL LINKS: Frontier Ventures',
          speakerIds: ['global-5']
        },
        {
          time: '13:55 - 14:10 (15m)',
          category: 'global',
          title: 'GLOBAL LINKS: Missio Nexus',
          speakerIds: ['global-6']
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
      dateLabel: 'Sep 18 (Fri)',
      sessions: [
        {
          time: '09:40 - 10:30',
          category: 'plenary',
          title: 'PLENARY: The Next Generation',
          speakerIds: ['plenary-7-speaker', 'plenary-7-respondent']
        }
      ]
    }
  ];

  const filteredDays = selectedDay === 'all' 
    ? timelineSchedule 
    : timelineSchedule.filter(d => d.date === selectedDay);

  const getCategoryClass = (cat) => {
    if (cat === 'biblical') return 'banner-biblical';
    if (cat === 'plenary') return 'banner-plenary';
    if (cat === 'global') return 'banner-global';
    return 'banner-national';
  };

  return (
    <div className="mobile-timeline-wrapper">
      {/* Day selector tabs */}
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
                  return null;
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
                              <span className={`tt-role-pill ${speaker.role === 'Lecturer' ? 'role-lecturer' : speaker.role === 'Respondent' ? 'role-respondent' : speaker.role === 'Expositor' ? 'role-expositor' : 'role-reporter'}`}>
                                {speaker.role}
                              </span>
                              
                              <div className="mobile-status-and-action">
                                {/* Status badge */}
                                <span className={`tt-status-tag ${isSubmitted ? 'tag-submitted' : 'tag-pending'}`}>
                                  {isSubmitted ? (
                                    <>
                                      <CheckCircle2 size={11} />
                                      <span>Submitted</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={11} />
                                      <span>Pending</span>
                                    </>
                                  )}
                                </span>

                                {/* Action button: "Submit" when pending, "Undo" when submitted */}
                                <button
                                  className={`mobile-action-btn ${isSubmitted ? 'btn-undo' : 'btn-submit'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleStatus(speaker.id);
                                  }}
                                >
                                  {isSubmitted ? 'Undo' : 'Submit'}
                                </button>
                              </div>
                            </div>

                            <div className="mobile-speaker-name">
                              {speaker.speakerName}
                            </div>

                            <div className="mobile-speaker-affil">
                              {speaker.affiliationOrCountry}
                            </div>

                            {/* Platform OS and File Types Display */}
                            {(speaker.computerOS || (speaker.fileTypes && speaker.fileTypes.length > 0)) && (
                              <div className="mobile-meta-badges">
                                {speaker.computerOS && (
                                  <span className={`tt-os-pill ${speaker.computerOS.toLowerCase()}`}>
                                    {speaker.computerOS}
                                  </span>
                                )}
                                {speaker.fileTypes && speaker.fileTypes.map(ft => (
                                  <span key={ft} className="tt-filetype-pill">
                                    {ft}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mobile-card-footer">
                              <div className="mobile-time-record">
                                {isSubmitted ? (
                                  <span className="text-emerald-400 font-medium">
                                    ✓ Received: {speaker.submittedAt || 'Done'}
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-medium">
                                    🔴 Material not received yet
                                  </span>
                                )}
                              </div>

                              <div className="mobile-card-actions">
                                <button 
                                  className="mobile-edit-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenEdit(speaker);
                                  }}
                                >
                                  <Edit2 size={12} />
                                  Format & Details
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
