import { configureStore } from '@reduxjs/toolkit';
import storyReducer from './slices/storySlice';
import activityReducer from './slices/activitySlice';
import userReducer from './slices/userSlice';
import { loadState, localStorageMiddleware } from './middleware/localStorage';

// Load persisted state from localStorage
const preloadedState = loadState();

// Define root reducer
const rootReducer = {
  story: storyReducer,
  activity: activityReducer,
  user: userReducer,
};

// Create the store
const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 