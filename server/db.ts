/**
 * Simulated Production-Grade In-Memory Database for the learning platform
 */
import { Course, Lesson, Enrollment, Certificate, UserProfileStats, LeaderboardEntry, UserRole, User, Quiz, Badge } from "../src/types";

export interface DatabaseState {
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  stats: { [userId: string]: UserProfileStats };
  quizzes: Quiz[];
}

// Global state initialized in memory
export const db: DatabaseState = {
  users: [
    {
      id: "std-1",
      name: "Portfolio Guest User",
      email: "portfolio-guest@eduai.com",
      role: UserRole.STUDENT,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=portfolio-guest",
    },
    {
      id: "inst-1",
      name: "Dr. Sarah Mitchell",
      email: "sarah.m@eduai.com",
      role: UserRole.INSTRUCTOR,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=sarah",
    },
    {
      id: "admin-1",
      name: "System Administrator",
      email: "admin@eduai.com",
      role: UserRole.ADMIN,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=admin",
    },
  ],
  courses: [
    {
      id: "course-1",
      title: "Next.js 15 & React 19 Full-Stack Architecture",
      description: "Master modern web architectures: Server Components, Server Actions, streaming, partial pre-rendering, and advanced hooks like raw usage.",
      longDescription: "Deploy high-performance web modern systems using clean modularity. Learn to bridge the client-server boundary using state hydration, edge functions, and real-time streams with React 19.",
      category: "Web Development",
      instructorName: "Dr. Sarah Mitchell",
      rating: 4.8,
      difficulty: "Intermediate",
      duration: "10 hours",
      lessonsCount: 4,
      thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop&q=80",
      tags: ["next.js", "react", "typescript", "tailwind", "frontend", "full-stack", "framework"],
      enrollmentsCount: 1420,
      isApproved: true,
      createdAt: "2026-01-15T08:00:00Z",
    },
    {
      id: "course-2",
      title: "Mastering Machine Learning with Python & Scikit-Learn",
      description: "A mathematical and practical deep-dive into supervised, unsupervised learning, collaborative filtering, TF-IDF, and data pipelining.",
      longDescription: "Unlock predictive intelligence. Design end-to-end vector structures, evaluate classification models, build text extractors, and build custom collaborative filters from scratch.",
      category: "Artificial Intelligence",
      instructorName: "Dr. Sarah Mitchell",
      rating: 4.9,
      difficulty: "Advanced",
      duration: "15 hours",
      lessonsCount: 4,
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80",
      tags: ["python", "machine learning", "scikit-learn", "data science", "ai", "math"],
      enrollmentsCount: 2310,
      isApproved: true,
      createdAt: "2026-02-10T10:30:00Z",
    },
    {
      id: "course-3",
      title: "Advanced System Design and High-Scale Architectures",
      description: "Design fault-tolerant, resilient backends with container orchestration, Redis multi-tier caching, rate limiters, and SQL replication.",
      longDescription: "Learn what scales. We cover load balancers, caching topologies, API gateways, database sharding, and event-driven microservices designed to withstand millions of queries per second.",
      category: "Software Engineering",
      instructorName: "System Administrator",
      rating: 4.7,
      difficulty: "Advanced",
      duration: "12 hours",
      lessonsCount: 4,
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      tags: ["system design", "docker", "redis", "node.js", "express", "sql", "architecture", "scaling"],
      enrollmentsCount: 950,
      isApproved: true,
      createdAt: "2026-03-01T14:15:00Z",
    },
    {
      id: "course-4",
      title: "Hands-On Generative AI: Gemini API Integrations",
      description: "Build robust AI-powered applications. Leverage the @google/genai SDK, function calling, structured schemas, and multimodal interactions.",
      longDescription: "Learn to design rich pipelines using Gemini models. Implement content summarizers, automatic audio translations, real-time groundings, and advanced JSON-schema generators with ease.",
      category: "Artificial Intelligence",
      instructorName: "Dr. Sarah Mitchell",
      rating: 4.95,
      difficulty: "Intermediate",
      duration: "8 hours",
      lessonsCount: 4,
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
      tags: ["generative ai", "gemini", "prompt engineering", "ai", "api", "typescript"],
      enrollmentsCount: 3102,
      isApproved: true,
      createdAt: "2026-03-18T09:00:00Z",
    },
    {
      id: "course-5",
      title: "Tailwind CSS & Aesthetic Design Systems",
      description: "Craft modern, breathtaking landing pages. Study grid layouts, fluid typography, dark mode orchestration, glassmorphism, and responsive design.",
      longDescription: "UI design is about precision, contrast, and balance. Master high-performance design primitives and build beautiful interactive dashboards that look like stripe and linear.",
      category: "Design & Frontend",
      instructorName: "Portfolio Guest User",
      rating: 4.6,
      difficulty: "Beginner",
      duration: "6 hours",
      lessonsCount: 4,
      thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
      tags: ["tailwind", "frontend", "ui/ux", "web design", "css"],
      enrollmentsCount: 820,
      isApproved: true,
      createdAt: "2026-04-05T12:00:00Z",
    },
    {
      id: "course-6",
      title: "Threat Hunting: Practical Cyber Security Protocols",
      description: "Identify server breaches, secure express API endpoints, evaluate cross-origin constraints, audit logs, and practice penetration defenses.",
      longDescription: "Secure applications from top to bottom. Understand injection mitigations, CORS security vectors, session protection, JWT strategies, and modern cyber threat detection.",
      category: "Cyber Security",
      instructorName: "System Administrator",
      rating: 4.75,
      difficulty: "Intermediate",
      duration: "9 hours",
      lessonsCount: 4,
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      tags: ["cybersecurity", "security", "express", "node.js", "back-end"],
      enrollmentsCount: 540,
      isApproved: true,
      createdAt: "2026-04-20T16:45:00Z",
    }
  ],
  lessons: [
    // NextJS (course-1)
    {
      id: "lesson-1-1",
      courseId: "course-1",
      title: "Core Mechanics of React 19 Server Components",
      duration: "12:15",
      videoUrl: "_B33LgWd3e4",
      content: "Welcome to React Server Components (RSC). In this unit, we explore how RSC avoids client serialization. We analyze standard component rendering pipelines and study how Next.js routes streams directly in modern edge nodes. Server-side code does not ship to client bundles, allowing secure, fast queries.",
      orderIndex: 1,
    },
    {
      id: "lesson-1-2",
      courseId: "course-1",
      title: "Simplifying Mutations with Next.js Server Actions",
      duration: "15:40",
      videoUrl: "dDpZfOQZ_Mo",
      content: "Master form actions. In this lesson, we study server-client interfaces. We cover progressive enhancement, the transition hook `useTransition`, form statuses, optimistically changing client records via a secure network proxy, and validating payloads with robust schemas.",
      orderIndex: 2,
    },
    {
      id: "lesson-1-3",
      courseId: "course-1",
      title: "Streaming HTML & Partial Pre-rendering (PPR)",
      duration: "18:20",
      videoUrl: "T8_A6f6g9lI",
      content: "PPR represents the peak of edge layout. By combining static shells with dynamic islands, we bypass runtime loading screens. We study custom suspension boundaries, edge stream pipelines, and layout orchestration.",
      orderIndex: 3,
    },
    {
      id: "lesson-1-4",
      courseId: "course-1",
      title: "React 19 Core States and hydration tactics",
      duration: "21:10",
      videoUrl: "raw_react_19_hook",
      content: "Let's explore key native hooks: `use` for promise consumption, form-state handlers, hydration debugging, and standard micro-tasks that optimize final client bundles.",
      orderIndex: 4,
    },

    // Machine Learning (course-2)
    {
      id: "lesson-2-1",
      courseId: "course-2",
      title: "Linear Algebra & Gradient Descent Primitives",
      duration: "22:50",
      videoUrl: "GD_math_explained",
      content: "Build regression math from scratch. Learn standard cost functions, partial derivatives of weights, parameter updates, local minima pitfalls, and optimal convergence learning rates.",
      orderIndex: 1,
    },
    {
      id: "lesson-2-2",
      courseId: "course-2",
      title: "Implementing TF-IDF and Content Vectorizers",
      duration: "18:10",
      videoUrl: "tfidf_algorithm",
      content: "Calculate Term Frequency (TF) and Inverse Document Frequency (IDF). Convert text rows into numeric keyword feature tokens to build custom content-based recommenders.",
      orderIndex: 2,
    },
    {
      id: "lesson-2-3",
      courseId: "course-2",
      title: "Building Collaborative Similars with Jaccard & Cosine",
      duration: "24:30",
      videoUrl: "cosine_similarity",
      content: "Develop correlation matrices. Learn to evaluate user similarities based on multi-dimensional vectors (likes, logs, enrollments) to suggest courses B to user A based on user B's interaction data.",
      orderIndex: 3,
    },
    {
      id: "lesson-2-4",
      courseId: "course-2",
      title: "Validating with K-Fold Cross-Validation Matrix",
      duration: "15:15",
      videoUrl: "kfold_validation_metrics",
      content: "Avoid model overfitting. Study standard data partition ratios, performance estimators, Precision-Recall curves, F1-scores, and hyperparameters tuning.",
      orderIndex: 4,
    },

    // System Design (course-3)
    {
      id: "lesson-3-1",
      courseId: "course-3",
      title: "Load Balancing algorithms (Nginx & HAProxy)",
      duration: "14:40",
      videoUrl: "load_balancing_topologies",
      content: "Understand layer 4 and layer 7 load routing. Study Round Robin, Weighted connections, IP hashing, active heartbeats, and failure recovery policies.",
      orderIndex: 1,
    },
    {
      id: "lesson-3-2",
      courseId: "course-3",
      title: "Multi-Tier Caching with Redis & Memory Tables",
      duration: "17:10",
      videoUrl: "redis_caching_architectures",
      content: "Prevent database bottlenecks. Design custom cache-aside pipelines, understand eviction algorithms (LRU, LFU, TTL), and mitigate cache stampede or cache penetration failures.",
      orderIndex: 2,
    },
    {
      id: "lesson-3-3",
      courseId: "course-3",
      title: "Database Partitioning & SQL Replication Pools",
      duration: "19:50",
      videoUrl: "db_replication_and_sharding",
      content: "Design master-replica replication trees. Implement vertical and horizontal sharding, understand hashing directories, write consensus strategies (raft/paxos), and resolve replication lag issues.",
      orderIndex: 3,
    },
    {
      id: "lesson-3-4",
      courseId: "course-3",
      title: "Rate Limiting with Token Bucket & Sliding Window Log",
      duration: "11:20",
      videoUrl: "rate_limiting_algorithms",
      content: "Build production rate limiters. Write Express middleware using sliding window algorithms. Mitigate DDoS vectors and prevent API degradation.",
      orderIndex: 4,
    },

    // Generative AI (course-4)
    {
      id: "lesson-4-1",
      courseId: "course-4",
      title: "Bootstrap the @google/genai TypeScript SDK",
      duration: "13:05",
      videoUrl: "google_genai_sdk_introduction",
      content: "Learn how the modern GoogleGenAI client is initialized on the server-side with strict API credentials configuration, correct schema structures, and appropriate headers.",
      orderIndex: 1,
    },
    {
      id: "lesson-4-2",
      courseId: "course-4",
      title: "Strict JSON Returns using ResponseSchema Type",
      duration: "16:20",
      videoUrl: "response_schema_json",
      content: "Ditch unreliable prompt instruction parses! Configure typed schemas directly in the Gemini call options using standard parameters. Get beautiful structural objects reliably.",
      orderIndex: 2,
    },
    {
      id: "lesson-4-3",
      courseId: "course-4",
      title: "Leveraging Native Function Calling in Workflows",
      duration: "21:40",
      videoUrl: "gemini_function_calling",
      content: "Create interactive pipelines. Inform the AI model about external tools. Handle request parameters, run operations on server side, and append results back to the conversation stream.",
      orderIndex: 3,
    },
    {
      id: "lesson-4-4",
      courseId: "course-4",
      title: "Grounding Answers with Live Web and Maps Searches",
      duration: "14:50",
      videoUrl: "gemini_grounding_search",
      content: "Connect the Gemini model to current worldwide event indices. Include citation links, trace grounding metadata chunks, and display matching search references.",
      orderIndex: 4,
    },

    // Design Systems (course-5)
    {
      id: "lesson-5-1",
      courseId: "course-5",
      title: "Modern Tailwind Configuration Primitives",
      duration: "11:15",
      videoUrl: "tailwind_configuration_systems",
      content: "Explore modern utility styling. Build custom theme maps, colors, spacing parameters, custom fonts, glassmorphism overlays, and border animations.",
      orderIndex: 1,
    },
    {
      id: "lesson-5-2",
      courseId: "course-5",
      title: "Fluid Grid Typography under Stripe Guidelines",
      duration: "14:00",
      videoUrl: "stripe_typography_grid",
      content: "Design like a designer. Build high-contrast text hierarchies, spacing layouts, micro-shadow frames, and elegant dark/light theme presets.",
      orderIndex: 2,
    },
    {
      id: "lesson-5-3",
      courseId: "course-5",
      title: "Creating Modern Cards, Dashboards and Glass Overlays",
      duration: "16:35",
      videoUrl: "modern_card_designs",
      content: "Study border-lights, gradient fills, backing blur parameters, shadow layers, dynamic layouts, and interactive cursor-hover response triggers.",
      orderIndex: 3,
    },
    {
      id: "lesson-5-4",
      courseId: "course-5",
      title: "Staggered Entrance Animations using Framer Motion",
      duration: "18:45",
      videoUrl: "framer_motion_entrances",
      content: "Reinforce dashboard visual flow. Design smooth layouts, staggered item fades, and beautiful interactive feedback on click.",
      orderIndex: 4,
    },

    // Cyber Security (course-6)
    {
      id: "lesson-6-1",
      courseId: "course-6",
      title: "Threat Modeling and CORS Configuration Rules",
      duration: "13:30",
      videoUrl: "cors_and_express_security",
      content: "Audit server security scopes. Define cross-origin configurations, study browser SOP mechanics, inspect credential options, and prevent headers injections.",
      orderIndex: 1,
    },
    {
      id: "lesson-6-2",
      courseId: "course-6",
      title: "Mitigating XSS and Cookie Injection Vectors",
      duration: "16:50",
      videoUrl: "xss_injection_mitigations",
      content: "Understand content injection, HTTP-only cookie headers, X-Frame-Options setups, rate limitations policies, payload structures, and sanitization practices.",
      orderIndex: 2,
    },
    {
      id: "lesson-6-3",
      courseId: "course-6",
      title: "Evaluating Express API Gateways & Security Audit Logs",
      duration: "18:15",
      videoUrl: "api_gateways_log_auditing",
      content: "Track authentication tokens securely. Practice request logging, evaluate proxy connections, write dynamic IP filters, and block abusive requests automatically.",
      orderIndex: 3,
    },
    {
      id: "lesson-6-4",
      courseId: "course-6",
      title: "Creating Strong JWT Expiry & Refresh Token Pipelines",
      duration: "15:20",
      videoUrl: "jwt_refresh_token_pipelines",
      content: "Design full session tokens infrastructure. Master token validation routines, sliding windows authorization, payload extraction, and cryptographic secrets management.",
      orderIndex: 4,
    }
  ],
  enrollments: [
    {
      id: "enr-1",
      userId: "std-1",
      courseId: "course-1",
      enrolledAt: "2026-05-25T14:00:00Z",
      completedLessons: ["lesson-1-1", "lesson-1-2"],
      progress: 50,
    },
    {
      id: "enr-2",
      userId: "std-1",
      courseId: "course-4",
      enrolledAt: "2026-05-26T10:00:00Z",
      completedLessons: ["lesson-4-1"],
      progress: 25,
    }
  ],
  certificates: [],
  stats: {
    "std-1": {
      userId: "std-1",
      xp: 420,
      level: 2,
      streakDays: 4,
      lastActiveDate: "2026-05-27T18:00:00Z",
      badges: [
        {
          id: "badge-1",
          title: "First Steps",
          description: "Enrolled in your very first AI Studio course!",
          icon: "Sparkles",
          unlockedAt: "2026-05-25T14:05:00Z",
        },
        {
          id: "badge-2",
          title: "Streaker",
          description: "Maintained a 3-day dynamic learning streak.",
          icon: "Flame",
          unlockedAt: "2026-05-27T10:00:00Z",
        }
      ],
      skills: {
        "Next.js": 45,
        "React": 50,
        "TypeScript": 30,
        "Generative AI": 25,
        "Prompt Engineering": 20,
      },
    },
  },
  quizzes: [
    {
      id: "quiz-1-1",
      courseId: "course-1",
      lessonId: "lesson-1-1",
      title: "React Server Components Quiz",
      questions: [
        {
          question: "Which of the following is true regarding React Server Components (RCS)?",
          options: [
            "RSCs render on the server and their dependencies do not add to the client bundle size.",
            "RSCs compile to HTML which is fully static and cannot use state or effect handlers anyway.",
            "RSCs only support client-side rendering after the initial page hydration.",
            "RSCs are fully deprecated in React 19.",
          ],
          correctAnswerIndex: 0,
          explanation: "RSCs execute entirely on the server side; only the serialized lightweight virtual DOM description is sent to the client, preventing package import sizes from bloating client bundles.",
        },
        {
          question: "Can an RSC directly import a Client Component?",
          options: [
            "No, server components can only yield to other server components.",
            "Yes, server components can import client components and pass serialized props to them.",
            "Only if client components are strictly configured inside edge layouts.",
            "Yes, but they will instantly turn the whole parent tree into a client component.",
          ],
          correctAnswerIndex: 1,
          explanation: "RSCs can freely import and render Client Components, defining the Client boundary. Props passed from RSCs to details in Client Components must be serializable.",
        }
      ]
    }
  ]
};

/**
 * Get dynamic global leaderboards based on simulated users
 */
export function getLeaderboard(): LeaderboardEntry[] {
  const mockEntries: LeaderboardEntry[] = [
    {
      userId: "std-2",
      userName: "Alex Rivers",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=rivers",
      role: UserRole.STUDENT,
      xp: 2450,
      level: 12,
      streakDays: 14,
    },
    {
      userId: "std-3",
      userName: "Liam Thorne",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=liam",
      role: UserRole.STUDENT,
      xp: 1890,
      level: 9,
      streakDays: 8,
    },
    // Guest active user
    {
      userId: "std-1",
      userName: db.users[0].name,
      avatarUrl: db.users[0].avatarUrl,
      role: db.users[0].role,
      xp: db.stats["std-1"] ? db.stats["std-1"].xp : 0,
      level: db.stats["std-1"] ? db.stats["std-1"].level : 1,
      streakDays: db.stats["std-1"] ? db.stats["std-1"].streakDays : 0,
    },
    {
      userId: "std-4",
      userName: "Sophia Martinez",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=sophia",
      role: UserRole.STUDENT,
      xp: 1210,
      level: 6,
      streakDays: 5,
    },
    {
      userId: "std-5",
      userName: "Marcus Vance",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=marcus",
      role: UserRole.STUDENT,
      xp: 840,
      level: 4,
      streakDays: 0,
    }
  ];

  return mockEntries.sort((a, b) => b.xp - a.xp);
}

/**
 * Perform actions to award XP and unlock badges or certificates
 */
export function awardProgressAction(userId: string, courseId: string, badgeCheckOnly = false): {
  xpGain: number;
  unlockedBadge?: Badge;
  newLevel?: number;
} {
  const userStats = db.stats[userId];
  if (!userStats) return { xpGain: 0 };

  let xpGain = 0;
  let unlockedBadge: Badge | undefined;
  let newLevel: number | undefined;

  if (!badgeCheckOnly) {
    // Standard event completions gets +40 XP
    xpGain = 40;
    userStats.xp += xpGain;
  }

  // Calculate new Level (e.g. Level = floor(sqrt(XP / 100)) + 1)
  const currentLevel = Math.floor(Math.sqrt(userStats.xp / 100)) + 1;
  if (currentLevel > userStats.level) {
    userStats.level = currentLevel;
    newLevel = currentLevel;
  }

  // Active Badge check: Check total completions, streaking thresholds
  const userEnrollments = db.enrollments.filter(e => e.userId === userId);
  const totalCompletedLessons = userEnrollments.reduce((sum, enr) => sum + enr.completedLessons.length, 0);

  const hasBadge = (title: string) => userStats.badges.some(b => b.title === title);

  // Badge: Code Warrior - Completed 4 lessons
  if (totalCompletedLessons >= 4 && !hasBadge("Code Warrior")) {
    unlockedBadge = {
      id: "badge-warrior",
      title: "Code Warrior",
      description: "Diligently parsed and completed 4 lesson units!",
      icon: "Code",
      unlockedAt: new Date().toISOString(),
    };
    userStats.badges.push(unlockedBadge);
    userStats.xp += 100; // award +100 for achievement
  }

  // Badge: Scholar - Enrolled in 3 courses
  if (userEnrollments.length >= 3 && !hasBadge("Scholar")) {
    unlockedBadge = {
      id: "badge-scholar",
      title: "Scholar",
      description: "Broadened your horizons by enrolling in 3 distinct curricula.",
      icon: "BookOpen",
      unlockedAt: new Date().toISOString(),
    };
    userStats.badges.push(unlockedBadge);
    userStats.xp += 100;
  }

  return { xpGain, unlockedBadge, newLevel };
}
