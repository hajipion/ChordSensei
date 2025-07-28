import { type ChordData } from "@shared/schema";

interface StaffNote {
  note: string;
  octave: number;
  yPosition: number;
}

const notePositions: Record<string, number> = {
  'C': 50,   // Middle C on staff
  'D': 42.5,
  'E': 35,
  'F': 27.5,
  'G': 20,
  'A': 12.5,
  'B': 5,
  'C#': 46.25,
  'D#': 38.75,
  'F#': 23.75,
  'G#': 16.25,
  'A#': 8.75,
  'Bb': 8.75,
  'Eb': 31.25
};

export function generateStaffNotation(chord: ChordData): string {
  const staffNotes = chord.notes.map(note => ({
    note,
    octave: 4,
    yPosition: notePositions[note] || 50
  }));

  const staffLines = Array.from({ length: 5 }, (_, i) => ({
    y: 20 + (i * 15)
  }));

  const noteElements = staffNotes.map((staffNote, index) => {
    const x = 100 + (index * 20);
    const isSharp = staffNote.note.includes('#') || staffNote.note.includes('b');
    
    return `
      <g>
        <ellipse cx="${x}" cy="${staffNote.yPosition}" rx="8" ry="6" fill="#000" transform="rotate(-15 ${x} ${staffNote.yPosition})"/>
        ${isSharp ? `<text x="${x - 15}" y="${staffNote.yPosition - 10}" font-size="12" fill="#000">${staffNote.note.includes('#') ? '♯' : '♭'}</text>` : ''}
      </g>
    `;
  }).join('');

  const staffLinesElements = staffLines.map(line => 
    `<line x1="40" y1="${line.y}" x2="360" y2="${line.y}" stroke="#000" stroke-width="1.5"/>`
  ).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" className="w-full h-20">
      <g>
        ${staffLinesElements}
        <g>
          <path d="M 60 10 Q 70 15 60 30 Q 50 25 60 10 Z" fill="#000"/>
        </g>
        ${noteElements}
      </g>
    </svg>
  `;
}
