import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, BookOpen, AlertCircle, Sparkles, Send, RefreshCw, Check, X, Award, ChevronRight, CheckCircle2 } from "lucide-react";
import { Lesson, ChatMessage, Quiz, Badge } from "../types";
import confetti from "canvas-confetti";

interface AILearningAssistantProps {
  activeLesson: Lesson | null;
  onXPUnlocked: (xpGained: number, badge?: Badge) => void;
}

export default function AILearningAssistant({ activeLesson, onXPUnlocked }: AILearningAssistantProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "quiz">("chat");

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quiz States
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Reset states when changing active lesson
    setChatMessages([
      {
        id: "welcome",
        sender: "ai",
        text: activeLesson
          ? `Hello! I am your AI Tech Tutor for "${activeLesson.title}". Ask me to summarize this module, explain its math, draft code snippets, or generate an interactive quiz challenge!`
          : "Welcome! Click any course lesson on the syllabus to start learning. You'll unleash my tutoring capabilities, summarize transcripts, and take quizzes!",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setQuiz(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  }, [activeLesson]);

  useEffect(() => {
    // Auto-scroll chat replies
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeLesson) return;
    const userMsg: ChatMessage = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          lessonId: activeLesson.id,
          history: chatMessages.slice(-5) // pass past turns for memory context
        }),
      });

      if (!response.ok) throw new Error("AI failed to reply.");

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: `Tutoring module error: ${err.message}. Please configure your GEMINI_API_KEY in the Settings tab.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!activeLesson) return;
    setQuizLoading(true);
    setQuiz(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);

    try {
      const response = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: activeLesson.id }),
      });

      if (!response.ok) throw new Error("Quiz compilation failed.");

      const data = await response.json();
      setQuiz(data);
    } catch (err: any) {
      alert(`Could not compile quiz: ${err.message}. Enforce that your GEMINI_API_KEY is active.`);
    } finally {
      setQuizLoading(false);
    }
  };

  const selectAnswer = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || quizSubmitted) return;
    
    // Check points
    let scoredPts = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) scoredPts++;
    });

    setScore(scoredPts);
    setQuizSubmitted(true);

    const isPerfect = scoredPts === quiz.questions.length;

    // Trigger completion points on backend!
    if (activeLesson) {
      try {
        const response = await fetch(`/api/lessons/${activeLesson.id}/complete`, { method: "POST" });
        if (response.ok) {
          const resData = await response.json();
          onXPUnlocked(resData.xpGain, resData.unlockedBadge);
          
          if (isPerfect) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.8 }
            });
          }
        }
      } catch (err) {
        console.error("XP updates failed:", err);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full flex flex-col overflow-hidden shadow-xl">
      {/* Sidebar Top Tabs Nav */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 p-2 gap-2">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
            activeTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> AI Tutor
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          disabled={!activeLesson}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
            activeTab === "quiz" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <Award className="w-4 h-4" /> Lesson Quiz
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {activeTab === "chat" ? (
          <div className="flex flex-col h-full flex-1 justify-between">
            {/* Conversations flow */}
            <div className="space-y-4 mb-4 flex-1">
              {chatMessages.map(msg => {
                const isUser = msg.sender === "user";
                return (
                  <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start animate-fadeIn"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed border ${
                        isUser
                          ? "bg-indigo-600 border-indigo-400/20 text-white"
                          : "bg-slate-800 border-slate-700/50 text-slate-200 text-left"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[10px] text-slate-400 block mt-1.5 text-right font-mono font-medium">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 text-slate-400 rounded-2xl p-3 text-xs flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>AI Tutor is drafting clean explanations...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* In-chat submit line */}
            {activeLesson ? (
              <div className="flex gap-2 border-t border-slate-800 pt-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask a technical question or summarize..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none placeholder-slate-500 transition"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 text-white rounded-xl transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/10 border border-slate-800 rounded-xl p-4 text-center">
                <AlertCircle className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <p className="text-slate-400 text-[11px]">Select a video in your catalog to boot chat assistance.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 flex flex-col justify-between h-full">
            {/* If no quiz compiled yet */}
            {!quiz && !quizLoading && (
              <div className="text-center py-10 my-auto">
                <Award className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-bounce" />
                <h3 className="text-sm font-bold text-slate-200">Test Your Competencies</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Click below to generate an AI-powered technical quiz of 3 questions specifically based on this lesson's transcript.
                </p>
                <button
                  onClick={handleGenerateQuiz}
                  className="mt-5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl shadow-lg border border-indigo-400/20 flex items-center gap-1.5 mx-auto transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Generate AI Challenge
                </button>
              </div>
            )}

            {quizLoading && (
              <div className="text-center py-16">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-medium">Prompting Gemini to craft interactive evaluations...</p>
              </div>
            )}

            {/* Quiz Render Loop */}
            {quiz && (
              <div className="space-y-6 text-left pb-4">
                <div className="flex justify-between items-center bg-slate-800/30 border border-slate-800/80 rounded-xl p-3.5">
                  <div>
                    <h4 className="text-white text-xs font-bold truncate max-w-[180px]">{quiz.title}</h4>
                    <span className="text-[10px] text-slate-400">Answer correctly to unlock XP & level progress!</span>
                  </div>
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                    +40 XP Reward
                  </span>
                </div>

                {quiz.questions.map((q, qK) => {
                  return (
                    <div key={qK} className="space-y-2 border-b border-slate-800 pb-5 last:border-b-0">
                      <h5 className="text-xs font-semibold text-slate-200 flex items-start gap-1">
                        <span className="text-indigo-400 font-mono font-bold">Q{qK+1}.</span> {q.question}
                      </h5>

                      <div className="space-y-1.5 pt-1.5">
                        {q.options.map((option, oK) => {
                          const isSelected = selectedAnswers[qK] === oK;
                          const showCorrect = quizSubmitted && oK === q.correctAnswerIndex;
                          const showIncorrect = quizSubmitted && isSelected && oK !== q.correctAnswerIndex;

                          let btnClasses = "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700";
                          if (isSelected && !quizSubmitted) {
                            btnClasses = "bg-indigo-600/10 border-indigo-500 text-indigo-400";
                          } else if (showCorrect) {
                            btnClasses = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold";
                          } else if (showIncorrect) {
                            btnClasses = "bg-rose-500/10 border-rose-500 text-rose-400";
                          }

                          return (
                            <button
                              key={oK}
                              onClick={() => selectAnswer(qK, oK)}
                              disabled={quizSubmitted}
                              className={`w-full p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between gap-2.5 ${btnClasses} cursor-pointer disabled:cursor-not-allowed`}
                            >
                              <span className="leading-snug">{option}</span>
                              {showCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {showIncorrect && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation details */}
                      {quizSubmitted && (
                        <div className="mt-2.5 bg-slate-950/85 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                          <strong className="text-indigo-400 font-semibold block mb-0.5">EXPLANATION</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Confirm Quiz submits */}
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete AI Challenge
                  </button>
                ) : (
                  <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800/80">
                    <h5 className="text-slate-100 text-sm font-bold">Quiz Results: {score}/{quiz.questions.length} Correct</h5>
                    <p className="text-xs text-slate-400 mt-1">XP gained: +40 XP points awarded. Skills leveled up!</p>
                    <button
                      onClick={handleGenerateQuiz}
                      className="mt-3.5 px-4.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-300 font-semibold transition cursor-pointer mx-auto block"
                    >
                      Redo Challenge
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
