import React, { useEffect, useState } from "react";
import {
  Compass,
  BookOpen,
  Award,
  Trophy,
  Activity,
  UserCheck,
  Zap,
  Flame,
  Sparkles,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  GraduationCap,
  Clock,
  LayoutDashboard,
  CheckCircle,
  X,
  FileText
} from "lucide-react";
import confetti from "canvas-confetti";
import CourseCatalog from "./components/CourseCatalog";
import Leaderboard from "./components/Leaderboard";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import AILearningAssistant from "./components/AILearningAssistant";
import InstructorConsole from "./components/InstructorConsole";
import AdminConsole from "./components/AdminConsole";
import { Course, Lesson, Enrollment, Certificate, User, Badge } from "./types";

export default function App() {
  // Session States
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<any>(null);

  // Active Navigation Tab
  // Tab keys: "landing", "browse", "classroom", "resume", "leaderboard", "instructor", "admin"
  const [activeTab, setActiveTab] = useState<string>("landing");

  // Learning states
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Certificates list
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Dynamic Badging / XP Popups
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);

  const fetchSession = async () => {
    try {
      const authRes = await fetch("/api/auth/session");
      if (authRes.ok) {
        const authData = await authRes.json();
        setActiveUser(authData.user);
        setUserStats(authData.stats);
      }

      // Fetch enrollments
      const enrollRes = await fetch("/api/enrollments");
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        setEnrollments(enrollData);
      }

      // Fetch certificates
      const certRes = await fetch("/api/certificates");
      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(certData);
      }
    } catch (err) {
      console.error("Session fetch sequence failed:", err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [activeTab]);

  const switchRole = async (role: string) => {
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveUser(data.user);
        setUserStats(data.stats);

        // Redirect appropriately
        if (role === "Student") setActiveTab("browse");
        else if (role === "Instructor") setActiveTab("instructor");
        else if (role === "Admin") setActiveTab("admin");

        // Flash dynamic confirmation
        setToastMessage(`Switched perspective to ${role} Role!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to switch dynamic session boundaries:", err);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Dynamic confetti on first enroll
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.9 }
        });

        // Trigger welcome modal or popup
        if (data.unlockedBadge) {
          setEarnedBadge(data.unlockedBadge);
          setToastMessage(`Congratulations! Earned badge: "${data.unlockedBadge.title}" +100 XP!`);
          setTimeout(() => {
            setToastMessage(null);
            setEarnedBadge(null);
          }, 6000);
        } else {
          setToastMessage("Successfully enrolled in course system!");
          setTimeout(() => setToastMessage(null), 3000);
        }

        // Fetch new enrollments
        const enrollRes = await fetch("/api/enrollments");
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json();
          setEnrollments(enrollData);
        }

        // Redirect directly to the newly enrolled course classroom!
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const courseData = await courseRes.ok ? await courseRes.json() : null;
          if (courseData) {
            handleSelectCourse(courseData);
          }
        }
      }
    } catch (err) {
      console.error("Could not enroll student:", err);
    }
  };

  const handleSelectCourse = async (course: Course) => {
    setActiveCourse(course);
    try {
      const lessonsRes = await fetch(`/api/courses/${course.id}/lessons`);
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData);

      if (lessonsData.length > 0) {
        // Resume from last completed or start at 0
        const enrollment = enrollments.find(e => e.courseId === course.id);
        const lastCompletedId = enrollment && enrollment.completedLessons.length > 0
          ? enrollment.completedLessons[enrollment.completedLessons.length - 1]
          : null;
        
        const lastCompletedIdx = lessonsData.findIndex((l: Lesson) => l.id === lastCompletedId);
        const targetIdx = lastCompletedIdx !== -1 && lastCompletedIdx < lessonsData.length - 1
          ? lastCompletedIdx + 1
          : 0;

        setActiveLesson(lessonsData[targetIdx]);
      } else {
        setActiveLesson(null);
      }
      setActiveTab("classroom");
    } catch (err) {
      console.error("Could not fetch lessons:", err);
    }
  };

  const handleXPUnlocked = (xpGained: number, badge?: Badge) => {
    setToastMessage(`Leveled Up! Gained +${xpGained} XP!`);
    if (badge) {
      setEarnedBadge(badge);
    }
    setTimeout(() => {
      setToastMessage(null);
      setEarnedBadge(null);
    }, 6000);
    fetchSession(); // refresh profile levels
  };

  const calculateOverallProgress = () => {
    if (enrollments.length === 0) return 0;
    const totals = enrollments.reduce((sum, curr) => sum + curr.progress, 0);
    return Math.round(totals / enrollments.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background radial overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none z-0" />

      {/* Dynamic badging or text popups */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-slate-900 border border-indigo-500/50 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm animate-fadeIn z-50 text-left">
          <div className="bg-indigo-600/20 p-2.5 rounded-lg border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400">STATUS REFRESH</h4>
            <p className="text-sm font-semibold text-white mt-0.5">{toastMessage}</p>
            {earnedBadge && <p className="text-[11px] text-slate-500 mt-0.5">{earnedBadge.description}</p>}
          </div>
        </div>
      )}

      {/* Certificates Viewer Modals */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 md:p-10 max-w-2xl w-full shadow-2xl relative text-center space-y-6 overflow-hidden">
            {/* Ambient gold circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-4 border-double border-indigo-500/30 rounded-2xl p-6 md:p-8 space-y-6 relative bg-slate-950">
              <div className="flex justify-center">
                <GraduationCap className="text-indigo-400 w-16 h-16 animate-bounce" />
              </div>
              <span className="text-xs font-mono text-indigo-400 tracking-widest font-bold uppercase block">
                Certificate of Technical Mastery
              </span>
              
              <div className="space-y-2">
                <p className="text-slate-400 text-xs italic">This certifies that</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {selectedCertificate.userName}
                </h2>
                <p className="text-slate-400 text-xs italic">has successfully completed the dynamic curriculum</p>
                <h3 className="text-lg md:text-xl font-bold text-indigo-400 tracking-tight">
                  {selectedCertificate.courseTitle}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-6 text-xs text-slate-500">
                <div className="text-left space-y-1">
                  <span>ISSUANCE DATE</span>
                  <p className="text-slate-350 font-bold font-mono">
                    {new Date(selectedCertificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span>AUDIT KEY</span>
                  <p className="text-slate-350 font-bold font-mono truncate hover:text-indigo-400 transition" title={selectedCertificate.hash}>
                    {selectedCertificate.hash}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-slate-500 text-[10px]">Verify certifications securely using our platform hash audit ledger.</p>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("landing")}>
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center border border-indigo-500/20 text-white font-bold shadow-lg shadow-indigo-600/10">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight uppercase">EduAI</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-mono ml-1.5">v1.2</span>
            </div>
          </div>

          {/* Quick tab navs */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("landing")}
              className={`px-3 py-2 rounded-xl transition ${
                activeTab === "landing" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-3 py-2 rounded-xl transition ${
                activeTab === "browse" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Curriculums
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${
                activeTab === "resume" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Resume Gap Audit
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-3 py-2 rounded-xl transition ${
                activeTab === "leaderboard" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Leaderboard
            </button>
          </nav>

          {/* Floating Workspace Switch Bar (Student/Instructor/Admin Switching) */}
          <div className="flex items-center gap-3">
            {activeUser && (
              <div className="hidden lg:flex bg-slate-900/80 p-1 border border-slate-800 rounded-xl items-center text-xs gap-1">
                <span className="text-slate-500 px-2 font-bold uppercase text-[9px] tracking-wider">PERSPECTIVE:</span>
                {["Student", "Instructor", "Admin"].map(r => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      activeUser.role === r ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Profile Avatar detail */}
            {activeUser && userStats && (
              <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800/80 pl-2 pr-3 py-1 rounded-xl">
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.name}
                  className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-bold text-white max-w-[80px] truncate leading-none">
                    {activeUser.name}
                  </p>
                  <span className="text-[9px] text-amber-500 font-mono font-medium flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-500" /> {userStats.xp} XP
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Role switcher for tablet / mobile viewports */}
      <div className="lg:hidden bg-slate-950 border-b border-indigo-500/10 p-2 flex items-center justify-center gap-2 text-xs z-30">
        <span className="text-slate-500 font-bold text-[9px] tracking-wider">PERSPECTIVE:</span>
        {["Student", "Instructor", "Admin"].map(r => (
          <button
            key={r}
            onClick={() => switchRole(r)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
              activeUser?.role === r ? "bg-indigo-600/20 border border-indigo-500 text-indigo-400" : "text-slate-500"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Main Body container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 z-10 relative">
        
        {/* Landing/Explore Tab */}
        {activeTab === "landing" && (
          <div className="space-y-16 py-8">
            {/* Dynamic Hero segment */}
            <div className="text-center space-y-6 max-w-3xl mx-auto py-12 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

              <span className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center w-fit gap-1.5 mx-auto">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Content-Based & Collaborative ML Systems live
              </span>
              
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-4">
                Structured Technical <span className="text-indigo-400">Curriculums</span> Powered by Adaptive recommendation matrices
              </h1>
              
              <p className="text-slate-450 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Connect your engineering goals with active, mathematically sound recommendations. Identify resume technical omissions, generate interactive roadmap units, and challenge yourself with AI Contextual Quizzes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => setActiveTab("browse")}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-550 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg border border-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  Explore Course Catalog <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab("resume")}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Run Resume Skill Gap Audit
                </button>
              </div>
            </div>

            {/* Quick stats board */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-xl">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Approved Courses</span>
                <p className="text-2xl font-black text-white font-mono">15+</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Active Engineers</span>
                <p className="text-2xl font-black text-white font-mono">4,300+</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Certificates Awarded</span>
                <p className="text-2xl font-black text-white font-mono">820+</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">AI Quizzes Solved</span>
                <p className="text-2xl font-black text-white font-mono">12,400+</p>
              </div>
            </div>

            {/* Student Achievements / unlocked Certificates segment */}
            {certificates.length > 0 && (
              <div className="space-y-4 pt-10 text-left">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="text-indigo-400 w-5 h-5" /> Awarded Achievements & Graduations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map(cert => (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCertificate(cert)}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4.5 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest font-mono">Verified Credential</span>
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition truncate max-w-[170px]">{cert.courseTitle}</h4>
                        <p className="text-[9px] text-slate-500 font-mono">Issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="p-2 bg-indigo-600/10 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                        View
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Browse Catalog Tab */}
        {activeTab === "browse" && (
          <CourseCatalog
            onSelectCourse={(courseId) => {
              // Retrieve full course details from static state to pass
              fetch(`/api/courses/${courseId}`)
                .then(res => res.json())
                .then(data => handleSelectCourse(data));
            }}
            onEnrollCourse={handleEnroll}
            enrolledCourseIds={enrollments.map(e => e.courseId)}
          />
        )}

        {/* Real-time classroom Tab */}
        {activeTab === "classroom" && activeCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left h-[calc(100vh-140px)] min-h-[500px]">
            {/* Classroom Video and syllabus navigation */}
            <div className="lg:col-span-2 flex flex-col space-y-4 h-full overflow-hidden pb-4">
              {/* Back to syllabus route */}
              <div className="flex justify-between items-center bg-slate-900/60 border border-slate-900 px-4 py-2.5 rounded-xl">
                <button
                  onClick={() => setActiveTab("browse")}
                  className="text-slate-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  ← Return to Curriculums Catalog
                </button>
                <div className="text-xs text-indigo-400 font-bold font-mono">
                  {enrollments.find(e => e.courseId === activeCourse.id)?.progress || 0}% Complete
                </div>
              </div>

              {/* simulated Classroom Player */}
              {activeLesson ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  {/* Embedded video simulation container */}
                  <div className="aspect-video w-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden relative shadow-xl">
                    {/* Embedded youtube iframe simulation */}
                    {activeLesson.videoUrl && activeLesson.videoUrl.length === 11 ? (
                      <iframe
                        title={activeLesson.title}
                        src={`https://www.youtube.com/embed/${activeLesson.videoUrl}?autoplay=0&rel=0`}
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-3 p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950">
                        <PlayCircle className="w-16 h-16 text-indigo-500 animate-pulse" />
                        <h4 className="text-white font-bold text-sm">{activeLesson.title}</h4>
                        <p className="text-slate-500 text-xs italic">Simulated Lesson Video streaming platform pipeline active.</p>
                      </div>
                    )}
                  </div>

                  {/* Syllabus / Transcript overview */}
                  <div className="bg-slate-900/30 border border-slate-950/50 p-4 rounded-xl flex-1 overflow-y-auto">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4.5 h-4.5 text-indigo-400" /> Syllabus Unit Blueprint
                    </h3>
                    <p className="text-slate-350 text-xs leading-relaxed mt-2.5">
                      {activeLesson.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 m-auto">
                  <PlayCircle className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                  <h4 className="text-white font-bold text-sm">Welcome to the Classroom</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Please select a syllabus unit lesson from the module course map to initialize learning feeds.</p>
                </div>
              )}
            </div>

            {/* Sidebar navigation and AI Tutoring Assist */}
            <div className="lg:col-span-1 flex flex-col space-y-4 h-full overflow-hidden pb-4">
              {/* Syllabi modules menu */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[200px] overflow-hidden">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
                  MODULE BLUEPRINT MAP ({lessons.length} UNITS)
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5">
                  {lessons.map((less, idx) => {
                    const isActive = activeLesson && activeLesson.id === less.id;
                    const isCompleted = enrollments
                      .find(e => e.courseId === activeCourse.id)
                      ?.completedLessons.includes(less.id);

                    return (
                      <button
                        key={less.id}
                        onClick={() => setActiveLesson(less)}
                        className={`w-full p-2.5 rounded-xl border text-[11px] text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                          isActive
                            ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold"
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 max-w-[180px]">
                          <span className="font-mono font-bold text-indigo-500/80">#{idx + 1}</span>
                          <span className="truncate">{less.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono font-medium text-slate-500">{less.duration}</span>
                          {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/10" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Tutoring assist side panel */}
              <div className="flex-1 overflow-hidden">
                <AILearningAssistant activeLesson={activeLesson} onXPUnlocked={handleXPUnlocked} />
              </div>
            </div>
          </div>
        )}

        {/* Resume gap analyzing Tab */}
        {activeTab === "resume" && (
          <ResumeAnalyzer
            onEnrollCourse={handleEnroll}
            enrolledCourseIds={enrollments.map(e => e.courseId)}
          />
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && <Leaderboard />}

        {/* Creator Workspace Tab */}
        {activeTab === "instructor" && <InstructorConsole />}

        {/* Admin Workspace Tab */}
        {activeTab === "admin" && <AdminConsole />}

      </main>

      {/* Footer credits block */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-500 text-xs py-10 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-bold">
              AI
            </div>
            <span className="text-slate-400 font-semibold tracking-tight uppercase">EduAI online Hub</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a href="#metadata" onClick={(e) => { e.preventDefault(); alert("AI Studio Build environment active. Credentials configured automatically."); }} className="hover:text-slate-350 transition">
              Secrets Audit
            </a>
            <span className="text-slate-800">|</span>
            <p className="text-slate-500">
              Structured matching coefficient algorithm calculated locally in Node sandboxes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
