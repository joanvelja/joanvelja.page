'use client';

import { useContext, useEffect, useId, useRef } from 'react';
import { MarginNotesContext } from './MarginNotes';

export function MarginNote({ children, label }) {
  const { registerNote } = useContext(MarginNotesContext);
  const reactId = useId();
  const id = `margin-note-${reactId}`;
  const contentRef = useRef(children);
  const labelRef = useRef(label);

  useEffect(() => {
    registerNote({
      id,
      content: contentRef.current,
      label: labelRef.current || 'Note',
    });
  }, [registerNote, id]);

  return (
    <span id={id} className="relative inline-block" data-margin-note-id={id}>
      <span className="sr-only">{children}</span>
    </span>
  );
}
