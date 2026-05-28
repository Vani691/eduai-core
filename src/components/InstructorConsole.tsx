import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Clock, FileText, CheckCircle, HelpCircle, ArrowRight, Video, Sparkles, RefreshCw } from "lucide-react";
import { Course } from "../types";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function InstructorConsole() {
  const [courses, setCourses] = useState<Course[]>([]);
  // Course form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("10 hours");
  const [tags, setTags] = useState("");

  // Lesson form
  const [targetCourseId, setTargetCourseId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState("15:00");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadInstructorCourses = async () => {
    try {
      const res = await fetch("/api/courses?all=true");
      const data = await res.json();
      setCourses(data);
      if (data.length > 0 && !targetCourseId) {
        setTargetCourseId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch instructor courses:", err);
    }
  };

  useEffect(() => {
    loadInstructorCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          longDescription,
          category,
          difficulty,
          duration,
          tags: tags.split(",").map(t => t.trim())
        })
      });

      if (!res.ok) throw new Error("Could not construct course outline.");

      setMessage("Success: Your course catalog has been submitted for Admin approval review!");
      setTitle("");
      setDescription("");
      setLongDescription("");
      setTags("");
      loadInstructorCourses();
    } catch (err: any) {
      setMessage(`Draft error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !targetCourseId) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/courses/${targetCourseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonTitle,
          duration: lessonDuration,
          videoUrl: lessonVideo,
          content: lessonContent
        })
      });

      if (!res.ok) throw new Error("Could not upload lesson structure.");

      setMessage("Success: Lesson curriculum module successfully loaded!");
      setLessonTitle("");
      setLessonContent("");
      setLessonVideo("");
      loadInstructorCourses();
    } catch (err: any) {
      setMessage(`Syllabus error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="instructor-console" className="space-y-10 max-w-6xl mx-auto">
      {/* Visual Analytics */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-indigo-400 w-5 h-5 animate-pulse" /> My Educator Dashboard
        </h2>
        <AnalyticsDashboard roleContext="Instructor" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        {/* Create Course Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="text-indigo-400 w-5 h-5" /> Launch a New Course
            </h3>
            <p className="text-slate-400 text-xs">Fill out the form below to submit a new syllabus curriculum topic candidate for review.</p>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Master TypeScript Metaprogramming"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none transition font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-300 focus:outline-none transition cursor-pointer"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Design & Frontend">Design & Frontend</option>
                  <option value="Cyber Security">Cyber Security</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 10 hours"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-300 focus:outline-none transition cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="e.g. ts, decorators, generics"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase">Brief Subtitle Summary</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A compelling 1-sentence sales pitch of what students will accomplish."
                className="w-full h-16 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase">Long Syllabus Overview</label>
              <textarea
                value={longDescription}
                onChange={e => setLongDescription(e.target.value)}
                placeholder="A deep, detailed multi-paragraph curriculum scope summary details..."
                className="w-full h-20 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 active:bg-indigo-700 disabled:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Submit Syllabus Draft"}
            </button>
          </form>
        </div>

        {/* Create Lesson / Course draft list */}
        <div className="space-y-6">
          {/* Create Lesson Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="text-indigo-400 w-5 h-5" /> Append Syllabus Module
              </h3>
              <p className="text-slate-400 text-xs">Add video metadata and learning material content to any of your launched courses.</p>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Draft a course syllabus outline first to load lesson modules.
              </div>
            ) : (
              <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold uppercase">Target Syllabus</label>
                  <select
                    value={targetCourseId}
                    onChange={e => setTargetCourseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-300 focus:outline-none transition cursor-pointer"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold uppercase">Lesson Title</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={e => setLessonTitle(e.target.value)}
                      placeholder="e.g. Advanced Metadata mapping"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold uppercase">Duration estimate</label>
                    <input
                      type="text"
                      value={lessonDuration}
                      onChange={e => setLessonDuration(e.target.value)}
                      placeholder="e.g. 15:45"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold uppercase">Mock Video YouTube ID (Optional)</label>
                  <input
                    type="text"
                    value={lessonVideo}
                    onChange={e => setLessonVideo(e.target.value)}
                    placeholder="e.g., T8_A6f6g9lI"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600"
                  />
                  <span className="text-[10px] text-slate-500 block">Provide standard YouTube hashes for dynamic iframe loads.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold uppercase">Lesson Material Transcript / Theory</label>
                  <textarea
                    value={lessonContent}
                    onChange={e => setLessonContent(e.target.value)}
                    placeholder="Enter detailed engineering transcripts, key definitions, or code files. AI Tutor will reference this details during study mode!"
                    className="w-full h-24 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-550 active:bg-emerald-700 disabled:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Append Lesson Syllabus"}
                </button>
              </form>
            )}
          </div>

          {/* Toast / Message Container */}
          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold border ${
              message.startsWith("Success")
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
