import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Volume2, VolumeX } from "lucide-react";

import { chordData } from "@/lib/chord-data";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedChords, setSelectedChords] = useState<string[]>(["ドミソ"]);
  const [selectedRounds, setSelectedRounds] = useState(10);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { toast } = useToast();

  // Load saved settings from localStorage
  useEffect(() => {
    const savedChords = localStorage.getItem("selectedChords");
    if (savedChords) {
      const parsed = JSON.parse(savedChords);
      if (!parsed.includes("ドミソ")) {
        parsed.push("ドミソ");
      }
      setSelectedChords(parsed);
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

  const createSessionMutation = useMutation({
    mutationFn: async (data: { selectedChords: string[]; totalRounds: number }) => {
      const response = await apiRequest("POST", "/api/sessions", {
        selectedChords: data.selectedChords,
        totalRounds: data.totalRounds,
        currentRound: 1,
        results: [],
        isCompleted: false,
      });
      return response.json();
    },
    onSuccess: (session) => {
      setLocation(`/practice/${session.id}`);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "セッションの作成に失敗しました",
        variant: "destructive",
      });
    },
  });

  const toggleChordSelection = (chordName: string) => {
    setSelectedChords(prev => {
      // Prevent deselecting "ドミソ"
      if (chordName === "ドミソ" && prev.includes(chordName)) {
        return prev;
      }
      return prev.includes(chordName)
        ? prev.filter(name => name !== chordName)
        : [...prev, chordName];
    });
  };

  const toggleAllChords = () => {
    if (selectedChords.length === chordData.length) {
      setSelectedChords(["ドミソ"]); // Keep "ドミソ" always selected
    } else {
      setSelectedChords(chordData.map(chord => chord.japaneseName));
    }
  };

  const incrementRounds = () => {
    setSelectedRounds(prev => Math.min(prev + 1, 20));
  };

  const decrementRounds = () => {
    setSelectedRounds(prev => Math.max(prev - 1, 5));
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

    createSessionMutation.mutate({
      selectedChords,
      totalRounds: selectedRounds,
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col bg-white">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">

        {/* Chord Selection */}
        <div className="mb-6">
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
                <span className="font-mono text-sm">{chord.japaneseName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Row */}
        <div className="mb-8 flex gap-4">
          {/* Round Selection */}
          <div className="flex-1">
            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                onClick={decrementRounds}
                disabled={selectedRounds <= 5}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="text-2xl font-mono font-bold text-gray-900 min-w-[40px] text-center">
                {selectedRounds}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                onClick={incrementRounds}
                disabled={selectedRounds >= 20}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="flex-1">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setAudioEnabled(false)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-mono transition-colors ${
                  !audioEnabled 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                流さない
              </button>
              <button
                onClick={() => setAudioEnabled(true)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-mono transition-colors ${
                  audioEnabled 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                流す
              </button>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button 
          onClick={startTraining}
          disabled={createSessionMutation.isPending}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-mono font-bold py-9 px-6 rounded-lg text-xl transition-colors tracking-wider"
        >
          {createSessionMutation.isPending ? "準備中..." : "トレーニング開始"}
        </Button>
      </div>
    </div>
  );
}
