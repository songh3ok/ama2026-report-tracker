import React from 'react';
import { CheckCircle2, Clock, Play } from 'lucide-react';

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
    const isDimmed = highlightPendingOnly && isSubmitted;

    return (
      <div 
        key={speaker.id}
        className={`tt-speaker-item ${isSubmitted ? 'is-submitted' : 'is-pending'} ${isDimmed ? 'dimmed' : ''}`}
        onClick={() => onOpenEdit(speaker)}
        title={isSubmitted ? "Click to view/edit submission" : "Click anywhere to start questionnaire and submit"}
      >
        <div className="tt-speaker-header">
          <span className={`tt-role-pill ${speaker.role === 'Lecturer' ? 'role-lecturer' : speaker.role === 'Respondent' ? 'role-respondent' : speaker.role === 'Expositor' ? 'role-expositor' : 'role-reporter'}`}>
            {speaker.role}
          </span>
          
          <div className="tt-status-and-action">
            {/* Status indicator moved to upper line: Not received yet vs Submitted */}
            <span className={`tt-status-tag ${isSubmitted ? 'tag-submitted' : 'tag-pending'}`}>
              {isSubmitted ? (
                <>
                  <CheckCircle2 size={10} />
                  <span>Submitted</span>
                </>
              ) : (
                <>
                  <Clock size={10} />
                  <span>Not received yet</span>
                </>
              )}
            </span>

            {/* Action button: "Start" when pending, "Undo" when submitted */}
            {isSubmitted ? (
              <button 
                className="tt-action-btn btn-undo"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(speaker.id);
                }}
                title="Click to revert to Pending"
              >
                Undo
              </button>
            ) : (
              <button 
                className="tt-action-btn btn-start"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEdit(speaker);
                }}
                title="Click to start questionnaire and submit"
              >
                <Play size={9} fill="currentColor" />
                <span>Start</span>
              </button>
            )}
          </div>
        </div>

        <div className="tt-speaker-name">
          {speaker.speakerName}
        </div>

        {speaker.affiliationOrCountry && (
          <div className="tt-affiliation">
            {speaker.affiliationOrCountry}
          </div>
        )}

        {/* Platform OS, File Types & Timestamp (When submitted) */}
        {isSubmitted && (
          <div className="tt-meta-badge-row">
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
            {speaker.submittedAt && (
              <span className="tt-timestamp-pill">
                ✓ {speaker.submittedAt}
              </span>
            )}
          </div>
        )}
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
              <th className="th-day">Sep 14 (Mon) · Day 1</th>
              <th className="th-day">15 (Tue) · Day 2</th>
              <th className="th-day">16 (Wed) · Day 3</th>
              <th className="th-day">17 (Thu) · Day 4</th>
              <th className="th-day">18 (Fri) · Day 5</th>
            </tr>
          </thead>
          <tbody>
            {/* AM 8:30-8:50 */}
            <tr className="tt-row-common">
              <td className="cell-time">AM 8:30-8:50</td>
              <td className="cell-min">20</td>
              <td className="cell-empty" rowSpan={6}>
                <div className="empty-notice">
                  <strong>REGISTRATION & ARRIVAL</strong>
                  <span>(Day 1 Official Program starts at 17:00)</span>
                </div>
              </td>
              <td colSpan={4} className="cell-static">
                PRAISE & WORSHIP
              </td>
            </tr>

            {/* AM 8:50-9:30: BIBLICAL EXEGESIS (INDIVIDUAL PER DAY) */}
            <tr className="tt-row-target-highlight">
              <td className="cell-time highlight-time">8:50-9:30</td>
              <td className="cell-min">40</td>
              {/* Tue: Day 2 */}
              <td className="cell-target">
                <div className="tt-biblical-header">
                  <span className="biblical-sub-tag">MORNING SESSION · DAY 2</span>
                  <h4 className="biblical-main-topic">BIBLICAL EXEGESIS (DAY 2)</h4>
                </div>
                {renderSpeakerBox("biblical-15")}
              </td>
              {/* Wed: Day 3 */}
              <td className="cell-target">
                <div className="tt-biblical-header">
                  <span className="biblical-sub-tag">MORNING SESSION · DAY 3</span>
                  <h4 className="biblical-main-topic">BIBLICAL EXEGESIS (DAY 3)</h4>
                </div>
                {renderSpeakerBox("biblical-16")}
              </td>
              {/* Thu: Day 4 */}
              <td className="cell-target">
                <div className="tt-biblical-header">
                  <span className="biblical-sub-tag">MORNING SESSION · DAY 4</span>
                  <h4 className="biblical-main-topic">BIBLICAL EXEGESIS (DAY 4)</h4>
                </div>
                {renderSpeakerBox("biblical-17")}
              </td>
              {/* Fri: Praise & Worship */}
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
                <div className="tt-plenary-header">
                  <span className="plenary-sub-tag">PLENARY SESSION</span>
                  <h4 className="plenary-main-topic">AI</h4>
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-1-speaker")}
                  {renderSpeakerBox("plenary-1-respondent")}
                </div>
              </td>
              {/* Wed: Religious Pluralism */}
              <td className="cell-target">
                <div className="tt-plenary-header">
                  <span className="plenary-sub-tag">PLENARY SESSION</span>
                  <h4 className="plenary-main-topic">Religious Pluralism</h4>
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-3-speaker")}
                  {renderSpeakerBox("plenary-3-respondent")}
                </div>
              </td>
              {/* Thu: Healing */}
              <td className="cell-target">
                <div className="tt-plenary-header">
                  <span className="plenary-sub-tag">PLENARY SESSION</span>
                  <h4 className="plenary-main-topic">Healing</h4>
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-5-speaker")}
                  {renderSpeakerBox("plenary-5-respondent")}
                </div>
              </td>
              {/* Fri: The Next Generation */}
              <td className="cell-target">
                <div className="tt-plenary-header">
                  <span className="plenary-sub-tag">PLENARY SESSION</span>
                  <h4 className="plenary-main-topic">The Next Generation</h4>
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
                <div className="tt-plenary-header">
                  <span className="plenary-sub-tag">PLENARY SESSION</span>
                  <h4 className="plenary-main-topic">Diaspora</h4>
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-2-speaker")}
                  {renderSpeakerBox("plenary-2-respondent")}
                </div>
              </td>
              {/* Wed: Justice */}
              <td className="cell-target">
                <div className="tt-plenary-header">
                  <span className="plenary-sub-tag">PLENARY SESSION</span>
                  <h4 className="plenary-main-topic">Justice</h4>
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("plenary-4-speaker")}
                  {renderSpeakerBox("plenary-4-respondent")}
                </div>
              </td>
              {/* Thu: The Created World */}
              <td className="cell-target">
                <div className="tt-plenary-header">
                  <span className="plenary-sub-tag">PLENARY SESSION</span>
                  <h4 className="plenary-main-topic">The Created World</h4>
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

            {/* PM 1:40-2:10: GLOBAL LINKS REPORTS (SPLIT INTO TWO 15-MIN ROWS) */}
            <tr className="tt-row-banner-only">
              <td rowSpan={3} className="cell-time highlight-time">1:40-2:10</td>
              <td className="cell-min text-xs font-bold text-muted-foreground">-</td>
              <td rowSpan={3} className="cell-muted">
                <div className="static-sub">-</div>
              </td>
              <td colSpan={3} className="cell-global-header">
                GLOBAL LINKS REPORTS
              </td>
              <td rowSpan={3} className="cell-static">
                <div className="static-sub">DEPARTURE</div>
              </td>
            </tr>

            {/* 1st 15 Min: 1:40 - 1:55 */}
            <tr className="tt-row-target-highlight">
              <td className="cell-min highlight-min">15</td>
              <td className="cell-target">
                {renderSpeakerBox("global-1")}
              </td>
              <td className="cell-target">
                {renderSpeakerBox("global-3")}
              </td>
              <td className="cell-target">
                {renderSpeakerBox("global-5")}
              </td>
            </tr>

            {/* 2nd 15 Min: 1:55 - 2:10 */}
            <tr className="tt-row-target-highlight">
              <td className="cell-min highlight-min">15</td>
              <td className="cell-target">
                {renderSpeakerBox("global-2")}
              </td>
              <td className="cell-target">
                {renderSpeakerBox("global-4")}
              </td>
              <td className="cell-target">
                {renderSpeakerBox("global-6")}
              </td>
            </tr>

            {/* 2:30-3:20 WORKSHOPS */}
            <tr className="tt-row-workshops">
              <td className="cell-time">2:30-3:20</td>
              <td className="cell-min">50</td>
              <td className="cell-muted">-</td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-1</div>
                <div className="ws-note">(Tracks A~G / Excluded)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-3</div>
                <div className="ws-note">(Tracks A~G / Excluded)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-5</div>
                <div className="ws-note">(Tracks A~G / Excluded)</div>
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
                <div className="ws-note">(Tracks A~G / Excluded)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-4</div>
                <div className="ws-note">(Tracks A~G / Excluded)</div>
              </td>
              <td className="cell-workshop-notice">
                <div className="ws-title">WORKSHOPS-6</div>
                <div className="ws-note">(Tracks A~G / Excluded)</div>
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
                <div className="tt-national-header">
                  <span className="national-sub-tag">EVENING SESSION</span>
                  <h4 className="national-main-topic">NATIONAL REPORTS</h4>
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
              </td>
              {/* Thu: National Reports (Cambodia & Myanmar) */}
              <td className="cell-target cell-target-evening">
                <div className="evening-sub-block">
                  <div className="static-sub-mini">PRAISE & WORSHIP / SPECIAL PERFORMANCES</div>
                </div>
                <div className="tt-national-header">
                  <span className="national-sub-tag">EVENING SESSION</span>
                  <h4 className="national-main-topic">NATIONAL REPORTS</h4>
                </div>
                <div className="tt-speakers-pair">
                  {renderSpeakerBox("national-3")}
                  {renderSpeakerBox("national-4")}
                </div>
                <div className="evening-sub-block mt-2">
                  <div className="static-sub-mini">MESSAGES: Rev. Dr. Daniel Shinjong Baeq</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
