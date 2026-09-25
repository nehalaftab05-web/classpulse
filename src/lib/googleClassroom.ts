import { Course, Assignment } from "../types/classroom";

export interface GoogleCourseRaw {
  id: string;
  name: string;
  section?: string;
  room?: string;
  descriptionHeading?: string;
  alternateLink?: string;
}

export interface GoogleCourseWorkRaw {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  alternateLink?: string;
  maxPoints?: number;
  workType?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
    seconds?: number;
  };
}

/**
 * Parses Google Classroom API coursework into our Assignment type
 */
export function parseGoogleCourseWork(
  item: GoogleCourseWorkRaw,
  course: Course
): Assignment {
  let dueDateIso = new Date(Date.now() + 86400000 * 3).toISOString();

  if (item.dueDate) {
    const year = item.dueDate.year;
    const month = (item.dueDate.month || 1) - 1; // 0-indexed in JS Date
    const day = item.dueDate.day || 1;
    const hours = item.dueTime?.hours || 23;
    const minutes = item.dueTime?.minutes || 59;
    dueDateIso = new Date(year, month, day, hours, minutes).toISOString();
  }

  return {
    id: `gcr-${item.id}`,
    courseId: course.id,
    courseCode: course.code,
    courseName: course.name,
    title: item.title,
    description: item.description || "Coursework synced from Google Classroom.",
    dueDate: dueDateIso,
    maxPoints: item.maxPoints || 100,
    status: "todo",
    type: item.workType === "MULTIPLE_CHOICE_QUESTION" ? "quiz" : "assignment",
    submissionUrl: item.alternateLink || `https://classroom.google.com/c/${course.id}`,
    estimatedHours: 3,
  };
}

/**
 * Fetches all courses and coursework from the live Google Classroom REST API using an OAuth access token
 */
export async function fetchLiveGoogleClassroom(accessToken: string): Promise<{
  courses: Course[];
  assignments: Assignment[];
}> {
  // 1. Fetch active courses
  const coursesResponse = await fetch(
    "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!coursesResponse.ok) {
    const err = await coursesResponse.json();
    throw new Error(err.error?.message || "Failed to fetch Google Classroom courses");
  }

  const coursesData = await coursesResponse.json();
  const rawCourses: GoogleCourseRaw[] = coursesData.courses || [];

  const parsedCourses: Course[] = rawCourses.map((c, index) => {
    const colors = [
      "bg-purple-50 text-purple-950 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/60",
      "bg-sky-50 text-sky-950 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/60",
      "bg-cyan-50 text-cyan-950 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-800/60",
      "bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60",
      "bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60",
      "bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60",
    ];

    return {
      id: c.id,
      code: c.section || `CS-${c.name.split(" ")[0]}`,
      name: c.name,
      section: c.section || "BCS-5E",
      room: c.room || "Google Classroom",
      instructor: c.descriptionHeading || "FAST-NU Faculty",
      color: colors[index % colors.length],
      alternateLink: c.alternateLink,
      meetLink: c.alternateLink,
      description: `Official course synced from Google Classroom.`,
    };
  });

  // 2. Fetch coursework for each course
  const allAssignments: Assignment[] = [];

  for (const course of parsedCourses) {
    try {
      const cwResponse = await fetch(
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (cwResponse.ok) {
        const cwData = await cwResponse.json();
        const rawItems: GoogleCourseWorkRaw[] = cwData.courseWork || [];
        for (const item of rawItems) {
          allAssignments.push(parseGoogleCourseWork(item, course));
        }
      }
    } catch (err) {
      console.warn(`Could not fetch coursework for course ${course.id}:`, err);
    }
  }

  return {
    courses: parsedCourses,
    assignments: allAssignments,
  };
}
