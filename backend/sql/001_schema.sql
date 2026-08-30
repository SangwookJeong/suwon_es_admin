-- 수원교회 청년부 성도관리 시스템 - 스키마

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(50) NOT NULL,
  department VARCHAR(30) NOT NULL,
  position VARCHAR(30) NOT NULL DEFAULT '',
  assigned_class VARCHAR(30) NOT NULL DEFAULT '',
  extra_role VARCHAR(50) NOT NULL DEFAULT '',
  contact VARCHAR(20) NOT NULL DEFAULT '',
  service_group VARCHAR(20) NOT NULL DEFAULT '',
  bs ENUM('B', 'S') NOT NULL,
  occupation VARCHAR(20) NOT NULL DEFAULT '',
  salvation_birthday VARCHAR(20) NOT NULL DEFAULT '',
  avatar VARCHAR(255) NOT NULL DEFAULT '',
  status ENUM('현직', '휴직', '퇴직', '전배') NOT NULL DEFAULT '현직',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_teachers_department (department),
  INDEX idx_teachers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  year INT NOT NULL,
  department VARCHAR(30) NOT NULL,
  position VARCHAR(30) NOT NULL DEFAULT '',
  assigned_class VARCHAR(30) NOT NULL DEFAULT '',
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_service_history_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 출석 체크: 행이 존재하면 해당 (teacher, date, type)에 출석한 것으로 간주
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  date DATE NOT NULL,
  type ENUM('주일오전', '주일오후', '교사교육') NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_attendance (teacher_id, date, type),
  INDEX idx_attendance_date_type (date, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  -- 아이디(username)만으로 로그인할 수 있도록 email 은 선택 항목입니다.
  -- MySQL/MariaDB 의 UNIQUE 는 NULL 중복을 허용합니다.
  email VARCHAR(100) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  teacher_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 학생 명부.
-- 학년/반(grade, class_no)이 곧 분반이고, 담당 분반선생님은 별도로 저장하지 않습니다.
-- teachers.assigned_class 가 '1-1반' 형태로 분반을 이미 들고 있어서,
-- 조회 시점에 CONCAT(grade,'-',class_no,'반') 로 이어 붙여 찾습니다.
-- (교사 인사이동이 있어도 학생 데이터를 손댈 필요가 없습니다)
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(50) NOT NULL,
  gender ENUM('남', '여') NOT NULL,
  grade TINYINT NOT NULL,
  class_no TINYINT NOT NULL,
  address VARCHAR(200) NOT NULL DEFAULT '',
  -- 학생 본인 연락처. 저학년은 없는 경우가 많아 빈 문자열을 허용합니다.
  contact VARCHAR(20) NOT NULL DEFAULT '',
  parent_name VARCHAR(50) NOT NULL DEFAULT '',
  parent_contact VARCHAR(20) NOT NULL DEFAULT '',
  parent_district VARCHAR(30) NOT NULL DEFAULT '',
  parent_salvation ENUM('구원', '미구원') NOT NULL DEFAULT '미구원',
  note VARCHAR(255) NOT NULL DEFAULT '',
  avatar VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_students_class (grade, class_no),
  INDEX idx_students_district (parent_district),
  INDEX idx_students_salvation (parent_salvation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 학생 출석 체크: 행이 존재하면 해당 (student, date, type)에 출석한 것으로 간주
-- 교사 출결(attendance)과 참조 대상 테이블이 달라 별도 테이블로 둡니다.
-- 학생 출석은 현재 '주일오전' 한 가지만 사용하지만, 추후 구분이 늘어날 수 있어 type을 남겨둡니다.
CREATE TABLE IF NOT EXISTS student_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  type ENUM('주일오전', '주일오후') NOT NULL DEFAULT '주일오전',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_student_attendance (student_id, date, type),
  INDEX idx_student_attendance_date_type (date, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
