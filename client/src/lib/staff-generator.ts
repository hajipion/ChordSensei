import { type ChordData } from "@shared/schema";

interface StaffNote {
  note: string;
  octave: number;
  yPosition: number;
  hasAccidental: boolean;
  accidentalType: '♯' | '♭' | null;
}

// Professional staff note positioning (in SVG units, staff line = 0, spaces between = 7.5)
const notePositions: Record<string, number> = {
  // Treble clef positioning (middle C = line below staff)
  'C4': 97.5,  // Middle C (ledger line below staff)
  'D4': 90,    // Below staff
  'E4': 82.5,  // Bottom line of staff
  'F4': 75,    // First space
  'G4': 67.5,  // Second line
  'A4': 60,    // Second space
  'B4': 52.5,  // Third line
  'C5': 45,    // Third space
  'D5': 37.5,  // Fourth line
  'E5': 30,    // Fourth space
  'F5': 22.5,  // Top line
  'G5': 15,    // Above staff
  'A5': 7.5,   // Ledger line above staff
  
  // Lower octave notes
  'C3': 112.5, // Ledger line below middle C
  'D3': 105,   // Below middle C
  'E3': 97.5,  // Same as middle C
  'F3': 90,    // Same as D4
  'G3': 82.5,  // Bottom line
  'A3': 75,    // First space
  'B3': 67.5,  // Second line
  
  // Higher octave notes
  'C6': 0,     // High ledger line
  'D6': -7.5,  // Higher ledger line
  'E6': -15,   // Even higher
};

// Helper function to parse note string and determine positioning
function parseNoteString(noteStr: string, defaultOctave: number = 4): StaffNote {
  let noteName = noteStr.charAt(0).toUpperCase();
  let accidental: '♯' | '♭' | null = null;
  let octave = defaultOctave;
  
  // Handle accidentals
  if (noteStr.includes('#')) {
    accidental = '♯';
  } else if (noteStr.includes('b')) {
    accidental = '♭';
  }
  
  // Extract octave if present
  const octaveMatch = noteStr.match(/\d/);
  if (octaveMatch) {
    octave = parseInt(octaveMatch[0]);
  }
  
  const fullNoteKey = `${noteName}${octave}`;
  const yPosition = notePositions[fullNoteKey] || notePositions[`${noteName}4`] || 67.5;
  
  return {
    note: noteStr,
    octave,
    yPosition,
    hasAccidental: accidental !== null,
    accidentalType: accidental
  };
}

// Enhanced treble clef with proper music engraving proportions
function getTrebleClefPath(): string {
  return `<g transform="translate(78, 55) scale(1.2, 1.2)">
    <path d="M -8 -25 
      C -8 -28, -6 -30, -3 -30
      C 2 -30, 7 -28, 7 -20
      C 7 -12, 2 -8, -2 -5
      C -3 -3, -3 -1, -2 1
      C -1 3, 1 4, 3 4
      C 5 4, 7 3, 7 1
      C 7 -1, 5 -2, 3 -2
      C 1 -2, -1 -1, -1 1
      C -1 3, 1 4, 3 4
      C 8 4, 12 1, 12 -5
      C 12 -11, 8 -14, 3 -14
      C -2 -14, -6 -11, -6 -5
      Q -6 5, -2 8
      Q 2 10, 3 4
      Q 12 1, 12 -5
      Q 12 -18, 2 -24
      Q -6 -28, -8 -25
      
      M -2 8
      C -4 8, -5 10, -5 12
      C -5 14, -4 16, -2 16
      C 0 16, 1 14, 1 12
      C 1 10, 0 8, -2 8
      
      M -2 20
      C -3 20, -4 18, -4 16
      C -4 14, -3 12, -1 12
      C 1 12, 2 14, 2 16
      C 2 18, 1 20, -1 20
      Z" 
      fill="#000" stroke="#000" stroke-width="0.3"/>
  </g>`;
}

export function generateStaffNotation(chord: ChordData): string {
  // Parse chord notes with proper octave assignment
  const staffNotes = chord.notes.map((note, index) => {
    // Assign different octaves for chord voicing (bottom to top)
    const octave = index === 0 ? 3 : index === 1 ? 4 : 5;
    return parseNoteString(note, octave);
  });

  // Professional staff lines (precisely spaced)
  const staffLines = Array.from({ length: 5 }, (_, i) => ({
    y: 22.5 + (i * 15) // Standard staff line spacing
  }));

  // Generate ledger lines for notes outside staff
  const ledgerLines: string[] = [];
  staffNotes.forEach((staffNote, index) => {
    const x = 120 + (index * 40);
    // Middle C ledger line
    if (staffNote.yPosition >= 97.5) {
      ledgerLines.push(`<line x1="${x - 15}" y1="97.5" x2="${x + 15}" y2="97.5" stroke="#000" stroke-width="1"/>`);
    }
    // High A ledger line
    if (staffNote.yPosition <= 7.5) {
      ledgerLines.push(`<line x1="${x - 15}" y1="7.5" x2="${x + 15}" y2="7.5" stroke="#000" stroke-width="1"/>`);
    }
  });

  // Generate note heads with proper positioning
  const noteElements = staffNotes.map((staffNote, index) => {
    const x = 120 + (index * 40);
    const noteHead = `<ellipse cx="${x}" cy="${staffNote.yPosition}" rx="6" ry="4.5" fill="#000" transform="rotate(-20 ${x} ${staffNote.yPosition})"/>`;
    
    // Add accidental if present
    const accidental = staffNote.hasAccidental ? 
      `<text x="${x - 20}" y="${staffNote.yPosition + 2}" font-size="16" font-family="serif" fill="#000">${staffNote.accidentalType}</text>` : '';
    
    // Add stem (stems go up if note is on or below middle line, down if above)
    const stemDirection = staffNote.yPosition >= 52.5 ? 'up' : 'down';
    const stemY1 = stemDirection === 'up' ? staffNote.yPosition - 4 : staffNote.yPosition + 4;
    const stemY2 = stemDirection === 'up' ? staffNote.yPosition - 30 : staffNote.yPosition + 30;
    const stemX = stemDirection === 'up' ? x + 6 : x - 6;
    const stem = `<line x1="${stemX}" y1="${stemY1}" x2="${stemX}" y2="${stemY2}" stroke="#000" stroke-width="1.5"/>`;
    
    return `<g>${accidental}${noteHead}${stem}</g>`;
  }).join('');

  // Main staff lines
  const staffLinesElements = staffLines.map(line => 
    `<line x1="60" y1="${line.y}" x2="280" y2="${line.y}" stroke="#000" stroke-width="1.2"/>`
  ).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140" class="w-full h-24">
      <g>
        <!-- Staff lines -->
        ${staffLinesElements}
        
        <!-- Treble clef -->
        ${getTrebleClefPath()}
        
        <!-- Ledger lines -->
        ${ledgerLines.join('')}
        
        <!-- Notes -->
        ${noteElements}
      </g>
    </svg>
  `;
}
