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
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col space-y-4">

        {/* Chord Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-mono font-bold text-gray-900">和音</h2>
            <Button
              onClick={toggleAllChords}
              variant="outline"
              size="sm"
              className="text-sm bg-white border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            >
              {selectedChords.length === chordData.length ? "すべて解除" : "すべて選択"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {chordData.map((chord) => (
              <div
                key={chord.japaneseName}
                className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChords.includes(chord.japaneseName)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white border-gray-300"
                }`}
                onClick={() => toggleChordSelection(chord.japaneseName)}
              >
                <div className="mr-2">
                  <Checkbox 
                    checked={selectedChords.includes(chord.japaneseName)}
                    onChange={() => {}}
                  />
                </div>
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: chord.color }}></div>
                <span className="font-mono text-sm">{chord.japaneseName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="font-mono font-bold text-gray-900">音楽</span>
            </div>
            <Button
              onClick={() => setAudioEnabled(!audioEnabled)}
              variant="outline"
              size="sm"
              className={`text-sm border-gray-900 ${
                audioEnabled 
                  ? "bg-gray-900 text-white hover:bg-gray-800" 
                  : "bg-white text-gray-900 hover:bg-gray-900 hover:text-white"
              }`}
            >
              {audioEnabled ? "流す" : "流さない"}
            </Button>
          </div>
        </div>

        {/* Round Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-mono font-bold text-gray-900">回数</h2>
            <div className="flex items-center space-x-3">
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
        </div>

        {/* Start Button */}
        <Button 
          onClick={startTraining}
          disabled={createSessionMutation.isPending}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-mono font-bold py-6 px-6 rounded-lg text-xl transition-colors"
        >
          {createSessionMutation.isPending ? "準備中..." : "トレーニング開始"}
        </Button>
      </div>
    </div>
  );
}
