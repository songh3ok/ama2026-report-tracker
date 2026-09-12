import React from 'react';
import { SpeakerCard } from './SpeakerCard';

const DAY_HEADERS = [
  ['Day 1', 'Mon · Sep 14'],
  ['Day 2', 'Tue · Sep 15'],
  ['Day 3', 'Wed · Sep 16'],
  ['Day 4', 'Thu · Sep 17'],
  ['Day 5', 'Fri · Sep 18']
];

const SessionHead = ({ cat, kicker, title }) => (
  <div className={`tt-head cat-${cat}`}>
    <div className="kicker">{kicker}</div>
    <div className="tt-head-title">{title}</div>
  </div>
);

export function TimetableGrid({
  speakersMap,
  onToggleStatus,
  onOpenEdit,
  highlightPendingOnly
}) {
  const renderSpeakerBox = (speakerId) => {
    const speaker = speakersMap[speakerId];
    if (!speaker) return null;

    return (
      <SpeakerCard
        key={speaker.id}
        speaker={speaker}
        compact
        dimmed={highlightPendingOnly && speaker.status === 'submitted'}
        onOpenEdit={onOpenEdit}
        onToggleStatus={onToggleStatus}
      />
    );
  };

  const renderPair = (lecturerId, respondentId) => (
    <div className="tt-pair">
      {renderSpeakerBox(lecturerId)}
      {renderSpeakerBox(respondentId)}
    </div>
  );

  return (
    <div className="tt-wrap">
      <table className="tt">
        <thead>
          <tr>
            <th className="th-time">Time</th>
            <th className="th-min">Min</th>
            {DAY_HEADERS.map(([day, date]) => (
              <th key={day} className="th-day">
                <span className="th-day-main">{day}</span>
                <span className="th-day-sub">{date}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* AM 8:30-8:50 */}
          <tr>
            <td className="cell-time">AM 8:30–8:50</td>
            <td className="cell-min">20</td>
            <td className="cell-muted" rowSpan={6} />
            <td colSpan={4} className="cell-static">Praise &amp; Worship</td>
          </tr>

          {/* AM 8:50-9:30: Biblical Exegesis (Day 2–4) */}
          <tr>
            <td className="cell-time is-key">8:50–9:30</td>
            <td className="cell-min">40</td>
            <td className="cell-target">
              <SessionHead cat="biblical" kicker="Morning Session" title="Biblical Exegesis" />
              {renderSpeakerBox('biblical-15')}
            </td>
            <td className="cell-target">
              <SessionHead cat="biblical" kicker="Morning Session" title="Biblical Exegesis" />
              {renderSpeakerBox('biblical-16')}
            </td>
            <td className="cell-target">
              <SessionHead cat="biblical" kicker="Morning Session" title="Biblical Exegesis" />
              {renderSpeakerBox('biblical-17')}
            </td>
            <td className="cell-static">Praise &amp; Worship</td>
          </tr>

          {/* AM 9:40-10:30: Plenary Sessions 1 */}
          <tr>
            <td className="cell-time is-key">9:40–10:30</td>
            <td className="cell-min">50</td>
            <td className="cell-target">
              <SessionHead cat="plenary" kicker="Plenary" title="AI" />
              {renderPair('plenary-1-speaker', 'plenary-1-respondent')}
            </td>
            <td className="cell-target">
              <SessionHead cat="plenary" kicker="Plenary" title="Religious Pluralism" />
              {renderPair('plenary-3-speaker', 'plenary-3-respondent')}
            </td>
            <td className="cell-target">
              <SessionHead cat="plenary" kicker="Plenary" title="Healing" />
              {renderPair('plenary-5-speaker', 'plenary-5-respondent')}
            </td>
            <td className="cell-target">
              <SessionHead cat="plenary" kicker="Plenary" title="The Next Generation" />
              {renderPair('plenary-7-speaker', 'plenary-7-respondent')}
            </td>
          </tr>

          {/* 10:30-11:00 Coffee Break */}
          <tr className="tt-row-break">
            <td className="cell-time">10:30–11:00</td>
            <td className="cell-min">30</td>
            <td colSpan={4} className="cell-static">Coffee Break</td>
          </tr>

          {/* AM 11:10-12:00: Plenary Sessions 2 */}
          <tr>
            <td className="cell-time is-key">11:10–12:00</td>
            <td className="cell-min">50</td>
            <td className="cell-target">
              <SessionHead cat="plenary" kicker="Plenary" title="Diaspora" />
              {renderPair('plenary-2-speaker', 'plenary-2-respondent')}
            </td>
            <td className="cell-target">
              <SessionHead cat="plenary" kicker="Plenary" title="Justice" />
              {renderPair('plenary-4-speaker', 'plenary-4-respondent')}
            </td>
            <td className="cell-target">
              <SessionHead cat="plenary" kicker="Plenary" title="The Created World" />
              {renderPair('plenary-6-speaker', 'plenary-6-respondent')}
            </td>
            <td className="cell-closing">
              <div className="closing-title">Closing</div>
              <ul className="closing-list">
                <li>AMA Declaration</li>
                <li>Introducing AMA New Leaders</li>
                <li>Holy Communion</li>
              </ul>
            </td>
          </tr>

          {/* PM 12:00-1:30 Lunch */}
          <tr className="tt-row-break">
            <td className="cell-time">PM 12:00–1:30</td>
            <td className="cell-min">90</td>
            <td colSpan={4} className="cell-static">Lunch</td>
          </tr>

          {/* PM 1:40-2:10: Global Links Reports (two 15-min rows) */}
          <tr>
            <td rowSpan={3} className="cell-time is-key">1:40–2:10</td>
            <td className="cell-min">–</td>
            <td rowSpan={3} className="cell-muted" />
            <td colSpan={3} className="cell-band cat-global">
              <span className="kicker">Global Links Reports</span>
            </td>
            <td rowSpan={3} className="cell-static">Departure</td>
          </tr>

          {/* 1st 15 min: 1:40-1:55 */}
          <tr>
            <td className="cell-min is-key">15</td>
            <td className="cell-target">{renderSpeakerBox('global-1')}</td>
            <td className="cell-target">{renderSpeakerBox('global-3')}</td>
            <td className="cell-target">{renderSpeakerBox('global-5')}</td>
          </tr>

          {/* 2nd 15 min: 1:55-2:10 */}
          <tr>
            <td className="cell-min is-key">15</td>
            <td className="cell-target">{renderSpeakerBox('global-2')}</td>
            <td className="cell-target">{renderSpeakerBox('global-4')}</td>
            <td className="cell-target">{renderSpeakerBox('global-6')}</td>
          </tr>

          {/* 2:30-3:20 Workshops */}
          <tr>
            <td className="cell-time">2:30–3:20</td>
            <td className="cell-min">50</td>
            {/* Day 1 (Mon): Registration 2:30–5:00 PM spans 4 afternoon rows */}
            <td className="cell-registration" rowSpan={4}>
              <div className="registration-box">
                <div className="registration-title">Registration</div>
                <div className="registration-time">2:30 – 5:00 PM</div>
              </div>
            </td>
            <td className="cell-workshop">
              <div className="ws-title">Workshops-1</div>
              <div className="ws-note">Tracks A–G · excluded</div>
            </td>
            <td className="cell-workshop">
              <div className="ws-title">Workshops-3</div>
              <div className="ws-note">Tracks A–G · excluded</div>
            </td>
            <td className="cell-workshop">
              <div className="ws-title">Workshops-5</div>
              <div className="ws-note">Tracks A–G · excluded</div>
            </td>
            <td className="cell-muted" rowSpan={11} />
          </tr>

          {/* 3:20-3:40 Coffee Break */}
          <tr className="tt-row-break">
            <td className="cell-time">3:20–3:40</td>
            <td className="cell-min">20</td>
            <td colSpan={3} className="cell-static">Coffee Break</td>
          </tr>

          {/* 3:40-4:30 Workshops */}
          <tr>
            <td className="cell-time">3:40–4:30</td>
            <td className="cell-min">50</td>
            <td className="cell-workshop">
              <div className="ws-title">Workshops-2</div>
              <div className="ws-note">Tracks A–G · excluded</div>
            </td>
            <td className="cell-workshop">
              <div className="ws-title">Workshops-4</div>
              <div className="ws-note">Tracks A–G · excluded</div>
            </td>
            <td className="cell-workshop">
              <div className="ws-title">Workshops-6</div>
              <div className="ws-note">Tracks A–G · excluded</div>
            </td>
          </tr>

          {/* 4:30-5:00 Break */}
          <tr className="tt-row-break">
            <td className="cell-time">4:30–5:00</td>
            <td className="cell-min">30</td>
            <td colSpan={3} className="cell-static">Break</td>
          </tr>

          {/* 5:00-6:30 Dinner */}
          <tr className="tt-row-break">
            <td className="cell-time">5:00–6:30</td>
            <td className="cell-min">90</td>
            <td colSpan={4} className="cell-static">Dinner</td>
          </tr>

          {/* Evening 1. 6:30-7:00 Praise & Worship */}
          <tr>
            <td className="cell-time">6:30–7:00</td>
            <td className="cell-min">30</td>
            <td colSpan={2} className="cell-static">Praise &amp; Worship</td>
            {/* Wed: Fellowship spans all 6 evening rows */}
            <td className="cell-static cell-feature" rowSpan={6}>Fellowship</td>
            <td className="cell-static">Praise &amp; Worship</td>
          </tr>

          {/* Evening 2. 7:00-7:20 Special Performances */}
          <tr>
            <td className="cell-time">7:00–7:20</td>
            <td className="cell-min">20</td>
            <td colSpan={2} className="cell-static">Special Performances</td>
            <td className="cell-static">Special Performances</td>
          </tr>

          {/* Evening 3. 7:20-7:35 National Reports 1 / Mon: Welcome Reception */}
          <tr>
            <td className="cell-time is-key">7:20–7:35</td>
            <td className="cell-min">15</td>
            <td className="cell-static cell-feature" rowSpan={3}>Welcome Reception</td>
            <td className="cell-target">
              <SessionHead cat="national" kicker="National Report · 15m" title="Uzbekistan" />
              {renderSpeakerBox('national-1')}
            </td>
            <td className="cell-target">
              <SessionHead cat="national" kicker="National Report · 15m" title="Cambodia" />
              {renderSpeakerBox('national-3')}
            </td>
          </tr>

          {/* Evening 4. 7:35-7:50 National Reports 2 */}
          <tr>
            <td className="cell-time is-key">7:35–7:50</td>
            <td className="cell-min">15</td>
            <td className="cell-target">
              <SessionHead cat="national" kicker="National Report · 15m" title="Mongolia" />
              {renderSpeakerBox('national-2')}
            </td>
            <td className="cell-target">
              <SessionHead cat="national" kicker="National Report · 15m" title="Myanmar" />
              {renderSpeakerBox('national-4')}
            </td>
          </tr>

          {/* Evening 5. 7:50-8:00 Prayer */}
          <tr>
            <td className="cell-time">7:50–8:00</td>
            <td className="cell-min">10</td>
            <td className="cell-static">Prayer</td>
            <td className="cell-static">Prayer</td>
          </tr>

          {/* Evening 6. 8:00-8:50 Evening Messages */}
          <tr>
            <td className="cell-time">8:00–8:50</td>
            <td className="cell-min">50</td>
            <td className="cell-static">
              <div>Evening Message</div>
              <div className="static-speaker">Rev. Jaehoon Lee</div>
            </td>
            <td className="cell-static">
              <div>Evening Message</div>
              <div className="static-speaker">Rev. Jongboo Hwa</div>
            </td>
            <td className="cell-static">
              <div>Evening Message</div>
              <div className="static-speaker">Rev. Dr. Daniel Shinjong Baeq</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
