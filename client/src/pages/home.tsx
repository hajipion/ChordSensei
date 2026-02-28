import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Volume2, VolumeX } from "lucide-react";

import { chordData, generateBalancedChordSequence } from "@/lib/chord-data";
import { createSession } from "@/lib/session-store";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedChords, setSelectedChords] = useState<string[]>(["ドミソ"]);
  const [selectedRounds, setSelectedRounds] = useState(15);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { toast } = useToast();

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Migration map for old chord names to new chord names (reverse migration)
  const chordNameMigration: Record<string, string> = {
    "ラツィスミ": "ラド#ミ",
    "レフィスラ": "レファ#ラ",
    "ミギスシ": "ミソ#シ",
    "ベーレファ": "シ♭レファ",
    "エスソベー": "ミ♭ソシ♭",
  };

  // Load saved settings from localStorage
  useEffect(() => {
    const savedChords = localStorage.getItem("selectedChords");
    if (savedChords) {
      const parsedChords: string[] = JSON.parse(savedChords);
      // Migrate old chord names to new names
      const migratedChords = parsedChords.map(name => chordNameMigration[name] || name);
      // Filter to only include valid chord names that exist in chordData
      const validChordNames = chordData.map(c => c.japaneseName);
      const filteredChords = migratedChords.filter(name => validChordNames.includes(name));
      // If no valid chords after filtering, use default
      if (filteredChords.length > 0) {
        setSelectedChords(filteredChords);
      }
    }
    
    const savedAudio = localStorage.getItem("audioEnabled");
    if (savedAudio !== null) {
      setAudioEnabled(JSON.parse(savedAudio));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("selectedChords", JSON.stringify(selectedChords));
  }, [selectedChords]);

  useEffect(() => {
    localStorage.setItem("audioEnabled", JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  const [isStarting, setIsStarting] = useState(false);

  const toggleChordSelection = (chordName: string) => {
    setSelectedChords(prev => {
      return prev.includes(chordName)
        ? prev.filter(name => name !== chordName)
        : [...prev, chordName];
    });
  };

  const toggleAllChords = () => {
    if (selectedChords.length === chordData.length) {
      setSelectedChords([]); // Allow complete deselection
    } else {
      setSelectedChords(chordData.map(chord => chord.japaneseName));
    }
  };

  const incrementRounds = () => {
    setSelectedRounds(prev => Math.min(prev + 1, 100));
  };

  const decrementRounds = () => {
    setSelectedRounds(prev => Math.max(prev - 1, 1));
  };

  const startTraining = () => {
    if (selectedChords.length === 0) {
      toast({
        title: "選択エラー",
        description: "少なくとも1つの和音を選択してください",
        variant: "destructive",
      });
      return;
    }

    // Save audio setting to pass to practice session
    localStorage.setItem("audioEnabled", JSON.stringify(audioEnabled));

    setIsStarting(true);
    const chordSequence = generateBalancedChordSequence(selectedChords, selectedRounds);
    const session = createSession({
      selectedChords,
      chordSequence,
      totalRounds: selectedRounds,
    });
    setLocation(`/practice/${session.id}`);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col bg-white">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 home-title">絶対音感トレーニング</h1>
        </div>

        {/* Content with equal spacing */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Chord Selection */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              {chordData.map((chord) => (
                <div
                  key={chord.japaneseName}
                  className={`flex items-center p-3 cursor-pointer rounded-lg border-2 transition-colors ${
                    selectedChords.includes(chord.japaneseName)
                      ? "bg-blue-50 border-blue-500 text-blue-900"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleChordSelection(chord.japaneseName)}
                >
                  <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: chord.color }}></div>
                  <span className="text-sm">{chord.japaneseName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex gap-4 items-center my-4">
            {/* Round Selection */}
            <div className="flex-1">
              <div className="flex items-center justify-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                  onClick={decrementRounds}
                  disabled={selectedRounds <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="text-2xl font-bold text-gray-900 min-w-[40px] text-center">
                  {selectedRounds}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                  onClick={incrementRounds}
                  disabled={selectedRounds >= 100}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Audio Settings */}
            <div className="flex-1">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setAudioEnabled(true)}
                  className={`flex-1 px-2 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1 ${
                    audioEnabled 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🔊</span>
                  <span>音あり</span>
                </button>
                <button
                  onClick={() => setAudioEnabled(false)}
                  className={`flex-1 px-2 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1 ${
                    !audioEnabled 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🔇</span>
                  <span>音なし</span>
                </button>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="mb-8">
            <Button 
              onClick={startTraining}
              disabled={isStarting}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-9 px-6 rounded-lg text-xl transition-colors tracking-wider"
            >
              {isStarting ? "準備中..." : "トレーニング開始"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
