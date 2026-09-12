import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

const OS_OPTIONS = ['Windows', 'Mac'];
const FILE_TYPE_OPTIONS = ['PPT', 'Keynote', 'PDF', 'DOCX', 'Image', 'MP4', 'MP3', 'Other'];

export function DetailModal({ speaker, isOpen, onClose, onSave }) {
  // Hooks must run on every render (before any early return)
  const [computerOS, setComputerOS] = useState('');
  const [fileTypes, setFileTypes] = useState([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (speaker) {
      setComputerOS(speaker.computerOS || '');
      setFileTypes(Array.isArray(speaker.fileTypes) ? speaker.fileTypes : []);
      setNotes(speaker.notes || '');
      setErrorMessage('');
      setAttemptedSubmit(false);
    }
  }, [speaker]);

  if (!isOpen || !speaker) return null;

  const isAlreadySubmitted = speaker.status === 'submitted';
  const showAffiliation =
    speaker.affiliationOrCountry && !speaker.sessionTitle.includes(speaker.affiliationOrCountry);

  const handleToggleOS = (os) => {
    setComputerOS(prev => (prev === os ? '' : os));
    setErrorMessage('');
  };

  const handleToggleFileType = (type) => {
    setFileTypes(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]));
    setErrorMessage('');
  };

  // Submit action: enforces mandatory inputs
  const handleSubmit = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!computerOS) {
      setErrorMessage('Please select the computer platform (Windows or Mac).');
      return;
    }

    if (fileTypes.length === 0) {
      setErrorMessage('Please select at least one material format.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onSave(speaker.id, {
      status: 'submitted',
      computerOS,
      fileTypes,
      submittedAt: speaker.submittedAt || formattedDate,
      notes
    });

    onClose();
  };

  // Option to revert to Pending
  const handleRevertToPending = () => {
    if (window.confirm('Revert this speaker to Pending status?')) {
      onSave(speaker.id, {
        status: 'pending',
        computerOS: '',
        fileTypes: [],
        submittedAt: '',
        notes: ''
      });
      onClose();
    }
  };

  const osInvalid = attemptedSubmit && !computerOS;
  const typesInvalid = attemptedSubmit && fileTypes.length === 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-head-text">
            <div className="modal-meta">
              <span>{speaker.role}</span>
              <span className="sep">·</span>
              <span>{speaker.dateLabel}</span>
              <span className="sep">·</span>
              <span className="mono">{speaker.time}</span>
            </div>
            <h2 id="modal-title" className="modal-title">{speaker.speakerName}</h2>
            <p className="modal-sub">
              {speaker.sessionTitle}
              {showAffiliation && <> · {speaker.affiliationOrCountry}</>}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {errorMessage && (
              <div className="form-error animate-shake" role="alert">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Computer Platform (mandatory) */}
            <div className={`field ${osInvalid ? 'is-invalid animate-shake' : ''}`}>
              <div className="field-label">
                <span className="field-name">
                  <span className="field-step">1</span>
                  Computer platform
                </span>
                <span className="field-req">Required</span>
              </div>
              <div className="seg-options">
                {OS_OPTIONS.map(os => {
                  const isSelected = computerOS === os;
                  return (
                    <button
                      key={os}
                      type="button"
                      aria-pressed={isSelected}
                      className={`option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleOS(os)}
                    >
                      {isSelected && <Check size={14} strokeWidth={2.5} />}
                      <span>{os}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Material Format (mandatory, multi-select) */}
            <div className={`field ${typesInvalid ? 'is-invalid animate-shake' : ''}`}>
              <div className="field-label">
                <span className="field-name">
                  <span className="field-step">2</span>
                  Material formats
                </span>
                <span className="field-req">Required · select all that apply</span>
              </div>
              <div className="chips">
                {FILE_TYPE_OPTIONS.map(type => {
                  const isSelected = fileTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={isSelected}
                      className={`chip-opt ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggleFileType(type)}
                    >
                      {isSelected && <Check size={12} strokeWidth={2.75} />}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Optional remarks */}
            <div className="field">
              <label className="field-label" htmlFor="modal-notes">
                <span className="field-name">
                  <span className="field-step">3</span>
                  Remarks
                </span>
                <span className="field-req">Optional</span>
              </label>
              <input
                id="modal-notes"
                type="text"
                className="text-input"
                placeholder="e.g. Video included, needs clicker…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-foot">
            {isAlreadySubmitted && (
              <button type="button" className="btn-text-danger" onClick={handleRevertToPending}>
                Revert to Pending
              </button>
            )}
            <button type="submit" className="btn-primary">
              <Check size={16} strokeWidth={2.5} />
              <span>{isAlreadySubmitted ? 'Update Submission' : 'Submit (제출)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
