import * as Tone from "tone";

export class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Start Tone.js audio context
      await Tone.start();
      
      // Create a simple, clean piano synthesizer
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.1,
          release: 0.8,
        },
      }).toDestination();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
    }
  }

  async playChord(notes: string[], duration: string = "1s") {
    if (!this.synth || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.synth) {
      console.error("Audio engine not initialized");
      return;
    }

    try {
      // Play all notes of the chord simultaneously
      this.synth.triggerAttackRelease(notes, duration);
    } catch (error) {
      console.error("Failed to play chord:", error);
    }
  }

  async playNote(note: string, duration: string = "8n") {
    if (!this.synth || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.synth) {
      console.error("Audio engine not initialized");
      return;
    }

    try {
      this.synth.triggerAttackRelease(note, duration);
    } catch (error) {
      console.error("Failed to play note:", error);
    }
  }

  dispose() {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.isInitialized = false;
  }
}

// Global audio engine instance
export const audioEngine = new AudioEngine();