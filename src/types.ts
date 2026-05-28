/**
 * Types & Interfaces for AI Online Learning & Course Recommendation Platform
 */

export enum UserRole {
  STUDENT = "Student",
  INSTRUCTOR = "Instructor",
  ADMIN = "Admin",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  instructorName: string;
  rating: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string; // e.g. "8 hours"
  lessonsCount: number;
  thumbnail: string;
  tags: string[]; // for content-based TF-IDF recommendations
  enrollmentsCount: number;
  isApproved: boolean; // managed by Admin
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string; // e.g. "12:45"
  videoUrl: string; // embedded YouTube identifier or standard format
  content: string; // markdown body transcript or summary
  orderIndex: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedLessons: string[]; // array of completed lesson IDs
  progress: number; // 0 to 100
  completedAt?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  hash: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon identifier
  unlockedAt: string;
}

export interface UserProfileStats {
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate?: string;
  badges: Badge[];
  skills: { [key: string]: number }; // skill name -> proficiency level 0-100
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl: string;
  role: UserRole;
  xp: number;
  level: number;
  streakDays: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  quizContext?: {
    question: QuizQuestion;
    explanationRequested?: boolean;
  };
}

export interface RoadmapStep {
  id: string;
  title: string;
  duration: string;
  skillsCovered: string[];
  explanation: string;
  recommendedCourseId?: string;
}

export interface ResumeAnalysisResult {
  skillsFound: string[];
  missingSkills: string[];
  recommendedCourseIds: string[];
  roadmap: RoadmapStep[];
}

export interface RecommendationAnalytics {
  totalCourses: number;
  metrics: {
    contentBasedMatchRate: number; // percentage
    collaborativeMatchRate: number; // percentage
    skillGapMatchRate: number; // percentage
  };
  recommendations: {
    carouselType: "personalized" | "trending" | "skillGap" | "collaborative" | "historyBased";
    explanation: string;
    courseIds: string[];
  }[];
}
