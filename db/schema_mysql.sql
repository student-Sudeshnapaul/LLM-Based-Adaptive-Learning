SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS knowledge_gaps, evaluations, script_pages, answer_scripts,
  questions, exams, course_outcomes, students, teacher_assignments, subjects, teachers;
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE teachers (
  id            VARCHAR(10) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password      VARCHAR(100) NOT NULL,          
  department    VARCHAR(20) NOT NULL,
  designation   VARCHAR(60),
  phone         VARCHAR(20)
);

CREATE TABLE subjects (
  code       VARCHAR(10) PRIMARY KEY,
  title      VARCHAR(120) NOT NULL,
  department VARCHAR(20) NOT NULL,
  year       INT CHECK (year BETWEEN 1 AND 4),
  semester   INT CHECK (semester BETWEEN 1 AND 8)
);

CREATE TABLE teacher_assignments (
  teacher_id   VARCHAR(10),
  subject_code VARCHAR(10),
  PRIMARY KEY (teacher_id, subject_code),
  FOREIGN KEY (teacher_id)   REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE
);

CREATE TABLE students (
  id         VARCHAR(10) PRIMARY KEY,
  roll       VARCHAR(20) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  department VARCHAR(20) NOT NULL,
  year       INT CHECK (year BETWEEN 1 AND 4)
);

CREATE TABLE course_outcomes (
  subject_code VARCHAR(10),
  co           VARCHAR(10),
  description  TEXT,
  PRIMARY KEY (subject_code, co),
  FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE
);

CREATE TABLE exams (
  id                 VARCHAR(10) PRIMARY KEY,
  subject_code       VARCHAR(10),
  name               VARCHAR(100) NOT NULL,
  exam_date          DATE,
  max_marks          INT,
  question_paper_url TEXT,
  created_by         VARCHAR(10),
  FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE,
  FOREIGN KEY (created_by)   REFERENCES teachers(id)
);

CREATE TABLE questions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  exam_id        VARCHAR(10),
  q_no           VARCHAR(5) NOT NULL,
  text           TEXT NOT NULL,
  marks          INT NOT NULL,
  co             VARCHAR(10),
  bloom_required VARCHAR(20),
  model_answer   TEXT,
  UNIQUE (exam_id, q_no),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE answer_scripts (
  id          VARCHAR(10) PRIMARY KEY,
  exam_id     VARCHAR(10),
  student_id  VARCHAR(10),
  status      VARCHAR(20) DEFAULT 'Uploaded',   -- Uploaded / OCR / Evaluating / Pending Review / Approved
  uploaded_by VARCHAR(10),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  UNIQUE (exam_id, student_id),
  FOREIGN KEY (exam_id)     REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id)  REFERENCES students(id),
  FOREIGN KEY (uploaded_by) REFERENCES teachers(id)
);

CREATE TABLE script_pages (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  script_id VARCHAR(10),
  page_no   INT,
  file_url  TEXT,
  FOREIGN KEY (script_id) REFERENCES answer_scripts(id) ON DELETE CASCADE
);

CREATE TABLE evaluations (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  script_id          VARCHAR(10),
  q_no               VARCHAR(5) NOT NULL,
  extracted_text     TEXT,
  ocr_confidence     FLOAT,
  ai_marks           FLOAT,
  final_marks        FLOAT NULL,                 -- teacher-edited; NULL until reviewed
  bloom_demonstrated VARCHAR(20),
  feedback           TEXT,
  UNIQUE (script_id, q_no),
  FOREIGN KEY (script_id) REFERENCES answer_scripts(id) ON DELETE CASCADE
);

CREATE TABLE knowledge_gaps (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  script_id VARCHAR(10),
  co        VARCHAR(10),
  concept   TEXT NOT NULL,
  severity  VARCHAR(10) CHECK (severity IN ('Low','Medium','High')),
  FOREIGN KEY (script_id) REFERENCES answer_scripts(id) ON DELETE CASCADE
);

-- ---------- DEMO DATA ----------
INSERT INTO teachers VALUES
('T001','Dr. Ananya Sen', 'ananya.sen@college.edu', 'demo123'      ,'CSE', 'Associate Professor','+91 98300 11111'),
('T002','Prof. Rahul Das','rahul.das@college.edu',  'demo123'      ,'AIML','Assistant Professor','+91 98300 22222'),
('T003','Dr. Priya Ghosh','priya.ghosh@college.edu','demo123'      ,'ECE', 'Professor',          '+91 98300 33333');

INSERT INTO subjects VALUES
('CS101','Programming in C',            'CSE', 1,1),
('CS301','Data Structures',             'CSE', 2,3),
('AI501','Machine Learning',            'AIML',3,5),
('AI602','Deep Learning',               'AIML',3,6),
('AI701','Natural Language Processing', 'AIML',4,7),
('EC201','Basic Electronics',           'ECE', 1,2),
('EC401','Signals & Systems',           'ECE', 2,4);

INSERT INTO teacher_assignments VALUES
('T001','CS101'),('T001','CS301'),('T001','AI501'),
('T002','AI602'),('T002','AI701'),
('T003','EC201'),('T003','EC401');

INSERT INTO students VALUES
('S101','CSE/24/01','Arjun Roy',  'CSE', 1),('S102','CSE/24/02','Meera Paul', 'CSE', 1),
('S201','CSE/23/01','Sourav Dey', 'CSE', 2),('S202','CSE/23/02','Riya Saha',  'CSE', 2),
('S301','AIML/22/01','Kunal Mitra','AIML',3),('S302','AIML/22/02','Tanya Bose','AIML',3),
('S401','AIML/21/01','Ishaan Kar', 'AIML',4),
('S501','ECE/24/01','Pooja Nandi','ECE', 1),('S502','ECE/23/01','Aman Sharma','ECE', 2);

INSERT INTO course_outcomes VALUES
('CS101','CO1','Recall basic C syntax, data types and variables'),
('CS101','CO2','Write C programs using control structures'),
('CS101','CO3','Analyze the behaviour of loops and conditions'),
('CS301','CO1','Describe linear data structures and their operations'),
('CS301','CO2','Apply stacks and queues to solve problems'),
('CS301','CO3','Analyze and justify data-structure choices'),
('AI501','CO1','Understand core ML concepts'),
('AI501','CO2','Apply regression and classification models');

INSERT INTO exams VALUES
('E0','CS101','Class Test 1',  '2026-09-05',15,NULL,'T001'),
('E1','CS301','Mid-Sem Test 1','2026-09-12',20,NULL,'T001'),
('E2','AI501','Class Test 1',  '2026-09-20',10,NULL,'T001');

INSERT INTO questions (exam_id,q_no,text,marks,co,bloom_required,model_answer) VALUES
('E0','Q1','What is a variable in C? Give an example.',5,'CO1','Remember','A named memory location that stores a value, e.g. int x = 10;'),
('E0','Q2','Write a C program to find the largest of three numbers.',5,'CO2','Apply','Read a, b, c; compare using if-else and print the largest.'),
('E0','Q3','Differentiate between while and do-while loops.',5,'CO3','Analyze','while checks the condition first; do-while runs the body at least once.'),
('E1','Q1','Define a stack and list its operations.',5,'CO1','Remember','LIFO structure; push, pop, peek, isEmpty, isFull.'),
('E1','Q2','Convert infix A+B*C to postfix using a stack.',5,'CO2','Apply','ABC*+ (multiplication has higher precedence).'),
('E1','Q3','Compare arrays and linked lists for insertion.',5,'CO3','Analyze','Array insertion O(n) due to shifting; linked list O(1) at a known node.'),
('E1','Q4','Justify the choice of a queue for CPU scheduling.',5,'CO3','Evaluate','FIFO order gives fairness (FCFS / round robin).'),
('E2','Q1','What is overfitting?',5,'CO1','Understand','Model fits training noise and generalizes poorly.'),
('E2','Q2','Apply linear regression to the given data.',5,'CO2','Apply','Compute slope and intercept by least squares and predict.');

INSERT INTO answer_scripts (id,exam_id,student_id,status,uploaded_by,approved_at) VALUES
('AS1','E1','S201','Pending Review','T001',NULL),
('AS2','E1','S202','Approved',      'T001',NOW()),
('AS3','E0','S101','Pending Review','T001',NULL);

INSERT INTO script_pages (script_id,page_no,file_url) VALUES
('AS1',1,'demo/AS1_p1.jpg'),('AS1',2,'demo/AS1_p2.jpg'),
('AS2',1,'demo/AS2_p1.jpg'),('AS3',1,'demo/AS3_p1.jpg');

INSERT INTO evaluations (script_id,q_no,extracted_text,ocr_confidence,ai_marks,final_marks,bloom_demonstrated,feedback) VALUES
('AS1','Q1','A stack is a LIFO data structure. Operations are push and pop and isEmpty.',0.93,4,NULL,'Remember','Correct definition; missed peek.'),
('AS1','Q2','AB+C* is the postfix form.',0.81,2,NULL,'Remember','Operator precedence applied incorrectly.'),
('AS1','Q3','Linked list insertion is easy, array needs shifting of elements.',0.88,3,NULL,'Understand','Lists differences but no complexity analysis.'),
('AS1','Q4','Queue is used because processes come one by one.',0.76,2,NULL,'Understand','No justification using fairness / FCFS.'),
('AS2','Q1','Stack is LIFO. push, pop, peek, isEmpty, isFull.',0.95,5,5,'Remember','Complete.'),
('AS2','Q2','ABC*+',0.90,5,5,'Apply','Correct conversion with steps.'),
('AS2','Q3','Array insertion requires shifting, linked list only pointer change.',0.89,4,4,'Analyze','Good; mention O(n) vs O(1).'),
('AS2','Q4','Queue gives FCFS order which is fair.',0.84,3,3,'Understand','Partial justification.'),
('AS3','Q1','Variable is a name given to memory. int a = 5;',0.91,4,NULL,'Remember','Correct with example.'),
('AS3','Q2','if a>b and a>c print a else if b>c print b else print c',0.79,3,NULL,'Apply','Logic correct but not a complete program.'),
('AS3','Q3','while loop checks condition. do while also checks.',0.72,1,NULL,'Remember','Missed that do-while runs at least once.');

INSERT INTO knowledge_gaps (script_id,co,concept,severity) VALUES
('AS1','CO2','Applying operator precedence rules','High'),
('AS1','CO3','Justifying design choices with reasoning','Medium'),
('AS1','CO3','Complexity-based comparison','Medium'),
('AS2','CO3','Evaluation-level reasoning','Low'),
('AS3','CO3','Difference between entry- and exit-controlled loops','High'),
('AS3','CO2','Writing complete programs (headers, main, I/O)','Medium');