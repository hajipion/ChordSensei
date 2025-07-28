import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import { ChordFlag } from "@/components/chord-flag";
import { chordData } from "@/lib/chord-data";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [selectedRounds, setSelectedRounds] = useState(10);
  const { toast } = useToast();

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
    setSelectedChords(prev =>
      prev.includes(chordName)
        ? prev.filter(name => name !== chordName)
        : [...prev, chordName]
    );
  };

  const selectAllChords = () => {
    setSelectedChords(chordData.map(chord => chord.japaneseName));
  };

  const clearSelection = () => {
    setSelectedChords([]);
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
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">絶対音感トレーニング</h1>
          <p className="text-gray-600">和音と色の関連づけ練習</p>
        </div>

        {/* Chord Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">練習する和音を選択</h2>
            <div className="space-y-3">
              {chordData.map((chord) => (
                <div
                  key={chord.japaneseName}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChords.includes(chord.japaneseName)
                      ? "bg-blue-50 border-blue-300"
                      : "border-gray-200"
                  }`}
                  onClick={() => toggleChordSelection(chord.japaneseName)}
                >
                  <ChordFlag color={chord.color} className="mr-3" />
                  <span className="font-medium text-gray-900">{chord.japaneseName}</span>
                  <div className="ml-auto">
                    <Checkbox 
                      checked={selectedChords.includes(chord.japaneseName)}
                      onChange={() => {}}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="link" onClick={selectAllChords} className="text-blue-600">
                すべて選択
              </Button>
              <span className="text-gray-400 mx-2">|</span>
              <Button variant="link" onClick={clearSelection} className="text-gray-600">
                選択解除
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Round Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">練習回数</h2>
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={decrementRounds}
                disabled={selectedRounds <= 5}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="text-3xl font-bold text-gray-900 min-w-[60px] text-center">
                {selectedRounds}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={incrementRounds}
                disabled={selectedRounds >= 20}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">5〜20回まで設定可能</div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button 
          onClick={startTraining}
          disabled={createSessionMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-lg"
        >
          {createSessionMutation.isPending ? "準備中..." : "トレーニング開始"}
        </Button>
      </div>
    </div>
  );
}
