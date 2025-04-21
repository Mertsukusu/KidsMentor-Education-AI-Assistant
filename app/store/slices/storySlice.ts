import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StoryPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  ageGroup: string;
}

export interface GeneratedStory {
  id: string;
  title: string;
  prompt: string;
  category: string;
  ageGroup: string;
  content: string;
  createdAt: number;
}

export interface StoryState {
  prompts: StoryPrompt[];
  selectedPrompt: StoryPrompt | null;
  userStory: string;
  aiGeneratedStory: string;
  savedStories: GeneratedStory[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const initialState: StoryState = {
  prompts: [],
  selectedPrompt: null,
  userStory: '',
  aiGeneratedStory: '',
  savedStories: [],
  isLoading: false,
  isGenerating: false,
  error: null,
};

export const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setPrompts: (state, action: PayloadAction<StoryPrompt[]>) => {
      state.prompts = action.payload;
    },
    setSelectedPrompt: (state, action: PayloadAction<StoryPrompt | null>) => {
      state.selectedPrompt = action.payload;
      // Reset the AI-generated story when selecting a new prompt
      state.aiGeneratedStory = '';
    },
    setUserStory: (state, action: PayloadAction<string>) => {
      state.userStory = action.payload;
    },
    setAiGeneratedStory: (state, action: PayloadAction<string>) => {
      state.aiGeneratedStory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addPrompt: (state, action: PayloadAction<StoryPrompt>) => {
      state.prompts.push(action.payload);
    },
    removePrompt: (state, action: PayloadAction<string>) => {
      state.prompts = state.prompts.filter(prompt => prompt.id !== action.payload);
    },
    saveStory: (state, action: PayloadAction<GeneratedStory>) => {
      state.savedStories.push(action.payload);
    },
    removeSavedStory: (state, action: PayloadAction<string>) => {
      state.savedStories = state.savedStories.filter(story => story.id !== action.payload);
    },
  },
});

export const { 
  setPrompts, 
  setSelectedPrompt, 
  setUserStory,
  setAiGeneratedStory, 
  setLoading,
  setGenerating, 
  setError,
  addPrompt,
  removePrompt,
  saveStory,
  removeSavedStory
} = storySlice.actions;

export default storySlice.reducer; 