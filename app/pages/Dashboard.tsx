import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import StoryStarter from '../components/StoryStarter';
import ActivityLogger from '../components/ActivityLogger';
import UserLogin from '../components/UserLogin';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'story' | 'activity' | 'progress'>('story');
  const { user, isLoggedIn } = useSelector((state: RootState) => state.user);
  const { savedStories } = useSelector((state: RootState) => state.story);
  
  // Show login screen if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <UserLogin onLogin={() => {}} />
      </div>
    );
  }
  
  // Sample progress data - in a real app, this would come from an API or Redux store
  const recentProgress = [
    { subject: "Math", score: 85, trend: "up" },
    { subject: "Reading", score: 92, trend: "up" },
    { subject: "Science", score: 78, trend: "neutral" }
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-white text-2xl font-bold">KidsMentor Education AI Assistant</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <div className="text-sm opacity-80">Welcome back,</div>
                <div className="font-medium">{user?.fullName}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                {user?.profileInitials}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Info Card */}
            <div className="card">
              <div className="text-center mb-4">
                <div className="h-24 w-24 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {user?.profileInitials}
                </div>
                <h2 className="mt-2 text-xl font-bold">{user?.fullName}</h2>
                <p className="text-gray-500">{user?.grade}</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Recent Progress</h3>
                <div className="space-y-2 mt-2">
                  {recentProgress.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.subject}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{item.score}%</span>
                        <span className="ml-1">
                          {item.trend === 'up' && '↑'}
                          {item.trend === 'down' && '↓'}
                          {item.trend === 'neutral' && '→'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {savedStories.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Recent Stories</h3>
                  <div className="space-y-2 mt-2">
                    {savedStories.slice(0, 3).map((story: { id: string, title: string }) => (
                      <div key={story.id} className="text-sm truncate">
                        {story.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Menu */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Menu</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('story')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center ${
                    activeTab === 'story' ? 'bg-blue-50 text-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Story Starter
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center ${
                    activeTab === 'activity' ? 'bg-blue-50 text-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Activity Logger
                </button>
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`w-full text-left px-4 py-2 rounded flex items-center ${
                    activeTab === 'progress' ? 'bg-blue-50 text-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  My Progress
                </button>
                
                <Link 
                  to="/ai-tutor"
                  className="w-full text-left px-4 py-2 rounded flex items-center hover:bg-green-50 text-green-600"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Ask AI Tutor
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'story' && <StoryStarter />}
            {activeTab === 'activity' && <ActivityLogger />}
            {activeTab === 'progress' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">My Progress</h2>
                <p className="text-gray-600 mb-4">Track your learning journey and achievements.</p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This page is under development. Check back soon for your full progress report!
                      </p>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium mb-2">Recommended Next Steps:</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
                  <li>Complete your Math Quiz to unlock new lessons</li>
                  <li>Try the AI Tutor for personalized learning content</li>
                  <li>Practice your reading skills with the Story Starter</li>
                </ul>
                
                <Link 
                  to="/ai-tutor" 
                  className="btn-primary inline-flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Try AI Tutor
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto p-4 text-center text-gray-500 text-sm mt-8">
        © {new Date().getFullYear()} KidsMentor Education AI Assistant - For Early Childhood Educators
      </footer>
    </div>
  );
};

export default Dashboard; 