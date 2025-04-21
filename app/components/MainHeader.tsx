import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MainHeader: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/assets/images/logo.svg" 
              alt="KidsMentor Logo" 
              className="w-48 h-48 mr-5"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://via.placeholder.com/192?text=KidsMentor';
              }}
            />
            <h1 className="text-white text-3xl font-bold ml-2 hidden md:block">KidsMentor Education Portal</h1>
          </div>
          
          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap gap-2 md:gap-4">
              <li>
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/dashboard'
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-tutor"
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/ai-tutor'
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link
                  to="/story-starter"
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/story-starter'
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Story Starter
                </Link>
              </li>
              <li>
                <Link
                  to="/activity-logger"
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/activity-logger'
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Activity Logger
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default MainHeader; 