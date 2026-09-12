import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { SpeakerCard } from './SpeakerCard';

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

  const CATEGORY_KICKER = {
    biblical: 'Morning Session',
    plenary: 'Plenary',
    global: 'Global Links',
    national: 'National Report'
  };

  // "PRAISE & WORSHIP" -> "Praise & Worship"
  const toTitleCase = (str) =>
    str.toLowerCase().replace(/(^|[\s(\-/&])([a-z])/g, (_, p, c) => p + c.toUpperCase());

  // "PLENARY: Diaspora" -> "Diaspora"; "BIBLICAL EXEGESIS (DAY 2)" -> "Biblical Exegesis"
  const getHeading = (title) => {
    const idx = title.indexOf(':');
    const raw = idx === -1 ? toTitleCase(title) : title.slice(idx + 1).trim();
    return raw.replace(/\s*\(Day \d\)$/i, '');
  };

  // "13:40 - 13:55 (1:40 – 1:55 PM, 15m)" -> { start: '1:40', end: '1:55 PM', duration: '15m' }
  const parseTime = (raw) => {
    const match = raw.match(/\(([^)]*)\)/);
    const inner = match ? match[1] : raw;
    const [range, duration] = inner.split(',').map(part => part.trim());
    const [rawStart, end] = range.split('–').map(part => part.trim());
    // "8:50" + "9:30 AM" -> "8:50 AM" so a start time is never ambiguous on its own
    const meridiem = end && end.match(/\s(AM|PM)$/);
    const start = meridiem && !/(AM|PM)$/.test(rawStart) ? `${rawStart} ${meridiem[1]}` : rawStart;
    return { start, end, duration };
  };

  const phaseLabel = (() => {
    if (simulatedDate) {
      if (isPreConvention(simulatedDate)) return '개막 전 · All 최우선';
      if (isPostConvention(simulatedDate)) return '9/19 이후 · All 최우선';
      return '대회 기간 · 당일 최우선';
    }
    if (isPreConvention(currentSystemDate)) return '개막 전 · All 최우선';
    if (isPostConvention(currentSystemDate)) return '대회 종료 · All 최우선';
    return '대회 진행 중 · 당일 최우선';
  })();

  return (
    <div className="tl">
      {/* Live date status & date simulation */}
      <div className="tl-datebar">
        <span className={`live-dot ${simulatedDate ? 'sim' : ''}`} aria-hidden="true" />
        <span className="tl-datebar-text">
          {simulatedDate ? (
            <><strong>시뮬레이션 모드</strong> · 가상 날짜 {simulatedDate}</>
          ) : (
            <><strong>자정 기준 자동 갱신</strong> · 오늘 {currentSystemDate}</>
          )}
        </span>
        <span className="chip">{phaseLabel}</span>

        <div className="tl-datebar-actions">
          {simulatedDate && (
            <button
              className="link-btn warn"
              onClick={() => {
                setSimulatedDate(null);
                setSelectedDay(getDefaultDayKey(currentSystemDate));
              }}
              title="실시간 시스템 날짜로 복귀"
            >
              <RotateCcw size={12} />
              <span>실시간 복귀</span>
            </button>
          )}
          <button
            className="link-btn"
            onClick={() => setShowSimPanel(prev => !prev)}
            aria-expanded={showSimPanel}
            title="날짜 테스트 메뉴 열기/닫기"
          >
            <span>날짜 테스트</span>
            {showSimPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {showSimPanel && (
        <div className="tl-sim">
          <span className="tl-sim-label">가상 날짜 선택</span>
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
      )}

      {/* Day tabs: [Today] -> [All Days] -> [next days...] -> [previous days] */}
      <div className="day-tabs" role="tablist" aria-label="Convention day">
        {orderedDayTabs.map(day => {
          const [datePart, dayPart] = day.key === 'all'
            ? ['Sep 14 – 18', 'All Days']
            : day.label.split(' · ');
          const isActive = selectedDay === day.key;
          return (
            <button
              key={day.key}
              role="tab"
              aria-selected={isActive}
              className={`day-tab ${isActive ? 'active' : ''} ${day.isToday ? 'is-today' : ''} ${day.isPast ? 'is-past' : ''}`}
              onClick={() => setSelectedDay(day.key)}
            >
              <span className="day-tab-main">
                {dayPart}
                {day.isToday && <span className="tab-flag">Today</span>}
                {day.isPast && <span className="tab-flag past">전날</span>}
              </span>
              <span className="day-tab-sub">{datePart}</span>
            </button>
          );
        })}
      </div>

      {/* Day-by-day agenda */}
      <div className="tl-days">
        {filteredDays.map(dayGroup => {
          const daySpeakers = dayGroup.sessions
            .flatMap(session => (session.speakerIds || []).map(id => speakersMap[id]))
            .filter(Boolean);
          const daySubmitted = daySpeakers.filter(s => s.status === 'submitted').length;
          const [datePart, dayPart] = dayGroup.dateLabel.split(' · ');
          const isToday = isDuringConvention(effectiveDate) && dayGroup.date === effectiveDate;

          const items = dayGroup.sessions.map((session, sIdx) => {
            const speakers = (session.speakerIds || []).map(id => speakersMap[id]).filter(Boolean);
            const hasPending = speakers.some(s => s.status === 'pending');

            if (highlightPendingOnly && !hasPending) {
              return null;
            }

            const { start, end, duration } = parseTime(session.time);
            const timeCell = (
              <div className="tl-time">
                <span>{start}</span>
                {end && <span className="tl-time-end">{end}</span>}
              </div>
            );

            if (session.isStatic) {
              return (
                <li key={sIdx} className={`tl-item is-static ${session.speakerName ? 'has-speaker' : ''}`}>
                  {timeCell}
                  <div className="tl-body">
                    <div className="tl-static-title">{toTitleCase(session.title)}</div>
                    {session.speakerName ? (
                      <div className="tl-static-speaker">
                        {session.speakerName}
                        {session.affiliation && <span> · {session.affiliation}</span>}
                      </div>
                    ) : session.details ? (
                      <div className="tl-static-desc">{session.details}</div>
                    ) : null}
                  </div>
                </li>
              );
            }

            return (
              <li key={sIdx} className={`tl-item is-target cat-${session.category}`}>
                {timeCell}
                <div className="tl-body">
                  <div className="kicker">
                    {CATEGORY_KICKER[session.category]}
                    {duration && <span className="kicker-dur">· {duration}</span>}
                  </div>
                  <h3 className="tl-title">{getHeading(session.title)}</h3>
                  <div className="spk-list">
                    {speakers.map(speaker => {
                      if (highlightPendingOnly && speaker.status === 'submitted') {
                        return null;
                      }
                      return (
                        <SpeakerCard
                          key={speaker.id}
                          speaker={speaker}
                          onOpenEdit={onOpenEdit}
                          onToggleStatus={onToggleStatus}
                        />
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          }).filter(Boolean);

          return (
            <section key={dayGroup.date} className="day">
              <header className="day-head">
                <div>
                  <div className="day-eyebrow">
                    {dayPart}
                    {isToday && <span className="tab-flag">Today</span>}
                  </div>
                  <h2 className="day-title">{datePart}</h2>
                </div>
                {daySpeakers.length > 0 && (
                  <div className="day-count">
                    <strong>{daySubmitted}</strong> / {daySpeakers.length} submitted
                  </div>
                )}
              </header>

              {items.length === 0 ? (
                <div className="empty-note">
                  {dayGroup.date === '2026-09-14'
                    ? 'Day 1 is Opening & Registration Day. No report submissions required.'
                    : 'No pending submissions for this day.'}
                </div>
              ) : (
                <ol className="tl-list">{items}</ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
