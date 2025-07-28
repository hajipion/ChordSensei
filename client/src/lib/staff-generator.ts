import { type ChordData } from "@shared/schema";

// Note positioning on staff (y-coordinates, staff lines at 60, 70, 80, 90, 100)
const notePositions: Record<string, number> = {
  'C3': 125,  // Below staff
  'D3': 120,  // Below staff
  'E3': 115,  // Below staff
  'F3': 110,  // Below staff
  'G3': 105,  // Below staff line
  'A3': 100,  // Bottom line
  'B3': 95,   // First space
  'C4': 90,   // Second line (middle C area)
  'D4': 85,   // Second space
  'E4': 80,   // Third line
  'F4': 75,   // Third space
  'G4': 70,   // Fourth line
  'A4': 65,   // Fourth space
  'B4': 60,   // Top line
  'C5': 55,   // Above staff
  'D5': 50,   // Above staff
  'E5': 45,   // Above staff
  'F5': 40,   // Above staff
  'G5': 35,   // Above staff
};

// Get note position with octave
function getNotePosition(noteStr: string, octave: number): number {
  const key = `${noteStr}${octave}`;
  return notePositions[key] || notePositions[`${noteStr}4`] || 80;
}

// Create treble clef SVG path
function createTrebleClef(): string {
  return `<path d="M 25 45 C 25 40, 30 35, 35 35 C 40 35, 45 40, 45 45 C 45 50, 40 55, 35 55 C 30 55, 25 50, 25 45 
    M 35 55 C 40 60, 45 65, 45 70 C 45 75, 40 80, 35 80 C 30 80, 25 75, 25 70 C 25 65, 30 60, 35 55
    M 35 55 L 37 25 C 38 20, 40 15, 45 15 C 50 15, 55 20, 55 25 C 55 30, 50 35, 45 35 C 40 35, 37 32, 37 27
    M 37 85 C 37 90, 32 95, 27 95 C 22 95, 17 90, 17 85 C 17 80, 22 75, 27 75 C 32 75, 37 80, 37 85 Z" 
    fill="#000"/>`;
}

// Create note head with accidental
function createNote(x: number, y: number, note: string, hasAccidental: boolean, accidentalType: string): string {
  const noteHead = `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.5" fill="#000" transform="rotate(-15 ${x} ${y})"/>`;
  
  // Add stem
  const stemUp = y >= 80; // Stem direction based on position
  const stemY1 = stemUp ? y - 4.5 : y + 4.5;
  const stemY2 = stemUp ? y - 35 : y + 35;
  const stemX = stemUp ? x + 6 : x - 6;
  const stem = `<line x1="${stemX}" y1="${stemY1}" x2="${stemX}" y2="${stemY2}" stroke="#000" stroke-width="1.5"/>`;
  
  // Add accidental if needed
  const accidental = hasAccidental ? 
    `<text x="${x - 20}" y="${y + 3}" font-size="18" font-family="serif" fill="#000">${accidentalType}</text>` : '';
  
  return `<g>${accidental}${noteHead}${stem}</g>`;
}

export function generateStaffNotation(chord: ChordData): string {
  // Create staff lines
  const staffLines = Array.from({ length: 5 }, (_, i) => {
    const y = 60 + (i * 10);
    return `<line x1="70" y1="${y}" x2="320" y2="${y}" stroke="#000" stroke-width="1.2"/>`;
  }).join('');

  // Process chord notes with proper octave assignment
  const noteElements = chord.notes.map((noteStr, index) => {
    // Assign different octaves for chord voicing (bass to treble)
    const octave = index === 0 ? 3 : index === 1 ? 4 : 5;
    
    // Get base note and accidental
    const baseName = noteStr.replace(/[#b]/, '');
    const hasAccidental = noteStr.includes('#') || noteStr.includes('b');
    const accidentalType = noteStr.includes('#') ? '♯' : noteStr.includes('b') ? '♭' : '';
    
    // Get note position
    const y = getNotePosition(baseName, octave);
    const x = 140 + (index * 35); // Spread notes horizontally
    
    return createNote(x, y, noteStr, hasAccidental, accidentalType);
  }).join('');

  // Add ledger lines for notes outside staff
  const ledgerLines: string[] = [];
  chord.notes.forEach((noteStr, index) => {
    const octave = index === 0 ? 3 : index === 1 ? 4 : 5;
    const baseName = noteStr.replace(/[#b]/, '');
    const y = getNotePosition(baseName, octave);
    const x = 140 + (index * 35);
    
    // Add ledger lines for low notes
    if (y >= 110) {
      ledgerLines.push(`<line x1="${x - 12}" y1="110" x2="${x + 12}" y2="110" stroke="#000" stroke-width="1"/>`);
    }
    if (y >= 120) {
      ledgerLines.push(`<line x1="${x - 12}" y1="120" x2="${x + 12}" y2="120" stroke="#000" stroke-width="1"/>`);
    }
    
    // Add ledger lines for high notes
    if (y <= 50) {
      ledgerLines.push(`<line x1="${x - 12}" y1="50" x2="${x + 12}" y2="50" stroke="#000" stroke-width="1"/>`);
    }
    if (y <= 40) {
      ledgerLines.push(`<line x1="${x - 12}" y1="40" x2="${x + 12}" y2="40" stroke="#000" stroke-width="1"/>`);
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 140" class="w-full h-20">
      <g>
        <!-- Staff lines -->
        ${staffLines}
        
        <!-- Treble clef -->
        ${createTrebleClef()}
        
        <!-- Ledger lines -->
        ${ledgerLines.join('')}
        
        <!-- Chord notes -->
        ${noteElements}
        
        <!-- Chord name -->
        <text x="175" y="130" text-anchor="middle" font-size="14" font-family="serif" fill="#666">${chord.japaneseName}</text>
      </g>
    </svg>
  `;
}
