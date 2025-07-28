import { type ChordData } from "@shared/schema";

export const chordData: ChordData[] = [
  // 白鍵の9個の和音（表1参照）
  { name: "C", japaneseName: "ドミソ", color: "#ef4444", notes: ["C4", "E4", "G4"] },
  { name: "F", japaneseName: "ドファラ", color: "#eab308", notes: ["C4", "F4", "A4"] },
  { name: "G", japaneseName: "シレソ", color: "#3b82f6", notes: ["B3", "D4", "G4"] },
  { name: "Am", japaneseName: "ラドファ", color: "#1f2937", notes: ["A3", "C4", "F4"] },
  { name: "Dm", japaneseName: "レソシ", color: "#22c55e", notes: ["D4", "G4", "B4"] },
  { name: "Em", japaneseName: "ミソド", color: "#f97316", notes: ["E4", "G4", "C5"] },
  { name: "F", japaneseName: "ファラド", color: "#a855f7", notes: ["F4", "A4", "C5"] },
  { name: "Bdim", japaneseName: "ソシレ", color: "#ec4899", notes: ["G4", "B4", "D5"] },
  { name: "Am", japaneseName: "ソドミ", color: "#a3744d", notes: ["G4", "C5", "E5"] },
  
  // 黒鍵の5個の和音の基本形（表1参照）
  { name: "A", japaneseName: "ラド#ミ", color: "#84cc16", notes: ["A3", "C#4", "E4"] },
  { name: "D", japaneseName: "レファ#ラ", color: "#f4a460", notes: ["D4", "F#4", "A4"] },
  { name: "E", japaneseName: "ミソ#シ", color: "#8b5cf6", notes: ["E4", "G#4", "B4"] },
  { name: "Bb", japaneseName: "シ♭レファ", color: "#6b7280", notes: ["Bb3", "D4", "F4"] },
  { name: "Eb", japaneseName: "ミ♭ソシ♭", color: "#06b6d4", notes: ["Eb4", "G4", "Bb4"] }
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
