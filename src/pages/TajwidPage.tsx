import React, { useState, useEffect } from 'react';
import { TAJWID_RULES, TAJWID_QUIZ_QUESTIONS } from '../data/tajwidData';
import { TajwidRule, TajwidQuizProgress } from '../types/tajwid';
import {
  getTajwidProgress,
  saveTajwidProgress,
} from '../storage/persistence';
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Info,
  Award,
} from 'lucide-react';

interface TajwidPageProps {
  onBack: () => void;
}

export const TajwidPage: React.FC<TajwidPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'materi' | 'kuis'>('materi');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nun_sukun' | 'mim_sukun' | 'mad' | 'lainnya'>('all');
  const [selectedRule, setSelectedRule] = useState<TajwidRule | null>(TAJWID_RULES[0]);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [progress, setProgress] = useState<TajwidQuizProgress>(() => getTajwidProgress());

  useEffect(() => {
    setProgress(getTajwidProgress());
  }, []);

  const filteredRules = selectedCategory === 'all'
    ? TAJWID_RULES
    : TAJWID_RULES.filter(r => r.category === selectedCategory);

  // Handle quiz answer
  const currentQuestion = TAJWID_QUIZ_QUESTIONS[currentQuizIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < TAJWID_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished
      const finalScore = quizScore + (selectedOption === currentQuestion.correctIndex ? 1 : 0);
      const percent = Math.round((finalScore / TAJWID_QUIZ_QUESTIONS.length) * 100);

      const updatedProgress: TajwidQuizProgress = {
        totalAnswered: progress.totalAnswered + TAJWID_QUIZ_QUESTIONS.length,
        correctAnswers: progress.correctAnswers + finalScore,
        completedRuleIds: Array.from(new Set([...progress.completedRuleIds, ...TAJWID_RULES.map(r => r.id)])),
        lastScorePercent: percent,
      };

      saveTajwidProgress(updatedProgress);
      setProgress(updatedProgress);
      setIsQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-28">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#AABBD0] hover:text-white hover:bg-[#082245] border border-transparent hover:border-[#29415E] transition cursor-pointer"
            title="Kembali ke Beranda"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Belajar Tajwid Interaktif
            </h1>
            <p className="text-xs sm:text-sm text-[#AABBD0]">
              Pelajari kaidah hukum bacaan Al-Qur’an secara bertahap
            </p>
          </div>
        </div>

        {/* Tab Switcher: Materi vs Kuis */}
        <div className="flex items-center p-1 bg-[#082245] rounded-2xl border border-[#29415E]">
          <button
            onClick={() => setActiveTab('materi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'materi'
                ? 'bg-[#168BFF] text-white shadow-md'
                : 'text-[#AABBD0] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Materi Tajwid</span>
          </button>

          <button
            onClick={() => setActiveTab('kuis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kuis'
                ? 'bg-[#168BFF] text-white shadow-md'
                : 'text-[#AABBD0] hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Kuis Interaktif</span>
            {progress.lastScorePercent > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px]">
                {progress.lastScorePercent}%
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'materi' ? (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Semua Hukum' },
              { id: 'nun_sukun', label: 'Nun Sukun & Tanwin' },
              { id: 'mim_sukun', label: 'Mim Sukun' },
              { id: 'mad', label: 'Hukum Mad' },
              { id: 'lainnya', label: 'Qalqalah & Lainnya' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#168BFF] text-white border-[#168BFF] shadow-md'
                    : 'bg-[#082245] border border-[#29415E] text-[#AABBD0] hover:text-white hover:border-[#168BFF]/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid Layout: Left Rules Selector, Right Rule Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left list of rules */}
            <div className="space-y-2 md:max-h-[600px] overflow-y-auto pr-1">
              {filteredRules.map(rule => {
                const isSelected = selectedRule?.id === rule.id;
                return (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className={`w-full p-3.5 rounded-2xl text-left transition border cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0c2f5d] border-[#168BFF] ring-2 ring-[#168BFF]/30 shadow-lg'
                        : 'bg-[#061A35] border-[#29415E] hover:border-[#168BFF]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: rule.colorHex }}
                        />
                        <h4 className="text-sm font-bold text-white">
                          {rule.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#AABBD0] mt-0.5 block">
                        {rule.categoryName}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#7E95B1]" />
                  </button>
                );
              })}
            </div>

            {/* Right: Selected Rule Detail Card */}
            {selectedRule && (
              <div className="md:col-span-2 p-6 rounded-3xl bg-[#061A35] border border-[#29415E] shadow-xl space-y-5 text-white">
                {/* Rule Header */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#29415E]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1.5"
                      style={{
                        backgroundColor: '#082245',
                        color: selectedRule.colorHex,
                        border: `1px solid ${selectedRule.colorHex}50`
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{selectedRule.categoryName}</span>
                    </div>

                    <h2 className="text-2xl font-black text-white">
                      {selectedRule.name}
                    </h2>
                  </div>

                  <span
                    className="w-4 h-4 rounded-full shrink-0 mt-2 shadow-sm"
                    style={{ backgroundColor: selectedRule.colorHex }}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#AABBD0] uppercase tracking-wider">
                    Pengertian
                  </h4>
                  <p className="text-sm text-[#E2EDF8] leading-relaxed">
                    {selectedRule.description}
                  </p>
                </div>

                {/* Huruf & Syarat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#082245] border border-[#29415E] space-y-1">
                    <span className="text-[10px] font-bold text-[#AABBD0] uppercase tracking-wider block">
                      Huruf yang Terlibat:
                    </span>
                    <p className="font-arabic text-xl font-bold text-[#168BFF] py-0.5 text-right">
                      {selectedRule.lettersArabic}
                    </p>
                    <p className="text-xs text-[#7E95B1]">
                      {selectedRule.letters.join(', ')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#082245] border border-[#29415E] space-y-1">
                    <span className="text-[10px] font-bold text-[#AABBD0] uppercase tracking-wider block">
                      Cara Membaca:
                    </span>
                    <p className="text-xs text-white font-semibold leading-relaxed">
                      {selectedRule.pronunciation}
                    </p>
                  </div>
                </div>

                {/* Quranic Verse Examples */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-[#AABBD0] uppercase tracking-wider">
                    Contoh dalam Al-Qur'an:
                  </h4>

                  <div className="space-y-2.5">
                    {selectedRule.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#082245] border border-[#29415E] hover:border-[#168BFF] transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#168BFF] bg-[#0c2f5d] px-2.5 py-0.5 rounded-md border border-[#168BFF]/30">
                            {ex.surahRef}
                          </span>
                          <span className="text-xs text-[#AABBD0]">
                            Fokus: <strong className="font-arabic text-sm text-[#168BFF]">{ex.highlightedPart}</strong>
                          </span>
                        </div>

                        <div className="text-right py-1">
                          <p className="font-arabic text-2xl text-white leading-loose">
                            {ex.arabic}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#AABBD0] gap-1 pt-1 border-t border-[#29415E]">
                          <span className="italic font-medium text-[#168BFF]">{ex.latin}</span>
                          <span className="text-[#E2EDF8]">"{ex.meaning}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-2 text-amber-200 text-xs">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Catatan:</strong> Modul ini bertujuan sebagai panduan edukasi dasar. Belajar membaca Al-Qur'an secara fasih tetap dianjurkan bertatap muka (*talaqqi & musyafahah*) bersama ustadz/guru Al-Qur’an yang bersanad.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* QUIZ MODE */
        <div className="max-w-2xl mx-auto space-y-6">
          {!isQuizFinished ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#061A35] border border-[#29415E] shadow-xl space-y-6 text-white">
              {/* Quiz progress header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#29415E]">
                <div>
                  <span className="text-[10px] font-bold text-[#AABBD0] uppercase tracking-wider block">
                    Kuis Tajwid Praktis
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Pertanyaan {currentQuizIndex + 1} dari {TAJWID_QUIZ_QUESTIONS.length}
                  </h3>
                </div>

                <div className="px-3 py-1 rounded-full bg-[#082245] border border-[#168BFF]/40 text-[#168BFF] text-xs font-bold">
                  Skor: {quizScore}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {currentQuestion.question}
                </h2>

                {/* Quran Snippet Box */}
                <div className="p-4 rounded-2xl bg-[#082245] border border-[#29415E] text-center space-y-1">
                  <span className="font-arabic text-2xl sm:text-3xl text-white block leading-loose">
                    {currentQuestion.exampleSnippet}
                  </span>
                  {currentQuestion.surahRef && (
                    <span className="text-[11px] font-semibold text-[#168BFF]">
                      ({currentQuestion.surahRef})
                    </span>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let optionStyle = 'bg-[#082245] border-[#29415E] text-white hover:border-[#168BFF]';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-red-950/80 border-red-500 text-red-200';
                    } else {
                      optionStyle = 'bg-[#04152D] border-[#29415E]/40 text-[#7E95B1] opacity-50';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-[#0c2f5d] border-[#168BFF] text-[#168BFF] font-bold shadow-md';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between text-xs sm:text-sm cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#04152D] text-xs font-bold flex items-center justify-center shrink-0 border border-[#29415E]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box after answer */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-[#082245] border border-[#168BFF]/30 space-y-1 text-xs animate-fade-in">
                  <span className="font-bold text-[#168BFF] block">Penjelasan:</span>
                  <p className="text-[#E2EDF8] leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#168BFF]/90 text-white text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    Kirim Jawaban
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#168BFF]/90 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
                  >
                    <span>
                      {currentQuizIndex < TAJWID_QUIZ_QUESTIONS.length - 1
                        ? 'Pertanyaan Berikutnya'
                        : 'Lihat Hasil Kuis'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Result Card */
            <div className="p-8 rounded-3xl bg-[#061A35] border border-[#29415E] shadow-2xl text-center space-y-6 text-white">
              <div className="w-20 h-20 rounded-full bg-[#082245] text-[#168BFF] border border-[#168BFF]/40 flex items-center justify-center mx-auto shadow-md">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">
                  Kuis Tajwid Selesai!
                </h3>
                <p className="text-xs text-[#AABBD0]">
                  Alhamdulillah, Anda telah menyelesaikan seluruh latihan tajwid.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#082245] border border-[#29415E] max-w-sm mx-auto space-y-2">
                <span className="text-xs font-bold text-[#AABBD0] uppercase tracking-wider block">
                  Nilai Akhir Anda
                </span>
                <span className="text-4xl font-black text-[#168BFF] font-mono">
                  {Math.round((quizScore / TAJWID_QUIZ_QUESTIONS.length) * 100)}%
                </span>
                <p className="text-xs font-semibold text-white">
                  Menjawab benar {quizScore} dari {TAJWID_QUIZ_QUESTIONS.length} pertanyaan
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082245] border border-[#29415E] hover:border-[#168BFF] text-white text-xs font-bold transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Kuis</span>
                </button>

                <button
                  onClick={() => setActiveTab('materi')}
                  className="px-5 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#168BFF]/90 text-white text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Pelajari Materi Kembali
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
