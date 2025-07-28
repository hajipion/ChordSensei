import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChordFlag } from "@/components/chord-flag";
import { useQuery } from "@tanstack/react-query";
import { type Session, type ChordResult } from "@shared/schema";
import { X, Check } from "lucide-react";

interface ResultsProps {
  params: { sessionId: string };
}

export default function Results({ params }: ResultsProps) {
  const [, setLocation] = useLocation();

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
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">練習結果</h1>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {correctAnswers}/{session.totalRounds}
          </div>
          <div className="text-lg text-gray-600">
            正解率 <span className="font-semibold">{accuracy}</span>%
          </div>
        </div>

        {/* Results Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-2">
              {results.map((result: ChordResult, index) => (
                <div key={index} className="flex items-center py-2">
                  <div className="w-6 h-6 flex items-center justify-center mr-3">
                    {result.isCorrect ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
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
          </CardContent>
        </Card>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="max-w-md mx-auto">
            <Button 
              onClick={returnHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors"
            >
              ホームに戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
