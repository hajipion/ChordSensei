import { type ChordData } from "@shared/schema";
import Vex from "vexflow";

// Note name mapping from chord notation to VexFlow notation
const noteToVexFlow: Record<string, string> = {
  'C': 'c',
  'D': 'd', 
  'E': 'e',
  'F': 'f',
  'G': 'g',
  'A': 'a',
  'B': 'b',
  'C#': 'c#',
  'D#': 'd#',
  'F#': 'f#',
  'G#': 'g#',
  'A#': 'a#',
  'Bb': 'bb',
  'Eb': 'eb',
  'Db': 'db',
  'Gb': 'gb',
  'Ab': 'ab'
};

// Convert note name to proper VexFlow notation with octave
function convertNoteToVexFlow(noteStr: string, octave: number = 4): string {
  const baseNote = noteToVexFlow[noteStr] || noteStr.charAt(0).toLowerCase();
  return `${baseNote}/${octave}`;
}

export function generateStaffNotation(chord: ChordData): string {
  // Create a unique container ID for this chord
  const containerId = `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Render VexFlow notation asynchronously
  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      // Clear any existing content
      container.innerHTML = '';
      
      // Create VexFlow renderer
      const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
      renderer.resize(350, 120);
      const context = renderer.getContext();
      
      // Create staff with treble clef
      const stave = new Vex.Flow.Stave(10, 10, 300);
      stave.addClef("treble");
      stave.setContext(context).draw();
      
      // Convert chord notes to VexFlow notation with proper octave assignment
      const vexFlowNotes = chord.notes.map((note, index) => {
        // Assign different octaves for chord voicing (low to high)
        const octave = index === 0 ? 3 : index === 1 ? 4 : 5;
        return convertNoteToVexFlow(note, octave);
      });
      
      // Create a single chord note (all notes played simultaneously)
      const chordNote = new Vex.Flow.StaveNote({
        clef: "treble", 
        keys: vexFlowNotes, 
        duration: "w" // whole note
      });
      
      // Add accidentals if needed
      chord.notes.forEach((note, index) => {
        if (note.includes('#')) {
          chordNote.addAccidental(index, new Vex.Flow.Accidental('#'));
        } else if (note.includes('b')) {
          chordNote.addAccidental(index, new Vex.Flow.Accidental('b'));
        }
      });
      
      // Create voice and add the chord
      const voice = new Vex.Flow.Voice({num_beats: 4, beat_value: 4});
      voice.addTickables([chordNote]);
      
      // Format and draw
      const formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 280);
      voice.draw(context, stave);
      
    } catch (error) {
      console.error("VexFlow rendering error:", error);
      // Fallback to simple text display
      container.innerHTML = `<div class="text-center py-4">${chord.japaneseName}</div>`;
    }
  }, 0);

  return `<div id="${containerId}" class="w-full h-20 flex items-center justify-center bg-white"></div>`;
}
