import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Zap,
  Users,
  Award,
  ChevronRight,
  Filter,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { Course } from "../types";

interface CourseCatalogProps {
  onSelectCourse: (courseId: string) => void;
  onEnrollCourse: (courseId: string) => void;
  enrolledCourseIds: string[];
}

export default function CourseCatalog({ onSelectCourse, onEnrollCourse, enrolledCourseIds }: CourseCatalogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<{
    personalized: Course[];
    contentBased: Course[];
    collaborative: Course[];
    trending: Course[];
  } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCatalogAndRecommendations = async () => {
    setLoading(true);
    try {
      // 1. Fetch search-filtered catalog
      const filterQuery = new URLSearchParams();
      if (searchTerm) filterQuery.append("search", searchTerm);
      if (category) filterQuery.append("category", category);
      if (difficulty) filterQuery.append("difficulty", difficulty);

      const catalogRes = await fetch(`/api/courses?${filterQuery.toString()}`);
      const catalogData = await catalogRes.json();
      setCourses(catalogData);

      // 2. Fetch multi-tier recommendations
      const recsRes = await fetch("/api/recommendations");
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData);
      }
    } catch (err) {
      console.error("Failed to load course catalog data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogAndRecommendations();
  }, [searchTerm, category, difficulty, enrolledCourseIds]);

  const categoriesList = [
    "Web Development",
    "Artificial Intelligence",
    "Software Engineering",
    "Design & Frontend",
    "Cyber Security",
  ];

  return (
    <div id="course-catalog" className="space-y-10 max-w-6xl mx-auto">
      {/* Header bar and search layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Expand Your Engineering Horizon</h2>
          <p className="text-slate-400 text-xs">Search standard tech curriculums, filter categories, or explore AI personalized models.</p>
        </div>

        {/* Search controls */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search subjects, tags, tools..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none transition placeholder-slate-500"
            />
          </div>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none transition cursor-pointer"
          >
            <option value="">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none transition cursor-pointer"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Recommended Reels (Hide when filtering or searching to prevent interface clutter) */}
      {!loading && !searchTerm && !category && !difficulty && recommendations && (
        <div className="space-y-12">
          {/* Reel 1: Personalized (Hybrid Model) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="text-indigo-400 w-5 h-5 animate-pulse" />
                Personalized Hybrid Picks
              </h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-mono" title="Scores combine interest tags similarity & collaborative overlap ratios">
                AI Recommendation Engine active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recommendations.personalized.slice(0, 3).map(course => (
                <CourseDeckCard
                  key={course.id}
                  course={course}
                  onSelect={onSelectCourse}
                  onEnroll={onEnrollCourse}
                  isEnrolled={enrolledCourseIds.includes(course.id)}
                />
              ))}
            </div>
          </div>

          {/* Reel 2: Collaborative ("Students like you also enrolled in...") */}
          {recommendations.collaborative.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800/60All">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="text-emerald-400 w-5 h-5" />
                Trending Among Peer Engineers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recommendations.collaborative.slice(0, 3).map(course => (
                  <CourseDeckCard
                    key={course.id}
                    course={course}
                    onSelect={onSelectCourse}
                    onEnroll={onEnrollCourse}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reel 3: Because You Watched/Enrolled (Content-Based) */}
          {enrolledCourseIds.length > 0 && recommendations.contentBased.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800/40">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="text-blue-400 w-5 h-5" />
                Recommended Based On Interests
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recommendations.contentBased.slice(0, 3).map(course => (
                  <CourseDeckCard
                    key={course.id}
                    course={course}
                    onSelect={onSelectCourse}
                    onEnroll={onEnrollCourse}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Catalog Search Results */}
      {!loading && (
        <div className="space-y-4 pt-8 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              {searchTerm || category || difficulty ? "Syllabus Filter Matches" : "Complete Syllabus Catalog"} ({courses.length})
            </h3>
          </div>

          {courses.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">No courses match filters</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your queries or selecting another topic filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseDeckCard
                  key={course.id}
                  course={course}
                  onSelect={onSelectCourse}
                  onEnroll={onEnrollCourse}
                  isEnrolled={enrolledCourseIds.includes(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline card component to optimize bundle splits
function CourseDeckCard({
  course,
  onSelect,
  onEnroll,
  isEnrolled
}: {
  course: Course;
  onSelect: (id: string) => void;
  onEnroll: (id: string) => void;
  isEnrolled: boolean;
  key?: string | number;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col text-left group">
      {/* Thumbnail */}
      <div className="h-40 w-full overflow-hidden relative bg-slate-950">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90"
          referrerPolicy="no-referrer"
        />
        <span className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow">
          {course.difficulty}
        </span>
      </div>

      {/* Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
            {course.category}
          </span>
          <h4 className="text-sm font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
            {course.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="text-[10px] bg-slate-800 border border-slate-700/40 text-slate-400 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/50 pt-3">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{course.enrollmentsCount} Enrolls</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{course.rating.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => onSelect(course.id)}
              className="py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl shadow border border-slate-700/50 transition cursor-pointer"
            >
              Syllabus Info
            </button>
            {isEnrolled ? (
              <button
                onClick={() => onSelect(course.id)}
                className="py-2 bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Continue
              </button>
            ) : (
              <button
                onClick={() => onEnroll(course.id)}
                className="py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" /> Enroll Free
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
