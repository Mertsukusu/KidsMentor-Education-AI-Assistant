import { LessonResponse, LessonContentItem } from '../types/api';

// Types for AI Tutor
export interface Subject {
  id: number;
  name: string;
  topics: string[];
}

export interface StudentProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  pace: 'fast' | 'moderate' | 'deliberate';
  challengeLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  strengths: string[];
  areasForImprovement: string[];
}

// Default student profile
export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  learningStyle: 'visual',
  pace: 'moderate',
  challengeLevel: 'beginner',
  interests: ['animals', 'space', 'art'],
  strengths: ['creativity', 'enthusiasm'],
  areasForImprovement: ['focus', 'organization']
};

// Export the key for consistent usage across files
export const STUDENT_PROFILE_KEY = 'kidsmentor_student_profile';

// Backend API URL - can be configured from environment
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Function to adapt content based on student profile
const adaptLessonToStudent = (lesson: LessonResponse, profile: StudentProfile): LessonResponse => {
  const adaptedLesson = {...lesson};
  
  // Adjust difficulty level based on profile's challenge level if needed
  if (profile.challengeLevel === 'intermediate' && adaptedLesson.difficultyLevel.toLowerCase() === 'beginner') {
    adaptedLesson.difficultyLevel = 'Intermediate';
  } else if (profile.challengeLevel === 'advanced' && 
            (adaptedLesson.difficultyLevel.toLowerCase() === 'beginner' || 
             adaptedLesson.difficultyLevel.toLowerCase() === 'intermediate')) {
    adaptedLesson.difficultyLevel = 'Advanced';
  }
  
  // Create a new lesson content item for the learning style tip
  let styleTip: LessonContentItem = {
    type: "learning_style_tip",
    text: ""
  };
  
  // Adapt content based on learning style
  if (profile.learningStyle === 'visual') {
    styleTip.text = "Visual Learning Tip: Try creating a diagram or chart to visualize the key concepts in this lesson. Use different colors to highlight important information.";
  } else if (profile.learningStyle === 'auditory') {
    styleTip.text = "Auditory Learning Tip: Try reading the lesson content aloud or explaining it to someone else. Creating a song or rhyme can also help you remember key information.";
  } else if (profile.learningStyle === 'kinesthetic') {
    styleTip.text = "Hands-on Learning Tip: Try acting out the concepts or creating a physical model. Movement and touch can help reinforce your understanding.";
  }
  
  // Add the style tip to lesson content
  adaptedLesson.lessonContent = [...adaptedLesson.lessonContent, styleTip];
  
  // Add interest-based content if applicable
  if (profile.interests.length > 0) {
    const randomInterest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
    const interestItem: LessonContentItem = {
      type: "interest_connection",
      text: `Since you're interested in ${randomInterest}, try thinking about how today's lesson on ${adaptedLesson.lessonTitle} relates to that topic!`
    };
    adaptedLesson.lessonContent = [...adaptedLesson.lessonContent, interestItem];
  }
  
  // Add challenge tip based on profile
  const challengeItem: LessonContentItem = {
    type: "challenge_tip",
    text: ""
  };
  
  if (profile.challengeLevel === 'beginner') {
    challengeItem.text = "Try the basic practice questions to reinforce your understanding of the concepts.";
  } else if (profile.challengeLevel === 'intermediate') {
    challengeItem.text = "After completing the practice questions, try to create your own examples to deepen your understanding.";
  } else if (profile.challengeLevel === 'advanced') {
    challengeItem.text = "Challenge yourself by connecting these concepts to other subjects and finding real-world applications.";
  }
  
  adaptedLesson.lessonContent = [...adaptedLesson.lessonContent, challengeItem];
  
  // For advanced students, add additional quiz questions that are more challenging
  if (profile.challengeLevel === 'advanced' && adaptedLesson.practiceQuiz.length > 0) {
    // Add more challenging questions
    adaptedLesson.practiceQuiz.push({
      question: `What might be a real-world application of what you learned about ${adaptedLesson.topic}?`,
      options: [
        "Explain to a friend",
        "Create a project",
        "Write a story about it",
        "All of the above"
      ],
      correct_answer: "All of the above"
    });
    
    adaptedLesson.practiceQuiz.push({
      question: `How could you connect ${adaptedLesson.topic} to other subjects you're learning?`,
      options: [
        "Draw connections to math concepts",
        "Relate it to scientific principles",
        "Find cultural or historical connections",
        "Consider all possible connections"
      ],
      correct_answer: "Consider all possible connections"
    });
  } else if (profile.challengeLevel === 'intermediate' && adaptedLesson.practiceQuiz.length > 0) {
    // Add a moderate challenge question
    adaptedLesson.practiceQuiz.push({
      question: `Why is it important to learn about ${adaptedLesson.topic}?`,
      options: [
        "To pass tests",
        "To understand our world better",
        "To teach others",
        "All of these reasons"
      ],
      correct_answer: "All of these reasons"
    });
  }
  
  // Adjust learning objectives based on challenge level
  if (profile.challengeLevel === 'advanced' && adaptedLesson.learningObjectives.length > 0) {
    adaptedLesson.learningObjectives.push(`Apply knowledge of ${adaptedLesson.topic} to solve complex problems`);
    adaptedLesson.learningObjectives.push(`Connect ${adaptedLesson.topic} concepts to other subject areas`);
  } else if (profile.challengeLevel === 'intermediate' && adaptedLesson.learningObjectives.length > 0) {
    adaptedLesson.learningObjectives.push(`Apply basic ${adaptedLesson.topic} concepts to new situations`);
  }
  
  return adaptedLesson;
};

// Sample lessons for different topics - simplified to use the new format
const SAMPLE_LESSONS: { [key: string]: LessonResponse } = {
  // Default lesson used when not calling the API
  'default': {
    lesson_id: 999,
    lessonTitle: "Introduction to Learning",
    topic: "Learning Fundamentals",
    learningObjectives: [
      "Understand the importance of learning",
      "Explore different learning styles",
      "Develop effective study habits"
    ],
    difficultyLevel: "beginner",
    lessonContent: [
      {
        type: "explanation",
        text: "Learning is the process of acquiring new understanding, knowledge, behaviors, skills, values, attitudes, and preferences. It's a lifelong journey that helps us grow and adapt to our world."
      },
      {
        type: "example",
        problem: "Why is learning important in our daily lives?",
        solution: "Learning helps us solve problems, make better decisions, and adapt to new situations. It enables us to pursue interests, develop skills, and connect with others through shared knowledge."
      }
    ],
    practiceQuiz: [
      {
        question: "Which of these is a key benefit of lifelong learning?",
        options: ["Reduced curiosity", "Enhanced adaptability", "Fewer opportunities", "Limited growth"],
        correct_answer: "Enhanced adaptability"
      },
      {
        question: "What are the three main learning styles discussed in education?",
        options: ["Reading, writing, arithmetic", "Visual, auditory, kinesthetic", "Memory, logic, creativity", "Structure, freedom, balance"],
        correct_answer: "Visual, auditory, kinesthetic"
      }
    ]
  }
};

// API service for AI Tutor
export const aiTutorService = {
  // Get all subjects
  getSubjects: async (): Promise<Subject[]> => {
    try {
      // Call the real API endpoint for subjects
      const response = await fetch(`${API_URL}/api/subjects`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subjects:', error);
      
      // Fallback to mock data if API fails
      return [
        { id: 1, name: 'Math', topics: ['Addition', 'Subtraction', 'Shapes', 'Counting', 'Patterns', 'Measurement'] },
        { id: 2, name: 'Science', topics: ['Animals', 'Plants', 'Weather', 'Seasons', 'Space', 'Simple Machines'] },
        { id: 3, name: 'Reading', topics: ['Phonics', 'Sight Words', 'Comprehension', 'Storytelling', 'Rhyming', 'Vocabulary'] },
        { id: 4, name: 'Social Studies', topics: ['Communities', 'Maps', 'Holidays', 'Cultures', 'History', 'Geography'] },
        { id: 5, name: 'Art & Music', topics: ['Colors', 'Drawing', 'Music Basics', 'Crafts', 'Instruments', 'Famous Artists'] }
      ];
    }
  },
  
  // Get topics for a specific subject
  getTopics: async (subjectId: number): Promise<string[]> => {
    try {
      // Call the real API endpoint for topics
      const response = await fetch(`${API_URL}/api/subjects/${subjectId}/topics`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },
  
  // Generate a lesson for a specific subject and topic
  generateLesson: async (subjectName: string, topicName: string, studentProfile: StudentProfile = DEFAULT_STUDENT_PROFILE): Promise<LessonResponse> => {
    try {
      console.log('Generating lesson with profile:', JSON.stringify(studentProfile, null, 2));
      
      // Check localStorage for most recent profile
      let currentProfile = studentProfile;
      try {
        const storedProfile = localStorage.getItem(STUDENT_PROFILE_KEY);
        if (storedProfile) {
          currentProfile = JSON.parse(storedProfile);
          console.log('Using stored profile with challenge level:', currentProfile.challengeLevel);
        }
      } catch (error) {
        console.warn('Error loading profile from localStorage:', error);
      }
      
      // Call the FastAPI backend to generate a lesson
      const response = await fetch(`${API_URL}/generate-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          student_id: 1, // Default student ID
          current_topic: topicName,
          subject: subjectName,
          challenge_level: currentProfile.challengeLevel, // Pass the challenge level to backend
          learning_style: currentProfile.learningStyle, // Pass the learning style
          last_quiz_score: null, // Could be tracked in state if needed
          learning_objectives: [`Learn about ${topicName}`] 
        })
      });
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      // Parse the response
      try {
        const data = await response.json();
        console.log("AI-generated lesson received:", data);
        
        // Personalize the lesson
        return adaptLessonToStudent(data, currentProfile);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        throw new Error("Failed to parse lesson data");
      }
    } catch (error) {
      console.error("Error generating lesson:", error);
      throw error;
    }
  },
  
  // Update student profile
  updateStudentProfile: async (
    profileUpdates: Partial<StudentProfile>,
    setStateCallback?: (profile: StudentProfile) => void
  ): Promise<StudentProfile> => {
    console.log('Updating student profile with:', profileUpdates);
    
    const savedProfile = localStorage.getItem(STUDENT_PROFILE_KEY);
    const updatedProfile = {
      ...DEFAULT_STUDENT_PROFILE,
      ...(savedProfile ? JSON.parse(savedProfile) : {}),
      ...profileUpdates
    };
    
    try {
      localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(updatedProfile));
      console.log('Profile updated successfully');
      // Call the setState callback if provided
      if (setStateCallback) {
        setStateCallback(updatedProfile);
      }
    } catch (error) {
      console.warn('Error saving profile to localStorage:', error);
    }
    
    return updatedProfile;
  }
}; 