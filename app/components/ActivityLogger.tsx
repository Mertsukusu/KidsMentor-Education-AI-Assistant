import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../store';
import { 
  addEntry, 
  setEntries,
  deleteEntry,
  ActivityEntry,
  MoodType,
  MealType
} from '../store/slices/activitySlice';
import { loadEntries, saveEntries } from '../services/storage';

const ActivityLogger: React.FC = () => {
  const dispatch = useDispatch();
  const { entries } = useSelector((state: RootState) => state.activity);
  
  // Load saved data on component mount
  useEffect(() => {
    const savedEntries = loadEntries();
    
    if (savedEntries.length > 0) {
      dispatch(setEntries(savedEntries));
    }
  }, [dispatch]);
  
  // Save entries to localStorage when they change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);
  
  // Current date state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'meal' | 'nap' | 'learning' | 'mood'>('meal');
  
  // Meal form state
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealDescription, setMealDescription] = useState('');
  
  // Nap form state
  const [napStart, setNapStart] = useState('');
  const [napEnd, setNapEnd] = useState('');
  
  // Learning form state
  const [learningFocus, setLearningFocus] = useState('');
  const [learningNotes, setLearningNotes] = useState('');
  
  // Mood form state
  const [mood, setMood] = useState<MoodType>('happy');
  const [moodNotes, setMoodNotes] = useState('');
  
  // Handle deleting an entry
  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      dispatch(deleteEntry(id));
    }
  };
  
  const handleSubmitMeal = () => {
    if (mealType) {
      const newEntry: ActivityEntry = {
        id: uuidv4(),
        date: selectedDate,
        childName: '',
        type: 'meal',
        mealType,
        mealDescription,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(addEntry(newEntry));
      setMealDescription('');
    }
  };
  
  const handleSubmitNap = () => {
    if (napStart && napEnd) {
      const newEntry: ActivityEntry = {
        id: uuidv4(),
        date: selectedDate,
        childName: '',
        type: 'nap',
        napStart,
        napEnd,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(addEntry(newEntry));
      setNapStart('');
      setNapEnd('');
    }
  };
  
  const handleSubmitLearning = () => {
    if (learningFocus) {
      const newEntry: ActivityEntry = {
        id: uuidv4(),
        date: selectedDate,
        childName: '',
        type: 'learning',
        learningFocus,
        learningNotes,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(addEntry(newEntry));
      setLearningFocus('');
      setLearningNotes('');
    }
  };
  
  const handleSubmitMood = () => {
    if (mood) {
      const newEntry: ActivityEntry = {
        id: uuidv4(),
        date: selectedDate,
        childName: '',
        type: 'mood',
        mood,
        moodNotes,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(addEntry(newEntry));
      setMoodNotes('');
    }
  };
  
  const getMoodEmoji = (moodType: MoodType) => {
    switch (moodType) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'tired': return '😴';
      case 'excited': return '😃';
      case 'frustrated': return '😣';
      case 'calm': return '😌';
      default: return '';
    }
  };
  
  // Get entries for the selected date
  const entriesForSelectedDate = entries.filter((entry: ActivityEntry) => 
    entry.date === selectedDate
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Daily Activity Logger</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input pl-10 py-2.5 w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              className={`p-2 rounded text-center ${
                activeTab === 'meal' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('meal')}
            >
              Meals
            </button>
            <button
              className={`p-2 rounded text-center ${
                activeTab === 'nap' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('nap')}
            >
              Naps
            </button>
            <button
              className={`p-2 rounded text-center ${
                activeTab === 'learning' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('learning')}
            >
              Learning
            </button>
            <button
              className={`p-2 rounded text-center ${
                activeTab === 'mood' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('mood')}
            >
              Mood
            </button>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2">
        <div className="card">
          <>
            <h2 className="text-xl font-bold mb-4">
              {activeTab === 'meal' && 'Meal Tracking'}
              {activeTab === 'nap' && 'Nap Tracking'}
              {activeTab === 'learning' && 'Learning Activities'}
              {activeTab === 'mood' && 'Mood Tracking'}
              {' for '}{new Date(selectedDate).toLocaleDateString()}
            </h2>
            
            {activeTab === 'meal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="form-input"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Snack</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    className="form-input h-32"
                    placeholder="What did the child eat? Any allergies or preferences noted?"
                  />
                </div>
                
                <button
                  className="btn-primary"
                  onClick={handleSubmitMeal}
                >
                  Log Meal
                </button>
              </div>
            )}
            
            {activeTab === 'nap' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nap Start Time
                  </label>
                  <input
                    type="time"
                    value={napStart}
                    onChange={(e) => setNapStart(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nap End Time
                  </label>
                  <input
                    type="time"
                    value={napEnd}
                    onChange={(e) => setNapEnd(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <button
                  className="btn-primary"
                  onClick={handleSubmitNap}
                >
                  Log Nap
                </button>
              </div>
            )}
            
            {activeTab === 'learning' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Focus
                  </label>
                  <input
                    type="text"
                    value={learningFocus}
                    onChange={(e) => setLearningFocus(e.target.value)}
                    className="form-input"
                    placeholder="E.g., Numbers, Colors, Shapes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={learningNotes}
                    onChange={(e) => setLearningNotes(e.target.value)}
                    className="form-input h-32"
                    placeholder="Describe the activity and how the child engaged with it."
                  />
                </div>
                
                <button
                  className="btn-primary"
                  onClick={handleSubmitLearning}
                >
                  Log Learning Activity
                </button>
              </div>
            )}
            
            {activeTab === 'mood' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mood
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['happy', 'sad', 'tired', 'excited', 'frustrated', 'calm'] as MoodType[]).map((moodType) => (
                      <button
                        key={moodType}
                        type="button"
                        className={`p-3 border rounded text-center ${
                          mood === moodType ? 'border-primary bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setMood(moodType)}
                      >
                        <span className="text-2xl">{getMoodEmoji(moodType)}</span>
                        <span className="block mt-1 capitalize">{moodType}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    className="form-input h-32"
                    placeholder="Any observations about the child's mood or behavior?"
                  />
                </div>
                
                <button
                  className="btn-primary"
                  onClick={handleSubmitMood}
                >
                  Log Mood
                </button>
              </div>
            )}
          </>
        </div>
        
        <div className="card mt-6">
          <h2 className="text-xl font-bold mb-4">Activities for {new Date(selectedDate).toLocaleDateString()}</h2>
          
          {entriesForSelectedDate.length === 0 ? (
            <p className="text-gray-600">No activities logged for this date.</p>
          ) : (
            <div className="space-y-3">
              {entriesForSelectedDate
                .sort((a: ActivityEntry, b: ActivityEntry) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry: ActivityEntry) => (
                  <div key={entry.id} className="p-3 border rounded">
                    <div className="flex justify-between">
                      <span className="font-semibold capitalize">{entry.type}</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-3">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          title="Delete activity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {entry.type === 'meal' && (
                      <div className="mt-1">
                        <span className="text-gray-700 capitalize">{entry.mealType}</span>
                        {entry.mealDescription && (
                          <p className="text-sm text-gray-600 mt-1">{entry.mealDescription}</p>
                        )}
                      </div>
                    )}
                    
                    {entry.type === 'nap' && (
                      <div className="mt-1">
                        <span className="text-gray-700">
                          {entry.napStart} - {entry.napEnd}
                        </span>
                      </div>
                    )}
                    
                    {entry.type === 'learning' && (
                      <div className="mt-1">
                        <span className="text-gray-700">{entry.learningFocus}</span>
                        {entry.learningNotes && (
                          <p className="text-sm text-gray-600 mt-1">{entry.learningNotes}</p>
                        )}
                      </div>
                    )}
                    
                    {entry.type === 'mood' && (
                      <div className="mt-1">
                        <span className="text-gray-700">
                          {entry.mood && (
                            <>
                              <span className="mr-2">{getMoodEmoji(entry.mood)}</span>
                              <span className="capitalize">{entry.mood}</span>
                            </>
                          )}
                        </span>
                        {entry.moodNotes && (
                          <p className="text-sm text-gray-600 mt-1">{entry.moodNotes}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogger; 