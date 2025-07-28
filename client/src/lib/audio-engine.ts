import * as Tone from "tone";

// V2.0 Audio Engine - Stable Salamander Grand Piano (0.5s clean sound)
export class AudioEngine {
  private sampler: Tone.Sampler | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Ensure user interaction occurred first
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // Optimized sampler covering chord range with correct Salamander sample names
      this.sampler = new Tone.Sampler({
        urls: {
          A2: "A2.mp3",
          C3: "C3.mp3", 
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3", 
          "F#4": "Fs4.mp3",
          A4: "A4.mp3", 
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3"
        },
        release: 0.5,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
      }).toDestination();

      // Wait a moment for the sample to be ready
      await Tone.loaded();
      this.isInitialized = true;
      console.log("Audio engine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
      this.isInitialized = false;
    }
  }

  async playChord(notes: string[], duration: string = "0.5s") {
    console.log("playChord called with notes:", notes, "duration:", duration);
    
    if (!this.sampler || !this.isInitialized) {
      console.log("Initializing audio engine...");
      await this.initialize();
    }

    if (!this.sampler) {
      console.error("Audio engine not initialized");
      return;
    }

    try {
      console.log("Waiting for samples to load...");
      await Tone.loaded();
      console.log("Samples loaded, triggering chord...");
      this.sampler.triggerAttackRelease(notes, duration);
      console.log("Chord triggered successfully");
    } catch (error) {
      console.error("Failed to play chord:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'Unknown error');
      console.error("Notes attempted:", notes);
      console.error("Sampler state:", this.sampler ? "exists" : "null");
    }
  }

  async playNote(note: string, duration: string = "8n") {
    if (!this.sampler || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.sampler) {
      console.error("Audio engine not initialized");
      return;
    }

    try {
      await Tone.loaded();
      this.sampler.triggerAttackRelease(note, duration);
    } catch (error) {
      console.error("Failed to play note:", error);
    }
  }

  dispose() {
    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = null;
    }
    this.isInitialized = false;
  }
}

// Global audio engine instance
export const audioEngine = new AudioEngine();