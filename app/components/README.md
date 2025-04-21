# KidsMentor Education Portal & AI Tutor

## Overview

The AI Tutor component is a personalized learning tool for early childhood education. It allows students to select subjects and topics to receive custom lessons with practice questions and recommended exercises.

## Key Features

- **Subject & Topic Selection**: Students can select from various educational subjects and topics
- **Dynamic Lesson Generation**: Lessons are generated based on the selected subject and topic
- **Interactive Practice Questions**: Students can test their knowledge with interactive questions
- **Progress Tracking**: The system tracks student progress through lessons
- **Recommended Exercises**: Each lesson includes suggested follow-up activities
- **Print-Friendly Format**: Lessons can be printed for offline use

## Component Structure

The AI Tutor consists of the following components:

### Main Components

- `AiTutor.tsx` - Main page component that orchestrates the UI and user interactions
- `LessonProgress.tsx` - Displays student progress, time spent, and completion percentage

### Hooks & Services

- `useAiTutor.ts` - Custom hook that manages the tutor state and API calls
- `aiTutorService.ts` - Service that handles API calls for subjects, topics, and lesson generation

## Data Flow

1. When the page loads, the `useAiTutor` hook fetches available subjects
2. When a subject is selected, it fetches topics for that subject
3. When a topic is selected and the user clicks "Generate Lesson", it fetches a lesson
4. As the student answers questions, their progress is updated in real-time
5. The session tracks time spent and completion percentage

## Technical Implementation

- React hooks for state management
- TypeScript for type safety
- Responsive design using Tailwind CSS
- Custom hooks for business logic
- Service-based API architecture
- Mock API responses for demonstration

## Future Enhancements

- Student progress persistence across sessions
- Adaptive difficulty based on performance
- More interactive learning elements
- Additional subject matter
- Integration with classroom management system
- Quiz and test generation
- Customizable lesson plans for teachers
