// User-related types
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number;
  userId: number;
  user: User;
  grade: number;
  dateOfBirth: string;
  parentContact?: string;
}

export interface Teacher {
  id: number;
  userId: number;
  user: User;
  subjects: string[];
  bio?: string;
}

export interface Admin {
  id: number;
  userId: number;
  user: User;
  department?: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Classroom and academic types
export interface Classroom {
  id: number;
  name: string;
  gradeLevel: number;
  teacherId: number;
  teacher: Teacher;
  academicYear: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export interface Attendance {
  id: number;
  studentId: number;
  student: Student;
  classroomId: number;
  classroom: Classroom;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface Grade {
  id: number;
  studentId: number;
  student: Student;
  classroomId: number;
  classroom: Classroom;
  assignmentName: string;
  score: number;
  maxScore: number;
  date: string;
  category: string;
}

// AI Tutor types
export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  type: 'multiple-choice' | 'text' | 'numeric';
  difficulty: number;
}

export interface Quiz {
  id: number;
  title: string;
  subject: string;
  topic?: string;
  questions: Question[];
  difficultyLevel: number;
  createdAt: string;
}

export interface QuizResult {
  quizId: number;
  studentId: number;
  score: number; // Percentage (0-100)
  timeSpent: number; // In seconds
  answers: Array<{
    questionId: string;
    answer: string | number;
    isCorrect: boolean;
  }>;
  accuracyPerTopic?: Record<string, number>;
}

export interface ProgressTracking extends QuizResult {
  id: number;
  timestamp: string;
  quiz: Quiz;
  student: Student;
}

export interface ExerciseItem {
  title: string;
  description: string;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  difficultyLevel: number;
  keyPoints: string[];
  practiceQuestions: Array<{
    question: string;
    answer: string;
  }>;
  recommendedExercises: ExerciseItem[];
  completed: boolean;
  completedAt?: string;
}

export interface LessonRequest {
  studentId: number;
  subject: string;
  topic?: string;
  previousQuizId?: number;
}

export interface LessonContentItem {
  type: string;
  text?: string;
  problem?: string;
  solution?: string;
  problem_data?: any;
}

export interface PracticeQuizItem {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface LessonResponse {
  lesson_id: number;
  lessonTitle: string;
  topic: string;
  learningObjectives: string[];
  difficultyLevel: string;
  lessonContent: LessonContentItem[];
  practiceQuiz: PracticeQuizItem[];
}

// Face recognition types
export interface FaceRecognitionResult {
  recognized: boolean;
  confidence: number;
  studentId?: number;
  studentName?: string;
  timestamp: string;
}

export interface AttendanceRecord {
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  timestamp: string;
}

// API Response Types

export interface UserResponse {
  id: number;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  email: string;
  avatar?: string;
}

export interface ActivityLogResponse {
  id: number;
  student_id: number;
  date: string;
  meal_notes: string;
  nap_duration: number;
  learning_activities: string;
  mood: 'happy' | 'neutral' | 'sad' | 'excited' | 'tired';
  notes: string;
  created_by: number;
  created_at: string;
}

export interface StoryPromptResponse {
  id: number;
  title: string;
  prompt: string;
  age_range: string;
  categories: string[];
  image_url?: string;
}

export interface StudentProgressResponse {
  student_id: number;
  subjects: {
    name: string;
    progress: number;
    recent_activities: {
      date: string;
      description: string;
      score?: number;
    }[];
  }[];
} 