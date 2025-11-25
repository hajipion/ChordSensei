import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChordFlag } from "@/components/chord-flag";
import { StaffNotation } from "@/components/staff-notation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getChordByName } from "@/lib/chord-data";
import { type Session, type ChordData } from "@shared/schema";
import { X, Circle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { audioEngine } from "@/lib/audio-engine";

interface PracticeProps {
  params: { sessionId: string };
}

// Render chord name with furigana for accidentals
function renderChordNameWithFurigana(japaneseName: string) {
  // Map accidentals to their furigana readings
  const furiganaMap: Record<string, string> = {
    "ド#": "ツィス",
    "ファ#": "フィス",
    "ソ#": "ギス",
    "シ♭": "ベー",
    "ミ♭": "エス",
  };
  
  // Find and replace accidentals with ruby annotations
  let result: JSX.Element[] = [];
  let remaining = japaneseName;
  let key = 0;
  
  while (remaining.length > 0) {
    let found = false;
    
    // Check for each accidental pattern
    for (const [pattern, reading] of Object.entries(furiganaMap)) {
      if (remaining.startsWith(pattern)) {
        result.push(
          <ruby key={key++} style={{ rubyPosition: 'over' }}>
            {pattern}
            <rt style={{ fontSize: '0.4em', fontWeight: 'normal', transform: 'translateY(-0.3em)', display: 'inline-block' }}>{reading}</rt>
          </ruby>
        );
        remaining = remaining.slice(pattern.length);
        found = true;
        break;
      }
    }
    
    // If no accidental found, add the next character
    if (!found) {
      result.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }
  }
  
  return result;
}

export default function Practice({ params }: PracticeProps) {
  const [, setLocation] = useLocation();
  const [currentChord, setCurrentChord] = useState<ChordData | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      // Always update the session data first
      queryClient.setQueryData(["/api/sessions", params.sessionId], updatedSession);
      
      if (updatedSession && updatedSession.currentRound > updatedSession.totalRounds) {
        // Complete session and go to results
        completeMutation.mutate();
      } else if (updatedSession) {
        // Continue to next round
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
    onSuccess: (completedSession) => {
      // Ensure the latest session data is cached before navigation
      queryClient.setQueryData(["/api/sessions", params.sessionId], completedSession);
      setLocation(`/results/${params.sessionId}`);
    },
  });

  const generateNextChord = (sessionData: Session) => {
    // Use pre-generated chord sequence instead of random generation
    const chordSequence = Array.isArray(sessionData.chordSequence) ? sessionData.chordSequence : [];
    const currentIndex = sessionData.currentRound - 1; // 0-based index
    
    if (currentIndex < chordSequence.length) {
      const nextChordName = chordSequence[currentIndex];
      const nextChord = getChordByName(nextChordName);
      setCurrentChord(nextChord || null);
      
      // Play chord sound automatically when a new chord is generated (only if audio is enabled)
      if (nextChord && audioEnabled) {
        setTimeout(async () => {
          await audioEngine.initialize(); // Initialize first to load samples
          await playChordSound(nextChord);
        }, 800); // Slightly longer delay to allow sample loading
      }
    } else {
      setCurrentChord(null);
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
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full h-full flex flex-col">
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
              <div className="w-20 h-20 rounded-full practice-color-circle" style={{ backgroundColor: currentChord.color }}></div>
            </div>

            {/* Chord Content */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-1 practice-chord-name" style={{ letterSpacing: '0.15em' }}>
                {renderChordNameWithFurigana(currentChord.japaneseName)}
              </div>
              
              {/* Staff Notation */}
              <div>
                <StaffNotation chord={currentChord} className="h-24" />
              </div>
            </div>
          </div>

          {/* Bottom Section - Action Buttons */}
          <div className="space-y-3 mb-8">
            {/* Play Button - only show if audio is enabled */}
            {audioEnabled && (
              <Button
                onClick={() => playChordSound(currentChord)}
                className="w-full bg-gray-200 active:bg-gray-500 text-gray-900 font-bold py-6 px-4 rounded-lg transition-none flex items-center justify-center min-h-[90px] focus:opacity-100 disabled:opacity-100"
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
                className="group bg-gray-200 active:bg-red-500 text-gray-900 active:text-white font-bold py-12 px-2 rounded-lg transition-none flex flex-col items-center justify-center min-h-[160px] gap-2 focus:opacity-100 disabled:opacity-100"
              >
                {/* X icon made with divs */}
                <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '53px', height: '53px' }}>
                  <div 
                    className="absolute bg-gray-900 group-active:bg-white transition-none"
                    style={{ 
                      width: '53px', 
                      height: '7px',
                      transform: 'rotate(45deg)',
                      borderRadius: '3.5px'
                    }}
                  ></div>
                  <div 
                    className="absolute bg-gray-900 group-active:bg-white transition-none"
                    style={{ 
                      width: '53px', 
                      height: '7px',
                      transform: 'rotate(-45deg)',
                      borderRadius: '3.5px'
                    }}
                  ></div>
                </div>
                <span className="text-lg flex items-center justify-center" style={{ height: '28px', lineHeight: '1.1em' }}>まちがい</span>
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                disabled={answerMutation.isPending}
                className="group bg-gray-200 active:bg-green-500 text-gray-900 active:text-white font-bold py-12 px-2 rounded-lg transition-none flex flex-col items-center justify-center min-h-[160px] gap-2 focus:opacity-100 disabled:opacity-100"
              >
                {/* Circle icon made with div */}
                <div 
                  className="border-gray-900 group-active:border-white transition-none flex-shrink-0"
                  style={{ 
                    width: '53px', 
                    height: '53px', 
                    borderWidth: '7px',
                    borderStyle: 'solid',
                    borderRadius: '50%'
                  }}
                ></div>
                <span className="text-lg flex items-center justify-center" style={{ height: '28px', lineHeight: '1.1em' }}>せいかい</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
