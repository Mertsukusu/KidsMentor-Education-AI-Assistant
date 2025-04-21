import React, { useState, useEffect } from 'react';
import { LessonResponse } from '../types/api';

interface LessonProgressProps {
  currentLesson: LessonResponse;
  questionsCompleted: number;
  totalQuestions: number;
}

const LessonProgress: React.FC<LessonProgressProps> = ({ 
  currentLesson, 
  questionsCompleted, 
  totalQuestions 
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  // Update progress percentage
  useEffect(() => {
    // Calculate progress based on questions answered
    const questionProgress = totalQuestions > 0 
      ? (questionsCompleted / totalQuestions) * 100 
      : 0;
      
    setProgress(Math.round(questionProgress));
  }, [questionsCompleted, totalQuestions]);

  // Update time spent every second
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsedSeconds);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime]);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Lesson Progress</h3>
        <span className="text-sm font-medium text-gray-700">Time: {formatTime(timeSpent)}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{questionsCompleted} of {totalQuestions} questions completed</span>
        <span>{progress}% complete</span>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Current Topic: {currentLesson.lessonTitle}</h4>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Difficulty:</span>
          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            {currentLesson.difficultyLevel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonProgress; 