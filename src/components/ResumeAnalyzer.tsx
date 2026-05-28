import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  Clock,
  Briefcase
} from "lucide-react";
import { Course, ResumeAnalysisResult, Badge } from "../types";
import confetti from "canvas-confetti";

interface ResumeAnalyzerProps {
  onEnrollCourse: (courseId: string) => void;
  enrolledCourseIds: string[];
}

export default function ResumeAnalyzer({ onEnrollCourse, enrolledCourseIds }: ResumeAnalyzerProps) {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResumeAnalysisResult | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStep, setSelectedStep] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ text: string; badge?: Badge } | null>(null);

  // Suggested resume template to make it easy for recruiters to test in one click!
  const loadSampleResume = () => {
    setResumeText(`Johnathan Doe
Junior Software Developer | contact: jdoe@engineering.com

OBJECTIVE
Motivated software engineer with experience writing basic HTML, CSS and simple Vanilla JavaScript. Looking to transition of a React environment and master fullstack deployments and cloud database caching.

SKILLS
- HTML5, CSS3, ES6 JavaScript, Git, basic SQL queries.
- Familiar with Linux commands, hosting static static pages on Netlify.

EXPERIENCE
Frontend Developer Apprentice - Spark Tech Group (2025 - 2026)
- Crafted static web pages for small local business clients.
- Automated static newsletters formatting using custom markup stylesheets.

EDUCATION
B.S. in Applied Management (2025)`);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setResults(null);
    setSelectedStep(null);

    // Fetch master courses catalog temporarily to render summaries
    try {
      const courseRes = await fetch("/api/courses");
      const courseData = await courseRes.json();
      setCourses(courseData);

      const resumeRes = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText })
      });

      if (!resumeRes.ok) {
        const errorData = await resumeRes.json();
        throw new Error(errorData.error || "Failed to analyze resume.");
      }

      const data = await resumeRes.json();
      setResults(data.diagnostics);

      // Trigger achievement celebrations
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });

      if (data.unlockedBadge) {
        setNotification({
          text: `XP Gained: +${data.xpGain}! Achievement Unlocked!`,
          badge: data.unlockedBadge
        });
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (err: any) {
      alert(`AI Parsing failed: ${err.message}. Ensure your GEMINI_API_KEY is configured in Settings.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="resume-analyzer" className="max-w-5xl mx-auto space-y-8">
      {/* Dynamic Popups for Badging */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-indigo-500/50 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm animate-bounce z-50">
          <div className="bg-indigo-600/20 p-2.5 rounded-lg border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400">ACHIEVEMENT COMPLETED</h4>
            <p className="text-sm font-semibold text-white mt-0.5">{notification.badge?.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{notification.badge?.description}</p>
          </div>
        </div>
      )}

      {/* Main Carrier Intro */}
      <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center w-fit gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Advanced Skill Analytics
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Resume Skill-Gap Audit</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Paste your standard resume or experience summary. Our Gemini engine extracts your skill set, finds critical omissions, and programs a connected interactive learn roadmap with course direct-shortcuts.
            </p>
          </div>
          <button
            onClick={loadSampleResume}
            className="px-4 py-2 bg-slate-800/80 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-200 text-xs font-medium flex items-center gap-2 hover:bg-slate-800 transition"
          >
            <FileText className="w-4 h-4 text-slate-400" /> Use Sample Resume
          </button>
        </div>

        {/* Input Text Box */}
        <div className="mt-8 space-y-4">
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your resume content, experience overview, or list of past technologies..."
            className="w-full h-44 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-mono">
              {resumeText.trim().length} characters entered.
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || !resumeText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent cursor-pointer rounded-xl font-semibold text-xs text-white border border-indigo-400/20 shadow-lg flex items-center gap-2 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Profile Gaps...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Skill Diagnostics
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="md:col-span-1 space-y-4">
            <div className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
            <div className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
          </div>
          <div className="md:col-span-2 h-96 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      )}

      {/* Results grid */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            {/* Found Skills Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="text-emerald-500 w-4 h-4" /> Detected Skills
              </h3>
              {results.skillsFound.length === 0 ? (
                <p className="text-xs text-slate-500">No specific software engineering skills detected.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {results.skillsFound.map((skill, k) => (
                    <span
                      key={k}
                      className="text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase className="text-indigo-400 w-4 h-4" /> Missing Key Skills
              </h3>
              {results.missingSkills.length === 0 ? (
                <p className="text-xs text-slate-500">Your resume matched standard benchmarks perfectly!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {results.missingSkills.map((skill, k) => (
                    <span
                      key={k}
                      className="text-xs bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Connected Learning Roadmap Timeline Tree */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="text-indigo-400 w-5 h-5" /> AI Custom Learn Roadmap
              </h3>
              <p className="text-slate-400 text-xs mb-8">
                Click any node on the learning timeline below to explore step-by-step techniques and enroll directly.
              </p>

              {/* Connected line nodes */}
              <div className="relative border-l-2 border-slate-800 pl-6 space-y-10 my-4 ml-3">
                {results.roadmap.map((step, idx) => {
                  const isSelected = selectedStep && selectedStep.id === step.id;
                  const associatedCourse = courses.find(c => c.id === step.recommendedCourseId);

                  return (
                    <div key={idx} className="relative group">
                      {/* Node circle tracker */}
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border-2 border-indigo-500 z-10 transition-all group-hover:scale-125" />

                      <div
                        onClick={() => setSelectedStep(step)}
                        className={`p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/30 cursor-pointer transition text-left ${
                          isSelected ? "border-indigo-500 ring-1 ring-indigo-500/20 bg-slate-900/80" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold mb-1">
                              MILESTONE #{idx + 1} ({step.duration})
                            </span>
                            <h4 className="text-sm font-bold text-white">{step.title}</h4>
                          </div>
                          <span className="p-1 bg-slate-800 rounded-lg text-[10px] text-slate-400 font-medium">
                            Details
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {step.skillsCovered.map((sc: string, sIdx: number) => (
                            <span key={sIdx} className="text-[10px] bg-slate-800 border border-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded-md">
                              {sc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected step details container */}
              {selectedStep && (
                <div className="mt-6 border-t border-slate-800 pt-6 animate-fadeIn text-left">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Sparkles className="text-indigo-400 w-4 h-4 animate-pulse" /> {selectedStep.title} Details
                    </h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {selectedStep.explanation}
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/50 pt-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <span>Timeline estimate: <strong className="text-slate-200">{selectedStep.duration}</strong></span>
                      </div>
                      
                      {selectedStep.recommendedCourseId && (
                        <div className="flex items-center gap-3">
                          {enrolledCourseIds.includes(selectedStep.recommendedCourseId) ? (
                            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Enrolled
                            </span>
                          ) : (
                            <button
                              onClick={() => onEnrollCourse(selectedStep.recommendedCourseId)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white transition flex items-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> Start Course Syllabus
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
