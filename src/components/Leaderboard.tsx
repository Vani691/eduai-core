import React, { useEffect, useState } from "react";
import { Award, Flame, Star, Trophy, Users, Zap } from "lucide-react";
import { LeaderboardEntry } from "../types";

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load leaderboard:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div id="leaderboard" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-500 w-7 h-7 animate-pulse" />
            Global Learnboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Learn daily, earn XP, and unlock exclusive engineering milestones.
          </p>
        </div>
        <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Global Rankings
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top 3 podium highlights */}
          <div className="grid grid-cols-3 gap-3 mb-6 pt-4">
            {entries.slice(0, 3).map((entry, idx) => {
              const bgColors = [
                "bg-amber-500/10 border-amber-500/35 text-amber-400",
                "bg-slate-300/10 border-slate-300/35 text-slate-300",
                "bg-amber-700/10 border-amber-700/35 text-amber-600",
              ];
              const medalIcons = [<Star className="w-4 h-4 fill-amber-400" />, <Star className="w-4 h-4 fill-slate-300" />, <Star className="w-4 h-4 fill-amber-700" />];

              return (
                <div
                  key={entry.userId}
                  className={`border rounded-2xl p-4 text-center relative overflow-hidden flex flex-col items-center justify-center ${
                    idx === 0 ? "scale-105 border-amber-500/50 ring-1 ring-amber-500/20" : ""
                  } ${bgColors[idx]}`}
                >
                  <div className="absolute top-2 right-2 flex items-center justify-center">
                    {medalIcons[idx]}
                  </div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">RANK #{idx + 1}</span>
                  <img
                    src={entry.avatarUrl}
                    alt={entry.userName}
                    className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800 mb-2 object-cover referrerPolicy='no-referrer'"
                  />
                  <h4 className="text-sm font-semibold truncate text-white w-full">{entry.userName}</h4>
                  <div className="flex items-center gap-1 text-xs font-medium mt-1">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span>{entry.xp} XP</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">Lv. {entry.level}</span>
                </div>
              );
            })}
          </div>

          {/* Table entries */}
          <div className="border border-slate-800/60 rounded-xl overflow-hidden divide-y divide-slate-800/60">
            {entries.map((entry, idx) => {
              const isGuest = entry.userId === "std-1";
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    isGuest ? "bg-indigo-600/10 border-l-2 border-indigo-500 text-white" : "hover:bg-slate-800/30 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-500 w-6 text-center">
                      {idx + 1}
                    </span>
                    <img
                      src={entry.avatarUrl}
                      alt={entry.userName}
                      className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{entry.userName}</span>
                        {isGuest && (
                          <span className="bg-indigo-600 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">Level {entry.level} Graduate</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {entry.streakDays > 0 && (
                      <div className="flex items-center gap-1 text-orange-500 text-xs font-medium" title="Streak active">
                        <Flame className="w-4 h-4 fill-orange-500 animate-bounce" />
                        <span>{entry.streakDays}d</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-slate-100 font-semibold w-24 justify-end text-sm">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span>{entry.xp} <span className="text-xs text-slate-500 font-normal">XP</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
