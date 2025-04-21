from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging
import json
import re
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("kidsmentor_backend")

# Load environment variables
# Try to load from .env.local first, then fall back to .env
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
    logger.info("Loaded environment variables from .env.local")
else:
    load_dotenv()
    logger.info("Loaded environment variables from .env")

# Configure Google Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")  # Using Gemini 1.5 Flash for better performance

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI(
    title="KidsMentor Backend",
    description="API for KidsMentor application, including AI Tutor and Story Generation features.",
    version="0.2.0",
)

# --- CORS Configuration --- 
# Adjust origins as needed for your frontend URL
origins = [
    "http://localhost:3000",     # React default
    "http://localhost:5173",     # Vite default
    "http://127.0.0.1:5173",     # Vite alternative
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

# --- Pydantic models for requests and responses ---

# AI Tutor models
class LessonContentItem(BaseModel):
    type: str
    text: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    problem_data: Optional[Dict[str, Any]] = None

class PracticeQuizItem(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class LessonRequest(BaseModel):
    student_id: int
    last_quiz_score: Optional[float] = None
    current_topic: str
    learning_objectives: List[str] = []
    subject: Optional[str] = None  # Added subject field
    challenge_level: Optional[str] = None  # To specify difficulty level
    learning_style: Optional[str] = None  # To specify learning style

class LessonResponse(BaseModel):
    lesson_id: int
    lessonTitle: str
    topic: str
    learningObjectives: List[str]
    difficultyLevel: str
    lessonContent: List[LessonContentItem]
    practiceQuiz: List[PracticeQuizItem]

# Story Generator models
class StoryRequest(BaseModel):
    theme: Optional[str] = ""
    character_ideas: Optional[List[str]] = []
    starting_phrase: Optional[str] = ""
    age_group: Optional[str] = "3-6"
    category: Optional[str] = "Fantasy"

class StoryStarterResponse(BaseModel):
    storyStarters: List[str]

# AI Tutoring Chat models
class ChatRequest(BaseModel):
    query: str
    conversationId: str
    studentProfile: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    conversationId: str

# --- Subject and topic data ---
SUBJECTS = [
    {
        "id": 1, 
        "name": "Math", 
        "topics": ["Addition", "Subtraction", "Shapes", "Counting", "Patterns", "Measurement"]
    },
    {
        "id": 2, 
        "name": "Science", 
        "topics": ["Animals", "Plants", "Weather", "Seasons", "Space", "Simple Machines"]
    },
    {
        "id": 3, 
        "name": "Reading", 
        "topics": ["Phonics", "Sight Words", "Comprehension", "Storytelling", "Rhyming", "Vocabulary"]
    },
    {
        "id": 4, 
        "name": "Social Studies", 
        "topics": ["Communities", "Maps", "Holidays", "Cultures", "History", "Geography"]
    },
    {
        "id": 5, 
        "name": "Art & Music", 
        "topics": ["Colors", "Drawing", "Music Basics", "Crafts", "Instruments", "Famous Artists"]
    }
]

# --- Helper Functions ---

def get_gemini_model():
    """Initialize and return the Gemini model"""
    try:
        logger.info(f"Initializing Gemini model: {GEMINI_MODEL}")
        model = genai.GenerativeModel(GEMINI_MODEL)
        return model
    except Exception as e:
        logger.error(f"Error initializing Gemini model: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initialize AI model")

def extract_json_from_response(response_text: str) -> str:
    """Extract JSON from Gemini response text"""
    logger.info("Extracting JSON from response")
    
    # Try finding JSON within ```json ... ``` blocks first
    json_match = re.search(r'```(?:json)?\n?({.*?})\n?```', response_text, re.DOTALL | re.IGNORECASE)
    if json_match:
        logger.info("Found JSON within markdown code blocks")
        return json_match.group(1)
    
    # If no markdown fences, check if the whole response is JSON
    response_text = response_text.strip()
    if response_text.startswith('{') and response_text.endswith('}'):
        logger.info("Found valid JSON structure in response")
        return response_text
    
    # Try finding the first '{' and last '}' as a fallback
    logger.warning("Response doesn't appear to be valid JSON, attempting fallback extraction")
    start = response_text.find('{')
    end = response_text.rfind('}')
    if start != -1 and end != -1 and start < end:
        extracted = response_text[start:end+1]
        logger.info(f"Extracted JSON using fallback method (chars {start}-{end})")
        return extracted
    
    # If all else fails, raise an error
    error_msg = "Could not extract valid JSON from model response"
    logger.error(f"{error_msg}. Raw response: {response_text[:100]}...")
    raise ValueError(error_msg)

# --- AI Tutor Endpoints ---

@app.post("/generate-lesson", response_model=LessonResponse)
async def generate_lesson(request: LessonRequest):
    """Generate a personalized lesson using Google Gemini based on student's context"""
    try:
        logger.info(f"Received lesson generation request for topic: {request.current_topic}")
        
        # Generate lesson content using Gemini
        lesson_data = await generate_lesson_content_gemini(
            student_id=request.student_id,
            last_quiz_score=request.last_quiz_score,
            current_topic=request.current_topic,
            learning_objectives=request.learning_objectives,
            subject=request.subject,
            challenge_level=request.challenge_level,
            learning_style=request.learning_style
        )

        # Return the lesson with a fixed ID
        response_data = {
            "lesson_id": request.student_id + 1000,  # Simple ID generation
            **lesson_data
        }
        
        logger.info(f"Successfully prepared lesson response for topic: {request.current_topic}")
        return LessonResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error in generate_lesson endpoint: {type(e).__name__}: {str(e)}")
        if isinstance(e, HTTPException):
            raise  # Re-raise HTTP exceptions as they already have status codes
        raise HTTPException(status_code=500, detail=f"Error generating lesson: {str(e)}")

async def generate_lesson_content_gemini(
    student_id: int,
    last_quiz_score: Optional[float],
    current_topic: str,
    learning_objectives: List[str],
    subject: Optional[str] = None,
    challenge_level: Optional[str] = None,
    learning_style: Optional[str] = None
) -> Dict[str, Any]:
    """Generate adaptive lesson content using Google Gemini"""
    
    logger.info(f"Generating lesson for student ID: {student_id}, topic: {current_topic}")
    
    # Determine adaptive strategy based on challenge level and score
    if challenge_level:
        if challenge_level.lower() == 'advanced':
            adaptive_instruction = (
                f"Generate an advanced-level lesson on the topic '{current_topic}'. "
                f"Include more complex concepts, challenging examples, and thought-provoking questions. "
                f"The lesson should be suitable for students who already have a good foundation in this subject."
            )
            difficulty_level = "advanced"
        elif challenge_level.lower() == 'intermediate':
            adaptive_instruction = (
                f"Generate an intermediate-level lesson on the topic '{current_topic}'. "
                f"Balance foundational concepts with more challenging applications. "
                f"The content should be appropriate for students who have some familiarity with the basics."
            )
            difficulty_level = "intermediate"
        else:  # default to beginner if not specified or unknown value
            adaptive_instruction = (
                f"Generate a beginner-level lesson on the topic '{current_topic}'. "
                f"Focus on foundational concepts with clear explanations and simple examples."
            )
            difficulty_level = "beginner"
    # Fall back to score-based adaptation if no challenge level provided
    elif last_quiz_score is None:
        adaptive_instruction = f"Generate an introductory lesson on the topic '{current_topic}' suitable for a beginner."
        difficulty_level = "beginner"
    elif last_quiz_score > 80:
        adaptive_instruction = (
            f"The student scored {last_quiz_score}% on the last quiz for a related topic. "
            f"Generate a slightly more challenging lesson building upon '{current_topic}' or introducing the next logical topic. "
            f"Aim for an 'intermediate' or 'advanced' difficulty."
        )
        difficulty_level = "intermediate to advanced"
    else:  # last_quiz_score <= 80
        adaptive_instruction = (
            f"The student scored {last_quiz_score}% on the last quiz for '{current_topic}'. "
            f"Generate a lesson reinforcing '{current_topic}' at a similar or slightly easier difficulty. "
            f"Focus on clarity and provide foundational examples. Aim for a 'beginner' or 'easy intermediate' difficulty."
        )
        difficulty_level = "beginner to easy intermediate"
    
    logger.info(f"Adapting lesson difficulty to: {difficulty_level}")

    # Define learning style adaptation if provided
    learning_style_instruction = ""
    if learning_style:
        if learning_style.lower() == 'visual':
            learning_style_instruction = (
                "The student is a visual learner. Include visual descriptions, "
                "diagrams, charts, and image suggestions. Use spatial organization "
                "and visual patterns in explanations."
            )
        elif learning_style.lower() == 'auditory':
            learning_style_instruction = (
                "The student is an auditory learner. Use rhythmic patterns, "
                "spoken word examples, and discussion-based activities. "
                "Include suggestions for speaking concepts aloud."
            )
        elif learning_style.lower() == 'kinesthetic':
            learning_style_instruction = (
                "The student is a kinesthetic learner. Incorporate hands-on activities, "
                "physical movements, and tactile examples. Suggest ways to physically "
                "engage with the material."
            )

    # Define the JSON structure example separately
    json_structure_example = '''
    {
      "lessonTitle": "string",
      "topic": "string", // The specific topic covered in this lesson
      "learningObjectives": ["string"], // List of objectives for this lesson
      "difficultyLevel": "string", // e.g., beginner, intermediate, advanced
      "lessonContent": [
        { "type": "explanation", "text": "string" },
        { "type": "example", "problem": "string", "solution": "string" },
        { "type": "interactive_problem", "problem_data": {...} } // Structure for React component
        // Add more content items as needed
      ],
      "practiceQuiz": [
         { "question": "string", "options": ["string"], "correct_answer": "string"}
         // Add more quiz items as needed
      ]
    }
    '''

    # Add subject context if provided
    subject_context = f"This lesson is part of the {subject} curriculum. " if subject else ""

    # Construct the final prompt
    prompt = f"""
    Act as an expert AI Tutor specializing in early childhood education concepts.
    Your task is to create a personalized, engaging, and adaptive lesson plan.

    Student Context:
    - Student ID: {student_id}
    - Current Topic: {current_topic}
    - Subject: {subject if subject else 'Not specified'}
    - Provided Learning Objectives: {', '.join(learning_objectives) if learning_objectives else 'None provided, please infer.'}
    - Last Quiz Score: {f'{last_quiz_score}%' if last_quiz_score is not None else 'N/A (first lesson on topic)'}
    - Challenge Level: {challenge_level if challenge_level else 'Not specified'}
    - Learning Style: {learning_style if learning_style else 'Not specified'}

    {subject_context}Adaptive Instruction:
    {adaptive_instruction}
    
    {learning_style_instruction}

    Output Requirements:
    - Generate the lesson content strictly in the following JSON format. Do not include any text, code formatting backticks, or explanation outside the JSON structure itself.
    - Ensure the lesson content is broken down into logical parts (explanation, example, interactive_problem).
    - For 'interactive_problem', define 'problem_data' that a React component can use to render the interactive element.
    - Create a short practice quiz with multiple-choice questions.
    - Define clear learning objectives if none were provided.
    - Set the overall difficulty level to "{difficulty_level}".
    - Make the content age-appropriate for young children (typically ages 3-8).
    - Use simple, clear language appropriate for the difficulty level.
    - Include engaging examples and visuals (described in text) where appropriate.

    JSON Output Structure Example (follow this structure exactly):
    {json_structure_example}
    """

    try:
        model = get_gemini_model()
        
        # Set up generation config for better JSON responses
        generation_config = {
            "temperature": 0.2,  # Lower temperature for more consistent outputs
            "response_mime_type": "application/json"  # Request JSON directly
        }
        
        logger.info("Sending request to Gemini API for lesson generation")
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        logger.info("Successfully received response from Gemini API")
        
        # Extract raw text from response
        raw_text = response.text
        
        # Extract and parse JSON from response
        try:
            json_string = extract_json_from_response(raw_text)
            lesson_data = json.loads(json_string)
            logger.info("Successfully parsed JSON response")
        except json.JSONDecodeError as json_e:
            logger.error(f"JSON parsing error: {str(json_e)}")
            logger.error(f"Attempted to parse: {json_string[:100]}...")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to parse lesson data from AI response: {str(json_e)}"
            )

        # Basic validation of response structure
        required_keys = ["lessonTitle", "topic", "learningObjectives", "difficultyLevel", "lessonContent", "practiceQuiz"]
        missing_keys = [key for key in required_keys if key not in lesson_data]
        
        if missing_keys:
            error_msg = f"AI response missing required keys: {', '.join(missing_keys)}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
            
        logger.info(f"Successfully generated lesson: '{lesson_data['lessonTitle']}'")
        return lesson_data

    except genai.types.api_errors.ApiError as api_e:
        # Handle specific Gemini API errors
        error_message = str(api_e)
        error_type = type(api_e).__name__
        logger.error(f"Gemini API error: {error_type} - {error_message}")
        
        if "rate limit" in error_message.lower():
            logger.error("Rate limit exceeded")
            raise HTTPException(status_code=429, detail="AI service rate limit exceeded")
        elif "invalid request" in error_message.lower():
            logger.error("Invalid request to Gemini API")
            raise HTTPException(status_code=400, detail=f"Invalid request to AI service: {error_message}")
        elif "authentication" in error_message.lower() or "unauthorized" in error_message.lower():
            logger.error("Authentication error with Gemini API")
            raise HTTPException(status_code=401, detail="AI service authentication failed")
        else:
            # Generic API error
            raise HTTPException(status_code=502, detail=f"AI service error: {error_type}")
    except Exception as e:
        # Catch-all for any other unexpected errors
        error_type = type(e).__name__
        error_message = str(e)
        logger.error(f"Unexpected error generating lesson content: {error_type}: {error_message}")
        logger.exception("Full exception details:")
        raise HTTPException(
            status_code=502, 
            detail=f"AI service error: {error_type} - {error_message}"
        )

# --- Story Generator Endpoints ---

@app.post("/api/story/generate", response_model=StoryStarterResponse)
async def generate_story_starters(request: StoryRequest):
    """
    Generate creative, age-appropriate story starters for early childhood educators
    using Google's Gemini AI.
    """
    try:
        logger.info(f"Received story starter request with theme: '{request.theme}'")
        
        # Generate story starters
        story_starters = await generate_story_starters_with_gemini(
            theme=request.theme,
            character_ideas=request.character_ideas,
            starting_phrase=request.starting_phrase,
            age_group=request.age_group,
            category=request.category
        )
        
        # Return response
        return StoryStarterResponse(storyStarters=story_starters)
    
    except Exception as e:
        logger.error(f"Error generating story starters: {type(e).__name__}: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating story starters: {str(e)}"
        )

async def generate_story_starters_with_gemini(
    theme: str = '',
    character_ideas: List[str] = None,
    starting_phrase: str = '',
    age_group: str = '3-6',
    category: str = 'Fantasy'
):
    """
    Generate creative, age-appropriate story starters using Google's Gemini AI.
    """
    if character_ideas is None:
        character_ideas = []
    
    # Log the inputs
    logger.info(f"Generating story starters with: Theme='{theme}', "
                f"Category='{category}', Age group='{age_group}'")
    
    # Construct the prompt for Gemini
    prompt = f"""
    You are a creative assistant for early childhood educators. Your task is to generate 
    2-3 engaging, open-ended story starters (not full stories) that are age-appropriate 
    for young children (ages {age_group}).
    
    Category: {category}
    
    The story starters should be:
    - Simple and clear language appropriate for young children ages {age_group}
    - Imaginative and engaging
    - Open-ended to encourage participation and creativity
    - 2-3 sentences long (each starter)
    - Age-appropriate (no scary, violent, or complex themes)
    - Designed to spark discussion and creative thinking
    
    {f"Theme to incorporate: {theme}" if theme else ""}
    {f"Characters to include: {', '.join(character_ideas)}" if character_ideas else ""}
    {f"Starting phrase to use or build upon: '{starting_phrase}'" if starting_phrase else ""}
    
    Please format your response as a JSON object containing a list of strings:
    {{
      "storyStarters": [
        "string - Starter 1",
        "string - Starter 2",
        "string - Starter 3"
      ]
    }}
    
    Do not include any explanations, only return the JSON object.
    """
    
    try:
        # Initialize the Gemini model
        model = get_gemini_model()
        
        # Set generation parameters for better JSON responses
        generation_config = {
            "temperature": 0.7,  # More creative temperature
            "response_mime_type": "application/json"  # Request JSON directly
        }
        
        # Call the Gemini API
        logger.info("Sending request to Gemini API for story starters")
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        logger.info("Successfully received response from Gemini API")
        
        # Extract JSON from response
        try:
            # Extract and parse the JSON
            json_string = extract_json_from_response(response.text)
            response_data = json.loads(json_string)
            
            # Extract story starters
            if 'storyStarters' in response_data and isinstance(response_data['storyStarters'], list):
                story_starters = response_data['storyStarters']
                logger.info(f"Successfully generated {len(story_starters)} story starters")
                return story_starters
            else:
                logger.warning("Response did not contain expected 'storyStarters' list")
                # If the response doesn't match expected structure but has other data, try to extract it
                if isinstance(response_data, dict) and len(response_data) > 0:
                    # Look for any list in the response
                    for key, value in response_data.items():
                        if isinstance(value, list) and len(value) > 0:
                            logger.info(f"Found alternate list under key '{key}', using this instead")
                            return value
                
                # If we couldn't find a usable list, raise an error
                raise ValueError("Response did not contain a valid list of story starters")
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {str(e)}")
            # If JSON parsing fails, attempt to extract text directly
            logger.warning("Attempting to extract plain text response instead")
            
            # Extract any text that looks like it might be a story starter
            potential_starters = re.findall(r'"([^"]+)"', response.text)
            
            if potential_starters:
                logger.info(f"Extracted {len(potential_starters)} potential starters from text")
                return potential_starters[:3]  # Limit to 3 starters
            
            # If all else fails, return the raw response split by newlines as a fallback
            logger.warning("Using fallback text extraction method")
            lines = [line.strip() for line in response.text.split('\n') if line.strip()]
            return lines[:3]  # Limit to 3 lines as starters
    
    except genai.types.api_errors.ApiError as api_e:
        # Handle specific Gemini API errors
        error_message = str(api_e)
        error_type = type(api_e).__name__
        logger.error(f"Gemini API error: {error_type} - {error_message}")
        
        if "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="AI service rate limit exceeded")
        elif "invalid request" in error_message.lower():
            raise HTTPException(status_code=400, detail=f"Invalid request to AI service: {error_message}")
        elif "authentication" in error_message.lower() or "unauthorized" in error_message.lower():
            raise HTTPException(status_code=401, detail="AI service authentication failed")
        else:
            raise HTTPException(status_code=502, detail=f"AI service error: {error_type}")
    
    except Exception as e:
        # General exception handling
        logger.error(f"Error in generate_story_starters_with_gemini: {type(e).__name__}: {str(e)}")
        logger.exception("Full exception details:")
        raise HTTPException(status_code=500, detail=str(e))

# --- Subjects and Topics API ---
@app.get("/api/subjects")
async def get_subjects():
    """Get all available subjects"""
    return SUBJECTS

@app.get("/api/subjects/{subject_id}/topics")
async def get_topics(subject_id: int):
    """Get topics for a specific subject"""
    subject = next((s for s in SUBJECTS if s["id"] == subject_id), None)
    if subject:
        return subject["topics"]
    raise HTTPException(status_code=404, detail="Subject not found")

# --- AI Tutoring Chat Endpoint ---
@app.post("/api/tutoring/chat", response_model=ChatResponse)
async def tutoring_chat(request: ChatRequest):
    """AI Tutor chat endpoint for conversational learning"""
    try:
        logger.info(f"Received chat request: {request.query[:50]}...")
        
        # Get or initialize student profile context
        student_profile = request.studentProfile or {}
        profile_context = ""
        
        if student_profile:
            interests = student_profile.get("interests", [])
            difficulty = student_profile.get("preferredDifficulty", "intermediate")
            learning_style = student_profile.get("learningStyle", "")
            
            profile_context = f"""
            Student Profile Context:
            - Interests: {', '.join(interests) if interests else 'Not specified'}
            - Preferred Difficulty: {difficulty}
            - Learning Style: {learning_style}
            """
        
        # Initialize Gemini model
        model = get_gemini_model()
        
        # Construct the prompt
        prompt = f"""
        Act as an AI tutor for elementary school children (ages 5-11). 
        Your name is KidsPortal AI Edu Assistant.
        
        {profile_context}
        
        Guidelines:
        - Be friendly, patient, and encouraging
        - Use simple language appropriate for young children
        - Give clear, concise explanations
        - If asked about a topic you're unsure about, admit limitations politely
        - Keep responses brief (1-3 sentences for simple questions)
        - Include examples when helpful
        - Use analogies that children can relate to
        - Include child-friendly images/visuals when possible
        - Use visual descriptions and references that would help children visualize concepts
        - Be supportive and positive in your responses
        - Do not include any harmful, inappropriate, or sensitive content
        
        Please respond to the following query with kid-friendly visuals when appropriate: "{request.query}"
        """
        
        # Call Gemini API
        logger.info("Sending request to Gemini API for tutoring chat")
        response = model.generate_content(prompt)
        
        # Process response
        ai_response = response.text.strip()
        logger.info(f"Successfully generated response: {ai_response[:50]}...")
        
        return ChatResponse(
            response=ai_response,
            conversationId=request.conversationId
        )
        
    except genai.types.api_errors.ApiError as api_e:
        # Handle specific Gemini API errors
        error_message = str(api_e)
        error_type = type(api_e).__name__
        logger.error(f"Gemini API error: {error_type} - {error_message}")
        
        if "rate limit" in error_message.lower():
            raise HTTPException(status_code=429, detail="AI service rate limit exceeded")
        elif "invalid request" in error_message.lower():
            raise HTTPException(status_code=400, detail=f"Invalid request to AI service: {error_message}")
        elif "authentication" in error_message.lower() or "unauthorized" in error_message.lower():
            raise HTTPException(status_code=401, detail="AI service authentication failed")
        else:
            raise HTTPException(status_code=502, detail=f"AI service error: {error_type}")
    
    except Exception as e:
        # General exception handling
        logger.error(f"Error in tutoring_chat endpoint: {type(e).__name__}: {str(e)}")
        logger.exception("Full exception details:")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

# --- Health check --- 
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check endpoint called")
    return {"status": "healthy", "message": "KidsMentor API is running"}

# --- Run the application ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 