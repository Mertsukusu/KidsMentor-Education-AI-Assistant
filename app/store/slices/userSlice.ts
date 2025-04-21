import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  username: string;
  fullName: string;
  grade: string;
  profileInitials: string;
}

export interface UserState {
  user: User | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  user: null,
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      
      // Calculate initials if not provided
      if (!state.user.profileInitials && state.user.fullName) {
        state.user.profileInitials = state.user.fullName
          .split(' ')
          .map(n => n[0])
          .join('');
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
    updateUserDetails: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
});

export const { 
  setUser, 
  clearUser,
  updateUserDetails
} = userSlice.actions;

export default userSlice.reducer; 