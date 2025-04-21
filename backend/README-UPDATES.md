# KidsMetor Updates

## Recent Changes

### 1. Gemini 2.0 Flash Integration

- The backend now uses Gemini 2.0 Flash for improved AI response performance and quality
- Updated environment configuration to support model customization
- Added support for local environment overrides with `.env.local`

### 2. Learning Profile Enhancements

- Added an "Apply Changes" button to the Learning Profile settings
- Implemented a temporary profile state to prevent changes until explicitly applied
- Added visual feedback when profile changes are successfully applied
- Added persistence for user profiles via localStorage

## How to Use These Updates

### Configuring the AI Model

1. The application now uses Gemini 2.0 Flash by default
2. To customize your model selection:
   - Copy `backend/.env.local.example` to `backend/.env.local`
   - Update the `GEMINI_API_KEY` with your own key
   - Optionally change the `GEMINI_MODEL` to your preferred model

### Using the New Learning Profile Features

1. Click on "Learning Profile" in the AI Tutor section
2. Make your desired changes to Learning Style, Pace, Challenge Level, or Interests
3. Click "Apply Changes" to save your preferences
4. The green success indicator confirms your changes have been applied
5. Your profile settings will now persist between sessions

## Troubleshooting

If you encounter any issues with the Gemini API:

1. Verify your API key is correct in the `.env` or `.env.local` file
2. Check that you have access to the specified model in your Google AI Studio account
3. Review the server logs for detailed error information
