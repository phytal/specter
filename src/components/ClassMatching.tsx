
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Check } from "lucide-react";

interface ClassMatch {
  id: string;
  name: string;
  description: string;
  matchConfidence: number;
  memberCount: number;
}

interface ClassMatchingProps {
  possibleMatches: ClassMatch[];
  selectedClassId: string | null;
  onClassSelect: (classId: string) => void;
  onCreateNewClass: () => void;
  isProcessing: boolean;
}

const ClassMatching: React.FC<ClassMatchingProps> = ({
  possibleMatches,
  selectedClassId,
  onClassSelect,
  onCreateNewClass,
  isProcessing,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (selectedClassId && !isProcessing) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedClassId, isProcessing]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader className="h-8 w-8 text-teal-600 animate-spin" />
        <p className="text-lg font-medium">Finding similar cases...</p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Comparing case details with existing class actions without sharing your personal data
        </p>
      </div>
    );
  }

  if (possibleMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <p className="text-lg font-medium">No matching class actions found</p>
        <Button 
          onClick={onCreateNewClass} 
          className="bg-amber hover:bg-amber-600 text-white"
        >
          Create New Class Action
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {showConfetti && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}px`,
                width: `${5 + Math.random() * 10}px`,
                height: `${5 + Math.random() * 10}px`,
                backgroundColor: i % 3 === 0 ? '#FFB547' : i % 3 === 1 ? '#006868' : '#ffffff',
                borderRadius: '50%',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-6">Potential Class Action Matches</h2>

      <div className="grid grid-cols-1 gap-4">
        {possibleMatches.map((match) => (
          <Card
            key={match.id}
            className={`overflow-hidden transition-all duration-200 ${
              selectedClassId === match.id
                ? "border-teal-600 shadow-md ring-1 ring-teal-600"
                : "hover:border-gray-300"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium mr-2">{match.name}</h3>
                    <Badge variant="outline" className="bg-teal-50">
                      {match.memberCount} member{match.memberCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{match.description}</p>
                </div>
                {selectedClassId === match.id && (
                  <div className="bg-teal-100 rounded-full p-1">
                    <Check className="h-5 w-5 text-teal-700" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Match confidence</span>
                  <span className="font-medium">{Math.round(match.matchConfidence * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${match.matchConfidence * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant={selectedClassId === match.id ? "default" : "outline"}
                  className={
                    selectedClassId === match.id
                      ? "bg-teal-700 hover:bg-teal-800"
                      : "text-teal-700 border-teal-700 hover:bg-teal-50"
                  }
                  onClick={() => onClassSelect(match.id)}
                >
                  {selectedClassId === match.id ? "Selected" : "Select This Class"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-4 text-center">
              Don't see a matching class action for your case?
            </p>
            <Button 
              variant="outline" 
              onClick={onCreateNewClass}
              className="border-amber text-amber hover:bg-amber-50"
            >
              Create New Class Action
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassMatching;
