/**
 * Master Express Server with Integrated Google Gemini AI API Client
 * Orchestrates API routes, mathematical recommendations, and dev Vite middleware.
 */
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { db, awardProgressAction, getLeaderboard } from "./server/db";
import {
  getHybridRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getSkillGapRecommendations
} from "./server/recommender";
import { createServer as createViteServer } from "vite";
import { Course, Lesson, Enrollment, UserRole, UserProfileStats, RoadmapStep, Badge, Quiz, Certificate } from "./src/types";

// Load Environment Configuration
dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON limits for rich resume text payloads
app.use(express.json({ limit: "15mb" }));

// Local reference for tracking active user session (simulated switching)
let activeUserId = "std-1";

// Safe Lazy-Initialization for Google Gemini SDK. Prevents server crashing if api key is missing on first start.
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      throw new Error(
        "GEMINI_API_KEY is not configured in environment variables. Please set it in Settings > Secrets."
      );
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Ensure database profile exists for custom guest user
function ensureUserProfile(userId: string) {
  if (!db.stats[userId]) {
    db.stats[userId] = {
      userId,
      xp: 0,
      level: 1,
      streakDays: 1,
      lastActiveDate: new Date().toISOString(),
      badges: [],
      skills: {},
    };
  }
}

// ----------------------------------------------------
// AUTHENTICATION & ROLE APIs
// ----------------------------------------------------

/**
 * Get active user session details
 */
app.get("/api/auth/session", (req, res) => {
  const user = db.users.find(u => u.id === activeUserId);
  if (!user) {
    return res.status(404).json({ error: "User session not found" });
  }
  ensureUserProfile(user.id);
  res.json({ user, stats: db.stats[user.id] });
});

/**
 * Switch session role dynamically (Student / Instructor / Admin) for testing
 */
app.post("/api/auth/switch-role", (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "Role is required" });

  const targetUser = db.users.find(u => u.role === role);
  if (targetUser) {
    activeUserId = targetUser.id;
    ensureUserProfile(targetUser.id);
    return res.json({ success: true, user: targetUser, stats: db.stats[targetUser.id] });
  }
  res.status(404).json({ error: `User with role ${role} not set up` });
});

// ----------------------------------------------------
// COURSE CATALOG & INSTRUCTOR APIS
// ----------------------------------------------------

/**
 * Get approved or all courses matching filter query
 */
app.get("/api/courses", (req, res) => {
  const { category, difficulty, search, all } = req.query;
  const user = db.users.find(u => u.id === activeUserId);
  
  // Administrators and Instructors can view unapproved courses
  const showUnapproved = all === "true" || (user && user.role !== UserRole.STUDENT);
  
  let courses = db.courses;
  if (!showUnapproved) {
    courses = courses.filter(c => c.isApproved);
  }

  // Search filtering
  if (search) {
    const term = String(search).toLowerCase();
    courses = courses.filter(
      c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.tags.some(t => t.toLowerCase().includes(term))
    );
  }

  // Category filtering
  if (category) {
    courses = courses.filter(c => c.category === String(category));
  }

  // Difficulty filtering
  if (difficulty) {
    courses = courses.filter(c => c.difficulty === String(difficulty));
  }

  res.json(courses);
});

/**
 * Create a new course catalog outline (Instructor role action)
 */
app.post("/api/courses", (req, res) => {
  const user = db.users.find(u => u.id === activeUserId);
  if (!user || user.role !== UserRole.INSTRUCTOR) {
    return res.status(403).json({ error: "Only instructors can submit courses." });
  }

  const { title, description, category, difficulty, duration, longDescription, tags } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required fields" });
  }

  const newCourse: Course = {
    id: `course-${Date.now()}`,
    title,
    description,
    longDescription: longDescription || description,
    category: category || "General Tech",
    instructorName: user.name,
    rating: 5.0,
    difficulty: difficulty || "Beginner",
    duration: duration || "5 hours",
    lessonsCount: 0,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    tags: tags ? tags.map((t: string) => t.trim().toLowerCase()) : ["general"],
    enrollmentsCount: 0,
    isApproved: false, // pending admin review
    createdAt: new Date().toISOString(),
  };

  db.courses.push(newCourse);
  res.status(201).json(newCourse);
});

/**
 * Approve a pending course submission (Admin role action)
 */
app.post("/api/courses/:id/approve", (req, res) => {
  const user = db.users.find(u => u.id === activeUserId);
  if (!user || user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin credentials required." });
  }

  const courseId = req.params.id;
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  course.isApproved = true;
  res.json({ success: true, course });
});

/**
 * Fetch specifications of a single course
 */
app.get("/api/courses/:id", (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

/**
 * Fetch lesson syllabi inside a course
 */
app.get("/api/courses/:id/lessons", (req, res) => {
  const lessons = db.lessons.filter(l => l.courseId === req.params.id);
  res.json(lessons.sort((a,b) => a.orderIndex - b.orderIndex));
});

/**
 * Upload lesson content into a course (Instructor action)
 */
app.post("/api/courses/:id/lessons", (req, res) => {
  const user = db.users.find(u => u.id === activeUserId);
  if (!user || user.role !== UserRole.INSTRUCTOR) {
    return res.status(403).json({ error: "Access denied. Instructor permissions required." });
  }

  const courseId = req.params.id;
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const { title, duration, content, videoUrl } = req.body;
  if (!title) return res.status(400).json({ error: "Lesson title is required" });

  const currentLessons = db.lessons.filter(l => l.courseId === courseId);
  const nextOrderIdx = currentLessons.length + 1;

  const newLesson: Lesson = {
    id: `lesson-${courseId}-${nextOrderIdx}`,
    courseId,
    title,
    duration: duration || "10:00",
    content: content || "Sample theory transcript details",
    videoUrl: videoUrl || "T8_A6f6g9lI", // fallback placeholder identifier
    orderIndex: nextOrderIdx
  };

  db.lessons.push(newLesson);
  course.lessonsCount = nextOrderIdx; // update counter
  res.status(201).json(newLesson);
});

// ----------------------------------------------------
// STUDENT PORTAL & PROGRESS TRACKING APIs
// ----------------------------------------------------

/**
 * Fetch all enrollments for active user
 */
app.get("/api/enrollments", (req, res) => {
  const enrolls = db.enrollments.filter(e => e.userId === activeUserId);
  res.json(enrolls);
});

/**
 * Enroll student into a course
 */
app.post("/api/enrollments", (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: "Course ID is required" });

  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  // Prevent double enrollments
  const existing = db.enrollments.find(e => e.userId === activeUserId && e.courseId === courseId);
  if (existing) return res.json(existing);

  const newEnrollment: Enrollment = {
    id: `enr-${Date.now()}`,
    userId: activeUserId,
    courseId,
    enrolledAt: new Date().toISOString(),
    completedLessons: [],
    progress: 0
  };

  db.enrollments.push(newEnrollment);
  course.enrollmentsCount += 1;

  // Trigger Badge check for "Scholar" (3 enrollments) or "First Steps" (1 enrollment)
  ensureUserProfile(activeUserId);
  const userStats = db.stats[activeUserId];
  
  let unlockedBadge: Badge | undefined;
  if (userStats.badges.length === 0) {
    unlockedBadge = {
      id: "badge-first-move",
      title: "First Steps",
      description: "Took the initiative and enrolled in your very first skill syllabus!",
      icon: "Sparkles",
      unlockedAt: new Date().toISOString(),
    };
    userStats.badges.push(unlockedBadge);
    userStats.xp += 100;
  } else {
    // Check Scholar achievement
    const actionResults = awardProgressAction(activeUserId, courseId, true);
    unlockedBadge = actionResults.unlockedBadge;
  }

  res.status(201).json({ enrollment: newEnrollment, unlockedBadge });
});

/**
 * Complete a lesson. Graded action updating XP, levels, strengths and creating certificate if course finishes!
 */
app.post("/api/lessons/:id/complete", (req, res) => {
  const lessonId = req.params.id;
  const lesson = db.lessons.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  const enrolment = db.enrollments.find(e => e.userId === activeUserId && e.courseId === lesson.courseId);
  if (!enrolment) {
    return res.status(400).json({ error: "User is not enrolled in this course" });
  }

  ensureUserProfile(activeUserId);
  const userStats = db.stats[activeUserId];

  let lessonEarnedAlready = enrolment.completedLessons.includes(lessonId);
  let newlyFinishedCourse = false;
  let certificate: Certificate | undefined;

  if (!lessonEarnedAlready) {
    enrolment.completedLessons.push(lessonId);
    
    // Recalculate progress percentage
    const syllabusLessonsCount = db.lessons.filter(l => l.courseId === lesson.courseId).length;
    enrolment.progress = Math.round((enrolment.completedLessons.length / Math.max(1, syllabusLessonsCount)) * 100);

    // If completed is 100%, mint graduation certificate!
    if (enrolment.progress === 100 && !enrolment.completedAt) {
      enrolment.completedAt = new Date().toISOString();
      newlyFinishedCourse = true;

      // Mint a real certificate unique token
      const course = db.courses.find(c => c.id === lesson.courseId);
      certificate = {
        id: `cert-${Date.now()}`,
        userId: activeUserId,
        userName: db.users.find(u => u.id === activeUserId)?.name || "Graduated Student",
        courseId: lesson.courseId,
        courseTitle: course?.title || "Technology Graduate Course",
        issuedAt: new Date().toISOString(),
        hash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-EDUAI`
      };
      db.certificates.push(certificate);

      // Award course completion XP boost!
      userStats.xp += 150;
    }
  }

  // Trigger gamification updates
  const { xpGain, unlockedBadge, newLevel } = awardProgressAction(activeUserId, lesson.courseId);

  // Update specific skills dynamically based on course tags
  const course = db.courses.find(c => c.id === lesson.courseId);
  if (course) {
    // Elevate skills associated with the course
    course.tags.forEach(t => {
      const skillName = t.charAt(0).toUpperCase() + t.slice(1);
      const currentVal = userStats.skills[skillName] || 0;
      userStats.skills[skillName] = Math.min(100, currentVal + 10); // increment proficiency
    });
  }

  // Maintain Learning Streaks
  const today = new Date().toISOString().split("T")[0];
  if (userStats.lastActiveDate !== today) {
    userStats.streakDays += 1;
    userStats.lastActiveDate = today;
  }

  res.json({
    success: true,
    progress: enrolment.progress,
    xpGain,
    newXp: userStats.xp,
    newLevel,
    unlockedBadge,
    certificate,
    finished: newlyFinishedCourse
  });
});

/**
 * Access individual credentials certificates
 */
app.get("/api/certificates", (req, res) => {
  const userCerts = db.certificates.filter(c => c.userId === activeUserId);
  res.json(userCerts);
});

// ----------------------------------------------------
// RECOMMENDATION ALGORITHMIC AGGREGATOR
// ----------------------------------------------------

/**
 * Compile customized student feeds based on multi-tier recommendation matrices
 */
app.get("/api/recommendations", (req, res) => {
  ensureUserProfile(activeUserId);

  // 1. Personalized (Hybrid Score)
  const personalized = getHybridRecommendations(activeUserId, 3);
  
  // 2. Content-Based (Based on watched)
  const contentBased = getContentBasedRecommendations(activeUserId, 3);

  // 3. Collaborative (Peers are learning)
  const collaborative = getCollaborativeRecommendations(activeUserId, 3);

  // 4. Popular (Trending)
  const trending = db.courses.filter(c => c.isApproved).sort((a,b) => b.enrollmentsCount - a.enrollmentsCount).slice(0, 3);

  res.json({
    personalized,
    contentBased,
    collaborative,
    trending
  });
});

// ----------------------------------------------------
// LEADERBOARDS & MULTI-USER ENGAGEMENT
// ----------------------------------------------------

app.get("/api/leaderboard", (req, res) => {
  res.json(getLeaderboard());
});

// ----------------------------------------------------
// DYNAMIC ANALYTICS APIs
// ----------------------------------------------------

app.get("/api/analytics/dashboard", (req, res) => {
  const enrollments = db.enrollments;
  const courses = db.courses;
  const user = db.users.find(u => u.id === activeUserId);

  if (user && user.role === UserRole.ADMIN) {
    // Calculate global admin stats
    const totalUsers = db.users.length;
    const totalCourses = db.courses.length;
    const totalEnrollments = db.enrollments.length;
    const totalXP = Object.values(db.stats).reduce((acc, curr) => acc + curr.xp, 0);

    // Dynamic Monthly Enrollments Chart points
    const monthlyEngagements = [
      { month: "Jan", enrollments: 120, certificates: 5 },
      { month: "Feb", enrollments: 210, certificates: 15 },
      { month: "Mar", enrollments: 340, certificates: 22 },
      { month: "Apr", enrollments: 490, certificates: 55 },
      { month: "May", enrollments: enrollments.length + 580, certificates: db.certificates.length + 80 }
    ];

    return res.json({
      role: "Admin",
      cards: [
        { title: "Total Members", value: totalUsers, change: "+24% quarterly", type: "users" },
        { title: "Syllabi Catalog", value: totalCourses, change: "Pending approve: " + db.courses.filter(c => !c.isApproved).length, type: "courses" },
        { title: "Total Enrollments", value: totalEnrollments, change: "Highly active in May", type: "trends" },
        { title: "Platform Hub XP", value: totalXP, change: "Dynamic level-ups", type: "stats" }
      ],
      monthlyEngagements
    });
  }

  if (user && user.role === UserRole.INSTRUCTOR) {
    // Instructor dashboard stats
    const instructorName = user.name;
    const myCourses = db.courses.filter(c => c.instructorName === instructorName);
    const myCourseIds = myCourses.map(c => c.id);
    const totalStudents = myCourses.reduce((sum, curr) => sum + curr.enrollmentsCount, 0);
    const totalLessons = db.lessons.filter(l => myCourseIds.includes(l.courseId)).length;

    const coursePerformance = myCourses.map(c => ({
      name: c.title.substring(0, 15) + "...",
      enrollments: c.enrollmentsCount,
      rating: c.rating
    }));

    return res.json({
      role: "Instructor",
      cards: [
        { title: "My Curriculums", value: myCourses.length, change: "Active & approved", type: "courses" },
        { title: "Total Students Impacted", value: totalStudents, change: "Active audience", type: "users" },
        { title: "Syllabus Modules", value: totalLessons, change: "Highly instructional", type: "lessons" },
        { title: "Instructor Rating", value: 4.88, change: "Top tier feedback", type: "rating" }
      ],
      coursePerformance
    });
  }

  // Default Standard Student stats dashboard
  ensureUserProfile(activeUserId);
  const myStats = db.stats[activeUserId];
  const userEnrolls = db.enrollments.filter(e => e.userId === activeUserId);
  const totalCompleted = userEnrolls.filter(e => e.progress === 100).length;

  res.json({
    role: "Student",
    cards: [
      { title: "Profile XP Gain", value: myStats.xp, change: `Rank: Level ${myStats.level}`, type: "xp" },
      { title: "Daily Run Streak", value: `${myStats.streakDays} Days`, change: "Keep learning!", type: "streak" },
      { title: "Enrolled", value: userEnrolls.length, change: "In active training", type: "enroll" },
      { title: "Graduations", value: totalCompleted, change: `${db.certificates.filter(c => c.userId === activeUserId).length} Credentials`, type: "completion" }
    ],
    skills: Object.keys(myStats.skills).map(name => ({
      name,
      proficiency: myStats.skills[name]
    }))
  });
});

// ----------------------------------------------------
// DYNAMIC AI WORKFLOW ENDPOINTS (GEMINI HUB)
// ----------------------------------------------------

/**
 * Chat Support Assistant endpoints. Contextualized tutoring.
 */
app.post("/api/ai/chat", async (req, res) => {
  const { message, history, lessonId } = req.body;
  if (!message) return res.status(400).json({ error: "User message is empty." });

  let lessonScope = "";
  if (lessonId) {
    const lesson = db.lessons.find(l => l.id === lessonId);
    const course = db.courses.find(c => c.id === lesson?.courseId);
    if (lesson && course) {
      lessonScope = `The user is currently studying the lesson "${lesson.title}" in the course "${course.title}". 
The transcript/summary of this lesson states: "${lesson.content}". Focus your answer inside this education scope.`;
    }
  }

  try {
    const ai = getGeminiClient();

    // Standardize conversational logs
    const convoLogs = history && Array.isArray(history) 
      ? history.map((m: any) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n") 
      : "";

    const systemPrompt = `You are a friendly, highly concise EdTech AI Learning Assistant and tutor holding dual master's degrees in Computer Science and Software Engineering.
Always prioritize providing simple, clear definitions with correct code syntax where applicable. Keep responses under 150 words to avoid interface scrolling stress.
${lessonScope}`;

    const prompt = `Conversational Logs so far:\n${convoLogs}\n\nUser Question:\n${message}\n\nExplain mathematically and instructively:`;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt
      }
    });

    const aiMessage = chatResponse.text || "I was unable to structure an explanation at this moment.";
    res.json({ text: aiMessage });
  } catch (error: any) {
    console.error("Gemini Chat Tutoring Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Quiz Generator Endpoint. Compiles 3 multiple-choice questions with answers dynamically based on syllabus!
 */
app.post("/api/ai/quiz", async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) return res.status(400).json({ error: "Lesson ID is required" });

  const lesson = db.lessons.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found in index" });

  // If we already have configured static quiz in database, retrieve that to save prompt budget
  const existingQuiz = db.quizzes.find(q => q.lessonId === lessonId);
  if (existingQuiz) return res.json(existingQuiz);

  try {
    const ai = getGeminiClient();

    const systemPrompt = `You are a professional EdTech Quiz Architect. Generate exactly 2 or 3 distinct technical multiple-choice questions testing concepts discussed in the provided text.
Include exactly 4 believable and structurally varied options of which ONLY ONE is correct. Write an encouraging, highly instructional explanation detailing the core reasoning behind the correct match.`;

    const targetContext = `Lesson Title: "${lesson.title}"
Lesson Transcript Theory Details: "${lesson.content}"`;

    const quizSchema = {
      type: Type.ARRAY,
      description: "List of multiple choice quiz questions",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Clear conceptual multiple-choice question testing the core lesson topic." },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 4 unique, structurally plausible alternative option answers."
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Zero-based index of the single correct option." },
          explanation: { type: Type.STRING, description: "Highly educational breakdown of the answer which explains clearly why the correct option is the accurate selection." }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Based on this lesson topic, output a multiple choice quiz:\n${targetContext}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: quizSchema
      }
    });

    const parsedQuestions = JSON.parse(response.text || "[]");

    const createdQuiz: Quiz = {
      id: `quiz-gen-${Date.now()}`,
      courseId: lesson.courseId,
      lessonId: lessonId,
      title: `${lesson.title} - AI Generated Challenge`,
      questions: parsedQuestions
    };

    // Cache generated quizzes temporarily
    db.quizzes.push(createdQuiz);
    res.json(createdQuiz);
  } catch (err: any) {
    console.error("Quiz generation failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Resume Parsing, Skill Extraction, Skill Gap analysis and customized Roadmap generator
 */
app.post("/api/ai/resume", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || resumeText.trim().length === 0) {
    return res.status(400).json({ error: "Resume text payload is empty." });
  }

  try {
    const ai = getGeminiClient();

    // Compile list of available courses to pass to Gemini
    const catalogBriefs = db.courses
      .filter(c => c.isApproved)
      .map(c => `ID: ${c.id}, Title: "${c.title}", Category: "${c.category}", Tags: [${c.tags.join(", ")}]`)
      .join("\n");

    const systemInstruction = `You are a high-fidelity HR Tech Talent Recruiter and career adviser. Analyze the applicant's resume.
1. Extract technical skillsets identified in the resume text.
2. Cross-reference them against modern engineering standards to identify missing core skills in modern fullstack, backend system architecture, databases, AI development, or design systems.
3. Suggest relevant matching courses purely from this exact provided pool catalog:
${catalogBriefs}
4. Compile an interactive 3-step learning milestone roadmap designed to bridge the gaps. Each roadmap step should match one of our course IDs from the selection if possible.`;

    const resumeSchemaPath = {
      type: Type.OBJECT,
      properties: {
        skillsFound: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Technical skills identified in the applicant's profile."
        },
        missingSkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Vital modern software engineering competencies missing from the profile."
        },
        recommendedCourseIds: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of matching Course IDs suggested specifically from our catalog IDs: course-1, course-2, course-3, course-4, course-5, course-6."
        },
        roadmap: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Milestone code name, e.g., 'm-1'" },
              title: { type: Type.STRING, description: "Clear action-based learning milestone title." },
              duration: { type: Type.STRING, description: "Estimated completion time, e.g. '2 weeks'" },
              skillsCovered: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific techniques taught in this phase." },
              explanation: { type: Type.STRING, description: "Highly precise summary of why they need this and what they will construct during this segment." },
              recommendedCourseId: { type: Type.STRING, description: "Associated matching Course ID (must be from: course-1, course-2, course-3, course-4, course-5, course-6)." }
            },
            required: ["id", "title", "duration", "skillsCovered", "explanation"]
          },
          description: "A structured 3-tier action learning path."
        }
      },
      required: ["skillsFound", "missingSkills", "recommendedCourseIds", "roadmap"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this resume and output structured skill diagnostics:\n\n${resumeText}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: resumeSchemaPath
      }
    });

    const diagnostics = JSON.parse(response.text || "{}");

    // Dynamic database update! Populate guest skills profile dynamically in memory using resume output content!
    ensureUserProfile(activeUserId);
    const userStats = db.stats[activeUserId];
    
    if (diagnostics.skillsFound && Array.isArray(diagnostics.skillsFound)) {
      diagnostics.skillsFound.forEach((s: string) => {
        const skillName = s.trim().charAt(0).toUpperCase() + s.trim().slice(1);
        if (!userStats.skills[skillName]) {
          userStats.skills[skillName] = 75; // set discovered skills level to intermediate
        }
      });
    }

    // Award XP boost for resume analysis completion milestone!
    userStats.xp += 100;
    
    // Check Scholar badge just in case this updates any states
    const awardResult = awardProgressAction(activeUserId, "none", true);

    res.json({
      diagnostics,
      unlockedBadge: awardResult.unlockedBadge,
      xpGain: 100
    });
  } catch (error: any) {
    console.error("Gemini Resume Analyzers Failures:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER & PRODUCTION MIDDLEWARE
// ----------------------------------------------------

async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with HMR routing handled by outer container proxy (port 3000)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve stable static assets from the compiled production build
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduAI Server successfully established at http://0.0.0.0:${PORT}`);
  });
}

bootServer().catch(err => {
  console.error("Server boot orchestration sequence crashed:", err);
});
