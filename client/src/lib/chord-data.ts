import { type ChordData } from "@shared/schema";

export const chordData: ChordData[] = [
  // White key chords (9 types)
  { name: "C", japaneseName: "ドミソ", color: "chord-red", notes: ["C", "E", "G"] },
  { name: "F", japaneseName: "ドファラ", color: "chord-yellow", notes: ["C", "F", "A"] },
  { name: "G", japaneseName: "シレソ", color: "chord-blue", notes: ["B", "D", "G"] },
  { name: "Am", japaneseName: "ラドファ", color: "chord-black", notes: ["A", "C", "F"] },
  { name: "Dm", japaneseName: "レソシ", color: "chord-green", notes: ["D", "G", "B"] },
  { name: "Em", japaneseName: "ミソド", color: "chord-orange", notes: ["E", "G", "C"] },
  { name: "G", japaneseName: "ファラド", color: "chord-purple", notes: ["F", "A", "C"] },
  { name: "Bdim", japaneseName: "ソシレ", color: "chord-pink", notes: ["G", "B", "D"] },
  
  // Black key chords (5 basic forms)
  { name: "A", japaneseName: "ラド#ミ", color: "chord-yellow-green", notes: ["A", "C#", "E"] },
  { name: "D", japaneseName: "レファ#ラ", color: "chord-skin", notes: ["D", "F#", "A"] },
  { name: "E", japaneseName: "ミソ#シ", color: "chord-wisteria", notes: ["E", "G#", "B"] },
  { name: "Bb", japaneseName: "シ♭レファ", color: "chord-gray", notes: ["Bb", "D", "F"] },
  { name: "Eb", japaneseName: "ミ♭ソシ♭", color: "chord-light-blue", notes: ["Eb", "G", "Bb"] },
  
  // Additional entries to make 14 total
  { name: "Gm", japaneseName: "ソドミ", color: "chord-brown", notes: ["G", "C", "E"] }
];

export function getChordByName(japaneseName: string): ChordData | undefined {
  return chordData.find(chord => chord.japaneseName === japaneseName);
}

export function getRandomChord(availableChords: string[]): ChordData | undefined {
  const filteredChords = chordData.filter(chord => 
    availableChords.includes(chord.japaneseName)
  );
  
  if (filteredChords.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * filteredChords.length);
  return filteredChords[randomIndex];
}
