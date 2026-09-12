import React from 'react';
import { Play, Check, RotateCcw } from 'lucide-react';

// Shared speaker card used by both the Timeline and the Full Grid views
export function SpeakerCard({
  speaker,
  onOpenEdit,
  onToggleStatus,
  compact = false,
  dimmed = false
}) {
  const isSubmitted = speaker.status === 'submitted';
  const affiliation = speaker.category === 'global_links' ? speaker.affiliationOrCountry : '';
  const fileTypes = speaker.fileTypes || [];
  // "2026-09-12 23:03" -> "09-12 23:03" (the year is always 2026)
  const submittedLabel = (speaker.submittedAt || '').replace(/^\d{4}-/, '');
  const hasMeta = isSubmitted && Boolean(speaker.computerOS || fileTypes.length || submittedLabel);

  const open = () => onOpenEdit(speaker);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`spk ${compact ? 'spk-compact' : ''} ${isSubmitted ? 'is-submitted' : 'is-pending'} ${dimmed ? 'dimmed' : ''}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          open();
        }
      }}
      title={isSubmitted ? 'Submitted — view or edit' : 'Not received — click to record submission'}
    >
      <div className="spk-main">
        <div className="spk-name">{speaker.speakerName}</div>
        <div className="spk-sub">
          <span>{speaker.role}</span>
          {affiliation && <span className="spk-affil">{affiliation}</span>}
        </div>
      </div>

      <div className="spk-actions">
        {isSubmitted ? (
          <>
            <span className="badge-done" title="Submitted" aria-label="Submitted">
              <Check size={14} strokeWidth={3} />
            </span>
            <button
              type="button"
              className="btn-undo"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(speaker.id);
              }}
              title="Undo — revert to Not Received"
              aria-label={`Undo submission for ${speaker.speakerName}`}
            >
              <RotateCcw size={13} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-start"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            <Play size={9} fill="currentColor" />
            <span>Start</span>
          </button>
        )}
      </div>

      {hasMeta && (
        <div className="spk-meta">
          {speaker.computerOS && <span className="tag tag-os">{speaker.computerOS}</span>}
          {fileTypes.map(ft => (
            <span key={ft} className="tag tag-file">{ft}</span>
          ))}
          {submittedLabel && <span className="spk-time">{submittedLabel}</span>}
        </div>
      )}
    </div>
  );
}
