import React, { useState, useEffect } from "react";
import { Check, ShieldAlert, Sparkles, Star, Users, Trash2, Clock, AlertCircle } from "lucide-react";
import { Course } from "../types";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function AdminConsole() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses?all=true");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to load catalog within admin scope:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}/approve`, { method: "POST" });
      if (res.ok) {
        fetchAllCourses();
      } else {
        const err = await res.json();
        alert(`Approve failed: ${err.error}`);
      }
    } catch(err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const pendingCourses = courses.filter(c => !c.isApproved);
  const activeCourses = courses.filter(c => c.isApproved);

  return (
    <div id="admin-console" className="space-y-10 max-w-6xl mx-auto">
      {/* Platform Analytics */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-indigo-400 w-5 h-5 animate-pulse" /> Core Platform Performance
        </h2>
        <AnalyticsDashboard roleContext="Admin" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {/* Course Moderation Panel */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-amber-500 w-5 h-5" /> Pending Curriculums approval Queue ({pendingCourses.length})
            </h3>
            <p className="text-slate-400 text-xs mt-1">Review newly submitted courses from instructors and approve them to go live.</p>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-800/40 rounded-xl" />
              ))}
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-850 text-center text-slate-500 text-xs">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All course requests cleared. No pending approvals!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCourses.map(course => (
                <div key={course.id} className="bg-slate-950 p-4 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{course.category}</span>
                    <h4 className="text-xs font-bold text-white leading-snug">{course.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>Instructor: <strong className="text-slate-300">{course.instructorName}</strong></span>
                      <span>Difficulty: <strong className="text-slate-300">{course.difficulty}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApprove(course.id)}
                    className="px-4.5 py-1.5 bg-emerald-600 hover:bg-emerald-550 active:bg-emerald-700 font-bold text-xs text-white rounded-lg transition shadow-md cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Catalog Auditing sidebar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Check className="text-emerald-500 w-4.5 h-4.5" /> Active Curriculums Live ({activeCourses.length})
          </h3>
          <p className="text-slate-400 text-xs">Monitor running courses currently visible on the active public catalog.</p>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800/40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {activeCourses.map(course => (
                <div key={course.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/50 text-[11px] text-slate-300 flex justify-between items-center">
                  <span className="truncate max-w-[180px] font-medium text-white">{course.title}</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Live
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
