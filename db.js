// ===== DEMO DATABASE (mock data) =====
// Later this is replaced by API calls to FastAPI + PostgreSQL.
const DB = {
  teachers: [
    {
      id: "T001", name: "Dr. Ananya Sen", email: "ananya.sen@college.edu", password: "demo123",
      department: "CSE", designation: "Associate Professor", phone: "+91 98300 11111",
      assignments: [
        { year: 1, semester: 1, department: "CSE", subjectCode: "CS101", subject: "Programming in C" },
        { year: 2, semester: 3, department: "CSE", subjectCode: "CS301", subject: "Data Structures" },
        { year: 3, semester: 5, department: "AIML", subjectCode: "AI501", subject: "Machine Learning" }
      ]
    },
    {
      id: "T002", name: "Prof. Rahul Das", email: "rahul.das@college.edu", password: "demo123",
      department: "AIML", designation: "Assistant Professor", phone: "+91 98300 22222",
      assignments: [
        { year: 3, semester: 6, department: "AIML", subjectCode: "AI602", subject: "Deep Learning" },
        { year: 4, semester: 7, department: "AIML", subjectCode: "AI701", subject: "Natural Language Processing" }
      ]
    },
    {
      id: "T003", name: "Dr. Priya Ghosh", email: "priya.ghosh@college.edu", password: "demo123",
      department: "ECE", designation: "Professor", phone: "+91 98300 33333",
      assignments: [
        { year: 1, semester: 2, department: "ECE", subjectCode: "EC201", subject: "Basic Electronics" },
        { year: 2, semester: 4, department: "ECE", subjectCode: "EC401", subject: "Signals & Systems" }
      ]
    }
  ],

  students: [
    { id: "S101", roll: "CSE/24/01", name: "Arjun Roy", department: "CSE", year: 1 },
    { id: "S102", roll: "CSE/24/02", name: "Meera Paul", department: "CSE", year: 1 },
    { id: "S201", roll: "CSE/23/01", name: "Sourav Dey", department: "CSE", year: 2 },
    { id: "S202", roll: "CSE/23/02", name: "Riya Saha", department: "CSE", year: 2 },
    { id: "S301", roll: "AIML/22/01", name: "Kunal Mitra", department: "AIML", year: 3 },
    { id: "S302", roll: "AIML/22/02", name: "Tanya Bose", department: "AIML", year: 3 },
    { id: "S401", roll: "AIML/21/01", name: "Ishaan Kar", department: "AIML", year: 4 },
    { id: "S501", roll: "ECE/24/01", name: "Pooja Nandi", department: "ECE", year: 1 },
    { id: "S502", roll: "ECE/23/01", name: "Aman Sharma", department: "ECE", year: 2 }
  ],

  exams: [
    {
      id: "E0", subjectCode: "CS101", name: "Class Test 1", date: "2026-09-05", maxMarks: 15,
      questions: [
        { no: "Q1", text: "What is a variable in C? Give an example.", marks: 5, co: "CO1", bloom: "Remember" },
        { no: "Q2", text: "Write a C program to find the largest of three numbers.", marks: 5, co: "CO2", bloom: "Apply" },
        { no: "Q3", text: "Differentiate between while and do-while loops.", marks: 5, co: "CO3", bloom: "Analyze" }
      ]
    },
    {
      id: "E1", subjectCode: "CS301", name: "Mid-Sem Test 1", date: "2026-09-12", maxMarks: 20,
      questions: [
        { no: "Q1", text: "Define a stack and list its operations.", marks: 5, co: "CO1", bloom: "Remember" },
        { no: "Q2", text: "Convert infix A+B*C to postfix using a stack.", marks: 5, co: "CO2", bloom: "Apply" },
        { no: "Q3", text: "Compare arrays and linked lists for insertion.", marks: 5, co: "CO3", bloom: "Analyze" },
        { no: "Q4", text: "Justify the choice of a queue for CPU scheduling.", marks: 5, co: "CO3", bloom: "Evaluate" }
      ]
    },
    {
      id: "E2", subjectCode: "AI501", name: "Class Test 1", date: "2026-09-20", maxMarks: 10,
      questions: [
        { no: "Q1", text: "What is overfitting?", marks: 5, co: "CO1", bloom: "Understand" },
        { no: "Q2", text: "Apply linear regression to the given data.", marks: 5, co: "CO2", bloom: "Apply" }
      ]
    }
  ],

  // Mock evaluation results (would come from PaddleOCR + LLM)
  evaluations: [
    {
      id: "EV1", examId: "E1", studentId: "S201", status: "Pending Review",
      results: [
        { q: "Q1", marks: 4, demonstrated: "Remember", ocrConf: 0.93, feedback: "Correct definition; missed 'peek'.", extracted: "A stack is a LIFO data structure. Operations are push and pop and isEmpty." },
        { q: "Q2", marks: 2, demonstrated: "Remember", ocrConf: 0.81, feedback: "Operator precedence applied incorrectly.", extracted: "AB+C* is the postfix form." },
        { q: "Q3", marks: 3, demonstrated: "Understand", ocrConf: 0.88, feedback: "Lists differences but no complexity analysis.", extracted: "Linked list insertion is easy, array needs shifting of elements." },
        { q: "Q4", marks: 2, demonstrated: "Understand", ocrConf: 0.76, feedback: "No justification using fairness / FCFS.", extracted: "Queue is used because processes come one by one." }
      ],
      gaps: ["Applying operator precedence rules", "Justifying design choices with reasoning", "Complexity-based comparison"]
    },
    {
      id: "EV2", examId: "E1", studentId: "S202", status: "Approved",
      results: [
        { q: "Q1", marks: 5, demonstrated: "Remember", ocrConf: 0.95, feedback: "Complete.", extracted: "Stack is LIFO. push, pop, peek, isEmpty, isFull." },
        { q: "Q2", marks: 5, demonstrated: "Apply", ocrConf: 0.9, feedback: "Correct conversion with steps.", extracted: "ABC*+" },
        { q: "Q3", marks: 4, demonstrated: "Analyze", ocrConf: 0.89, feedback: "Good; mention O(n) vs O(1).", extracted: "Array insertion requires shifting, linked list only pointer change." },
        { q: "Q4", marks: 3, demonstrated: "Understand", ocrConf: 0.84, feedback: "Partial justification.", extracted: "Queue gives FCFS order which is fair." }
      ],
      gaps: ["Evaluation-level reasoning"]
    }
  ]
};