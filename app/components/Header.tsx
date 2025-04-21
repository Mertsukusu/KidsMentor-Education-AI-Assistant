import React from 'react';

interface HeaderProps {
  activeTab: 'story' | 'activity';
  setActiveTab: (tab: 'story' | 'activity') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/images/logo.svg"
              alt="KidsMentor Logo"
              className="h-16 w-auto"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://via.placeholder.com/64?text=KidsMentor';
              }}
            />
            <h1 className="text-white text-2xl font-bold">KidsMentor - Education AI Assistant</h1>
          </div>
          
          <nav>
            <ul className="flex space-x-4">
              <li>
                <button
                  onClick={() => setActiveTab('story')}
                  className={`px-4 py-2 rounded-t-lg ${
                    activeTab === 'story'
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-primary-dark'
                  }`}
                >
                  Story Starter
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-2 rounded-t-lg ${
                    activeTab === 'activity'
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-primary-dark'
                  }`}
                >
                  Activity Logger
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 