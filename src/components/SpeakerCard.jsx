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
  const showAffiliation = speaker.category === 'global_links' && speaker.affiliationOrCountry;
  const platformLine = [speaker.computerOS, (speaker.fileTypes || []).join(', ')]
    .filter(Boolean)
    .join(' · ');
  const hasMeta = isSubmitted && Boolean(platformLine || speaker.submittedAt);

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
      title={isSubmitted ? 'View or edit submission' : 'Not received — click to record submission'}
    >
      <div className="spk-top">
        <span className="spk-role">
          <span className="spk-dot" aria-hidden="true" />
          {speaker.role}
        </span>

        <div className="spk-actions">
          {isSubmitted ? (
            <>
              <span className="badge-done">
                <Check size={12} strokeWidth={2.75} />
                <span>Submitted</span>
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
                <RotateCcw size={12} />
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
      </div>

      <div className="spk-name">{speaker.speakerName}</div>

      {showAffiliation && <div className="spk-affil">{speaker.affiliationOrCountry}</div>}

      {hasMeta && (
        <div className="spk-meta">
          {platformLine && <span>{platformLine}</span>}
          {speaker.submittedAt && <span className="spk-time">{speaker.submittedAt}</span>}
        </div>
      )}
    </div>
  );
}
