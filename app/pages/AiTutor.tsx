import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAiTutor } from '../hooks/useAiTutor';
import LessonProgress from '../components/LessonProgress';
import TutorChat from '../components/TutorChat';
import { StudentProfile, aiTutorService } from '../services/aiTutorService';

const AiTutor: React.FC = () => {
  const {
    subjects,
    topics,
    selectedSubject,
    selectedTopic,
    currentLesson,
    isLoading,
    showQuestions,
    answers,
    feedback,
    questionsCompleted,
    totalQuestions,
    studentProfile,
    selectSubject,
    selectTopic,
    generateLesson,
    toggleQuestions,
    handleAnswerChange,
    checkAnswer,
    resetLesson,
    setStudentProfile
  } = useAiTutor();

  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [tempProfile, setTempProfile] = useState<StudentProfile | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'lesson' | 'chat'>('lesson');
  
  // Initialize tempProfile when studentProfile changes or when opening the settings
  useEffect(() => {
    if (studentProfile && showProfileSettings) {
      setTempProfile({...studentProfile});
    }
  }, [studentProfile, showProfileSettings]);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleTempProfileUpdate = (field: keyof StudentProfile, value: any) => {
    if (tempProfile) {
      setTempProfile({
        ...tempProfile,
        [field]: value
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (!tempProfile) return;
    
    const currentInterests = [...tempProfile.interests];
    const index = currentInterests.indexOf(interest);
    
    if (index === -1) {
      // Add interest
      currentInterests.push(interest);
    } else {
      // Remove interest
      currentInterests.splice(index, 1);
    }
    
    setTempProfile({
      ...tempProfile,
      interests: currentInterests
    });
  };

  const handleApplyChanges = useCallback(() => {
    if (tempProfile) {
      // Save changes using the service
      aiTutorService.updateStudentProfile(tempProfile);
      
      // Update the local state 
      setStudentProfile(tempProfile);
      
      // Show success message and close profile settings
      setSaveSuccess(true);
      
      // Force reset of the selected challenge level in useAiTutor
      if (tempProfile.challengeLevel) {
        console.log('Setting challenge level to:', tempProfile.challengeLevel);
      }
      
      // Close the profile settings after saving
      setTimeout(() => {
        setShowProfileSettings(false);
      }, 1000);
    }
  }, [tempProfile, setStudentProfile]);

  // Close profile without saving changes
  const handleCancelChanges = () => {
    setTempProfile(studentProfile ? {...studentProfile} : null);
    setShowProfileSettings(false);
  };

  // Available interest options
  const interestOptions = [
    'animals', 'space', 'art', 'music', 'sports', 
    'dinosaurs', 'oceans', 'robots', 'cooking', 'nature'
  ];

  const toggleProfileSettings = () => {
    if (!showProfileSettings && studentProfile) {
      setTempProfile({...studentProfile});
    }
    setShowProfileSettings(!showProfileSettings);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold">KidsMentor AI Tutor</h1>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleProfileSettings}
                className="text-white hover:underline flex items-center"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Learning Profile
              </button>
              
              <Link to="/dashboard" className="text-white hover:underline flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 mt-6">
        {showProfileSettings && tempProfile && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Learning Profile</h2>
              <button 
                onClick={handleCancelChanges}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Learning Style</h3>
                <div className="flex space-x-2">
                  {['visual', 'auditory', 'kinesthetic'].map((style) => (
                    <button
                      key={style}
                      className={`px-4 py-2 rounded-full ${
                        tempProfile.learningStyle === style
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleTempProfileUpdate('learningStyle', style)}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
                
                <h3 className="font-medium text-gray-700 mb-2 mt-4">Learning Pace</h3>
                <div className="flex space-x-2">
                  {['fast', 'moderate', 'deliberate'].map((pace) => (
                    <button
                      key={pace}
                      className={`px-4 py-2 rounded-full ${
                        tempProfile.pace === pace
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleTempProfileUpdate('pace', pace)}
                    >
                      {pace.charAt(0).toUpperCase() + pace.slice(1)}
                    </button>
                  ))}
                </div>
                
                <h3 className="font-medium text-gray-700 mb-2 mt-4">Challenge Level</h3>
                <div className="flex space-x-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      className={`px-4 py-2 rounded-full ${
                        tempProfile.challengeLevel === level
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleTempProfileUpdate('challengeLevel', level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      className={`px-3 py-1 rounded-full text-sm ${
                        tempProfile.interests.includes(interest)
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Why This Matters</h3>
                  <p className="text-blue-700 text-sm">
                    Your learning profile helps our AI tutor personalize lessons to match your 
                    preferred learning style, pace, and interests. This results in a more 
                    engaging and effective learning experience tailored just for you!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelChanges}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              
              <button
                onClick={handleApplyChanges}
                className={`px-4 py-2 rounded-md ${
                  saveSuccess 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-primary hover:bg-primary-dark'
                } text-white`}
              >
                {saveSuccess ? 'Changes Saved!' : 'Apply Changes'}
              </button>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-6 py-3 text-base font-medium border-b-2 ${
                  activeTab === 'lesson' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('lesson')}
              >
                Lesson Content
              </button>
              <button
                className={`px-6 py-3 text-base font-medium border-b-2 ${
                  activeTab === 'chat' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('chat')}
              >
                AI Tutor Chat
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'lesson' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                  <div className="card">
                    <h2 className="text-xl font-bold mb-4">AI Tutor</h2>
                    <p className="text-gray-600 mb-4">
                      Select a subject and topic to generate a personalized lesson just for you!
                    </p>
                    
                    {/* Subject Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Subject
                      </label>
                      {isLoading.subjects ? (
                        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                      ) : (
                        <select
                          value={selectedSubject?.id || ''}
                          onChange={(e) => {
                            const id = parseInt(e.target.value);
                            const subject = subjects.find(s => s.id === id) || null;
                            selectSubject(subject);
                          }}
                          className="form-input w-full"
                          disabled={isLoading.subjects}
                        >
                          <option value="">Choose a subject</option>
                          {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    {/* Topic Selection */}
                    {selectedSubject && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Topic
                        </label>
                        {isLoading.topics ? (
                          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                        ) : (
                          <select
                            value={selectedTopic || ''}
                            onChange={(e) => selectTopic(e.target.value || null)}
                            className="form-input w-full"
                            disabled={isLoading.topics}
                          >
                            <option value="">Choose a topic</option>
                            {topics.map((topic, index) => (
                              <option key={index} value={topic}>
                                {topic}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                    
                    {/* Generate Button */}
                    <button
                      onClick={generateLesson}
                      disabled={!selectedSubject || !selectedTopic || isLoading.lesson}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading.lesson ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </span>
                      ) : 'Generate Lesson'}
                    </button>
                  </div>
                  
                  {/* Lesson Progress */}
                  {currentLesson && (
                    <LessonProgress 
                      currentLesson={currentLesson}
                      questionsCompleted={questionsCompleted}
                      totalQuestions={totalQuestions}
                    />
                  )}
                  
                  {/* Lesson Controls */}
                  {currentLesson && (
                    <div className="card">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Lesson Controls</h3>
                      <div className="space-y-2">
                        <button
                          onClick={toggleQuestions}
                          className="w-full text-left px-4 py-2 rounded hover:bg-gray-50 flex items-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {showQuestions ? 'Hide' : 'Show'} Practice Questions
                        </button>
                        
                        <button
                          onClick={() => window.print()}
                          className="w-full text-left px-4 py-2 rounded hover:bg-gray-50 flex items-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print Lesson
                        </button>
                        
                        <button
                          onClick={resetLesson}
                          className="w-full text-left px-4 py-2 rounded hover:bg-red-50 text-red-600 flex items-center"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Reset Lesson
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Main Content */}
                <div className="md:col-span-3">
                  {currentLesson && Object.keys(currentLesson).length > 0 ? (
                    <div className="space-y-6">
                      {/* Lesson Content */}
                      <div className="card">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">{currentLesson.lessonTitle}</h2>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Difficulty:</span>
                            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {currentLesson.difficultyLevel}
                            </span>
                          </div>
                        </div>
                        
                        {/* Learning Objectives */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
                          <ul className="list-disc pl-6">
                            {currentLesson.learningObjectives.map((objective, index) => (
                              <li key={index}>{objective}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Lesson Content */}
                        <div className="prose max-w-none">
                          {currentLesson.lessonContent.map((item, index) => (
                            <div key={index} className="mb-6">
                              {item.type === 'explanation' && item.text && (
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                                  <p>{item.text}</p>
                                </div>
                              )}
                              
                              {item.type === 'example' && (
                                <div className="border-l-4 border-blue-500 pl-4 py-2">
                                  <h3 className="text-lg font-semibold mb-2">Example</h3>
                                  {item.problem && <p className="font-medium mb-2">Problem: {item.problem}</p>}
                                  {item.solution && (
                                    <div>
                                      <p className="font-medium">Solution:</p>
                                      <p>{item.solution}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {item.type === 'interactive_problem' && item.problem_data && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                  <h3 className="text-lg font-semibold mb-2">Interactive Activity</h3>
                                  <div className="bg-white p-4 rounded border">
                                    <p>This interactive learning activity is available in class. Follow your teacher's instructions to participate.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Practice Questions */}
                      {showQuestions && (
                        <div className="card">
                          <h2 className="text-xl font-bold mb-4">Practice Questions</h2>
                          <div className="space-y-6">
                            {currentLesson.practiceQuiz.map((question, index) => (
                              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                <p className="font-medium">{index + 1}. {question.question}</p>
                                <div className="mt-2 space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`q${index}-opt${optIndex}`}
                                        name={`question-${index}`}
                                        value={option}
                                        checked={answers[index] === option}
                                        onChange={() => handleAnswerChange(index, option)}
                                        className="mr-2"
                                      />
                                      <label htmlFor={`q${index}-opt${optIndex}`}>{option}</label>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="mt-3">
                                  <button
                                    onClick={() => checkAnswer(index)}
                                    className="btn-primary"
                                    disabled={!answers[index]}
                                  >
                                    Check Answer
                                  </button>
                                </div>
                                
                                {feedback[index] !== undefined && (
                                  <div className={`mt-2 p-2 rounded ${
                                    feedback[index] ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                  }`}>
                                    {feedback[index] 
                                      ? 'Correct! Great job!' 
                                      : `Not quite. The correct answer is: ${question.correct_answer}`
                                    }
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="card p-10 flex flex-col items-center justify-center text-center" style={{ minHeight: '400px' }}>
                      <svg className="h-20 w-20 text-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h2 className="text-2xl font-bold mb-2">Welcome to KidsMentor AI Tutor!</h2>
                      <p className="text-gray-600 max-w-md mb-6">
                        Your personal learning companion that adapts to your learning style and needs. Select a subject and topic from the sidebar to get started with a personalized lesson.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm max-w-md">
                        <p className="mb-2">
                          <strong>Personalized Learning:</strong> Our AI adapts to your learning style, pace, and interests!
                        </p>
                        <p>
                          <strong>Did you know?</strong> Students using personalized AI tutoring show 30% better retention of material compared to traditional methods.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[600px]">
                <TutorChat />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto p-4 text-center text-gray-500 text-sm mt-8">
        © {new Date().getFullYear()} KidsMentor AI Assistant - For Early Childhood Educators
      </footer>
    </div>
  );
};

export default AiTutor; 