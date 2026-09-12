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
            {/* Status indicator moved to upper line: NOT RECEIVED vs SUBMITTED */}
            <span className={`tt-status-tag ${isSubmitted ? 'tag-submitted' : 'tag-pending'}`}>
              {isSubmitted ? (
                <>
                  <CheckCircle2 size={9} />
                  <span>SUBMITTED</span>
                </>
              ) : (
                <>
                  <Clock size={9} />
                  <span>NOT RECEIVED</span>
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
              <td className="cell-muted" rowSpan={6}>
                <div className="static-sub">-</div>
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
              {/* Day 1 (Mon): REGISTRATION (2:30 - 5:00 PM, spans 4 afternoon rows) */}
              <td className="cell-registration-block" rowSpan={4}>
                <div className="registration-box">
                  <div className="registration-main-title">REGISTRATION</div>
                  <div className="registration-sub-time">2:30 – 5:00 PM</div>
                </div>
              </td>
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
              <td className="cell-muted" rowSpan={11}>-</td>
            </tr>

            {/* 3:20-3:40 COFFEE BREAK */}
            <tr className="tt-row-break">
              <td className="cell-time">3:20-3:40</td>
              <td className="cell-min">20</td>
              {/* Mon covered by rowSpan={4} */}
              <td colSpan={3} className="cell-static text-coffee">
                COFFEE BREAK
              </td>
            </tr>

            {/* 3:40-4:30 WORKSHOPS */}
            <tr className="tt-row-workshops">
              <td className="cell-time">3:40-4:30</td>
              <td className="cell-min">50</td>
              {/* Mon covered by rowSpan={3} */}
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
              {/* Mon covered by rowSpan={3} */}
              <td colSpan={3} className="cell-static">
                BREAK
              </td>
            </tr>

            {/* 5:00-6:30 DINNER */}
            <tr className="tt-row-break">
              <td className="cell-time">5:00-6:30</td>
              <td className="cell-min">90</td>
              <td colSpan={4} className="cell-static text-dinner">
                DINNER
              </td>
            </tr>

            {/* ============================================================ */}
            {/* EVENING SESSIONS: SPLIT INTO 6 DISTINCT SUB-ROWS              */}
            {/* ============================================================ */}

            {/* 1. 6:30-7:00 (30m): Praise & Worship */}
            <tr className="tt-row-evening">
              <td className="cell-time highlight-time">6:30-7:00</td>
              <td className="cell-min">30</td>
              {/* Mon & Tue: Praise & Worship */}
              <td colSpan={2} className="cell-static">
                PRAISE & WORSHIP
              </td>
              {/* Wed: Fellowship (spans all 6 evening rows) */}
              <td className="cell-static" rowSpan={6}>
                <div className="static-title text-amber-300 font-bold">FELLOWSHIP</div>
              </td>
              {/* Thu: Praise & Worship */}
              <td className="cell-static">
                PRAISE & WORSHIP
              </td>
            </tr>

            {/* 2. 7:00-7:20 (20m): Special Performances */}
            <tr className="tt-row-evening">
              <td className="cell-time highlight-time">7:00-7:20</td>
              <td className="cell-min">20</td>
              {/* Mon & Tue: Special Performances */}
              <td colSpan={2} className="cell-static">
                SPECIAL PERFORMANCES
              </td>
              {/* Thu: Special Performances */}
              <td className="cell-static">
                SPECIAL PERFORMANCES
              </td>
            </tr>

            {/* 3. 7:20-7:35 (15m): National Reports 1 (Uzbekistan / Cambodia) / Mon: Welcome Reception */}
            <tr className="tt-row-target-highlight">
              <td className="cell-time highlight-time">7:20-7:35</td>
              <td className="cell-min">15</td>
              {/* Mon: Welcome Reception (spans 7:20 - 8:00, 3 rows) */}
              <td className="cell-static" rowSpan={3} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                <div className="static-title font-bold text-sky-200">WELCOME RECEPTION</div>
              </td>
              {/* Tue: Uzbekistan */}
              <td className="cell-target cell-target-evening">
                <div className="tt-national-header">
                  <span className="national-sub-tag">NATIONAL REPORT · 15m</span>
                  <h4 className="national-main-topic">UZBEKISTAN</h4>
                </div>
                {renderSpeakerBox("national-1")}
              </td>
              {/* Thu: Cambodia */}
              <td className="cell-target cell-target-evening">
                <div className="tt-national-header">
                  <span className="national-sub-tag">NATIONAL REPORT · 15m</span>
                  <h4 className="national-main-topic">CAMBODIA</h4>
                </div>
                {renderSpeakerBox("national-3")}
              </td>
            </tr>

            {/* 4. 7:35-7:50 (15m): National Reports 2 (Mongolia / Myanmar) */}
            <tr className="tt-row-target-highlight">
              <td className="cell-time highlight-time">7:35-7:50</td>
              <td className="cell-min">15</td>
              {/* Mon covered by rowSpan={3} */}
              {/* Tue: Mongolia */}
              <td className="cell-target cell-target-evening">
                <div className="tt-national-header">
                  <span className="national-sub-tag">NATIONAL REPORT · 15m</span>
                  <h4 className="national-main-topic">MONGOLIA</h4>
                </div>
                {renderSpeakerBox("national-2")}
              </td>
              {/* Thu: Myanmar */}
              <td className="cell-target cell-target-evening">
                <div className="tt-national-header">
                  <span className="national-sub-tag">NATIONAL REPORT · 15m</span>
                  <h4 className="national-main-topic">MYANMAR</h4>
                </div>
                {renderSpeakerBox("national-4")}
              </td>
            </tr>

            {/* 5. 7:50-8:00 (10m): Prayer */}
            <tr className="tt-row-evening">
              <td className="cell-time highlight-time">7:50-8:00</td>
              <td className="cell-min">10</td>
              {/* Mon covered by rowSpan={3} */}
              {/* Tue: Prayer */}
              <td className="cell-static">
                PRAYER
              </td>
              {/* Thu: Prayer */}
              <td className="cell-static">
                PRAYER
              </td>
            </tr>

            {/* 6. 8:00-8:50 (50m): Evening Messages */}
            <tr className="tt-row-evening">
              <td className="cell-time highlight-time">8:00-8:50</td>
              <td className="cell-min">50</td>
              {/* Mon: Rev. Jaehoon Lee */}
              <td className="cell-static">
                <div className="static-title">EVENING MESSAGES</div>
                <div className="static-sub font-semibold text-sky-300">Rev. Jaehoon Lee</div>
              </td>
              {/* Tue: Rev. Jongboo Hwa */}
              <td className="cell-static">
                <div className="static-title">EVENING MESSAGES</div>
                <div className="static-sub font-semibold text-sky-300">Rev. Jongboo Hwa</div>
              </td>
              {/* Thu: Rev. Dr. Daniel Shinjong Baeq */}
              <td className="cell-static">
                <div className="static-title">EVENING MESSAGES</div>
                <div className="static-sub font-semibold text-sky-300">Rev. Dr. Daniel Shinjong Baeq</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
