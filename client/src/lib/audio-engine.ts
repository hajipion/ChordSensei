import * as Tone from "tone";

export class AudioEngine {
  private sampler: Tone.Sampler | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Start Tone.js audio context
      await Tone.start();
      
      // Create a high-quality piano sampler using Salamander Grand Piano samples
      this.sampler = new Tone.Sampler({
        urls: {
          A0: "A0.mp3", 
          C1: "C1.mp3", 
          "D#1": "Ds1.mp3", 
          "F#1": "Fs1.mp3",
          A1: "A1.mp3", 
          C2: "C2.mp3", 
          "D#2": "Ds2.mp3", 
          "F#2": "Fs2.mp3",
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
          C6: "C6.mp3", 
          "D#6": "Ds6.mp3", 
          "F#6": "Fs6.mp3",
          A6: "A6.mp3", 
          C7: "C7.mp3", 
          "D#7": "Ds7.mp3", 
          "F#7": "Fs7.mp3"
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
      }).toDestination();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
    }
  }

  async playChord(notes: string[], duration: string = "1s") {
    if (!this.sampler || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.sampler) {
      console.error("Audio engine not initialized");
      return;
    }

    try {
      // Wait for samples to load, then play all notes of the chord simultaneously
      await Tone.loaded();
      this.sampler.triggerAttackRelease(notes, duration);
    } catch (error) {
      console.error("Failed to play chord:", error);
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