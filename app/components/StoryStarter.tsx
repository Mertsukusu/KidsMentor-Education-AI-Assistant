import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../store';
import { 
  setSelectedPrompt, 
  setUserStory, 
  addPrompt, 
  StoryPrompt,
  setAiGeneratedStory,
  setGenerating,
  saveStory
} from '../store/slices/storySlice';
import { storyService } from '../services/storyService';

const defaultPrompts: StoryPrompt[] = [
  {
    id: '1',
    title: 'The Magic Garden',
    prompt: 'Once upon a time, there was a magical garden where the plants could talk...',
    category: 'Fantasy',
    ageGroup: '3-5',
  },
  {
    id: '2',
    title: 'Space Adventure',
    prompt: 'The spaceship landed on a planet where everything was made of candy...',
    category: 'Adventure',
    ageGroup: '4-6',
  },
  {
    id: '3',
    title: 'The Friendly Monster',
    prompt: 'Under the bed lived a monster who just wanted to make friends...',
    category: 'Friendship',
    ageGroup: '3-4',
  },
];

const categories = [
  'Fantasy', 'Adventure', 'Friendship', 'Animals', 'Space', 'Nature', 'Fairytale', 'Mystery'
];

const ageGroups = [
  '3-4', '4-5', '5-6', '6-7', '7-8'
];

const StoryStarter: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedPrompt, userStory, aiGeneratedStory, isGenerating } = useSelector((state: RootState) => state.story);
  const { user } = useSelector((state: RootState) => state.user);
  
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'write' | 'generate'>('write');
  
  // Adding the useEffect hook to load saved prompts and stories when component mounts
  useEffect(() => {
    const loadDefaultAndSavedPrompts = async () => {
      // Add default prompts
      defaultPrompts.forEach(prompt => {
        dispatch(addPrompt(prompt));
      });
      
      // Load saved stories
      try {
        const savedStories = await storyService.getSavedStories();
        if (savedStories.length > 0) {
          // If there are saved stories, extract their prompts and add to the prompts list
          // Avoid duplicates by checking IDs
          const existingPromptIds = defaultPrompts.map(p => p.id);
          
          savedStories.forEach(story => {
            if (!existingPromptIds.includes(story.id)) {
              // Create a prompt from the saved story
              const promptFromStory: StoryPrompt = {
                id: uuidv4(), // Generate a new ID for the prompt
                title: story.title,
                prompt: story.prompt,
                category: story.category,
                ageGroup: story.ageGroup
              };
              dispatch(addPrompt(promptFromStory));
            }
          });
        }
      } catch (error) {
        console.error('Error loading saved stories:', error);
      }
    };
    
    loadDefaultAndSavedPrompts();
  }, [dispatch]);
  
  const handleSelectPrompt = (prompt: StoryPrompt) => {
    dispatch(setSelectedPrompt(prompt));
  };
  
  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setUserStory(e.target.value));
  };
  
  const handleCreatePrompt = () => {
    if (title && prompt && category && ageGroup) {
      const newPrompt: StoryPrompt = {
        id: uuidv4(),
        title,
        prompt,
        category,
        ageGroup,
      };
      
      dispatch(addPrompt(newPrompt));
      
      // After adding the prompt, select it automatically
      dispatch(setSelectedPrompt(newPrompt));
      
      // Clear the form
      setTitle('');
      setPrompt('');
      setCategory('');
      setAgeGroup('');
      setShowForm(false);
      
      // Show success message
      alert('Story prompt has been created and saved successfully!');
    }
  };
  
  const handleGenerateStory = async () => {
    if (!selectedPrompt) return;
    
    dispatch(setGenerating(true));
    
    try {
      const generatedStory = await storyService.generateStory(selectedPrompt, userStory);
      dispatch(setAiGeneratedStory(generatedStory));
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      dispatch(setGenerating(false));
    }
  };
  
  const handleSaveStory = async () => {
    if (!selectedPrompt) return;
    
    const storyToSave = {
      id: uuidv4(),
      title: selectedPrompt.title,
      prompt: selectedPrompt.prompt,
      category: selectedPrompt.category,
      ageGroup: selectedPrompt.ageGroup,
      content: viewMode === 'write' ? userStory : aiGeneratedStory,
      createdAt: Date.now()
    };
    
    try {
      const savedStory = await storyService.saveStory(storyToSave);
      dispatch(saveStory(savedStory));
      alert('Story saved successfully!');
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Story Prompts</h2>
          
          <div className="space-y-4 mb-4">
            {defaultPrompts.map((prompt) => (
              <div 
                key={prompt.id} 
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedPrompt?.id === prompt.id ? 'border-primary bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleSelectPrompt(prompt)}
              >
                <h3 className="font-semibold">{prompt.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{prompt.category}</span>
                  <span>Ages: {prompt.ageGroup}</span>
                </div>
              </div>
            ))}
          </div>
          
          {!showForm ? (
            <button
              className="btn-primary w-full"
              onClick={() => setShowForm(true)}
            >
              Create New Prompt
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold">Create New Prompt</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  placeholder="Enter a title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="form-input h-20"
                  placeholder="Enter a story prompt"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select age group</option>
                  {ageGroups.map((age) => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="btn-primary flex-1"
                  onClick={handleCreatePrompt}
                >
                  Save
                </button>
                <button
                  className="btn-secondary flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="md:col-span-2">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            {selectedPrompt ? selectedPrompt.title : 'Select a Prompt to Begin'}
          </h2>
          
          {selectedPrompt && (
            <>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-gray-700">{selectedPrompt.prompt}</p>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{selectedPrompt.category}</span>
                  <span>Ages: {selectedPrompt.ageGroup}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    className={`flex-1 py-2 px-4 rounded ${
                      viewMode === 'write' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setViewMode('write')}
                  >
                    Write Yourself
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded ${
                      viewMode === 'generate' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setViewMode('generate')}
                  >
                    AI Generate
                  </button>
                </div>
              </div>
              
              {viewMode === 'write' ? (
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Continue the story:
                  </label>
                  <textarea
                    value={userStory}
                    onChange={handleStoryChange}
                    className="form-input h-64"
                    placeholder="Type your story here..."
                  />
                </div>
              ) : (
                <div>
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded border p-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                      <p className="text-gray-600">Generating your story...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                    </div>
                  ) : aiGeneratedStory ? (
                    <div className="prose max-w-none">
                      <div className="bg-gray-50 p-6 rounded border h-64 overflow-y-auto">
                        {aiGeneratedStory.split('\n').map((line: string, i: number) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <p className="text-gray-600">
                        Click the button below to let AI generate a story based on this prompt.
                        {userStory && " Your story notes will be incorporated into the generated story."}
                      </p>
                      
                      {userStory && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">Your story notes:</h4>
                          <p className="text-sm">{userStory}</p>
                        </div>
                      )}
                      
                      <button
                        className="btn-primary"
                        onClick={handleGenerateStory}
                      >
                        Generate Story
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <button
                  className="btn-primary"
                  onClick={handleSaveStory}
                  disabled={viewMode === 'write' ? !userStory : !aiGeneratedStory}
                >
                  Save Story
                </button>
              </div>
            </>
          )}
          
          {!selectedPrompt && (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">
                Select a story prompt from the left to begin your creative writing journey!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryStarter; 