import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MoodType = 'happy' | 'sad' | 'tired' | 'excited' | 'frustrated' | 'calm';
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface ActivityEntry {
  id: string;
  date: string;
  childName: string;
  type: 'meal' | 'nap' | 'learning' | 'mood';
  mealType?: MealType;
  mealDescription?: string;
  napStart?: string;
  napEnd?: string;
  learningFocus?: string;
  learningNotes?: string;
  mood?: MoodType;
  moodNotes?: string;
  createdAt: string;
}

export interface ActivityState {
  entries: ActivityEntry[];
  isLoading: boolean;
  error: string | null;
  children: string[];
}

const initialState: ActivityState = {
  entries: [],
  isLoading: false,
  error: null,
  children: [],
};

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<ActivityEntry[]>) => {
      state.entries = action.payload;
    },
    addEntry: (state, action: PayloadAction<ActivityEntry>) => {
      state.entries.push(action.payload);
    },
    updateEntry: (state, action: PayloadAction<ActivityEntry>) => {
      const index = state.entries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    deleteEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setChildren: (state, action: PayloadAction<string[]>) => {
      state.children = action.payload;
    },
    addChild: (state, action: PayloadAction<string>) => {
      if (!state.children.includes(action.payload)) {
        state.children.push(action.payload);
      }
    },
  },
});

export const {
  setEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  setLoading,
  setError,
  setChildren,
  addChild,
} = activitySlice.actions;

export default activitySlice.reducer; 