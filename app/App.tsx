import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainHeader from './components/MainHeader';
import Dashboard from './pages/Dashboard';
import AiTutor from './pages/AiTutor';
import StoryStarterPage from './pages/StoryStarterPage';
import ActivityLoggerPage from './pages/ActivityLoggerPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <MainHeader />
        
        <main className="container mx-auto p-4 mt-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-tutor" element={<AiTutor />} />
            <Route path="/story-starter" element={<StoryStarterPage />} />
            <Route path="/activity-logger" element={<ActivityLoggerPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        
        <footer className="container mx-auto p-4 text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} KidsMentor AI Assistant - For Early Childhood Educators
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App; 