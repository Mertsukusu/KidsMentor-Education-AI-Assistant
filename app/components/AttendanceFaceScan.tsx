import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
  FaceRecognitionResult, 
  AttendanceStatus, 
  AttendanceRecord 
} from '../types/api';

// Mock data for testing - in production this would come from API
const MOCK_STUDENTS = [
  { id: 1, name: 'Emma Johnson', image: '/students/emma.jpg' },
  { id: 2, name: 'Noah Smith', image: '/students/noah.jpg' },
  { id: 3, name: 'Olivia Williams', image: '/students/olivia.jpg' },
  { id: 4, name: 'Liam Brown', image: '/students/liam.jpg' },
];

interface AttendanceFaceScanProps {
  classroomId: number;
  onComplete?: (records: AttendanceRecord[]) => void;
}

const AttendanceFaceScan: React.FC<AttendanceFaceScanProps> = ({ 
  classroomId,
  onComplete 
}) => {
  const dispatch = useDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string>('Loading face recognition models...');
  const [recognizedStudents, setRecognizedStudents] = useState<AttendanceRecord[]>([]);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [cvLoaded, setCvLoaded] = useState(false);
  
  // Reference to OpenCV's face classifier
  const faceClassifierRef = useRef<any>(null);
  const faceRecognizerRef = useRef<any>(null);
  
  // Load OpenCV.js
  useEffect(() => {
    // Function to handle OpenCV loading
    const loadOpenCV = () => {
      // This pattern assumes OpenCV.js is loaded from CDN in index.html
      if (window.cv) {
        setCvLoaded(true);
        setMessage('OpenCV loaded. Loading models...');
        
        // Load face recognition models
        const loadFaceModels = async () => {
          try {
            // In a real app, these would be proper model files
            // For this demo, we set up mock implementations
            faceClassifierRef.current = new window.cv.CascadeClassifier();
            // Pretend to load a pre-trained haarcascade file
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            faceRecognizerRef.current = new window.cv.face.LBPHFaceRecognizer_create();
            // Pretend to load a pre-trained recognizer
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsLoading(false);
            setMessage('Models loaded. Ready to scan.');
          } catch (error) {
            console.error('Error loading face models:', error);
            setMessage('Error loading models. Please try again.');
          }
        };
        
        loadFaceModels();
      } else {
        // Poll for OpenCV to be loaded
        setTimeout(loadOpenCV, 500);
      }
    };
    
    // Add script to load OpenCV.js if not already loaded
    if (!document.getElementById('opencv-script')) {
      const script = document.createElement('script');
      script.id = 'opencv-script';
      script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
      script.async = true;
      script.onload = loadOpenCV;
      document.body.appendChild(script);
    } else {
      loadOpenCV();
    }
    
    // Cleanup
    return () => {
      // Stop video stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setMessage('Camera active. Position face in frame.');
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setMessage('Error accessing camera. Please check permissions.');
    }
  };
  
  // Start face scanning
  const startScanning = async () => {
    if (!cvLoaded || isLoading) {
      setMessage('Please wait for models to load');
      return;
    }
    
    await startWebcam();
    setIsScanning(true);
    scanFaces();
  };
  
  // Stop face scanning
  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // If callback provided, send the results
    if (onComplete && recognizedStudents.length > 0) {
      onComplete(recognizedStudents);
    }
  };
  
  // Main face recognition function - runs in a loop when scanning
  const scanFaces = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current || !cvLoaded) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // In a real implementation, we'd process the image with OpenCV here
    // For this demo, we'll simulate face recognition with random results
    simulateFaceRecognition();
    
    // Continue scanning
    requestAnimationFrame(scanFaces);
  };
  
  // Simulate face recognition (in a real app, this would use actual OpenCV processing)
  const simulateFaceRecognition = () => {
    // Randomly "recognize" students for demo purposes
    if (Math.random() < 0.03 && recognizedStudents.length < MOCK_STUDENTS.length) {
      // Find a student we haven't recognized yet
      const unrecognizedStudents = MOCK_STUDENTS.filter(
        student => !recognizedStudents.some(record => record.studentId === student.id)
      );
      
      if (unrecognizedStudents.length > 0) {
        const randomIndex = Math.floor(Math.random() * unrecognizedStudents.length);
        const student = unrecognizedStudents[randomIndex];
        
        // Create confidence score (90-99% for demo)
        const confidence = 90 + Math.floor(Math.random() * 10);
        setAccuracy(confidence);
        
        // Create attendance record
        const record: AttendanceRecord = {
          studentId: student.id,
          studentName: student.name,
          status: AttendanceStatus.PRESENT,
          timestamp: new Date().toISOString()
        };
        
        // Add to recognized list
        setRecognizedStudents(prev => [...prev, record]);
        
        // Update message
        setMessage(`Recognized ${student.name} (${confidence}% confidence)`);
        
        // Draw rectangle and name on the canvas (visual feedback)
        const context = canvasRef.current?.getContext('2d');
        if (context) {
          context.strokeStyle = '#00FF00';
          context.lineWidth = 3;
          const x = 100 + Math.random() * 200;
          const y = 100 + Math.random() * 100;
          context.strokeRect(x, y, 200, 200);
          
          context.fillStyle = '#00FF00';
          context.font = '16px Arial';
          context.fillText(student.name, x, y - 10);
        }
      }
    }
  };
  
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Face Recognition Attendance</h2>
      
      <div className="relative mb-4 bg-gray-900 rounded overflow-hidden">
        <video 
          ref={videoRef} 
          className="w-full"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {!isScanning && (
          <div className="aspect-video flex items-center justify-center bg-gray-800 text-white">
            <div className="text-center p-6">
              <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>{message}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Recognition Accuracy: {accuracy}%</span>
          <span className="text-sm">{recognizedStudents.length}/{MOCK_STUDENTS.length} Students</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-primary rounded-full" 
            style={{ width: `${accuracy}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <h3 className="font-semibold">Recognized Students:</h3>
        {recognizedStudents.length === 0 ? (
          <p className="text-gray-500 text-sm">No students recognized yet.</p>
        ) : (
          <div className="max-h-40 overflow-y-auto">
            {recognizedStudents.map((record) => (
              <div key={record.studentId} className="p-2 bg-green-50 border border-green-200 rounded flex justify-between">
                <span>{record.studentName}</span>
                <span className="text-sm text-gray-500">
                  {new Date(record.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex space-x-3">
        {!isScanning ? (
          <button
            onClick={startScanning}
            disabled={isLoading}
            className={`btn-primary flex-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="btn-secondary flex-1"
          >
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceFaceScan; 