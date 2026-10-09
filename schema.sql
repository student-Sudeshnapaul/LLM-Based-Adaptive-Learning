-- PostgreSQL schema + demo seed (same data as db.js)
CREATE TABLE teachers (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- store bcrypt hash, never plain text
  department VARCHAR(20) NOT NULL,
  designation VARCHAR(60),
  phone VARCHAR(20)
);

CREATE TABLE subjects (
  code VARCHAR(10) PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  department VARCHAR(20) NOT NULL,
  year INT CHECK (year BETWEEN 1 AND 4),
  semester INT CHECK (semester BETWEEN 1 AND 8)
);

CREATE TABLE teacher_assignments (
  teacher_id VARCHAR(10) REFERENCES teachers(id),
  subject_code VARCHAR(10) REFERENCES subjects(code),
  PRIMARY KEY (teacher_id, subject_code)
);

CREATE TABLE students (
  id VARCHAR(10) PRIMARY KEY,
  roll VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(20) NOT NULL,
  year INT
);

CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(10) REFERENCES subjects(code),
  name VARCHAR(100), exam_date DATE, max_marks INT,
  question_paper_url TEXT
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
  q_no VARCHAR(5), text TEXT, marks INT, co VARCHAR(10), bloom_required VARCHAR(20), model_answer TEXT
);

CREATE TABLE answer_scripts (
  id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES exams(id),
  student_id VARCHAR(10) REFERENCES students(id),
  status VARCHAR(20) DEFAULT 'Uploaded',      -- Uploaded/OCR/Evaluating/Pending Review/Approved
  uploaded_by VARCHAR(10) REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE script_pages (
  id SERIAL PRIMARY KEY,
  script_id INT REFERENCES answer_scripts(id) ON DELETE CASCADE,
  page_no INT, file_url TEXT
);

CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  script_id INT REFERENCES answer_scripts(id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(id),
  extracted_text TEXT, ocr_confidence REAL,
  ai_marks REAL, final_marks REAL,
  bloom_demonstrated VARCHAR(20), feedback TEXT
);

CREATE TABLE knowledge_gaps (
  id SERIAL PRIMARY KEY,
  script_id INT REFERENCES answer_scripts(id) ON DELETE CASCADE,
  co VARCHAR(10), concept TEXT, severity VARCHAR(10)
);

-- ===== SEED =====
-- password for all: demo123 (bcrypt hash generated in Python: bcrypt.hashpw(b"demo123", bcrypt.gensalt()))
INSERT INTO teachers VALUES
('T001','Dr. Ananya Sen','ananya.sen@college.edu','$2b$12$REPLACE_WITH_HASH','CSE','Associate Professor','+91 98300 11111'),
('T002','Prof. Rahul Das','rahul.das@college.edu','$2b$12$REPLACE_WITH_HASH','AIML','Assistant Professor','+91 98300 22222'),
('T003','Dr. Priya Ghosh','priya.ghosh@college.edu','$2b$12$REPLACE_WITH_HASH','ECE','Professor','+91 98300 33333');

INSERT INTO subjects VALUES
('CS101','Programming in C','CSE',1,1),('CS301','Data Structures','CSE',2,3),
('AI501','Machine Learning','AIML',3,5),('AI602','Deep Learning','AIML',3,6),
('AI701','Natural Language Processing','AIML',4,7),
('EC201','Basic Electronics','ECE',1,2),('EC401','Signals & Systems','ECE',2,4);

INSERT INTO teacher_assignments VALUES
('T001','CS101'),('T001','CS301'),('T001','AI501'),
('T002','AI602'),('T002','AI701'),('T003','EC201'),('T003','EC401');

INSERT INTO students VALUES
('S101','CSE/24/01','Arjun Roy','CSE',1),('S102','CSE/24/02','Meera Paul','CSE',1),
('S201','CSE/23/01','Sourav Dey','CSE',2),('S202','CSE/23/02','Riya Saha','CSE',2),
('S301','AIML/22/01','Kunal Mitra','AIML',3),('S302','AIML/22/02','Tanya Bose','AIML',3),
('S401','AIML/21/01','Ishaan Kar','AIML',4),('S501','ECE/24/01','Pooja Nandi','ECE',1),
('S502','ECE/23/01','Aman Sharma','ECE',2);
