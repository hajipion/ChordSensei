import { type ChordData } from "@shared/schema";

// Use global VexFlow from CDN
declare global {
  interface Window {
    VexFlow: any;
  }
}

// Convert note name to VexFlow notation
function convertNoteToVexFlow(noteStr: string, octave: number): string {
  // VexFlow uses lowercase note names with accidentals
  const baseNote = noteStr.replace(/[#b]/, '').toLowerCase();
  const accidental = noteStr.includes('#') ? '#' : noteStr.includes('b') ? 'b' : '';
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

      // Ensure fonts are loaded before creating notation
      VF.loadFonts('Bravura', 'Academico').then(() => {
        VF.setFonts('Bravura', 'Academico');
        
        const { Factory } = VF;

        // Create VexFlow factory with proper renderer configuration
        const factory = new Factory({
          renderer: { 
            elementId: containerId, 
            width: 350, 
            height: 120 
          }
        });

        // Get EasyScore for simplified notation
        const score = factory.EasyScore();
        const system = factory.System();

        // Convert chord notes to VexFlow notation with proper octave assignment
        const vexFlowNotes = chord.notes.map((note, index) => {
          // Assign different octaves for chord voicing (low to high)
          const octave = index === 0 ? 3 : index === 1 ? 4 : 5;
          return convertNoteToVexFlow(note, octave);
        });

        // Create chord notation string for EasyScore
        // Format individual notes with quarter note duration, then combine in a voice
        const noteString = vexFlowNotes.map(note => `${note}/q`).join(', ');
        
        // Add stave with treble clef and the chord notes
        system
          .addStave({
            voices: [score.voice(score.notes(noteString))]
          })
          .addClef('treble');

        // Draw the notation
        factory.draw();
      }).catch((fontError: any) => {
        console.error("Font loading error:", fontError);
        // Fallback without fonts
        const { Factory } = VF;
        const factory = new Factory({
          renderer: { 
            elementId: containerId, 
            width: 350, 
            height: 120 
          }
        });
        factory.draw();
      });
      
    } catch (error) {
      console.error("VexFlow rendering error:", error);
      console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
      // Fallback to simple text display
      container.innerHTML = `<div class="text-center py-4 text-sm font-medium">${chord.japaneseName}</div>`;
    }
  }, 0);

  return `<div id="${containerId}" class="w-full h-20 flex items-center justify-center bg-white border border-gray-200 rounded"></div>`;
}
