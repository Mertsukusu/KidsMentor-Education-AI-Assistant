import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';

interface UserLoginProps {
  onLogin: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !fullName.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Create profile initials from full name
    const profileInitials = fullName
      .split(' ')
      .map(n => n[0])
      .join('');
    
    // Dispatch user data to store
    dispatch(setUser({
      username,
      fullName,
      grade: grade || 'Not specified',
      profileInitials
    }));
    
    // Call the onLogin callback
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="card max-w-md w-full mx-auto p-8 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-xs mb-6">
            <img 
              src="/assets/images/logo.svg"
              alt="KidsMentor Logo"
              className="w-full h-auto max-w-xs mx-auto"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://via.placeholder.com/300?text=KidsMentor';
              }}
            />
          </div>
          <h2 className="text-3xl font-bold text-center text-primary">Welcome to KidsMentor</h2>
          <p className="text-gray-600 mt-2 text-center">Early Childhood Education Portal</p>
        </div>
      
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
              <p>{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="grade">
              Grade Level
            </label>
            <select
              id="grade"
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="">Select grade level</option>
              <option value="Preschool">Preschool</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="1st Grade">1st Grade</option>
              <option value="2nd Grade">2nd Grade</option>
              <option value="3rd Grade">3rd Grade</option>
              <option value="4th Grade">4th Grade</option>
              <option value="5th Grade">5th Grade</option>
            </select>
          </div>
          
          <button type="submit" className="btn-primary w-full py-2 rounded-md text-white font-medium">
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin; 