/**
 * Storage service for persisting data to localStorage
 */
import { ActivityEntry } from '../store/slices/activitySlice';

// Storage keys
const CHILDREN_KEY = 'kidsmentor_children';
const ENTRIES_KEY = 'kidsmentor_entries';

/**
 * Save children to localStorage
 */
export const saveChildren = (children: string[]): void => {
  try {
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
  } catch (err) {
    console.error('Error saving children to localStorage:', err);
  }
};

/**
 * Load children from localStorage
 */
export const loadChildren = (): string[] => {
  try {
    const storedChildren = localStorage.getItem(CHILDREN_KEY);
    return storedChildren ? JSON.parse(storedChildren) : [];
  } catch (err) {
    console.error('Error loading children from localStorage:', err);
    return [];
  }
};

/**
 * Save activity entries to localStorage
 */
export const saveEntries = (entries: ActivityEntry[]): void => {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Error saving entries to localStorage:', err);
  }
};

/**
 * Load activity entries from localStorage
 */
export const loadEntries = (): ActivityEntry[] => {
  try {
    const storedEntries = localStorage.getItem(ENTRIES_KEY);
    return storedEntries ? JSON.parse(storedEntries) : [];
  } catch (err) {
    console.error('Error loading entries from localStorage:', err);
    return [];
  }
}; 