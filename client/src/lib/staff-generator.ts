import { type ChordData } from "@shared/schema";

// Use global VexFlow from CDN
declare global {
  interface Window {
    VexFlow: any;
  }
}

// Convert note name to VexFlow notation
function convertNoteToVexFlow(noteStr: string): string {
  // Extract note, accidental, and octave from chord-data format (e.g., "C4", "C#4", "Bb3")
  const match = noteStr.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) {
    console.error("Invalid note format:", noteStr);
    return "c/4";
  }
  
  const [, note, accidental, octave] = match;
  const baseNote = note.toLowerCase();
  return `${baseNote}${accidental}/${octave}`;
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
      
      // Check if VexFlow is available
      if (!window.VexFlow) {
        throw new Error('VexFlow is not loaded');
      }

      const VF = window.VexFlow;

      // Use native VexFlow API without font loading (uses default fonts)
      const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VF;

      // Create VexFlow renderer with more height and better spacing
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(280, 120);
      const context = renderer.getContext();

      // Create staff with treble clef and more spacing
      const stave = new Stave(20, 15, 200);
      stave.addClef("treble");
      stave.setContext(context).draw();

      // Convert chord notes to VexFlow notation (use original octaves from chord data)
      const vexFlowNotes = chord.notes.map((note) => {
        return convertNoteToVexFlow(note);
      });


      
      // Create a single chord note (all notes played simultaneously)
      const chordNote = new StaveNote({
        clef: "treble",
        keys: vexFlowNotes,
        duration: "w" // whole note
      });

      // Create voice and add the chord
      const voice = new Voice({ num_beats: 4, beat_value: 4 });
      voice.addTickables([chordNote]);

      // Format and draw with better spacing between clef and notes
      const formatter = new Formatter().joinVoices([voice]).format([voice], 120);
      voice.draw(context, stave);
      
    } catch (error) {
      console.error("VexFlow rendering error:", error);
      console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
      // Fallback to simple text display
      container.innerHTML = `<div class="text-center py-4 text-sm font-medium">${chord.japaneseName}</div>`;
    }
  }, 0);

  return `<div id="${containerId}" class="w-full h-20 flex items-center justify-center"></div>`;
}
