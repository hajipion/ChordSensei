import { type ChordData } from "@shared/schema";

export const chordData: ChordData[] = [
  // 白鍵の9個の和音（表1参照）
  { name: "C", japaneseName: "ドミソ", color: "chord-red", notes: ["C4", "E4", "G4"] },
  { name: "F", japaneseName: "ドファラ", color: "chord-yellow", notes: ["C4", "F4", "A4"] },
  { name: "G", japaneseName: "シレソ", color: "chord-blue", notes: ["B3", "D4", "G4"] },
  { name: "Am", japaneseName: "ラドファ", color: "chord-black", notes: ["A3", "C4", "F4"] },
  { name: "Dm", japaneseName: "レソシ", color: "chord-green", notes: ["D4", "G4", "B4"] },
  { name: "Em", japaneseName: "ミソド", color: "chord-orange", notes: ["E4", "G4", "C5"] },
  { name: "F", japaneseName: "ファラド", color: "chord-purple", notes: ["F4", "A4", "C5"] },
  { name: "Bdim", japaneseName: "ソシレ", color: "chord-pink", notes: ["G4", "B4", "D5"] },
  { name: "Am", japaneseName: "ソドミ", color: "chord-brown", notes: ["G4", "C5", "E5"] },
  
  // 黒鍵の5個の和音の基本形（表1参照）
  { name: "A", japaneseName: "ラド#ミ", color: "chord-yellow-green", notes: ["A3", "C#4", "E4"] },
  { name: "D", japaneseName: "レファ#ラ", color: "chord-skin", notes: ["D4", "F#4", "A4"] },
  { name: "E", japaneseName: "ミソ#シ", color: "chord-wisteria", notes: ["E4", "G#4", "B4"] },
  { name: "Bb", japaneseName: "シ♭レファ", color: "chord-gray", notes: ["Bb3", "D4", "F4"] },
  { name: "Eb", japaneseName: "ミ♭ソシ♭", color: "chord-light-blue", notes: ["Eb4", "G4", "Bb4"] }
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
