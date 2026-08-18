import studentsRaw from './studentsData.json';

export interface StudentInfo {
  studentId: string;
  fullName: string;
  gradeRoom: string;
  studentNumber: string;
}

const studentsDatabase: Record<
  string,
  { name: string; gradeRoom: string; number: string }
> = studentsRaw;

/**
 * Instant O(1) lookup student info by Student ID (เลขประจำตัวนักเรียน 5 หลัก)
 */
export function findStudentById(studentId: string): {
  found: boolean;
  student?: StudentInfo;
} {
  if (!studentId) return { found: false };

  const cleanId = studentId.trim();
  const match = studentsDatabase[cleanId];

  if (match) {
    return {
      found: true,
      student: {
        studentId: cleanId,
        fullName: match.name,
        gradeRoom: match.gradeRoom,
        studentNumber: match.number,
      },
    };
  }

  return { found: false };
}

/**
 * Get total student count
 */
export function getTotalStudentsCount(): number {
  return Object.keys(studentsDatabase).length;
}
