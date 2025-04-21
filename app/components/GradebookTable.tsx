import React, { useState, useEffect, useRef } from 'react';
import { Grade, Student, Classroom } from '../types/api';

// Mock data for testing
const MOCK_STUDENTS: Student[] = [
  { 
    id: 1, 
    userId: 101, 
    grade: 3, 
    dateOfBirth: '2015-05-14',
    user: { 
      id: 101, 
      email: 'emma@example.com',
      firstName: 'Emma', 
      lastName: 'Johnson', 
      role: 'STUDENT' as any,
      createdAt: '2022-01-15T00:00:00Z',
      updatedAt: '2022-01-15T00:00:00Z'
    }
  },
  { 
    id: 2, 
    userId: 102, 
    grade: 3, 
    dateOfBirth: '2015-06-22',
    user: { 
      id: 102, 
      email: 'noah@example.com',
      firstName: 'Noah', 
      lastName: 'Smith', 
      role: 'STUDENT' as any,
      createdAt: '2022-01-16T00:00:00Z',
      updatedAt: '2022-01-16T00:00:00Z'
    }
  },
  { 
    id: 3, 
    userId: 103, 
    grade: 3, 
    dateOfBirth: '2015-03-11',
    user: { 
      id: 103, 
      email: 'olivia@example.com',
      firstName: 'Olivia', 
      lastName: 'Williams', 
      role: 'STUDENT' as any,
      createdAt: '2022-01-17T00:00:00Z',
      updatedAt: '2022-01-17T00:00:00Z'
    }
  },
  {
    id: 4, 
    userId: 104, 
    grade: 3, 
    dateOfBirth: '2015-09-03',
    user: { 
      id: 104, 
      email: 'liam@example.com',
      firstName: 'Liam', 
      lastName: 'Brown', 
      role: 'STUDENT' as any,
      createdAt: '2022-01-18T00:00:00Z',
      updatedAt: '2022-01-18T00:00:00Z'
    }
  }
];

const MOCK_ASSIGNMENTS = [
  { id: 1, name: 'Math Quiz 1', category: 'Quiz', maxScore: 100 },
  { id: 2, name: 'Science Project', category: 'Project', maxScore: 50 },
  { id: 3, name: 'Reading Comprehension', category: 'Homework', maxScore: 20 },
  { id: 4, name: 'History Test', category: 'Exam', maxScore: 100 },
  { id: 5, name: 'Art Portfolio', category: 'Project', maxScore: 30 }
];

// Generate mock grades
const generateMockGrades = (): Grade[] => {
  const grades: Grade[] = [];
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  
  MOCK_STUDENTS.forEach(student => {
    MOCK_ASSIGNMENTS.forEach((assignment, index) => {
      // Some random score based on max score
      const score = Math.floor(Math.random() * (assignment.maxScore * 0.5)) + Math.floor(assignment.maxScore * 0.5);
      const daysAgo = index * 2;
      
      grades.push({
        id: grades.length + 1,
        studentId: student.id,
        student: student,
        classroomId: 1,
        classroom: {} as Classroom, // Mock data
        assignmentName: assignment.name,
        score,
        maxScore: assignment.maxScore,
        date: new Date(today.getTime() - (daysAgo * oneDay)).toISOString(),
        category: assignment.category
      });
    });
  });
  
  return grades;
};

interface GradebookTableProps {
  classroomId: number;
  userId?: number;
  userRole?: string;
}

const GradebookTable: React.FC<GradebookTableProps> = ({ 
  classroomId,
  userId,
  userRole = 'TEACHER'
}) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingCell, setEditingCell] = useState<{
    studentId: number;
    assignmentId: number;
    value: number;
  } | null>(null);
  
  // WebSocket reference
  const webSocketRef = useRef<WebSocket | null>(null);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, these would be API calls
        // For this demo, we use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        const mockGrades = generateMockGrades();
        setGrades(mockGrades);
        setStudents(MOCK_STUDENTS);
        setAssignments(MOCK_ASSIGNMENTS);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading gradebook data:', error);
        setError('Failed to load gradebook data');
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up WebSocket connection
    connectWebSocket();
    
    return () => {
      // Clean up WebSocket on unmount
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [classroomId]);
  
  // Setup WebSocket connection
  const connectWebSocket = () => {
    try {
      // In a real app, this would connect to your actual WebSocket server
      // For this demo, we'll simulate WebSocket updates
      
      // Simulate WebSocket connection
      console.log('WebSocket connection established (simulated)');
      
      // Set up periodic "updates" to simulate real-time data
      const interval = setInterval(() => {
        // Simulate a WebSocket message with a grade update
        const randomStudentIndex = Math.floor(Math.random() * MOCK_STUDENTS.length);
        const randomAssignmentIndex = Math.floor(Math.random() * MOCK_ASSIGNMENTS.length);
        const randomStudent = MOCK_STUDENTS[randomStudentIndex];
        const randomAssignment = MOCK_ASSIGNMENTS[randomAssignmentIndex];
        
        // Create a simulated message
        const message = {
          type: 'GRADE_UPDATE',
          data: {
            studentId: randomStudent.id,
            assignmentId: randomAssignment.id,
            assignmentName: randomAssignment.name,
            score: Math.floor(Math.random() * randomAssignment.maxScore) + 1,
            maxScore: randomAssignment.maxScore,
            timestamp: new Date().toISOString()
          }
        };
        
        // Process the simulated message
        handleWebSocketMessage(message);
      }, 10000); // Simulate a new grade every 10 seconds
      
      // Store the interval ID for cleanup
      const mockSocket = { 
        close: () => clearInterval(interval) 
      } as unknown as WebSocket;
      webSocketRef.current = mockSocket;
      
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  };
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    if (message.type === 'GRADE_UPDATE') {
      const { studentId, assignmentName, score } = message.data;
      
      // Update the grade in our state
      setGrades(currentGrades => {
        return currentGrades.map(grade => {
          if (grade.studentId === studentId && grade.assignmentName === assignmentName) {
            // Found the grade to update
            const updatedGrade = { ...grade, score };
            
            // Show notification
            const student = students.find(s => s.id === studentId);
            const studentName = student ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown student';
            showNotification(`Grade updated: ${studentName} - ${assignmentName} - ${score}/${grade.maxScore}`);
            
            return updatedGrade;
          }
          return grade;
        });
      });
    }
  };
  
  // Show a temporary notification for real-time updates
  const showNotification = (message: string) => {
    // In a real app, you'd use a toast notification library
    console.log('NOTIFICATION:', message);
    
    // For this demo, we could implement a simple notification system
    // but we'll keep it simple for now
  };
  
  // Handle grade editing
  const handleEditGrade = (studentId: number, assignmentId: number, currentValue: number) => {
    // Only teachers can edit grades
    if (userRole !== 'TEACHER') return;
    
    setEditingCell({ 
      studentId, 
      assignmentId, 
      value: currentValue 
    });
  };
  
  // Handle grade value change
  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCell) return;
    
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setEditingCell({ ...editingCell, value });
    }
  };
  
  // Save edited grade
  const handleSaveGrade = () => {
    if (!editingCell) return;
    
    const { studentId, assignmentId, value } = editingCell;
    
    // Find the assignment from our assignments list
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    // Update the grade in state
    setGrades(currentGrades => {
      return currentGrades.map(grade => {
        if (grade.studentId === studentId && grade.assignmentName === assignment.name) {
          // Check if value is within bounds
          const newScore = Math.min(Math.max(0, value), grade.maxScore);
          return { ...grade, score: newScore };
        }
        return grade;
      });
    });
    
    // In a real app, you'd send this update to the server
    console.log(`Updated grade: Student ID ${studentId}, Assignment ID ${assignmentId}, New Score: ${value}`);
    
    // Clear editing state
    setEditingCell(null);
  };
  
  // Cancel grade editing
  const handleCancelEdit = () => {
    setEditingCell(null);
  };
  
  // Calculate grade averages
  const calculateAverage = (studentId: number) => {
    const studentGrades = grades.filter(grade => 
      grade.studentId === studentId && 
      (selectedCategory === 'all' || grade.category === selectedCategory)
    );
    
    if (studentGrades.length === 0) return 'N/A';
    
    const totalPoints = studentGrades.reduce((sum, grade) => sum + grade.score, 0);
    const maxPoints = studentGrades.reduce((sum, grade) => sum + grade.maxScore, 0);
    
    return maxPoints > 0 ? `${Math.round((totalPoints / maxPoints) * 100)}%` : 'N/A';
  };
  
  // Filter assignments by category
  const filteredAssignments = selectedCategory === 'all' 
    ? assignments 
    : assignments.filter(assignment => assignment.category === selectedCategory);
  
  // Get unique categories for filter dropdown
  const uniqueCategories = ['all', ...new Set(assignments.map(a => a.category))];
  
  if (isLoading) {
    return <div className="card p-6 flex justify-center items-center">Loading gradebook...</div>;
  }
  
  if (error) {
    return <div className="card p-6 text-red-500">{error}</div>;
  }
  
  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gradebook</h2>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Filter by:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input py-1 w-auto"
          >
            {uniqueCategories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                Student
              </th>
              {filteredAssignments.map(assignment => (
                <th 
                  key={assignment.id} 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div>
                    <div>{assignment.name}</div>
                    <div className="text-gray-400 normal-case">{assignment.category} • {assignment.maxScore} pts</div>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white">
                  <div className="text-sm font-medium text-gray-900">
                    {student.user.firstName} {student.user.lastName}
                  </div>
                </td>
                {filteredAssignments.map(assignment => {
                  const grade = grades.find(g => 
                    g.studentId === student.id && 
                    g.assignmentName === assignment.name
                  );
                  
                  const score = grade ? grade.score : null;
                  const maxScore = assignment.maxScore;
                  const percentage = score !== null ? Math.round((score / maxScore) * 100) : null;
                  
                  // Determine cell color based on percentage
                  let cellColor = '';
                  if (percentage !== null) {
                    if (percentage >= 90) cellColor = 'bg-green-50';
                    else if (percentage >= 80) cellColor = 'bg-blue-50';
                    else if (percentage >= 70) cellColor = 'bg-yellow-50';
                    else if (percentage >= 60) cellColor = 'bg-orange-50';
                    else cellColor = 'bg-red-50';
                  }
                  
                  const isEditing = editingCell && 
                    editingCell.studentId === student.id && 
                    editingCell.assignmentId === assignment.id;
                  
                  return (
                    <td 
                      key={assignment.id} 
                      className={`px-4 py-4 whitespace-nowrap ${cellColor}`}
                      onClick={() => score !== null && handleEditGrade(student.id, assignment.id, score)}
                    >
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={editingCell.value}
                            onChange={handleGradeChange}
                            className="form-input py-1 w-16"
                            min={0}
                            max={maxScore}
                            autoFocus
                          />
                          <span className="text-gray-500">/ {maxScore}</span>
                          <button 
                            onClick={handleSaveGrade}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            ✓
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ) : score !== null ? (
                        <div className={`text-sm ${userRole === 'TEACHER' ? 'cursor-pointer hover:underline' : ''}`}>
                          {score} / {maxScore} ({percentage}%)
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Not graded</div>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-4 whitespace-nowrap font-medium">
                  {calculateAverage(student.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {userRole === 'TEACHER' && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Click on any grade to edit it. Changes are saved automatically and synced in real-time.</p>
        </div>
      )}
    </div>
  );
};

export default GradebookTable; 