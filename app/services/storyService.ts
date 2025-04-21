import { v4 as uuidv4 } from 'uuid';
import { StoryPrompt, GeneratedStory } from '../store/slices/storySlice';

// Backend API URL - can be configured from environment
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Local storage key for saved stories
const SAVED_STORIES_KEY = 'kidsmentor_saved_stories';

// This service calls the Gemini-powered AI API
export const storyService = {
  // Generate a story based on the given prompt and parameters
  generateStory: async (
    prompt: StoryPrompt,
    additionalDetails: string = ''
  ): Promise<string> => {
    try {
      console.log("Generating story with prompt:", prompt);
      
      // Prepare request data for the API
      const requestData = {
        theme: prompt.prompt,
        age_group: prompt.ageGroup,
        category: prompt.category,
        character_ideas: [],
        starting_phrase: additionalDetails || ''
      };
      
      // Call the AI-powered story generation API
      const response = await fetch(`${API_URL}/api/story/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // Check for API errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`Story generation API error: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      if (data && data.storyStarters && data.storyStarters.length > 0) {
        // Pick a random story starter from the options
        const selectedStarter = data.storyStarters[Math.floor(Math.random() * data.storyStarters.length)];
        
        // Build a more complete story around the starter
        return buildStoryFromStarter(selectedStarter, prompt, additionalDetails);
      } else {
        throw new Error("No story starters returned from the API");
      }
    } catch (error) {
      console.error("Error generating story:", error);
      
      // Fallback to a very basic story if the API fails
      return buildFallbackStory(prompt, additionalDetails);
    }
  },
  
  // Save a generated story
  saveStory: async (story: GeneratedStory): Promise<GeneratedStory> => {
    // Add ID and timestamp if not present
    const storyToSave = {
      ...story,
      id: story.id || uuidv4(),
      createdAt: story.createdAt || Date.now(),
    };
    
    try {
      // Get existing saved stories
      const savedStories = await storyService.getSavedStories();
      
      // Add the new story
      const updatedStories = [...savedStories, storyToSave];
      
      // Save to localStorage
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(updatedStories));
      
      console.log("Story saved successfully:", storyToSave);
      return storyToSave;
    } catch (storageError) {
      console.error('Failed to save story to localStorage:', storageError);
      // Return the story anyway so UI can still use it
      return storyToSave;
    }
  },
  
  // Get all saved stories
  getSavedStories: async (): Promise<GeneratedStory[]> => {
    try {
      // Get stories from localStorage
      const savedStoriesJson = localStorage.getItem(SAVED_STORIES_KEY);
      
      if (savedStoriesJson) {
        const stories = JSON.parse(savedStoriesJson) as GeneratedStory[];
        console.log("Retrieved saved stories:", stories.length);
        return stories;
      }
    } catch (error) {
      console.error("Error retrieving saved stories:", error);
    }
    
    // Return empty array if nothing saved or error occurs
    return [];
  },
  
  // Delete a saved story by ID
  deleteStory: async (storyId: string): Promise<boolean> => {
    try {
      // Get existing saved stories
      const savedStories = await storyService.getSavedStories();
      
      // Filter out the story to delete
      const updatedStories = savedStories.filter(story => story.id !== storyId);
      
      // Save back to localStorage
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(updatedStories));
      
      console.log("Story deleted successfully:", storyId);
      return true;
    } catch (error) {
      console.error("Error deleting story:", error);
      return false;
    }
  }
};

// Helper function to build a more complete story from a starter
function buildStoryFromStarter(starter: string, prompt: StoryPrompt, additionalDetails: string): string {
  // Add age-appropriate content based on age group
  let ageSpecificContent = '';
  if (prompt.ageGroup.includes('3') || prompt.ageGroup.includes('4')) {
    ageSpecificContent = '\n\nThe colors were bright and beautiful, like a rainbow after the rain. There were many smiles and laughter throughout the day. Everyone learned that being kind and brave makes the world a better place.';
  } else if (prompt.ageGroup.includes('5') || prompt.ageGroup.includes('6')) {
    ageSpecificContent = '\n\nAs the adventure continued, everyone discovered they each had special talents to contribute. They worked together to solve problems, showing that teamwork and friendship can overcome any obstacle. The day ended with a celebration and promises of more adventures to come.';
  } else {
    ageSpecificContent = '\n\nThe journey taught valuable lessons about courage, friendship, and believing in yourself. Through challenges and triumphs, the characters grew stronger and wiser, understanding that every ending is just the beginning of a new story.';
  }
  
  // Incorporate additional details if provided
  const detailsSection = additionalDetails 
    ? `\n\n${additionalDetails}\n\n` 
    : '\n\n';
  
  // Combine the starter with age-specific content and additional details
  return `${starter}${detailsSection}${ageSpecificContent}\n\nThe End.`;
}

// Fallback story generation if the API fails
function buildFallbackStory(prompt: StoryPrompt, additionalDetails: string): string {
  interface FallbackStarters {
    [key: string]: string;
  }
  
  const fallbackStarters: FallbackStarters = {
    'Fantasy': `Once upon a time in a magical land, ${prompt.prompt.toLowerCase()} The adventure was just beginning...`,
    'Adventure': `The explorer looked out at the vast unknown, ${prompt.prompt.toLowerCase()} What amazing discoveries awaited?`,
    'Friendship': `Two friends sat together, sharing stories, ${prompt.prompt.toLowerCase()} Their friendship was special in so many ways.`,
    'Animals': `In the heart of the forest, the animals gathered, ${prompt.prompt.toLowerCase()} Each one had something important to share.`,
    'Space': `Among the stars and planets, ${prompt.prompt.toLowerCase()} The space journey had just begun.`,
    'Nature': `Under the tallest tree in the forest, ${prompt.prompt.toLowerCase()} Nature had many secrets to reveal.`
  };
  
  // Select a starter based on category or use a generic one
  const starter = fallbackStarters[prompt.category] || 
    `Once upon a time, ${prompt.prompt.toLowerCase()} It was the beginning of a wonderful story...`;
  
  // Use the helper function to build the rest of the story
  return buildStoryFromStarter(starter, prompt, additionalDetails);
} 