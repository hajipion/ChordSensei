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
import { X, Circle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { audioEngine } from "@/lib/audio-engine";

interface PracticeProps {
  params: { sessionId: string };
}

export default function Practice({ params }: PracticeProps) {
  const [, setLocation] = useLocation();
  const [currentChord, setCurrentChord] = useState<ChordData | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load audio setting from localStorage
  useEffect(() => {
    const savedAudio = localStorage.getItem("audioEnabled");
    if (savedAudio !== null) {
      setAudioEnabled(JSON.parse(savedAudio));
    }
  }, []);

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
    const chordHistory = Array.isArray(sessionData.chordHistory) ? sessionData.chordHistory : [];
    const nextChord = getRandomChord(availableChords, chordHistory);
    setCurrentChord(nextChord || null);
    
    // Play chord sound automatically when a new chord is generated (only if audio is enabled)
    if (nextChord && audioEnabled) {
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
      await audioEngine.playChord(chord.notes, "1s");
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-md mx-auto w-full h-screen flex flex-col">
        {/* Progress Header */}
        <div className="text-center py-4">
          <div className="text-3xl font-mono font-bold text-gray-900">
            {session.currentRound}/{session.totalRounds}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-between px-4 py-4">
          {/* Top Section */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-6">
            {/* Color Flag */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full" style={{ backgroundColor: currentChord.color }}></div>
            </div>

            {/* Chord Content */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-1">
                <span style={{ letterSpacing: '0.25em' }}>{currentChord.japaneseName.slice(0, -1)}</span>
                <span>{currentChord.japaneseName.slice(-1)}</span>
              </div>
              
              {/* Staff Notation */}
              <div>
                <StaffNotation chord={currentChord} className="h-24" />
              </div>
            </div>
          </div>

          {/* Bottom Section - Action Buttons */}
          <div className="space-y-3">
            {/* Play Button - only show if audio is enabled */}
            {audioEnabled && (
              <Button
                onClick={() => playChordSound(currentChord)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-6 px-4 rounded-lg transition-colors flex items-center justify-center min-h-[90px]"
              >
                <Play className="w-6 h-6 mr-1" />
                <span className="text-lg">リプレイ</span>
              </Button>
            )}
            
            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                onClick={() => handleAnswer(false)}
                disabled={answerMutation.isPending}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-12 px-2 rounded-lg transition-colors flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="text-8xl leading-none font-black flex items-center justify-center" style={{ height: '80px' }}>✕</div>
                <span className="text-lg" style={{ height: '28px', display: 'flex', alignItems: 'center' }}>まちがい</span>
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                disabled={answerMutation.isPending}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-12 px-2 rounded-lg transition-colors flex flex-col items-center justify-center min-h-[160px]"
              >
                <div 
                  className="border-gray-900 flex-shrink-0"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderWidth: '10px',
                    borderStyle: 'solid',
                    borderRadius: '50%',
                    minWidth: '80px',
                    minHeight: '80px'
                  }}
                ></div>
                <span className="text-lg" style={{ height: '28px', display: 'flex', alignItems: 'center' }}>せいかい</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
