import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useQuery } from "@tanstack/react-query";
import { type Session, type ChordResult } from "@shared/schema";
import { X, Circle, Check } from "lucide-react";

interface ResultsProps {
  params: { sessionId: string };
}

export default function Results({ params }: ResultsProps) {
  const [, setLocation] = useLocation();

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", params.sessionId],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">セッションが見つかりません</div>
      </div>
    );
  }

  const results = Array.isArray(session.results) ? session.results : [];
  const correctAnswers = results.filter((result: ChordResult) => result.isCorrect).length;
  const accuracy = Math.round((correctAnswers / session.totalRounds) * 100);

  const returnHome = () => {
    setLocation("/");
  };

  const restartTraining = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto w-full pb-24">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">結果</h1>
          <div className="text-6xl font-bold text-green-600 mb-2">
            {correctAnswers}/{session.totalRounds}
          </div>
          <div className="text-lg text-gray-600">
            正解率 <span className="font-semibold">{accuracy}</span>%
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white border border-gray-200 rounded-lg mx-4 mb-8">
          <div>
            {results.map((result: ChordResult, index) => (
              <div key={index} className={`flex items-center py-4 px-4 ${index < results.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="w-6 h-6 flex items-center justify-center mr-3">
                  {result.isCorrect ? (
                    <Circle className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="w-8 h-8 rounded-full mr-3" style={{ backgroundColor: result.color }}></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{result.chordName}</div>
                </div>
                <div className="text-sm text-gray-500">
                  第{result.roundNumber}問
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 pt-4 px-4 pb-8 bg-white border-t">
          <div className="max-w-md mx-auto">
            <Button 
              onClick={returnHome}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-6 px-6 rounded-lg text-lg transition-colors"
            >
              ホームに戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
