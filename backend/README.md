# KidsMentor Backend

This is the FastAPI backend for the KidsMentor Education Portal, powering both the AI Tutor and Story Generator features using Google's Gemini AI.

## Features

- AI-Powered Personal Tutor using Gemini Pro for all subjects and topics
- Interactive Story Starter generator for early childhood educators
- RESTful API for subject and topic management
- Comprehensive error handling and logging

## Tech Stack

- **Framework**: FastAPI
- **AI Model**: Google Gemini Pro
- **Authentication**: Environment variable-based API key management
- **Logging**: Python's built-in logging module
- **Type Annotations**: Comprehensive Pydantic models

## Getting Started

### Prerequisites

- Python 3.10+
- Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`

### Configuration

Create a `.env` file in the backend directory with the following content:

```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
```

### Running the Server

```bash
uvicorn main:app --reload
```

This will start the server at `http://localhost:8000`.

## API Endpoints

### AI Tutor

- **POST** `/generate-lesson`: Generate a personalized lesson for a specific topic
  - Request Body:
    ```json
    {
      "student_id": 1,
      "last_quiz_score": 75,
      "current_topic": "Addition",
      "learning_objectives": [
        "Learn basic addition",
        "Understand number bonds"
      ],
      "subject": "Math"
    }
    ```

### Story Generator

- **POST** `/api/story/generate`: Generate creative, age-appropriate story starters
  - Request Body:
    ```json
    {
      "theme": "A day at the beach",
      "character_ideas": ["friendly turtle", "curious child"],
      "starting_phrase": "One sunny morning",
      "age_group": "4-6",
      "category": "Adventure"
    }
    ```

### Subject & Topic Management

- **GET** `/api/subjects`: Get all available subjects
- **GET** `/api/subjects/{subject_id}/topics`: Get topics for a specific subject

## Troubleshooting

### 502 Errors

If you encounter 502 errors when generating lessons or stories, check:

1. Your Gemini API key is valid
2. The API key has proper permissions
3. You have enough quota available
4. The server logs for detailed error information

## Development Notes

- The Gemini API responses are parsed and validated for structure
- Error handling includes specific HTTP status codes for different error types
- Logging is configured to help diagnose issues with the AI model

## License

MIT License
