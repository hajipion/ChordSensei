import * as Tone from "tone";

// V3.0 Audio Engine - FreePats Real Yamaha C5 Grand Piano Samples
export class AudioEngine {
  private sampler: Tone.Sampler | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Start Tone.js audio context
      await Tone.start();
      
      // Create premium real grand piano sampler using University of Iowa Steinway Model B samples
      // These are actual high-quality recordings from a real Steinway & Sons Model B grand piano
      this.sampler = new Tone.Sampler({
        urls: {
          // University of Iowa Steinway Model B Piano samples (pp = pianissimo/soft touch)
          "A#0": "Piano.pp.Bb0.aiff",
          B0: "Piano.pp.B0.aiff",
          C1: "Piano.pp.C1.aiff", 
          "C#1": "Piano.pp.Db1.aiff",
          D1: "Piano.pp.D1.aiff",
          "D#1": "Piano.pp.Eb1.aiff", 
          E1: "Piano.pp.E1.aiff",
          F1: "Piano.pp.F1.aiff",
          "F#1": "Piano.pp.Gb1.aiff",
          G1: "Piano.pp.G1.aiff",
          "G#1": "Piano.pp.Ab1.aiff",
          A1: "Piano.pp.A1.aiff", 
          "A#1": "Piano.pp.Bb1.aiff",
          B1: "Piano.pp.B1.aiff",
          C2: "Piano.pp.C2.aiff", 
          "C#2": "Piano.pp.Db2.aiff",
          D2: "Piano.pp.D2.aiff",
          "D#2": "Piano.pp.Eb2.aiff", 
          E2: "Piano.pp.E2.aiff",
          F2: "Piano.pp.F2.aiff",
          "F#2": "Piano.pp.Gb2.aiff",
          G2: "Piano.pp.G2.aiff",
          "G#2": "Piano.pp.Ab2.aiff",
          A2: "Piano.pp.A2.aiff", 
          "A#2": "Piano.pp.Bb2.aiff",
          B2: "Piano.pp.B2.aiff",
          C3: "Piano.pp.C3.aiff", 
          "C#3": "Piano.pp.Db3.aiff",
          D3: "Piano.pp.D3.aiff",
          "D#3": "Piano.pp.Eb3.aiff", 
          E3: "Piano.pp.E3.aiff",
          F3: "Piano.pp.F3.aiff",
          "F#3": "Piano.pp.Gb3.aiff",
          G3: "Piano.pp.G3.aiff",
          "G#3": "Piano.pp.Ab3.aiff",
          A3: "Piano.pp.A3.aiff", 
          "A#3": "Piano.pp.Bb3.aiff",
          B3: "Piano.pp.B3.aiff",
          C4: "Piano.pp.C4.aiff", 
          "C#4": "Piano.pp.Db4.aiff",
          D4: "Piano.pp.D4.aiff",
          "D#4": "Piano.pp.Eb4.aiff", 
          E4: "Piano.pp.E4.aiff",
          F4: "Piano.pp.F4.aiff",
          "F#4": "Piano.pp.Gb4.aiff",
          G4: "Piano.pp.G4.aiff",
          "G#4": "Piano.pp.Ab4.aiff",
          A4: "Piano.pp.A4.aiff", 
          "A#4": "Piano.pp.Bb4.aiff",
          B4: "Piano.pp.B4.aiff",
          C5: "Piano.pp.C5.aiff", 
          "C#5": "Piano.pp.Db5.aiff",
          D5: "Piano.pp.D5.aiff",
          "D#5": "Piano.pp.Eb5.aiff", 
          E5: "Piano.pp.E5.aiff",
          F5: "Piano.pp.F5.aiff",
          "F#5": "Piano.pp.Gb5.aiff",
          G5: "Piano.pp.G5.aiff",
          "G#5": "Piano.pp.Ab5.aiff",
          A5: "Piano.pp.A5.aiff", 
          "A#5": "Piano.pp.Bb5.aiff",
          B5: "Piano.pp.B5.aiff",
          C6: "Piano.pp.C6.aiff", 
          "C#6": "Piano.pp.Db6.aiff",
          D6: "Piano.pp.D6.aiff",
          "D#6": "Piano.pp.Eb6.aiff", 
          E6: "Piano.pp.E6.aiff",
          F6: "Piano.pp.F6.aiff",
          "F#6": "Piano.pp.Gb6.aiff",
          G6: "Piano.pp.G6.aiff",
          "G#6": "Piano.pp.Ab6.aiff",
          A6: "Piano.pp.A6.aiff", 
          "A#6": "Piano.pp.Bb6.aiff",
          B6: "Piano.pp.B6.aiff",
          C7: "Piano.pp.C7.aiff", 
          "C#7": "Piano.pp.Db7.aiff",
          D7: "Piano.pp.D7.aiff",
          "D#7": "Piano.pp.Eb7.aiff", 
          E7: "Piano.pp.E7.aiff",
          F7: "Piano.pp.F7.aiff",
          "F#7": "Piano.pp.Gb7.aiff",
          G7: "Piano.pp.G7.aiff",
          "G#7": "Piano.pp.Ab7.aiff",
          A7: "Piano.pp.A7.aiff", 
          "A#7": "Piano.pp.Bb7.aiff",
          B7: "Piano.pp.B7.aiff",
          C8: "Piano.pp.C8.aiff"
        },
        release: 0.5, // Clean, short release as requested
        baseUrl: "https://theremin.music.uiowa.edu/sound%20files/MIS/Piano_Other/piano/"
      }).toDestination();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize FreePats Yamaha C5 audio engine:", error);
      // Fallback to previous working version
      console.log("Falling back to Salamander samples from Tone.js CDN...");
      this.sampler = new Tone.Sampler({
        urls: {
          A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
          A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
          A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
          A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
          A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
          A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
          A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3"
        },
        release: 0.5,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
      }).toDestination();
    }
  }

  async playChord(notes: string[], duration: string = "0.5s") {
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