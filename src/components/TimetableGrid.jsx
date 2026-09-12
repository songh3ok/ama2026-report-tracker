import React from 'react';
import { CheckCircle2, Clock, ExternalLink, Edit2 } from 'lucide-react';

export function TimetableGrid({ 
  speakersMap, 
  onToggleStatus, 
  onOpenEdit,
  highlightPendingOnly 
}) {
  // Helper to render an interactive target speaker card within a cell
  const renderSpeakerBox = (speakerId) => {
    const speaker = speakersMap[speakerId];
    if (!speaker) return null;

    const isSubmitted = speaker.status === 'submitted';
    const isPending = !isSubmitted;

    // If filter says highlightPendingOnly and this is submitted, we can dim it
    const isDimmed = highlightPendingOnly && isSubmitted;

    return (
      <div 
        key={speaker.id}
        className={`tt-speaker-item ${isSubmitted ? 'is-submitted' : 'is-pending'} ${isDimmed ? 'dimmed' : ''}`}
      >
        <div className="tt-speaker-header">
          <span className={`tt-role-pill ${speaker.role.includes('강사') ? 'role-lecturer' : speaker.role.includes('논찬') ? 'role-respondent' : 'role-reporter'}`}>
            {speaker.role.split(' ')[0]}
          </span>
          <button 
            className={`tt-status-badge ${isSubmitted ? 'status-submitted' : 'status-pending'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(speaker.id);
            }}
            title="클릭하여 제출/미제출 전환"
          >
            {isSubmitted ? (
              <>
                <CheckCircle2 size={12} />
                <span>제출완료</span>
              </>
            ) : (
              <>
                <Clock size={12} />
                <span>미제출</span>
              </>
            )}
          </button>
        </div>

        <div className="tt-speaker-name" onClick={() => onOpenEdit(speaker)}>
          {speaker.speakerName}
        </div>

        {speaker.affiliationOrCountry && (
          <div className="tt-affiliation">
            {speaker.affiliationOrCountry}
          </div>
        )}

        {/* Date & Time Record */}
        <div className="tt-timestamp-row" onClick={() => onOpenEdit(speaker)}>
          {isSubmitted ? (
            <span className="timestamp-submitted text-emerald-400">
              ✓ {speaker.submittedAt || '접수완료'}
            </span>
          ) : (
            <span className="timestamp-pending text-rose-400">
              자료 미접수
            </span>
          )}
          {speaker.documentUrl && (
            <a 
              href={speaker.documentUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="tt-link-icon"
              onClick={(e) => e.stopPropagation()}
              title="제출 자료 열기"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <button 
            className="tt-edit-mini-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEdit(speaker);
            }}
            title="상세 정보 및 링크 편집"
          >
            <Edit2 size={11} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="timetable-wrapper">
      <div className="timetable-table-container">
        <table className="pdf-timetable">
          <thead>
            <tr className="header-row">
              <th className="th-time">Time</th>
              <th className="th-min">Min</th>
              <th className="th-day">9.14 (Mon)</th>
              <th className="th-day">15 (Tue)</th>
              <th className="th-day">16 (Wed)</th>
              <th className="th-day">17 (Thur)</th>
              <th className="th-day">18 (Fri)</th>
            </tr>
          </thead>
          <tbody>
            {/* AM 8:30-8:50 */}
            <tr className="tt-row-common">
              <td className="cell-time">AM 8:30-8:50</td>
              <td className="cell-min">20</td>
              <td className="cell-muted" rowSpan={6}>
                <div className="cell-static-content">
                  <div className="static-title">REGISTRATION</div>
                  <div className="static-sub">등록 및 접수</div>
                </div>
              </td>
              <td colSpan={4} className="cell-static">
                PRAISE & WORSHIP
              </td>
            </tr>

            {/* AM 8:50-9:30 */}
            <tr className="tt-row-common">
              <td className="cell-time">8:50-9:30</td>
              <td className="cell-min">40</td>
              <td colSpan={3} className="cell-static">
                <div className="static-title">BIBLICAL EXEGESIS</div>
                <div className="static-sub">Dr. Allen Yeh</div>
              </td>
              <td className="cell-static">
                <div className="static-title">PRAISE & WORSHIP</div>
              </td>
            </tr>

            {/* AM 9:40-10:30: PLENARY SESSIONS 1 */}
            <tr className="tt-row-plenary">
              <td className="cell-time highlight-time">9:40-10:30</td>
              <td className="cell-min">50</td>
              {/* Tue: AI */}
              <td className="cell-target">
                <div className="tt-session-banner banner-plenary">
                  PLENARY: AI
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-1-speaker")}
                  {renderSpeakerBox("plenary-1-respondent")}
                </div>
              </td>
              {/* Wed: Religious Pluralism */}
              <td className="cell-target">
                <div className="tt-session-banner banner-plenary">
                  PLENARY: Religious Pluralism
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-3-speaker")}
                  {renderSpeakerBox("plenary-3-respondent")}
                </div>
              </td>
              {/* Thu: Healing */}
              <td className="cell-target">
                <div className="tt-session-banner banner-plenary">
                  PLENARY: Healing
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-5-speaker")}
                  {renderSpeakerBox("plenary-5-respondent")}
                </div>
              </td>
              {/* Fri: The Next Generation */}
              <td className="cell-target">
                <div className="tt-session-banner banner-plenary">
                  PLENARY: The Next Generation
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-7-speaker")}
                  {renderSpeakerBox("plenary-7-respondent")}
                </div>
              </td>
            </tr>

            {/* 10:30-11:00 COFFEE BREAK */}
            <tr className="tt-row-break">
              <td className="cell-time">10:30-11:00</td>
              <td className="cell-min">30</td>
              <td colSpan={4} className="cell-static text-coffee">
                COFFEE BREAK
              </td>
            </tr>

            {/* AM 11:10-12:00: PLENARY SESSIONS 2 */}
            <tr className="tt-row-plenary">
              <td className="cell-time highlight-time">11:10-12:00</td>
              <td className="cell-min">50</td>
              {/* Tue: Diaspora */}
              <td className="cell-target">
                <div className="tt-session-banner banner-plenary">
                  PLENARY: Diaspora
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-2-speaker")}
                  {renderSpeakerBox("plenary-2-respondent")}
                </div>
              </td>
              {/* Wed: Justice */}
              <td className="cell-target">
                <div className="tt-session-banner banner-plenary">
                  PLENARY: Justice
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-4-speaker")}
                  {renderSpeakerBox("plenary-4-respondent")}
                </div>
              </td>
              {/* Thu: The Created World */}
              <td className="cell-target">
                <div className="tt-session-banner banner-plenary">
                  PLENARY: The Created World
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-6-speaker")}
                  {renderSpeakerBox("plenary-6-respondent")}
                </div>
              </td>
              {/* Fri: Closing */}
              <td className="cell-static cell-closing">
                <div className="static-title-badge">CLOSING</div>
                <div className="closing-list">
                  <div>• AMA Declaration</div>
                  <div>• Introducing AMA New Leaders</div>
                  <div>• Holy Communion</div>
                </div>
              </td>
            </tr>

            {/* PM 12:00-1:30 LUNCH */}
            <tr className="tt-row-break">
              <td className="cell-time">PM 12:00-1:30</td>
              <td className="cell-min">90</td>
              <td colSpan={4} className="cell-static text-lunch">
                LUNCH
              </td>
            </tr>

            {/* PM 1:40-2:10: GLOBAL LINKS REPORTS */}
            <tr className="tt-row-target-highlight">
              <td className="cell-time highlight-time">1:40-2:10</td>
              <td className="cell-min">30</td>
              <td className="cell-muted">
                <div className="static-sub">-</div>
              </td>
              {/* Tue: Lausanne & MANI */}
              <td className="cell-target">
                <div className="tt-session-banner banner-global">
                  GLOBAL LINKS REPORTS
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("global-1")}
                  {renderSpeakerBox("global-2")}
                </div>
              </td>
              {/* Wed: WEA-MC & COMIBAM */}
              <td className="cell-target">
                <div className="tt-session-banner banner-global">
                  GLOBAL LINKS REPORTS
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("global-3")}
                  {renderSpeakerBox("global-4")}
                </div>
              </td>
              {/* Thu: Frontier & Missio Nexus */}
              <td className="cell-target">
                <div className="tt-session-banner banner-global">
                  GLOBAL LINKS REPORTS
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("global-5")}
                  {renderSpeakerBox("global-6")}
                </div>
              </td>
              {/* Fri: Departure */}
              <td className="cell-static">
                <div className="static-sub">DEPARTURE</div>
              </td>
            </tr>

            {/* 2:30-3:20 WORKSHOPS */}
            <tr className="tt-row-workshops">
              <td className="cell-time">2:30-3:20</td>
              <td className="cell-min">50</td>
              <td className="cell-muted">-</td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-1</div>
                <div className="ws-note">(A~G 트랙 진행 / 접수 제외)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-3</div>
                <div className="ws-note">(A~G 트랙 진행 / 접수 제외)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-5</div>
                <div className="ws-note">(A~G 트랙 진행 / 접수 제외)</div>
              </td>
              <td className="cell-muted" rowSpan={6}>-</td>
            </tr>

            {/* 3:20-3:40 COFFEE BREAK */}
            <tr className="tt-row-break">
              <td className="cell-time">3:20-3:40</td>
              <td className="cell-min">20</td>
              <td className="cell-muted">-</td>
              <td colSpan={3} className="cell-static text-coffee">
                COFFEE BREAK
              </td>
            </tr>

            {/* 3:40-4:30 WORKSHOPS */}
            <tr className="tt-row-workshops">
              <td className="cell-time">3:40-4:30</td>
              <td className="cell-min">50</td>
              <td className="cell-muted">-</td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-2</div>
                <div className="ws-note">(A~G 트랙 진행 / 접수 제외)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-4</div>
                <div className="ws-note">(A~G 트랙 진행 / 접수 제외)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-6</div>
                <div className="ws-note">(A~G 트랙 진행 / 접수 제외)</div>
              </td>
            </tr>

            {/* 4:30-5:00 BREAK */}
            <tr className="tt-row-break">
              <td className="cell-time">4:30-5:00</td>
              <td className="cell-min">30</td>
              <td className="cell-muted">-</td>
              <td colSpan={3} className="cell-static">
                BREAK
              </td>
            </tr>

            {/* 5:00-6:30 DINNER */}
            <tr className="tt-row-break">
              <td className="cell-time">5:00-6:30</td>
              <td className="cell-min">90</td>
              <td className="cell-static text-dinner">DINNER</td>
              <td colSpan={3} className="cell-static text-dinner">
                DINNER
              </td>
            </tr>

            {/* 6:30-8:50 EVENING SESSIONS & NATIONAL REPORTS */}
            <tr className="tt-row-evening">
              <td className="cell-time highlight-time">6:30-8:50</td>
              <td className="cell-min">140</td>
              {/* Mon: Welcome Reception */}
              <td className="cell-static">
                <div className="static-title">WELCOME RECEPTION</div>
                <div className="static-sub">Rev. Jaehoon Lee</div>
              </td>
              {/* Tue: National Reports (Uzbekistan & Mongolia) */}
              <td className="cell-target cell-target-evening">
                <div className="evening-sub-block">
                  <div className="static-sub-mini">PRAISE & WORSHIP / SPECIAL PERFORMANCES</div>
                </div>
                <div className="tt-session-banner banner-national">
                  NATIONAL REPORTS
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("national-1")}
                  {renderSpeakerBox("national-2")}
                </div>
                <div className="evening-sub-block mt-2">
                  <div className="static-sub-mini">EVENING MESSAGES: Rev. Jongboo Hwa</div>
                </div>
              </td>
              {/* Wed: Fellowship */}
              <td className="cell-static">
                <div className="static-title text-amber-300">FELLOWSHIP NIGHT</div>
                <div className="static-sub">교제의 밤</div>
              </td>
              {/* Thu: National Reports (Cambodia & Myanmar) */}
              <td className="cell-target cell-target-evening">
                <div className="evening-sub-block">
                  <div className="static-sub-mini">PRAISE & WORSHIP / SPECIAL PERFORMANCES</div>
                </div>
                <div className="tt-session-banner banner-national">
                  NATIONAL REPORTS
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("national-3")}
                  {renderSpeakerBox("national-4")}
                </div>
                <div className="evening-sub-block mt-2">
                  <div className="static-sub-mini">PRAYER & EVENING MESSAGES: Rev. Yohannes Nahuway</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
