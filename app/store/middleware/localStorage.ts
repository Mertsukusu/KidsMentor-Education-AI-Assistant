import { Middleware } from 'redux';
import { RootState } from '../index';

// Keys for storing different slices of state
const ACTIVITY_STATE_KEY = 'eduspark_activity_state';

// Load state from localStorage
export const loadState = () => {
  try {
    const activityState = localStorage.getItem(ACTIVITY_STATE_KEY);
    
    if (activityState === null) {
      return undefined;
    }
    
    return {
      activity: JSON.parse(activityState)
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return undefined;
  }
};

// Save state to localStorage
export const saveState = (state: Partial<RootState>) => {
  try {
    if (state.activity) {
      localStorage.setItem(ACTIVITY_STATE_KEY, JSON.stringify(state.activity));
    }
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};
// Middleware that saves state to localStorage after each action
export const localStorageMiddleware: Middleware = store => next => action => {
  const result = next(action);
  
  // Only save if the action is related to the activity slice
  if (action.type?.startsWith('activity/')) {
    saveState({ activity: store.getState().activity });
  }
  
  return result;
}; 