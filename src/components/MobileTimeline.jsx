import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Clock, Play, Calendar, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

// Get local date string in YYYY-MM-DD format
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CONVENTION_DAYS_DEF = [
  { key: '2026-09-14', label: 'Sep 14 (Mon) · Day 1', shortLabel: 'Sep 14 · Day 1' },
  { key: '2026-09-15', label: 'Sep 15 (Tue) · Day 2', shortLabel: 'Sep 15 · Day 2' },
  { key: '2026-09-16', label: 'Sep 16 (Wed) · Day 3', shortLabel: 'Sep 16 · Day 3' },
  { key: '2026-09-17', label: 'Sep 17 (Thu) · Day 4', shortLabel: 'Sep 17 · Day 4' },
  { key: '2026-09-18', label: 'Sep 18 (Fri) · Day 5', shortLabel: 'Sep 18 · Day 5' }
];

const ALL_TAB_DEF = { key: 'all', label: 'All Days', shortLabel: 'All Days' };

// Date range checkers
const isPreConvention = (dateStr) => dateStr < '2026-09-14';
const isPostConvention = (dateStr) => dateStr >= '2026-09-19';
const isDuringConvention = (dateStr) => !isPreConvention(dateStr) && !isPostConvention(dateStr);

// Default selected day: 'all' before Sep 14 and on/after Sep 19; specific day during Sep 14-18
const getDefaultDayKey = (dateStr) => {
  if (isPreConvention(dateStr) || isPostConvention(dateStr)) {
    return 'all';
  }
  return dateStr;
};

const SIMULATION_PRESETS = [
  { key: '2026-09-13', label: '9/13 (개막 전 · All)' },
  { key: '2026-09-14', label: '9/14 (Day 1 시작)' },
  { key: '2026-09-15', label: '9/15 (Day 2)' },
  { key: '2026-09-16', label: '9/16 (Day 3)' },
  { key: '2026-09-17', label: '9/17 (Day 4)' },
  { key: '2026-09-18', label: '9/18 (Day 5)' },
  { key: '2026-09-19', label: '9/19 (종료 후 · All)' }
];

export function MobileTimeline({ 
  speakersMap, 
  onToggleStatus, 
  onOpenEdit,
  highlightPendingOnly 
}) {
  // Real-time system date string (YYYY-MM-DD)
  const [currentSystemDate, setCurrentSystemDate] = useState(getLocalDateString);
  // Optional simulated date for instant preview and testing
  const [simulatedDate, setSimulatedDate] = useState(null);
  const [showSimPanel, setShowSimPanel] = useState(false);

  // Midnight timer & automatic date updater
  useEffect(() => {
    const handleCheckDate = () => {
      const today = getLocalDateString();
      setCurrentSystemDate(prev => (prev !== today ? today : prev));
    };

    // Calculate time until next midnight (00:00:00.050)
    const now = new Date();
    const tomorrowMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 50
    );
    const msToMidnight = Math.max(1000, tomorrowMidnight.getTime() - now.getTime());

    const midnightTimeout = setTimeout(() => {
      handleCheckDate();
    }, msToMidnight);

    // Watchdog interval every 30 seconds (checks after system wake or clock change)
    const intervalId = setInterval(handleCheckDate, 30000);

    // Trigger on visibility change (e.g., waking phone or switching back to tab in morning)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleCheckDate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentSystemDate]);

  // Effective date: simulated date if active, otherwise live system date
  const effectiveDate = simulatedDate || currentSystemDate;

  // Default selectedDay: 'all' before Sep 14 or from Sep 19 onwards; today's date during convention
  const [selectedDay, setSelectedDay] = useState(() => getDefaultDayKey(effectiveDate));

  // Automatically transition selected day when midnight advances
  const prevEffectiveDateRef = useRef(effectiveDate);
  useEffect(() => {
    const prev = prevEffectiveDateRef.current;
    if (prev !== effectiveDate) {
      const prevDefault = getDefaultDayKey(prev);
      if (selectedDay === prevDefault || selectedDay === prev) {
        setSelectedDay(getDefaultDayKey(effectiveDate));
      }
      prevEffectiveDateRef.current = effectiveDate;
    }
  }, [effectiveDate, selectedDay]);

  // Reorder tabs:
  // 1. [개막 전 (< 2026-09-14) 또는 9월 19일 이후 (>= 2026-09-19)]:
  //    All Days가 제일 앞으로 오고, 그 뒤로 Day 1 ~ Day 5 순서
  // 2. [대회 기간 (2026-09-14 ~ 2026-09-18)]:
  //    14일 되면 14일이 제일 앞으로, 15일 되면 15일이 제일 앞으로...
  //    그 다음 all, 다음날.... 순서에 맨 마지막에 전날
  let orderedDayTabs = [];
  if (isPreConvention(effectiveDate) || isPostConvention(effectiveDate)) {
    orderedDayTabs = [
      ALL_TAB_DEF,
      ...CONVENTION_DAYS_DEF
    ];
  } else {
    const activeIndex = CONVENTION_DAYS_DEF.findIndex(d => d.key === effectiveDate);
    if (activeIndex === -1) {
      orderedDayTabs = [ALL_TAB_DEF, ...CONVENTION_DAYS_DEF];
    } else {
      const todayItem = CONVENTION_DAYS_DEF[activeIndex];
      const nextDays = CONVENTION_DAYS_DEF.slice(activeIndex + 1);
      const prevDays = CONVENTION_DAYS_DEF.slice(0, activeIndex);

      orderedDayTabs = [
        { ...todayItem, isToday: true },
        ALL_TAB_DEF,
        ...nextDays.map(d => ({ ...d, isFuture: true })),
        ...prevDays.map(d => ({ ...d, isPast: true }))
      ];
    }
  }

  // Grouped sessions by day with COMPLETE schedule from morning to night
  const timelineSchedule = [
    {
      date: '2026-09-14',
      dateLabel: 'Sep 14 (Mon) · Day 1',
      sessions: [
        {
          time: '14:30 - 17:00 (2:30 – 5:00 PM)',
          category: 'registration',
          title: 'REGISTRATION',
          speakerIds: [],
          details: 'Convention Registration & Badge / Materials Pick-up',
          isStatic: true
        },
        {
          time: '17:00 - 18:30 (5:00 – 6:30 PM)',
          category: 'meal',
          title: 'DINNER',
          speakerIds: [],
          details: 'Dinner & Welcome Fellowship',
          isStatic: true
        },
        {
          time: '18:30 - 19:00 (6:30 – 7:00 PM)',
          category: 'worship',
          title: 'PRAISE & WORSHIP',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '19:00 - 19:20 (7:00 – 7:20 PM)',
          category: 'performance',
          title: 'SPECIAL PERFORMANCES',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '19:20 - 20:00 (7:20 – 8:00 PM)',
          category: 'reception',
          title: 'WELCOME RECEPTION',
          speakerIds: [],
          details: 'Official Welcome Reception for Delegates & Guests',
          isStatic: true
        },
        {
          time: '20:00 - 20:50 (8:00 – 8:50 PM)',
          category: 'evening',
          title: 'EVENING MESSAGES',
          speakerIds: [],
          speakerName: 'Rev. Jaehoon Lee',
          role: 'Preacher',
          affiliation: 'Onnuri Community Church',
          isStatic: true
        }
      ]
    },
    {
      date: '2026-09-15',
      dateLabel: 'Sep 15 (Tue) · Day 2',
      sessions: [
        {
          time: '08:30 - 08:50 (8:30 – 8:50 AM)',
          category: 'worship',
          title: 'PRAISE & WORSHIP',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '08:50 - 09:30 (8:50 – 9:30 AM)',
          category: 'biblical',
          title: 'BIBLICAL EXEGESIS (DAY 2)',
          speakerIds: ['biblical-15']
        },
        {
          time: '09:40 - 10:30 (9:40 – 10:30 AM)',
          category: 'plenary',
          title: 'PLENARY: AI (Artificial Intelligence)',
          speakerIds: ['plenary-1-speaker', 'plenary-1-respondent']
        },
        {
          time: '10:30 - 11:10 (10:30 – 11:10 AM)',
          category: 'break',
          title: 'COFFEE BREAK',
          speakerIds: [],
          details: 'Morning Coffee & Refreshments',
          isStatic: true
        },
        {
          time: '11:10 - 12:00 (11:10 AM – 12:00 PM)',
          category: 'plenary',
          title: 'PLENARY: Diaspora',
          speakerIds: ['plenary-2-speaker', 'plenary-2-respondent']
        },
        {
          time: '12:00 - 13:30 (12:00 – 1:30 PM)',
          category: 'meal',
          title: 'LUNCH',
          speakerIds: [],
          details: 'Buffet Lunch & Fellowship',
          isStatic: true
        },
        {
          time: '13:40 - 13:55 (1:40 – 1:55 PM, 15m)',
          category: 'global',
          title: 'GLOBAL LINKS: Lausanne Movement',
          speakerIds: ['global-1']
        },
        {
          time: '13:55 - 14:10 (1:55 – 2:10 PM, 15m)',
          category: 'global',
          title: 'GLOBAL LINKS: MANI',
          speakerIds: ['global-2']
        },
        {
          time: '14:30 - 15:20 (2:30 – 3:20 PM)',
          category: 'workshop',
          title: 'WORKSHOPS-1',
          speakerIds: [],
          details: 'Tracks A~G / Parallel Workshops',
          isStatic: true
        },
        {
          time: '15:20 - 15:40 (3:20 – 3:40 PM)',
          category: 'break',
          title: 'COFFEE BREAK',
          speakerIds: [],
          details: 'Afternoon Tea & Networking',
          isStatic: true
        },
        {
          time: '15:40 - 16:30 (3:40 – 4:30 PM)',
          category: 'workshop',
          title: 'WORKSHOPS-2',
          speakerIds: [],
          details: 'Tracks A~G / Parallel Workshops',
          isStatic: true
        },
        {
          time: '16:30 - 17:00 (4:30 – 5:00 PM)',
          category: 'break',
          title: 'BREAK',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '17:00 - 18:30 (5:00 – 6:30 PM)',
          category: 'meal',
          title: 'DINNER',
          speakerIds: [],
          details: 'Dinner & Evening Fellowship',
          isStatic: true
        },
        {
          time: '18:30 - 19:00 (6:30 – 7:00 PM)',
          category: 'worship',
          title: 'PRAISE & WORSHIP',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '19:00 - 19:20 (7:00 – 7:20 PM)',
          category: 'performance',
          title: 'SPECIAL PERFORMANCES',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '19:20 - 19:35 (7:20 – 7:35 PM, 15m)',
          category: 'national',
          title: 'NATIONAL REPORT: Uzbekistan',
          speakerIds: ['national-1']
        },
        {
          time: '19:35 - 19:50 (7:35 – 7:50 PM, 15m)',
          category: 'national',
          title: 'NATIONAL REPORT: Mongolia',
          speakerIds: ['national-2']
        },
        {
          time: '19:50 - 20:00 (7:50 – 8:00 PM, 10m)',
          category: 'worship',
          title: 'PRAYER',
          speakerIds: [],
          details: 'Corporate Prayer for the Nations',
          isStatic: true
        },
        {
          time: '20:00 - 20:50 (8:00 – 8:50 PM)',
          category: 'evening',
          title: 'EVENING MESSAGES',
          speakerIds: [],
          speakerName: 'Rev. Jongboo Hwa',
          role: 'Preacher',
          affiliation: 'Nam Seoul Church',
          isStatic: true
        }
      ]
    },
    {
      date: '2026-09-16',
      dateLabel: 'Sep 16 (Wed) · Day 3',
      sessions: [
        {
          time: '08:30 - 08:50 (8:30 – 8:50 AM)',
          category: 'worship',
          title: 'PRAISE & WORSHIP',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '08:50 - 09:30 (8:50 – 9:30 AM)',
          category: 'biblical',
          title: 'BIBLICAL EXEGESIS (DAY 3)',
          speakerIds: ['biblical-16']
        },
        {
          time: '09:40 - 10:30 (9:40 – 10:30 AM)',
          category: 'plenary',
          title: 'PLENARY: Religious Pluralism',
          speakerIds: ['plenary-3-speaker', 'plenary-3-respondent']
        },
        {
          time: '10:30 - 11:10 (10:30 – 11:10 AM)',
          category: 'break',
          title: 'COFFEE BREAK',
          speakerIds: [],
          details: 'Morning Coffee & Refreshments',
          isStatic: true
        },
        {
          time: '11:10 - 12:00 (11:10 AM – 12:00 PM)',
          category: 'plenary',
          title: 'PLENARY: Justice',
          speakerIds: ['plenary-4-speaker', 'plenary-4-respondent']
        },
        {
          time: '12:00 - 13:30 (12:00 – 1:30 PM)',
          category: 'meal',
          title: 'LUNCH',
          speakerIds: [],
          details: 'Buffet Lunch & Fellowship',
          isStatic: true
        },
        {
          time: '13:40 - 13:55 (1:40 – 1:55 PM, 15m)',
          category: 'global',
          title: 'GLOBAL LINKS: WEA-MC',
          speakerIds: ['global-3']
        },
        {
          time: '13:55 - 14:10 (1:55 – 2:10 PM, 15m)',
          category: 'global',
          title: 'GLOBAL LINKS: COMIBAM',
          speakerIds: ['global-4']
        },
        {
          time: '14:30 - 15:20 (2:30 – 3:20 PM)',
          category: 'workshop',
          title: 'WORKSHOPS-3',
          speakerIds: [],
          details: 'Tracks A~G / Parallel Workshops',
          isStatic: true
        },
        {
          time: '15:20 - 15:40 (3:20 – 3:40 PM)',
          category: 'break',
          title: 'COFFEE BREAK',
          speakerIds: [],
          details: 'Afternoon Tea & Networking',
          isStatic: true
        },
        {
          time: '15:40 - 16:30 (3:40 – 4:30 PM)',
          category: 'workshop',
          title: 'WORKSHOPS-4',
          speakerIds: [],
          details: 'Tracks A~G / Parallel Workshops',
          isStatic: true
        },
        {
          time: '16:30 - 17:00 (4:30 – 5:00 PM)',
          category: 'break',
          title: 'BREAK',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '17:00 - 18:30 (5:00 – 6:30 PM)',
          category: 'meal',
          title: 'DINNER',
          speakerIds: [],
          details: 'Dinner & Evening Fellowship',
          isStatic: true
        },
        {
          time: '18:30 - 20:50 (6:30 – 8:50 PM)',
          category: 'fellowship',
          title: 'FELLOWSHIP NIGHT',
          speakerIds: [],
          details: 'AMA Convention Fellowship & Mission Family Night',
          isStatic: true
        }
      ]
    },
    {
      date: '2026-09-17',
      dateLabel: 'Sep 17 (Thu) · Day 4',
      sessions: [
        {
          time: '08:30 - 08:50 (8:30 – 8:50 AM)',
          category: 'worship',
          title: 'PRAISE & WORSHIP',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '08:50 - 09:30 (8:50 – 9:30 AM)',
          category: 'biblical',
          title: 'BIBLICAL EXEGESIS (DAY 4)',
          speakerIds: ['biblical-17']
        },
        {
          time: '09:40 - 10:30 (9:40 – 10:30 AM)',
          category: 'plenary',
          title: 'PLENARY: Healing',
          speakerIds: ['plenary-5-speaker', 'plenary-5-respondent']
        },
        {
          time: '10:30 - 11:10 (10:30 – 11:10 AM)',
          category: 'break',
          title: 'COFFEE BREAK',
          speakerIds: [],
          details: 'Morning Coffee & Refreshments',
          isStatic: true
        },
        {
          time: '11:10 - 12:00 (11:10 AM – 12:00 PM)',
          category: 'plenary',
          title: 'PLENARY: The Created World',
          speakerIds: ['plenary-6-speaker', 'plenary-6-respondent']
        },
        {
          time: '12:00 - 13:30 (12:00 – 1:30 PM)',
          category: 'meal',
          title: 'LUNCH',
          speakerIds: [],
          details: 'Buffet Lunch & Fellowship',
          isStatic: true
        },
        {
          time: '13:40 - 13:55 (1:40 – 1:55 PM, 15m)',
          category: 'global',
          title: 'GLOBAL LINKS: Frontier Ventures',
          speakerIds: ['global-5']
        },
        {
          time: '13:55 - 14:10 (1:55 – 2:10 PM, 15m)',
          category: 'global',
          title: 'GLOBAL LINKS: Missio Nexus',
          speakerIds: ['global-6']
        },
        {
          time: '14:30 - 15:20 (2:30 – 3:20 PM)',
          category: 'workshop',
          title: 'WORKSHOPS-5',
          speakerIds: [],
          details: 'Tracks A~G / Parallel Workshops',
          isStatic: true
        },
        {
          time: '15:20 - 15:40 (3:20 – 3:40 PM)',
          category: 'break',
          title: 'COFFEE BREAK',
          speakerIds: [],
          details: 'Afternoon Tea & Networking',
          isStatic: true
        },
        {
          time: '15:40 - 16:30 (3:40 – 4:30 PM)',
          category: 'workshop',
          title: 'WORKSHOPS-6',
          speakerIds: [],
          details: 'Tracks A~G / Parallel Workshops',
          isStatic: true
        },
        {
          time: '16:30 - 17:00 (4:30 – 5:00 PM)',
          category: 'break',
          title: 'BREAK',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '17:00 - 18:30 (5:00 – 6:30 PM)',
          category: 'meal',
          title: 'DINNER',
          speakerIds: [],
          details: 'Dinner & Evening Fellowship',
          isStatic: true
        },
        {
          time: '18:30 - 19:00 (6:30 – 7:00 PM)',
          category: 'worship',
          title: 'PRAISE & WORSHIP',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '19:00 - 19:20 (7:00 – 7:20 PM)',
          category: 'performance',
          title: 'SPECIAL PERFORMANCES',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '19:20 - 19:35 (7:20 – 7:35 PM, 15m)',
          category: 'national',
          title: 'NATIONAL REPORT: Cambodia',
          speakerIds: ['national-3']
        },
        {
          time: '19:35 - 19:50 (7:35 – 7:50 PM, 15m)',
          category: 'national',
          title: 'NATIONAL REPORT: Myanmar',
          speakerIds: ['national-4']
        },
        {
          time: '19:50 - 20:00 (7:50 – 8:00 PM, 10m)',
          category: 'worship',
          title: 'PRAYER',
          speakerIds: [],
          details: 'Corporate Prayer for the Nations',
          isStatic: true
        },
        {
          time: '20:00 - 20:50 (8:00 – 8:50 PM)',
          category: 'evening',
          title: 'EVENING MESSAGES',
          speakerIds: [],
          speakerName: 'Rev. Dr. Daniel Shinjong Baeq',
          role: 'Preacher',
          affiliation: 'Torch Trinity Graduate University',
          isStatic: true
        }
      ]
    },
    {
      date: '2026-09-18',
      dateLabel: 'Sep 18 (Fri) · Day 5',
      sessions: [
        {
          time: '08:30 - 09:30 (8:30 – 9:30 AM)',
          category: 'worship',
          title: 'PRAISE & WORSHIP',
          speakerIds: [],
          isStatic: true
        },
        {
          time: '09:40 - 10:30 (9:40 – 10:30 AM)',
          category: 'plenary',
          title: 'PLENARY: The Next Generation',
          speakerIds: ['plenary-7-speaker', 'plenary-7-respondent']
        },
        {
          time: '10:30 - 11:10 (10:30 – 11:10 AM)',
          category: 'break',
          title: 'COFFEE BREAK',
          speakerIds: [],
          details: 'Morning Coffee & Networking',
          isStatic: true
        },
        {
          time: '11:10 - 12:00 (11:10 AM – 12:00 PM)',
          category: 'closing',
          title: 'CLOSING CEREMONY',
          speakerIds: [],
          details: '• AMA Declaration\n• Introducing AMA New Leaders\n• Holy Communion',
          isStatic: true
        },
        {
          time: '12:00 - 13:30 (12:00 – 1:30 PM)',
          category: 'meal',
          title: 'LUNCH',
          speakerIds: [],
          details: 'Farewell Lunch & Fellowship',
          isStatic: true
        },
        {
          time: '13:40 - 14:10 (1:40 – 2:10 PM)',
          category: 'departure',
          title: 'DEPARTURE',
          speakerIds: [],
          details: 'Official Convention Conclusion & Delegate Departures',
          isStatic: true
        }
      ]
    }
  ];

  const filteredDays = (selectedDay === 'all' 
    ? timelineSchedule 
    : timelineSchedule.filter(d => d.date === selectedDay)
  ).filter(dayGroup => {
    if (!highlightPendingOnly) return true;
    if (selectedDay !== 'all') return true;
    return dayGroup.sessions.some(session => {
      const speakers = (session.speakerIds || []).map(id => speakersMap[id]).filter(Boolean);
      return speakers.some(s => s.status === 'pending');
    });
  });

  const getCategoryClass = (cat) => {
    if (cat === 'biblical') return 'banner-biblical';
    if (cat === 'plenary') return 'banner-plenary';
    if (cat === 'global') return 'banner-global';
    if (cat === 'national') return 'banner-national';
    if (cat === 'registration') return 'banner-registration';
    if (cat === 'evening') return 'banner-evening';
    if (cat === 'reception') return 'banner-reception';
    if (cat === 'worship') return 'banner-worship';
    if (cat === 'performance') return 'banner-performance';
    if (cat === 'meal') return 'banner-meal';
    if (cat === 'break') return 'banner-break';
    if (cat === 'workshop') return 'banner-workshop';
    if (cat === 'fellowship') return 'banner-fellowship';
    if (cat === 'closing') return 'banner-closing';
    if (cat === 'departure') return 'banner-departure';
    return 'banner-general';
  };

  return (
    <div className="mobile-timeline-wrapper">
      {/* Real-time status & Date simulation bar */}
      <div className="timeline-date-status-bar glass-panel">
        <div className="timeline-date-status-top">
          <div className="timeline-date-info">
            <span className={`live-clock-dot ${simulatedDate ? 'sim-mode' : ''}`} />
            <span className="timeline-date-current">
              {simulatedDate ? (
                <>
                  <strong className="text-amber-400">시뮬레이션 모드</strong>: {simulatedDate} 가상 날짜
                  {isPreConvention(simulatedDate) && <span className="pre-event-badge">개막 전 · All 최우선</span>}
                  {isPostConvention(simulatedDate) && <span className="pre-event-badge">9/19 이후 · All 최우선</span>}
                  {isDuringConvention(simulatedDate) && <span className="pre-event-badge">대회 기간 · 당일 최우선</span>}
                </>
              ) : (
                <>
                  <strong>자정 기준 자동 갱신 중</strong> (오늘: {currentSystemDate})
                  {isPreConvention(currentSystemDate) && (
                    <span className="pre-event-badge">개막 전 · All 최우선</span>
                  )}
                  {isPostConvention(currentSystemDate) && (
                    <span className="pre-event-badge">대회 종료 · All 최우선</span>
                  )}
                  {isDuringConvention(currentSystemDate) && (
                    <span className="pre-event-badge">대회 진행 중 · 당일 최우선</span>
                  )}
                </>
              )}
            </span>
          </div>

          <div className="timeline-status-actions">
            {simulatedDate && (
              <button
                className="sim-btn sim-reset-btn"
                onClick={() => {
                  setSimulatedDate(null);
                  setSelectedDay(getDefaultDayKey(currentSystemDate));
                }}
                title="실시간 시스템 날짜로 복귀"
              >
                <RotateCcw size={11} />
                <span>실시간 복귀</span>
              </button>
            )}
            <button
              className="timeline-sim-toggle-btn"
              onClick={() => setShowSimPanel(prev => !prev)}
              title="날짜 테스트 메뉴 열기/닫기"
            >
              <span>날짜 테스트</span>
              {showSimPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {showSimPanel && (
          <div className="timeline-date-simulator-panel animate-fade-in">
            <span className="sim-label">가상 날짜 선택 (자정 변경 즉시 확인):</span>
            <div className="sim-btn-group">
              {SIMULATION_PRESETS.map(d => (
                <button
                  key={d.key}
                  className={`sim-btn ${effectiveDate === d.key ? 'active' : ''}`}
                  onClick={() => {
                    setSimulatedDate(d.key);
                    setSelectedDay(getDefaultDayKey(d.key));
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day selector tabs: [해당날짜 (Today)] -> [All Days] -> [다음날...] -> [전날] */}
      <div className="mobile-day-tabs">
        {orderedDayTabs.map(day => (
          <button
            key={day.key}
            className={`mobile-day-tab ${selectedDay === day.key ? 'active' : ''} ${day.isToday ? 'is-today' : ''} ${day.isPast ? 'is-past' : ''}`}
            onClick={() => setSelectedDay(day.key)}
          >
            <span>{day.label}</span>
            {day.isToday && <span className="tab-today-pill">Today</span>}
            {day.isPast && <span className="tab-past-pill">전날</span>}
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
              {isDuringConvention(effectiveDate) && dayGroup.date === effectiveDate && (
                <span className="day-header-today-pill">Today</span>
              )}
            </div>

            <div className="mobile-sessions-list">
              {(() => {
                const sessionElements = dayGroup.sessions.map((session, sIdx) => {
                  const speakers = (session.speakerIds || []).map(id => speakersMap[id]).filter(Boolean);
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

                      {session.isStatic ? (
                        session.speakerName ? (
                          <div className="mobile-speakers-col">
                            <div className="mobile-speaker-card is-static-speaker">
                              <div className="mobile-card-row-top">
                                <span className="tt-role-pill role-lecturer">
                                  {session.role || 'Preacher'}
                                </span>
                                <span className="tt-status-tag tag-general">
                                  GENERAL SESSION
                                </span>
                              </div>

                              <div className="mobile-speaker-name">
                                {session.speakerName}
                              </div>

                              {session.affiliation && (
                                <div className="mobile-speaker-affil">
                                  {session.affiliation}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : session.details ? (
                          <div className="mobile-static-desc">
                            {session.details}
                          </div>
                        ) : null
                      ) : (
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
                                    {/* Status badge: NOT RECEIVED vs SUBMITTED */}
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
                                        className="mobile-action-btn btn-undo"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onToggleStatus(speaker.id);
                                        }}
                                      >
                                        Undo
                                      </button>
                                    ) : (
                                      <button
                                        className="mobile-action-btn btn-start"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenEdit(speaker);
                                        }}
                                      >
                                        <Play size={10} fill="currentColor" />
                                        <span>Start</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="mobile-speaker-name">
                                  {speaker.speakerName}
                                </div>

                                {/* Platform OS, File Types & Timestamp (When submitted) */}
                                {isSubmitted && (
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
                                    {speaker.submittedAt && (
                                      <span className="tt-timestamp-pill">
                                        ✓ {speaker.submittedAt}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });

                const validSessions = sessionElements.filter(Boolean);
                if (validSessions.length === 0) {
                  return (
                    <div className="mobile-empty-day-note">
                      <span>{dayGroup.date === '2026-09-14' 
                        ? 'ℹ️ Day 1 is Opening & Registration Day. No report submissions required.' 
                        : '✓ No pending submissions found for this day.'}</span>
                    </div>
                  );
                }
                return validSessions;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
