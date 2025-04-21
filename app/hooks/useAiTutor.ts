import { useState, useEffect, useCallback } from 'react';
import { LessonResponse, PracticeQuizItem } from '../types/api';
import { aiTutorService, StudentProfile, DEFAULT_STUDENT_PROFILE, STUDENT_PROFILE_KEY, Subject } from '../services/aiTutorService';

// Define Topic type since it isn't exported from api.ts
export type Topic = string;

export interface Badge {
  id: string;
  name: string;
  description: string;
  criteria: string;
  icon: string;
  earnedDate?: string;
}

const defaultBadges: Badge[] = [
  {
    id: 'curious-learner',
    name: 'Curious Learner',
    description: 'Completed your first AI tutoring session',
    criteria: 'Complete first session',
    icon: '🔍'
  },
  {
    id: 'math-explorer',
    name: 'Math Explorer',
    description: 'Mastered basic math concepts',
    criteria: 'Complete 3 math lessons',
    icon: '🧮'
  },
  {
    id: 'science-whiz',
    name: 'Science Whiz',
    description: 'Showed excellent understanding of scientific concepts',
    criteria: 'Score 90%+ on a science quiz',
    icon: '🔬'
  }
];

// Load initial profile from localStorage
const loadInitialProfile = (): StudentProfile => {
  try {
    const storedProfile = localStorage.getItem('studentProfile');
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
  } catch (error) {
    console.warn('Error loading student profile from localStorage:', error);
  }
  return DEFAULT_STUDENT_PROFILE;
};

// Load badges from localStorage
const loadBadges = (): Badge[] => {
  try {
    const storedBadges = localStorage.getItem('studentBadges');
    if (storedBadges) {
      return JSON.parse(storedBadges);
    }
  } catch (error) {
    console.warn('Error loading badges from localStorage:', error);
  }
  return defaultBadges;
};

interface AiTutorState {
  subjects: Subject[];
  topics: string[];
  selectedSubject: Subject | null;
  selectedTopic: string | null;
  currentLesson: LessonResponse | null;
  isLoading: {
    subjects: boolean;
    topics: boolean;
    lesson: boolean;
  };
  showQuestions: boolean;
  answers: {[key: number]: string};
  feedback: {[key: number]: boolean | undefined};
  questionsCompleted: number;
  studentProfile: StudentProfile;
  badges: Badge[];
}

export const useAiTutor = () => {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(loadInitialProfile());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>(loadBadges());

  // State management
  const [state, setState] = useState<AiTutorState>({
    subjects: [],
    topics: [],
    selectedSubject: null,
    selectedTopic: null,
    currentLesson: null,
    isLoading: {
      subjects: false,
      topics: false,
      lesson: false,
    },
    showQuestions: false,
    answers: {},
    feedback: {},
    questionsCompleted: 0,
    studentProfile: studentProfile,
    badges: badges
  });

  // Total questions in the current lesson
  const totalQuestions = state.currentLesson?.practiceQuiz.length || 0;

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Load topics when subject changes
  useEffect(() => {
    if (state.selectedSubject) {
      fetchTopics(state.selectedSubject.id);
    } else {
      setState(prev => ({ ...prev, topics: [] }));
    }
  }, [state.selectedSubject]);

  // Update questions completed count when feedback changes
  useEffect(() => {
    if (!state.currentLesson) return;
    
    const completedCount = Object.values(state.feedback).filter(Boolean).length;
    setState(prev => ({ ...prev, questionsCompleted: completedCount }));
  }, [state.feedback, state.currentLesson]);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    setState(prev => ({ 
      ...prev, 
      isLoading: { ...prev.isLoading, subjects: true } 
    }));
    
    try {
      const data = await aiTutorService.getSubjects();
      setState(prev => ({ 
        ...prev, 
        subjects: data,
        isLoading: { ...prev.isLoading, subjects: false } 
      }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: { ...prev.isLoading, subjects: false } 
      }));
    }
  };

  // Fetch topics for a subject
  const fetchTopics = async (subjectId: number) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: { ...prev.isLoading, topics: true },
      selectedTopic: null
    }));
    
    try {
      const data = await aiTutorService.getTopics(subjectId);
      setState(prev => ({ 
        ...prev, 
        topics: data,
        isLoading: { ...prev.isLoading, topics: false } 
      }));
    } catch (error) {
      console.error('Error fetching topics:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: { ...prev.isLoading, topics: false } 
      }));
    }
  };

  // Generate a lesson
  const generateLesson = async () => {
    if (!state.selectedSubject || !state.selectedTopic) return;
    
    setState(prev => ({ 
      ...prev, 
      isLoading: { ...prev.isLoading, lesson: true },
      currentLesson: null,
      showQuestions: false,
      answers: {},
      feedback: {},
      questionsCompleted: 0
    }));
    
    try {
      const data = await aiTutorService.generateLesson(
        state.selectedSubject.name,
        state.selectedTopic,
        state.studentProfile
      );
      
      setState(prev => ({ 
        ...prev, 
        currentLesson: data,
        isLoading: { ...prev.isLoading, lesson: false } 
      }));
    } catch (error) {
      console.error('Error generating lesson:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: { ...prev.isLoading, lesson: false } 
      }));
    }
  };

  // Select a subject
  const selectSubject = (subject: Subject | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedSubject: subject,
      selectedTopic: null
    }));
  };

  // Select a topic
  const selectTopic = (topic: string | null) => {
    setState(prev => ({ ...prev, selectedTopic: topic }));
  };

  // Toggle showing questions
  const toggleQuestions = () => {
    setState(prev => ({ ...prev, showQuestions: !prev.showQuestions }));
  };

  // Handle answer changes
  const handleAnswerChange = (index: number, value: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [index]: value
      },
      feedback: {
        ...prev.feedback,
        [index]: undefined
      }
    }));
  };

  // Check an answer
  const checkAnswer = (index: number) => {
    if (!state.currentLesson) return;
    
    const question = state.currentLesson.practiceQuiz[index];
    const userAnswer = state.answers[index] || '';
    
    // Check if answer is correct (simple case-insensitive check)
    const isCorrect = userAnswer.trim().toLowerCase() === question.correct_answer.toLowerCase();
    
    setState(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        [index]: isCorrect
      }
    }));
  };

  // Reset the lesson
  const resetLesson = () => {
    setState(prev => ({
      ...prev,
      currentLesson: null,
      selectedTopic: null,
      showQuestions: false,
      answers: {},
      feedback: {},
      questionsCompleted: 0
    }));
  };

  const updateProfile = useCallback(
    async (profileUpdates: Partial<StudentProfile>) => {
      setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, subjects: true } }));
      try {
        const updatedProfile = await aiTutorService.updateStudentProfile(
          profileUpdates,
          setStudentProfile
        );
        return updatedProfile;
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('Failed to update profile');
        throw error;
      } finally {
        setState(prev => ({ ...prev, isLoading: { ...prev.isLoading, subjects: false } }));
      }
    },
    [setStudentProfile]
  );

  // Function to get student badges
  const getStudentBadges = useCallback(() => {
    return badges;
  }, [badges]);
  
  // Function to award a new badge
  const awardBadge = useCallback((badgeId: string) => {
    setBadges(prevBadges => {
      const updatedBadges = prevBadges.map(badge => {
        if (badge.id === badgeId && !badge.earnedDate) {
          return { ...badge, earnedDate: new Date().toISOString() };
        }
        return badge;
      });
      
      try {
        localStorage.setItem('studentBadges', JSON.stringify(updatedBadges));
      } catch (error) {
        console.warn('Error saving badges to localStorage:', error);
      }
      
      return updatedBadges;
    });
  }, []);

  return {
    ...state,
    totalQuestions,
    selectSubject,
    selectTopic,
    generateLesson,
    toggleQuestions,
    handleAnswerChange,
    checkAnswer,
    resetLesson,
    updateProfile,
    getStudentBadges,
    awardBadge,
    setStudentProfile
  };
}; 