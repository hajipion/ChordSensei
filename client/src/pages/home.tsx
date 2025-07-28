import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";

import { chordData } from "@/lib/chord-data";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedChords, setSelectedChords] = useState<string[]>(["ドミソ"]);
  const [selectedRounds, setSelectedRounds] = useState(10);
  const { toast } = useToast();

  // Load saved chord selections from localStorage
  useEffect(() => {
    const savedChords = localStorage.getItem("selectedChords");
    if (savedChords) {
      const parsed = JSON.parse(savedChords);
      // Always ensure "ドミソ" is included
      if (!parsed.includes("ドミソ")) {
        parsed.push("ドミソ");
      }
      setSelectedChords(parsed);
    }
  }, []);

  // Save chord selections to localStorage
  useEffect(() => {
    localStorage.setItem("selectedChords", JSON.stringify(selectedChords));
  }, [selectedChords]);

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

    createSessionMutation.mutate({
      selectedChords,
      totalRounds: selectedRounds,
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col bg-gray-50">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">


        {/* Chord Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">和音</h2>
              <Button
                onClick={toggleAllChords}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                {selectedChords.length === chordData.length ? "すべて解除" : "すべて選択"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {chordData.map((chord) => (
                <div
                  key={chord.japaneseName}
                  className={`flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChords.includes(chord.japaneseName)
                      ? "bg-blue-50 border-blue-300"
                      : "border-gray-200"
                  }`}
                  onClick={() => toggleChordSelection(chord.japaneseName)}
                >
                  <div className="mr-2">
                    <Checkbox 
                      checked={selectedChords.includes(chord.japaneseName)}
                      onChange={() => {}}
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: chord.color }}></div>
                  <span className="font-medium text-gray-900 text-sm">{chord.japaneseName}</span>
                </div>
              ))}
            </div>
            

          </CardContent>
        </Card>

        {/* Round Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">練習回数</h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                  onClick={decrementRounds}
                  disabled={selectedRounds <= 5}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="text-xl font-bold text-gray-900 min-w-[40px] text-center">
                  {selectedRounds}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                  onClick={incrementRounds}
                  disabled={selectedRounds >= 20}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button 
          onClick={startTraining}
          disabled={createSessionMutation.isPending}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-6 px-6 rounded-xl text-xl transition-colors shadow-lg"
        >
          {createSessionMutation.isPending ? "準備中..." : "トレーニング開始"}
        </Button>
      </div>
    </div>
  );
}
