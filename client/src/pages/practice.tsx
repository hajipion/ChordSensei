import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChordFlag } from "@/components/chord-flag";
import { StaffNotation } from "@/components/staff-notation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getRandomChord } from "@/lib/chord-data";
import { type Session, type ChordData } from "@shared/schema";
import { X, Check, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { audioEngine } from "@/lib/audio-engine";

interface PracticeProps {
  params: { sessionId: string };
}

export default function Practice({ params }: PracticeProps) {
  const [, setLocation] = useLocation();
  const [currentChord, setCurrentChord] = useState<ChordData | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", params.sessionId],
  });

  const answerMutation = useMutation({
    mutationFn: async (isCorrect: boolean) => {
      if (!currentChord || !session) return;
      
      const response = await apiRequest("POST", `/api/sessions/${params.sessionId}/answer`, {
        chordName: currentChord.japaneseName,
        color: currentChord.color,
        isCorrect,
        roundNumber: session.currentRound,
      });
      return response.json();
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(["/api/sessions", params.sessionId], updatedSession);
      
      if (updatedSession.currentRound > updatedSession.totalRounds) {
        // Complete session and go to results
        completeMutation.mutate();
      } else {
        // Generate next chord
        generateNextChord(updatedSession);
      }
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "回答の記録に失敗しました",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sessions/${params.sessionId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      setLocation(`/results/${params.sessionId}`);
    },
  });

  const generateNextChord = (sessionData: Session) => {
    const availableChords = Array.isArray(sessionData.selectedChords) 
      ? sessionData.selectedChords 
      : [];
    const nextChord = getRandomChord(availableChords);
    setCurrentChord(nextChord || null);
    
    // Play chord sound automatically when a new chord is generated
    if (nextChord) {
      setTimeout(async () => {
        await audioEngine.initialize(); // Initialize first to load samples
        await playChordSound(nextChord);
      }, 800); // Slightly longer delay to allow sample loading
    }
  };

  useEffect(() => {
    if (session && !currentChord) {
      generateNextChord(session);
    }
  }, [session, currentChord]);

  const playChordSound = async (chord: ChordData) => {
    try {
      await audioEngine.initialize();
      await audioEngine.playChord(chord.notes, "0.5s");
    } catch (error) {
      console.error("Failed to play chord sound:", error);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    answerMutation.mutate(isCorrect);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!session || !currentChord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">セッションが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto w-full h-full flex flex-col">
        {/* Progress Header */}
        <div className="text-center py-4">
          <div className="text-lg font-medium text-gray-600 mb-2">進行状況</div>
          <div className="text-3xl font-bold text-blue-600">
            {session.currentRound}/{session.totalRounds}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center space-y-8">
          {/* Color Flag */}
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 mb-4">この色の和音は？</div>
            <div className="flex flex-col items-center space-y-4">
              <ChordFlag color={currentChord.color} size="large" className="mx-auto" />
              <Button
                onClick={() => playChordSound(currentChord)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Volume2 className="w-4 h-4" />
                <span>音を聞く</span>
              </Button>
            </div>
          </div>

          {/* Chord Name */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {currentChord.japaneseName}
              </div>
              
              {/* Staff Notation */}
              <div className="mb-4">
                <StaffNotation chord={currentChord} className="h-20" />
              </div>
              
              <div className="text-sm text-gray-500">五線譜上での表示</div>
            </CardContent>
          </Card>

          {/* Answer Buttons */}
          <div className="w-full px-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer(false)}
                disabled={answerMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-8 px-4 rounded-2xl text-2xl transition-colors shadow-lg flex flex-col items-center h-auto"
              >
                <X className="w-8 h-8 mb-2" />
                <span className="text-base">まちがい</span>
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                disabled={answerMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-8 px-4 rounded-2xl text-2xl transition-colors shadow-lg flex flex-col items-center h-auto"
              >
                <Check className="w-8 h-8 mb-2" />
                <span className="text-base">せいかい</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
