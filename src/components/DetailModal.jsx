import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, Laptop, FileCheck, Check, AlertCircle, Sparkles } from 'lucide-react';

const OS_OPTIONS = ['Windows', 'Mac'];
const FILE_TYPE_OPTIONS = ['PPT', 'Keynote', 'PDF', 'DOCX', 'Image', 'MP4', 'MP3', 'Other'];

export function DetailModal({ speaker, isOpen, onClose, onSave }) {
  if (!isOpen || !speaker) return null;

  const [computerOS, setComputerOS] = useState('');
  const [fileTypes, setFileTypes] = useState([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isAlreadySubmitted = speaker.status === 'submitted';

  useEffect(() => {
    if (speaker) {
      setComputerOS(speaker.computerOS || '');
      setFileTypes(Array.isArray(speaker.fileTypes) ? speaker.fileTypes : []);
      setNotes(speaker.notes || '');
      setErrorMessage('');
      setAttemptedSubmit(false);
    }
  }, [speaker]);

  const handleToggleOS = (os) => {
    setComputerOS(prev => prev === os ? '' : os);
    setErrorMessage('');
  };

  const handleToggleFileType = (type) => {
    setFileTypes(prev => {
      const exists = prev.includes(type);
      return exists ? prev.filter(t => t !== type) : [...prev, type];
    });
    setErrorMessage('');
  };

  // Submit action: enforces mandatory inputs
  const handleSubmit = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    // Validation: Computer OS is required
    if (!computerOS) {
      setErrorMessage('Required: Please select the Computer Platform (Windows or Mac).');
      return;
    }

    // Validation: At least one File Type is required
    if (fileTypes.length === 0) {
      setErrorMessage('Required: Please select at least one Material Format (PPT, PDF, etc.).');
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

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="modal-container glass-panel modal-motion-popup" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-badge-row">
              <span className="modal-role-pill">{speaker.role}</span>
              <span className="modal-day-badge">{speaker.dateLabel} {speaker.time}</span>
              <span className="modal-intake-badge">
                <Sparkles size={11} className="text-amber-400" />
                <span>Intake Questionnaire</span>
              </span>
            </div>
            <h2 className="modal-title">{speaker.speakerName}</h2>
            <p className="modal-subtitle">
              {speaker.sessionTitle} · {speaker.affiliationOrCountry}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Validation Notice */}
          {errorMessage && (
            <div className="modal-error-banner animate-shake">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Computer Platform (MANDATORY) */}
          <div className={`form-question-card ${attemptedSubmit && !computerOS ? 'is-invalid animate-shake' : ''}`}>
            <div className="question-header">
              <span className="question-step">Step 1</span>
              <div className="question-title-wrap">
                <Laptop size={16} className="text-blue-400" />
                <span className="question-title">Computer Platform</span>
                <span className="required-tag">Mandatory</span>
              </div>
            </div>
            <p className="question-hint">Which OS will be used for this presentation?</p>
            <div className="os-selector-grid">
              {OS_OPTIONS.map(os => {
                const isSelected = computerOS === os;
                return (
                  <button
                    key={os}
                    type="button"
                    className={`os-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleOS(os)}
                  >
                    {isSelected && <Check size={16} className="text-blue-400 font-bold" />}
                    <span>{os}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Material Format Type (MANDATORY) */}
          <div className={`form-question-card ${attemptedSubmit && fileTypes.length === 0 ? 'is-invalid animate-shake' : ''}`}>
            <div className="question-header">
              <span className="question-step">Step 2</span>
              <div className="question-title-wrap">
                <FileCheck size={16} className="text-emerald-400" />
                <span className="question-title">Material Format Type</span>
                <span className="required-tag">Mandatory</span>
              </div>
            </div>
            <p className="question-hint">Select all formats provided (one or more):</p>
            <div className="file-types-chips-grid">
              {FILE_TYPE_OPTIONS.map(type => {
                const isSelected = fileTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    className={`file-type-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleFileType(type)}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Optional Remarks */}
          <div className="form-group">
            <label className="form-label">
              <span>Remarks / Memo (Optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Video included, Needs clicker..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Row */}
          <div className="modal-submit-actions">
            {isAlreadySubmitted && (
              <button 
                type="button" 
                className="btn-revert"
                onClick={handleRevertToPending}
              >
                Revert to Pending
              </button>
            )}

            <button type="submit" className="btn-final-submit">
              <CheckCircle2 size={18} />
              <span>{isAlreadySubmitted ? 'Update Submission' : 'Submit (제출)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
