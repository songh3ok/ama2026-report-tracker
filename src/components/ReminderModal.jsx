import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Globe, Mail } from 'lucide-react';
import { CONVENTION_INFO } from '../data/speakersData';

export function ReminderModal({ speaker, isOpen, onClose }) {
  if (!isOpen || !speaker) return null;

  const [lang, setLang] = useState('ko');
  const [copied, setCopied] = useState(false);

  // Korean template
  const koreanTemplate = `[The 15th AMA Triennial Convention, Incheon 2026]
발표 원고 및 자료 제출 안내

존경하는 ${speaker.speakerName} 님, 주님의 평안을 전합니다.

오는 2026년 9월 인천에서 개최되는 제15차 AMA 총회(“${CONVENTION_INFO.theme}”)의 귀한 세션에 발표자로 함께해 주셔서 깊이 감사드립니다.

■ 배정 세션 정보
- 구분: ${speaker.categoryLabel} (${speaker.role})
- 세션 주제: ${speaker.sessionTitle}
- 일정: ${speaker.dateLabel} ${speaker.time}
- 소속/기관: ${speaker.affiliationOrCountry}

총회 자료집(프로시딩) 인쇄 및 동시통역 준비를 위하여 강사님의 발표 원고(논문/발제문) 및 프레젠테이션(PPT) 자료를 접수받고 있습니다.

아직 최종 자료가 접수되지 않아 안내드리오니, 아래 회신처로 자료를 송부해 주시거나 구글 드라이브 링크를 공유해 주시면 감사하겠습니다.

감사합니다.
The 15th AMA Convention 조직위원회 배상`;

  // English template
  const englishTemplate = `Subject: Material Submission Request - The 15th AMA Triennial Convention, Incheon 2026

Dear ${speaker.speakerName},

Warm greetings in the name of our Lord Jesus Christ.

We are deeply grateful for your participation in The 15th AMA Triennial Convention, Incheon 2026 under the theme "${CONVENTION_INFO.theme}".

■ Your Session Details:
- Category & Role: ${speaker.categoryLabel} (${speaker.role})
- Session Topic: ${speaker.sessionTitle}
- Schedule: ${speaker.dateLabel}, ${speaker.time}
- Affiliation: ${speaker.affiliationOrCountry}

To ensure timely preparation for the convention proceedings and simultaneous interpretation, we kindly request the submission of your presentation paper and slides (PPT/PDF).

As of today, our records show that your material has not yet been received. We would greatly appreciate it if you could send your file or share a cloud link at your earliest convenience.

Thank you very much for your dedication and partnership.

Sincerely,
Organizing Committee
The 15th AMA Triennial Convention, Incheon 2026`;

  const activeText = lang === 'ko' ? koreanTemplate : englishTemplate;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">독촉 및 안내 메시지 생성</h2>
            <p className="modal-subtitle">
              {speaker.speakerName} ({speaker.affiliationOrCountry})
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Lang Tabs */}
          <div className="reminder-lang-tabs">
            <button
              className={`lang-tab-btn ${lang === 'ko' ? 'active' : ''}`}
              onClick={() => setLang('ko')}
            >
              <MessageSquare size={14} />
              <span>한국어 메시지 (카카오톡 / 문자)</span>
            </button>
            <button
              className={`lang-tab-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              <Globe size={14} />
              <span>English Template (Email / WhatsApp)</span>
            </button>
          </div>

          <div className="reminder-text-area-box">
            <textarea
              readOnly
              className="reminder-textarea"
              value={activeText}
              rows={14}
            />
          </div>

          <div className="reminder-actions-row">
            <button 
              className={`btn-copy-reminder ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>클립보드에 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>메시지 전체 복사하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
