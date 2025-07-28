import { type ChordData } from "@shared/schema";
import abcjs from "abcjs";

// Note name mapping from chord notation to ABC notation
const noteToABC: Record<string, string> = {
  'C': 'C',
  'D': 'D', 
  'E': 'E',
  'F': 'F',
  'G': 'G',
  'A': 'A',
  'B': 'B',
  'C#': '^C',
  'D#': '^D',
  'F#': '^F',
  'G#': '^G',
  'A#': '^A',
  'Bb': '_B',
  'Eb': '_E',
  'Db': '_D',
  'Gb': '_G',
  'Ab': '_A'
};

// Convert note name to proper ABC notation with octave
function convertNoteToABC(noteStr: string, octave: number = 4): string {
  const baseNote = noteToABC[noteStr] || noteStr.charAt(0);
  
  // ABC octave notation: lowercase = octave 4, uppercase = octave 5, etc.
  if (octave <= 3) {
    return baseNote.toUpperCase() + ','.repeat(4 - octave);
  } else if (octave === 4) {
    return baseNote.toUpperCase();
  } else if (octave === 5) {
    return baseNote.toLowerCase();
  } else {
    return baseNote.toLowerCase() + "'".repeat(octave - 5);
  }
}

export function generateStaffNotation(chord: ChordData): string {
  // Create a unique container ID for this chord
  const containerId = `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Convert chord notes to ABC notation with proper octave assignment
  const abcNotes = chord.notes.map((note, index) => {
    // Assign different octaves for chord voicing (low to high)
    const octave = index === 0 ? 3 : index === 1 ? 4 : 5;
    return convertNoteToABC(note, octave);
  });

  // Create ABC notation for a chord (notes in brackets played simultaneously)
  const abcNotation = `
X:1
T:${chord.japaneseName}
K:C
L:1/4
[${abcNotes.join('')}]
`;

  // Create container div for abcjs to render into
  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (container) {
      // Clear any existing content
      container.innerHTML = '';
      
      // Render using abcjs with optimized settings for chord display
      abcjs.renderAbc(containerId, abcNotation, {
        responsive: "resize",
        scale: 1.2,
        staffwidth: 300,
        add_classes: true,
        clickListener: undefined,
        format: {
          titlefont: "serif 12",
          gchordfont: "serif 10",
          vocalfont: "serif 10"
        }
      });
    }
  }, 0);

  return `<div id="${containerId}" class="w-full h-20 flex items-center justify-center"></div>`;
}
