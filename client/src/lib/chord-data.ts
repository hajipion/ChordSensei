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
  { name: "A", japaneseName: "ラツィスミ", color: "#84cc16", notes: ["A3", "C#4", "E4"] },
  { name: "D", japaneseName: "レフィスラ", color: "#f4a460", notes: ["D4", "F#4", "A4"] },
  { name: "E", japaneseName: "ミギスシ", color: "#DDA0DD", notes: ["E4", "G#4", "B4"] },
  { name: "Bb", japaneseName: "ベーレファ", color: "#6b7280", notes: ["Bb3", "D4", "F4"] },
  { name: "Eb", japaneseName: "エスソベー", color: "#06b6d4", notes: ["Eb4", "G4", "Bb4"] }
];

export function getChordByName(japaneseName: string): ChordData | undefined {
  return chordData.find(chord => chord.japaneseName === japaneseName);
}

// Generate a balanced chord sequence that ensures even distribution
export function generateBalancedChordSequence(availableChords: string[], totalRounds: number): string[] {
  if (availableChords.length === 0) return [];
  
  const sequence: string[] = [];
  
  // If we have fewer rounds than chords, just return a shuffled subset
  if (totalRounds <= availableChords.length) {
    const shuffled = [...availableChords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalRounds);
  }
  
  // Calculate how many times each chord should appear (at least once)
  const baseCount = Math.floor(totalRounds / availableChords.length);
  const remainder = totalRounds % availableChords.length;
  
  // Create distribution array
  const distribution: { chord: string; count: number }[] = availableChords.map((chord, index) => ({
    chord,
    count: baseCount + (index < remainder ? 1 : 0)
  }));
  
  // Build the sequence ensuring even distribution
  for (const { chord, count } of distribution) {
    for (let i = 0; i < count; i++) {
      sequence.push(chord);
    }
  }
  
  // Shuffle the sequence to randomize order
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  
  // Enhanced post-processing to prevent consecutive duplicate chords
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i-1]) {
      // Find a different chord to swap with that won't create new consecutive duplicates
      let swapped = false;
      for (let j = i + 1; j < sequence.length; j++) {
        const candidate = sequence[j];
        if (candidate !== sequence[i] && 
            candidate !== sequence[i-1] && 
            (j === sequence.length - 1 || candidate !== sequence[j+1]) &&
            (i === sequence.length - 1 || candidate !== sequence[i+1])) {
          [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
          swapped = true;
          break;
        }
      }
      
      // If we couldn't find a good swap candidate, try swapping backwards
      if (!swapped) {
        for (let j = 0; j < i - 1; j++) {
          const candidate = sequence[j];
          if (candidate !== sequence[i] && 
              candidate !== sequence[i-1] &&
              (j === 0 || candidate !== sequence[j-1]) &&
              candidate !== sequence[j+1]) {
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
            break;
          }
        }
      }
    }
  }
  
  return sequence;
}

export function getRandomChord(availableChords: string[], previousChords: string[] = []): ChordData | undefined {
  const filteredChords = chordData.filter(chord => 
    availableChords.includes(chord.japaneseName)
  );
  
  if (filteredChords.length === 0) return undefined;
  
  // 最後の2つの音が同じ場合、3回連続を防ぐ
  const lastTwo = previousChords.slice(-2);
  if (lastTwo.length === 2 && lastTwo[0] === lastTwo[1]) {
    const excludeSame = filteredChords.filter(chord => chord.japaneseName !== lastTwo[1]);
    if (excludeSame.length > 0) {
      const randomIndex = Math.floor(Math.random() * excludeSame.length);
      return excludeSame[randomIndex];
    }
  }
  
  // 直前の音と同じものを選ぶ確率を下げる（30%の確率で除外）
  const lastChord = previousChords[previousChords.length - 1];
  if (lastChord && Math.random() < 0.7) {
    const excludeLast = filteredChords.filter(chord => chord.japaneseName !== lastChord);
    if (excludeLast.length > 0) {
      const randomIndex = Math.floor(Math.random() * excludeLast.length);
      return excludeLast[randomIndex];
    }
  }
  
  // 通常のランダム選択
  const randomIndex = Math.floor(Math.random() * filteredChords.length);
  return filteredChords[randomIndex];
}
