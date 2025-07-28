import * as Tone from "tone";

export class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Start Tone.js audio context
      await Tone.start();
      
      // Create a more realistic piano synthesizer
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "fatsawtooth",
          count: 3,
          spread: 30,
        },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.4,
          release: 2.0,
        },
      });

      // Create effect chain for more realistic piano sound
      const chorus = new Tone.Chorus({
        frequency: 4,
        delayTime: 2.5,
        depth: 0.5,
        wet: 0.2,
      }).start();

      const reverb = new Tone.Reverb({
        decay: 2.0,
        wet: 0.4,
        preDelay: 0.01,
      });

      const compressor = new Tone.Compressor({
        threshold: -20,
        ratio: 8,
        attack: 0.01,
        release: 0.1,
      });

      const eq = new Tone.EQ3({
        low: -2,
        mid: 3,
        high: 1,
        lowFrequency: 300,
        highFrequency: 3000,
      });

      // Chain effects: synth -> chorus -> eq -> compressor -> reverb -> destination
      this.synth.chain(chorus, eq, compressor, reverb, Tone.Destination);

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
    }
  }

  async playChord(notes: string[], duration: string = "2n") {
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