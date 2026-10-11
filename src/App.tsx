/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language } from './utils/translations';
import { soundEngine } from './utils/audio';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { MarbleBagLab } from './components/MarbleBagLab';
import { ToolsLab } from './components/ToolsLab';
import { DailySituations } from './components/DailySituations';
import { QuizSection } from './components/QuizSection';
import { TeachersGuide } from './components/TeachersGuide';

export default function App() {
  const [studentName, setStudentName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'app' | 'teachers_guide'>('app');
  const [lang, setLang] = useState<Language>('ms'); // BM as default
  const [activeTab, setActiveTab] = useState<'marble' | 'tools' | 'daily' | 'quiz'>('marble');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmActive, setIsBgmActive] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Initialize preference checks
  useEffect(() => {
    // Check system prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    // Try reading saved name from localStorage
    try {
      const savedName = localStorage.getItem('kssr_student_name');
      if (savedName) {
        setStudentName(savedName);
      }
    } catch {
      // restricted sandbox storage fallback
    }
  }, []);

  // Language toggle handler
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ms' ? 'en' : 'ms'));
  };

  // Master mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMute(nextMuted);
  };

  // BGM toggle
  const handleToggleBgm = () => {
    const nextBgm = !isBgmActive;
    setIsBgmActive(nextBgm);
    soundEngine.setBgmEnabled(nextBgm);
    if (nextBgm && !isMuted && isLoggedIn && viewMode === 'app') {
      soundEngine.startBGM();
    } else if (!nextBgm) {
      soundEngine.stopBGM();
    }
  };

  // Reduced motion toggle
  const handleToggleReducedMotion = () => {
    setReducedMotion((prev) => !prev);
  };

  // Start from Login Screen
  const handleStart = (name: string) => {
    setStudentName(name);
    setIsLoggedIn(true);
    setViewMode('app');
  };

  // Switch student
  const handleSwitchStudent = () => {
    soundEngine.playClick();
    setIsLoggedIn(false);
    setViewMode('app');
  };

  // Open Teacher's Guide (Without playing music)
  const handleOpenTeachersGuide = () => {
    setViewMode('teachers_guide');
  };

  // Back from Teacher's Guide
  const handleBackFromTeachersGuide = () => {
    setViewMode('app');
  };

  // If in Teacher's Guide mode: show guide directly
  if (viewMode === 'teachers_guide') {
    return <TeachersGuide lang={lang} onBack={handleBackFromTeachersGuide} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${reducedMotion ? 'motion-reduce' : ''}`}>
      {!isLoggedIn ? (
        <LoginScreen
          lang={lang}
          onToggleLang={handleToggleLang}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStart={handleStart}
          onOpenTeachersGuide={handleOpenTeachersGuide}
          reducedMotion={reducedMotion}
        />
      ) : (
        <>
          <Navbar
            lang={lang}
            onToggleLang={handleToggleLang}
            studentName={studentName}
            onSwitchStudent={handleSwitchStudent}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenTeachersGuide={handleOpenTeachersGuide}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isBgmActive={isBgmActive}
            onToggleBgm={handleToggleBgm}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={handleToggleReducedMotion}
          />

          <main className="flex-1 pb-16">
            {activeTab === 'marble' && (
              <MarbleBagLab lang={lang} reducedMotion={reducedMotion} />
            )}
            {activeTab === 'tools' && (
              <ToolsLab lang={lang} reducedMotion={reducedMotion} />
            )}
            {activeTab === 'daily' && <DailySituations lang={lang} />}
            {activeTab === 'quiz' && (
              <QuizSection lang={lang} studentName={studentName} />
            )}
          </main>

          {/* Classroom footer */}
          <footer className="border-t border-amber-200 bg-white/70 py-4 px-6 text-center text-xs text-slate-500 font-bold print:hidden">
            <p>
              {lang === 'ms'
                ? 'KSSR Semakan 2017 Matematik Tahun 6 • Standard Pembelajaran 8.2.2 Kebolehjadian'
                : 'KSSR Revised 2017 Year 6 Mathematics • Learning Standard 8.2.2 Likelihood'}
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
