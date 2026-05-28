import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Award, BookOpen, Flame, GraduationCap, TrendingUp, Users, Zap, Star } from "lucide-react";

interface CardMetric {
  title: string;
  value: number | string;
  change: string;
  type: string;
}

interface AnalyticsData {
  role: string;
  cards: CardMetric[];
  monthlyEngagements?: { month: string; enrollments: number; certificates: number }[];
  coursePerformance?: { name: string; enrollments: number; rating: number }[];
  skills?: { name: string; proficiency: number }[];
}

export default function AnalyticsDashboard({ roleContext }: { roleContext: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/analytics/dashboard")
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load analytics:", err);
        setLoading(false);
      });
  }, [roleContext]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-slate-800/40 border border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "users":
        return <Users className="w-5 h-5 text-indigo-400" />;
      case "courses":
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case "trends":
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case "stats":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "xp":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "streak":
        return <Flame className="w-5 h-5 text-orange-500" />;
      case "enroll":
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case "completion":
        return <GraduationCap className="w-5 h-5 text-emerald-400" />;
      case "lessons":
        return <Award className="w-5 h-5 text-blue-400" />;
      case "rating":
        return <Star className="w-5 h-5 text-amber-400" fill="currentColor" />;
      default:
        return <Zap className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {data.cards.map((card, i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all duration-300"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {card.title}
              </span>
              <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/30">
                {getMetricIcon(card.type)}
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {card.value}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="text-slate-500 font-medium">{card.change}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Analytics Visualizers based on Profile Roles */}
      {data.role === "Admin" && data.monthlyEngagements && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Platform Velocity & Growth
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyEngagements}>
                  <defs>
                    <linearGradient id="colorEnrolls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Student Enrollments"
                  />
                  <Line
                    type="monotone"
                    dataKey="certificates"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Certificates Minted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {data.role === "Instructor" && data.coursePerformance && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Syllabus Enrollments Breakdown
            </h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Enrolled Seats" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {data.role === "Student" && data.skills && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skill lists card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-1 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" /> Skills Mastered
            </h3>
            {data.skills.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                You haven't studied any lessons yet. Completing lessons levels up your proficiency!
              </div>
            ) : (
              <div className="space-y-4">
                {data.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center text-xs text-slate-400 font-medium mb-1.5">
                      <span className="text-slate-200">{skill.name}</span>
                      <span className="font-mono text-indigo-400">{skill.proficiency}% Mastered</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Radar/Graph card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 shadow-lg">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Technical Competency Vector
            </h3>
            {data.skills.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-xs text-slate-500">
                A visual radar layout maps your path automatically. Finish your first lesson!
              </div>
            ) : (
              <div className="h-60 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.skills}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" max={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar dataKey="proficiency" fill="#10b981" radius={[4, 4, 0, 0]} name="Skill Proficiency Level" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
