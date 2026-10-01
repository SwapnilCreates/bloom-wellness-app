"use client";

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  CloudSun,
  Droplets,
  Flower2,
  Heart,
  Home,
  MoonStar,
  NotebookPen,
  Send,
  Sparkles,
  UserRound,
  Watch,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bloom-data-v1';
const THEME_KEY = 'bloom-theme-v1';
const PARTNER_EMAIL_KEY = 'bloom-partner-email-v1';
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

const THEMES = {
  blossom: {
    name: 'Blossom Pink',
    bg: '#fff7fb',
    bg2: '#ffeef7',
    card: '#fffefa',
    cardStrong: '#ffe5f1',
    text: '#7c415f',
    muted: '#9b6e82',
    primary: '#f5a6c8',
    secondary: '#d8c2f4',
    accent: '#f7caa8',
    glow: '#ffd5eb',
    ring: '#f7b4d3',
  },
  lavender: {
    name: 'Lavender Dream',
    bg: '#f8f4ff',
    bg2: '#efe8ff',
    card: '#fffcff',
    cardStrong: '#e9d8ff',
    text: '#5b4c88',
    muted: '#7b6ea1',
    primary: '#c9b7ff',
    secondary: '#b8d9ff',
    accent: '#f8d7c8',
    glow: '#e6dcff',
    ring: '#b299ff',
  },
  peach: {
    name: 'Peach Glow',
    bg: '#fff8f2',
    bg2: '#ffe8d8',
    card: '#fffefc',
    cardStrong: '#fde2d1',
    text: '#8b5d49',
    muted: '#a67662',
    primary: '#f7c3a6',
    secondary: '#f8d78f',
    accent: '#ffb1b9',
    glow: '#ffd9c5',
    ring: '#f5a682',
  },
  rose: {
    name: 'Rose Cloud',
    bg: '#fff4f4',
    bg2: '#ffe2ea',
    card: '#fffdfd',
    cardStrong: '#ffdfe8',
    text: '#7a3e53',
    muted: '#a05d74',
    primary: '#f4a2b9',
    secondary: '#d9b6ff',
    accent: '#f7d0a8',
    glow: '#ffd7e3',
    ring: '#ee87a5',
  },
  cream: {
    name: 'Pearl Bloom',
    bg: '#fffdfa',
    bg2: '#f8efe7',
    card: '#fffdfb',
    cardStrong: '#f3e5d1',
    text: '#705d4c',
    muted: '#8c7668',
    primary: '#e9bdb4',
    secondary: '#d8c8ef',
    accent: '#f2d39f',
    glow: '#f9e9d7',
    ring: '#d99282',
  },
} as const;

type ThemeKey = keyof typeof THEMES;
type TabKey = 'home' | 'track' | 'journey' | 'profile';

type TrackerData = {
  water: number;
  vitC: boolean;
  vitD1: boolean;
  vitD2: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  fruits: boolean;
  activity: number;
  ankleCare: boolean;
  sleepHours: number;
  sleepQuality: number;
  screenTime: number;
  phoneBeforeSleep: boolean;
  mood: number;
  energy: number;
  stress: number;
  overthinking: number;
  study: number;
  editing: number;
};

const defaultTracker: TrackerData = {
  water: 0,
  vitC: false,
  vitD1: false,
  vitD2: false,
  breakfast: false,
  lunch: false,
  dinner: false,
  fruits: false,
  activity: 0,
  ankleCare: false,
  sleepHours: 0,
  sleepQuality: 3,
  screenTime: 0,
  phoneBeforeSleep: false,
  mood: 3,
  energy: 3,
  stress: 3,
  overthinking: 1,
  study: 0,
  editing: 0,
};

const moodLabels = ['Very Bad', 'Low', 'Neutral', 'Good', 'Great'];
const energyLabels = ['Exhausted', 'Low', 'Okay', 'Good', 'Energetic'];
const stressLabels = ['Calm', 'A bit', 'Okay', 'High', 'Overloaded'];
const sleepQualityLabels = ['Poor', 'Below Average', 'Okay', 'Good', 'Excellent'];

const getDateKey = (date: Date = new Date()) => date.toISOString().slice(0, 10);

const getTodayGreeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return { title: 'Good Morning, Princess', subtitle: 'Let’s make today beautiful! 🌸' };
  if (hours < 17) return { title: 'Good Afternoon, Beautiful', subtitle: 'You’ve got this. ✨' };
  return { title: 'Good Evening, Princess', subtitle: 'Take a breath and settle in. 🌙' };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatHours = (value: number) => {
  if (value === 0) return '0h';
  if (Number.isInteger(value)) return `${value}h`;
  return `${value.toFixed(1)}h`;
};

const getProductivityStatus = (total: number) => {
  if (total === 0) return { label: '🌙 Rest Day', color: '#d9c4f2' };
  if (total >= 0.5 && total <= 1.5) return { label: '🌱 Small Progress', color: '#f7caa8' };
  if (total >= 2 && total <= 3.5) return { label: '✨ Productive Day', color: '#f5a6c8' };
  if (total >= 4 && total <= 5.5) return { label: '🔥 Amazing Day', color: '#f7b4d3' };
  return { label: '👑 Productivity Queen', color: '#f1c76f' };
};

const buildDailySummary = (
  entry: TrackerData,
  hydrationGoal: number,
  totalProductiveHours: number,
  wellnessScore: number,
) => {
  const mealText = [entry.breakfast, entry.lunch, entry.dinner].filter(Boolean).length;
  const moodText = moodLabels[Math.max(0, Math.min(moodLabels.length - 1, entry.mood - 1))];
  const sleepText = sleepQualityLabels[Math.max(0, Math.min(sleepQualityLabels.length - 1, entry.sleepQuality - 1))];

  return [
    '💝 Your girl’s Bloom report 🌸',
    '',
    `Wellness Score: ${wellnessScore}/100`,
    `Productivity: ${totalProductiveHours.toFixed(1)}h`,
    `Mood: ${moodText}`,
    `Water: ${entry.water}/${hydrationGoal} glasses`,
    `Sleep: ${formatHours(entry.sleepHours)} • ${sleepText}`,
    `Meals: ${mealText}/3 eaten`,
    `Activity: ${entry.activity} min`,
    `Screen Time: ${entry.screenTime}h`,
    `Phone Before Sleep: ${entry.phoneBeforeSleep ? 'Avoided it' : 'Used it'}`,
    `Study: ${formatHours(entry.study)}`,
    `Editing: ${formatHours(entry.editing)}`,
    `Fruit & Veg: ${entry.fruits ? 'Yes' : 'Not today'}`,
    '',
    'You are doing amazing. Keep blooming. 🌷',
  ].join('\n');
};

function App() {
  const [themeKey, setThemeKey] = useState<ThemeKey>('blossom');
  const [tab, setTab] = useState<TabKey>('home');
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [entries, setEntries] = useState<Record<string, TrackerData>>({});
  const [hydrationGoal, setHydrationGoal] = useState(8);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const theme = THEMES[themeKey];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedPartnerEmail = localStorage.getItem(PARTNER_EMAIL_KEY);

    if (savedTheme && savedTheme in THEMES) setThemeKey(savedTheme as ThemeKey);
    if (savedPartnerEmail) setPartnerEmail(savedPartnerEmail);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.entries) setEntries(parsed.entries);
        if (parsed.hydrationGoal) setHydrationGoal(parsed.hydrationGoal);
      } catch (error) {
        console.error('Failed to parse local data', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeKey);
  }, [themeKey]);

  useEffect(() => {
    localStorage.setItem(PARTNER_EMAIL_KEY, partnerEmail);
  }, [partnerEmail]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        entries,
        hydrationGoal,
      }),
    );
  }, [entries, hydrationGoal]);

  const currentEntry = entries[selectedDate] || defaultTracker;

  const updateEntry = (field: keyof TrackerData, value: number | boolean) => {
    setEntries((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || defaultTracker),
        [field]: value,
      },
    }));
  };

  const totalProductiveHours = (currentEntry.study || 0) + (currentEntry.editing || 0);
  const productivityStatus = getProductivityStatus(totalProductiveHours);

  const completionData = useMemo(() => {
    const values = currentEntry;
    let complete = 0;

    if (values.water > 0) complete += 1;
    if (values.vitC) complete += 1;
    if (values.vitD1) complete += 1;
    if (values.vitD2) complete += 1;
    if (values.breakfast) complete += 1;
    if (values.lunch) complete += 1;
    if (values.dinner) complete += 1;
    if (values.fruits) complete += 1;
    if (values.activity > 0) complete += 1;
    if (values.ankleCare) complete += 1;
    if (values.sleepHours > 0) complete += 1;
    if (values.sleepQuality > 0) complete += 1;
    if (values.screenTime >= 0) complete += 1;
    if (values.phoneBeforeSleep !== undefined) complete += 1;
    if (values.mood > 0) complete += 1;
    if (values.energy > 0) complete += 1;
    if (values.stress > 0) complete += 1;
    if (values.overthinking > 0) complete += 1;
    if (values.study >= 0) complete += 1;
    if (values.editing >= 0) complete += 1;

    return {
      percentage: Math.min(Math.round((complete / 20) * 100), 100),
      complete,
    };
  }, [currentEntry]);

  const wellnessScore = useMemo(() => {
    const water = clamp((currentEntry.water / hydrationGoal) * 20, 0, 20);
    const fruits = currentEntry.fruits ? 8 : 0;
    const meals = [currentEntry.breakfast, currentEntry.lunch, currentEntry.dinner].filter(Boolean).length * 6;
    const activity = clamp((currentEntry.activity / 60) * 15, 0, 15);
    const sleep = clamp((currentEntry.sleepHours / 8) * 15, 0, 15);
    const quality = ((currentEntry.sleepQuality - 1) / 4) * 10;
    const screen = clamp((1 - currentEntry.screenTime / 12) * 10, 0, 10);
    const mind = ((currentEntry.mood - 1) / 4) * 10 + ((currentEntry.energy - 1) / 4) * 8 - ((currentEntry.stress - 1) / 4) * 6;
    const productivity = clamp((totalProductiveHours / 6) * 12, 0, 12);
    const vitamins = [currentEntry.vitC, currentEntry.vitD1, currentEntry.vitD2].filter(Boolean).length * 5;

    const score = Math.round(
      water + fruits + meals + activity + sleep + quality + screen + clamp(mind, 0, 18) + productivity + vitamins,
    );

    return clamp(score, 0, 100);
  }, [currentEntry, hydrationGoal, totalProductiveHours]);

  const recentDates = Object.keys(entries).sort((a, b) => b.localeCompare(a));

  const streakCount = useMemo(() => {
    let count = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const current = new Date(today);
      current.setDate(today.getDate() - i);
      const key = getDateKey(current);
      if (entries[key]) {
        count += 1;
      } else if (i > 0) {
        break;
      }
    }

    return count;
  }, [entries]);

  const gardenStage = useMemo(() => {
    if (streakCount >= 30) return { icon: '🌼', label: 'Blooming Garden' };
    if (streakCount >= 14) return { icon: '🌷', label: 'Rose energy' };
    if (streakCount >= 7) return { icon: '🌸', label: 'Cherry bloom' };
    if (streakCount >= 3) return { icon: '🌱', label: 'Growing roots' };
    return { icon: '🌿', label: 'New seed' };
  }, [streakCount]);

  const greeting = getTodayGreeting();
  const themeSwatches = Object.keys(THEMES) as ThemeKey[];

  const handleCompleteCheckIn = () => {
    setShowCelebration(true);
    setTab('home');
    setTimeout(() => setShowCelebration(false), 2600);
  };

  const handleSendToPartner = async () => {
    if (!partnerEmail.trim()) {
      setReportStatus('Add your partner email in profile first 💌');
      setTab('profile');
      return;
    }

    const summary = buildDailySummary(currentEntry, hydrationGoal, totalProductiveHours, wellnessScore);
    setReportStatus('Sending your daily report...');

    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: partnerEmail,
          report: summary,
          subject: `Your girl’s Bloom update for ${new Date(selectedDate).toLocaleDateString()}`,
        }),
      });

      const payload = await response.json();

      if (payload.success) {
        setReportStatus('Daily report sent to your boyfie ✨');
      } else {
        const mailtoLink = `mailto:${partnerEmail}?subject=${encodeURIComponent('Your girl’s Bloom update 🌸')}&body=${encodeURIComponent(summary)}`;
        window.location.href = mailtoLink;
        setReportStatus('Email app opened — send it from there 💌');
      }
    } catch (error) {
      const mailtoLink = `mailto:${partnerEmail}?subject=${encodeURIComponent('Your girl’s Bloom update 🌸')}&body=${encodeURIComponent(summary)}`;
      window.location.href = mailtoLink;
      setReportStatus('Couldn’t send automatically, so your email app opened instead 💌');
    }
  };

  const currentMood = moodLabels[clamp(currentEntry.mood - 1, 0, moodLabels.length - 1)] || 'Neutral';

  return (
    <div
      className="min-h-screen px-4 py-5"
      style={{
        background: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.bg2} 100%)`,
        color: theme.text,
      }}
    >
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
              BLOOM
            </p>
          </div>
          <div className="rounded-full border border-white/50 px-3 py-1.5 text-xs font-medium shadow-soft" style={{ background: theme.card, color: theme.text }}>
            {DATE_FORMATTER.format(new Date(selectedDate))}
          </div>
        </div>

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff9fb]/70 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm rounded-[30px] border border-white/60 p-6 text-center shadow-soft"
                style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.cardStrong} 100%)` }}
              >
                <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.6 }} className="mb-4 text-5xl">
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Today is complete! 🌸</h2>
                <p className="mt-2 text-sm" style={{ color: theme.muted }}>
                  Wellness score: <strong>{wellnessScore}/100</strong>
                </p>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  Productivity: <strong>{totalProductiveHours.toFixed(1)}h</strong>
                </p>
                <p className="mt-5 text-sm italic" style={{ color: theme.text }}>
                  “Small steps still count. 🌷”
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'home' && (
          <div className="space-y-5 pb-24">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] border border-white/50 p-5 shadow-soft"
              style={{ background: `linear-gradient(135deg, ${theme.card} 0%, ${theme.cardStrong} 100%)` }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.muted }}>Hello, love</p>
                  <h1 className="mt-1 text-3xl font-bold leading-tight" style={{ color: theme.text }}>
                    {greeting.title}
                  </h1>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: theme.glow }}>
                  <Sparkles size={22} style={{ color: theme.text }} />
                </div>
              </div>
              <p className="text-sm" style={{ color: theme.muted }}>{greeting.subtitle}</p>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-[26px] border border-white/50 p-4" style={{ background: theme.card }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.muted }}>Today</p>
                  <p className="mt-2 text-3xl font-bold" style={{ color: theme.text }}>{completionData.percentage}%</p>
                  <p className="mt-1 text-xs" style={{ color: theme.muted }}>check-in complete</p>
                </div>

                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg width="78" height="78" viewBox="0 0 100 100" className="rotate-[-90deg]">
                    <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.7)" strokeWidth="10" fill="none" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke={theme.primary}
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={239}
                      strokeDashoffset={239 - (239 * completionData.percentage) / 100}
                    />
                  </svg>
                  <div className="absolute text-sm font-bold" style={{ color: theme.text }}>{completionData.percentage}%</div>
                </div>
              </div>
            </motion.section>

            <section className="grid grid-cols-2 gap-3">
              <QuickCard icon={<Droplets size={18} />} label="Water" value={`${currentEntry.water} / ${hydrationGoal}`} color={theme.primary} />
              <QuickCard icon={<MoonStar size={18} />} label="Sleep" value={formatHours(currentEntry.sleepHours)} color={theme.secondary} />
              <QuickCard icon={<NotebookPen size={18} />} label="Study" value={formatHours(currentEntry.study)} color={theme.accent} />
              <QuickCard icon={<CloudSun size={18} />} label="Mood" value={currentMood} color={theme.primary} />
            </section>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab('track')}
              className="flex w-full items-center justify-between rounded-[28px] border border-white/50 px-5 py-4 text-left shadow-soft"
              style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, color: '#fff' }}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">Daily check-in</p>
                <p className="mt-1 text-xl font-bold">Complete Today’s Check-in</p>
              </div>
              <ArrowRight size={22} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSendToPartner}
              className="flex w-full items-center justify-center gap-2 rounded-[28px] border border-white/50 px-5 py-4 text-base font-bold shadow-soft"
              style={{ background: `linear-gradient(135deg, ${theme.cardStrong} 0%, ${theme.card} 100%)`, color: theme.text }}
            >
              <Send size={18} />
              Let your boyfie know 🌷
            </motion.button>

            {reportStatus && (
              <p className="text-center text-sm" style={{ color: theme.muted }}>{reportStatus}</p>
            )}

            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-lg font-bold" style={{ color: theme.text }}>Bloom Garden</p>
                <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: theme.glow, color: theme.text }}>{gardenStage.icon} {gardenStage.label}</span>
              </div>
              <div className="flex items-end justify-between gap-2 rounded-[24px] px-3 py-4" style={{ background: `linear-gradient(180deg, ${theme.cardStrong}, ${theme.card})` }}>
                <div className="text-5xl">{gardenStage.icon}</div>
                <div className="flex-1 text-right">
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.muted }}>Streak</p>
                  <p className="text-2xl font-bold" style={{ color: theme.text }}>{streakCount} days</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'track' && (
          <div className="space-y-5 pb-24">
            <header className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.muted }}>Today’s Tracker</p>
                  <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Daily Check-In</h2>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-full border border-white/50 px-3 py-2 text-sm shadow-sm outline-none"
                  style={{ background: theme.cardStrong, color: theme.text }}
                />
              </div>
            </header>

            <TrackerSection title="🌿 Body & Health" icon={<Heart size={18} />}>
              <WaterTracker value={currentEntry.water} max={hydrationGoal} onChange={(v) => updateEntry('water', v)} />
              <YesNoRow label="Vitamin C" value={currentEntry.vitC} onChange={(v) => updateEntry('vitC', v)} />
              <YesNoRow label="Vitamin D1" value={currentEntry.vitD1} onChange={(v) => updateEntry('vitD1', v)} />
              <YesNoRow label="Vitamin D2" value={currentEntry.vitD2} onChange={(v) => updateEntry('vitD2', v)} />
              <MealRow value={currentEntry} onChange={updateEntry} />
              <ChoiceCardRow
                title="Fruits & Vegetables"
                options={[
                  { label: 'Had some today!', value: true },
                  { label: 'Not today', value: false },
                ]}
                selected={currentEntry.fruits}
                onSelect={(v) => updateEntry('fruits', v)}
              />
              <SliderRow label="Physical Activity" min={0} max={120} step={5} suffix="min" value={currentEntry.activity} onChange={(v) => updateEntry('activity', v)} />
              <ChoiceCardRow
                title="Ankle Care"
                options={[
                  { label: 'Yes, I did!', value: true },
                  { label: 'Not today', value: false },
                ]}
                selected={currentEntry.ankleCare}
                onSelect={(v) => updateEntry('ankleCare', v)}
              />
            </TrackerSection>

            <TrackerSection title="🌙 Sleep" icon={<MoonStar size={18} />}>
              <SliderRow label="Sleep Duration" min={0} max={12} step={0.5} suffix="h" value={currentEntry.sleepHours} onChange={(v) => updateEntry('sleepHours', v)} />
              <MoodPicker label="Sleep Quality" options={sleepQualityLabels} value={currentEntry.sleepQuality} onChange={(v) => updateEntry('sleepQuality', v)} />
            </TrackerSection>

            <TrackerSection title="📱 Digital Life" icon={<Watch size={18} />}>
              <SliderRow label="Screen Time" min={0} max={12} step={0.5} suffix="h" value={currentEntry.screenTime} onChange={(v) => updateEntry('screenTime', v)} />
              <ChoiceCardRow
                title="Phone Before Sleep"
                options={[
                  { label: 'I avoided it!', value: true },
                  { label: 'Guilty...', value: false },
                ]}
                selected={currentEntry.phoneBeforeSleep}
                onSelect={(v) => updateEntry('phoneBeforeSleep', v)}
              />
            </TrackerSection>

            <TrackerSection title="🧠 Mind & Wellbeing" icon={<Brain size={18} />}>
              <EmojiPicker label="Mood" options={moodLabels} value={currentEntry.mood} onChange={(v) => updateEntry('mood', v)} />
              <MoodPicker label="Energy Level" options={energyLabels} value={currentEntry.energy} onChange={(v) => updateEntry('energy', v)} />
              <MoodPicker label="Stress Level" options={stressLabels} value={currentEntry.stress} onChange={(v) => updateEntry('stress', v)} />
              <ChoiceCardRow
                title="Overthinking"
                options={[
                  { label: 'Peaceful', value: 1 },
                  { label: 'A Little', value: 2 },
                  { label: 'A Lot', value: 3 },
                ]}
                selected={currentEntry.overthinking}
                onSelect={(v) => updateEntry('overthinking', v)}
              />
            </TrackerSection>

            <TrackerSection title="🎯 Productivity" icon={<Zap size={18} />}>
              <SliderRow label="Study Time" min={0} max={8} step={0.5} suffix="h" value={currentEntry.study} onChange={(v) => updateEntry('study', v)} />
              <SliderRow label="Video Editing" min={0} max={8} step={0.5} suffix="h" value={currentEntry.editing} onChange={(v) => updateEntry('editing', v)} />
              <div className="rounded-[22px] border border-white/50 p-4" style={{ background: theme.cardStrong }}>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.muted }}>Auto productivity</p>
                <p className="mt-2 text-2xl font-bold" style={{ color: theme.text }}>{totalProductiveHours.toFixed(1)} hours</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: productivityStatus.color }}>{productivityStatus.label}</p>
              </div>
            </TrackerSection>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCompleteCheckIn}
              className="mb-24 flex w-full items-center justify-center rounded-[28px] px-5 py-4 text-lg font-bold shadow-soft"
              style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, color: '#ffffff' }}
            >
              Complete Check-In
            </motion.button>
          </div>
        )}

        {tab === 'journey' && (
          <div className="space-y-5 pb-24">
            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <p className="text-sm font-medium" style={{ color: theme.muted }}>Your growth</p>
              <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text }}>Journey</h2>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <InfoCard label="Wellness Score" value={`${wellnessScore}/100`} accent={theme.primary} />
              <InfoCard label="Streak" value={`${streakCount} days`} accent={theme.secondary} />
              <InfoCard label="Study" value={formatHours(recentDates.reduce((sum, key) => sum + (entries[key]?.study || 0), 0))} accent={theme.accent} />
              <InfoCard label="Avg Sleep" value={formatHours(recentDates.length ? recentDates.reduce((sum, key) => sum + (entries[key]?.sleepHours || 0), 0) / recentDates.length : 0)} accent={theme.primary} />
            </div>

            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <p className="mb-4 text-lg font-bold" style={{ color: theme.text }}>This Week</p>
              <div className="space-y-3">
                {['Water', 'Sleep', 'Mood', 'Study'].map((label, index) => {
                  const value = [currentEntry.water, currentEntry.sleepHours, currentEntry.mood, currentEntry.study][index];
                  const max = [hydrationGoal, 12, 5, 8][index];
                  const pct = clamp((value / max) * 100, 0, 100);
                  return (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-sm" style={{ color: theme.muted }}>
                        <span>{label}</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.7)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold" style={{ color: theme.text }}>Bloom Garden</p>
                <Flower2 size={20} style={{ color: theme.text }} />
              </div>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {Array.from({ length: 25 }).map((_, index) => {
                  const unlocked = index < Math.max(streakCount, 1);
                  return (
                    <motion.div
                      key={index}
                      animate={{ scale: unlocked ? 1 : 0.9, opacity: unlocked ? 1 : 0.4 }}
                      className="flex h-12 items-center justify-center rounded-2xl text-xl"
                      style={{ background: unlocked ? theme.glow : 'rgba(255,255,255,0.4)' }}
                    >
                      {unlocked ? '🌸' : '🌿'}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {tab === 'profile' && (
          <div className="space-y-5 pb-24">
            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.muted }}>Profile</p>
                  <h2 className="text-3xl font-bold" style={{ color: theme.text }}>My Bloom</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: theme.glow }}>
                  <UserRound size={22} style={{ color: theme.text }} />
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <p className="mb-3 text-lg font-bold" style={{ color: theme.text }}>Custom Goals</p>
              <SliderRow label="Water Goal" min={4} max={12} step={1} suffix="glasses" value={hydrationGoal} onChange={setHydrationGoal} />
            </section>

            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <p className="mb-3 text-lg font-bold" style={{ color: theme.text }}>Your Boyfie</p>
              <label className="mb-2 block text-sm" style={{ color: theme.muted }}>Partner email</label>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="boyfriend@example.com"
                className="w-full rounded-[22px] border border-white/50 px-3 py-3 outline-none"
                style={{ background: theme.cardStrong, color: theme.text }}
              />
              <button
                onClick={handleSendToPartner}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, color: '#fff' }}
              >
                <Send size={16} />
                Send today’s report
              </button>
              {reportStatus && <p className="mt-3 text-sm" style={{ color: theme.muted }}>{reportStatus}</p>}
            </section>

            <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: theme.card }}>
              <p className="mb-3 text-lg font-bold" style={{ color: theme.text }}>Theme Library</p>
              <div className="grid grid-cols-2 gap-3">
                {themeSwatches.map((item) => (
                  <button
                    key={item}
                    onClick={() => setThemeKey(item)}
                    className="rounded-[22px] border p-3 text-left shadow-sm transition-all"
                    style={{
                      borderColor: themeKey === item ? theme.primary : 'rgba(255,255,255,0.6)',
                      background: `linear-gradient(135deg, ${THEMES[item].cardStrong} 0%, ${THEMES[item].card} 100%)`,
                    }}
                  >
                    <div className="mb-2 flex gap-2">
                      {[THEMES[item].primary, THEMES[item].secondary, THEMES[item].accent].map((color, index) => (
                        <span key={index} className="h-5 w-5 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: THEMES[item].text }}>{THEMES[item].name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        <nav className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-[28px] border border-white/50 px-3 py-2 shadow-soft" style={{ background: `rgba(255,255,255,0.72)`, backdropFilter: 'blur(18px)' }}>
          {[
            { id: 'home', icon: <Home size={18} />, label: 'Home' },
            { id: 'track', icon: <Sparkles size={18} />, label: 'Track' },
            { id: 'journey', icon: <BarChart3 size={18} />, label: 'Journey' },
            { id: 'profile', icon: <UserRound size={18} />, label: 'Profile' },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as TabKey)}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-xs font-semibold transition-all"
              style={{
                color: tab === id ? theme.text : theme.muted,
                background: tab === id ? theme.glow : 'transparent',
              }}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function QuickCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-[24px] border border-white/50 p-3 shadow-soft" style={{ background: 'rgba(255,255,255,0.6)' }}>
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: color }}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.18em]" style={{ color: '#8c6a76' }}>{label}</p>
      <p className="mt-1 text-xl font-bold" style={{ color: '#6e3b53' }}>{value}</p>
    </div>
  );
}

function TrackerSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[30px] border border-white/50 p-4 shadow-soft" style={{ background: 'rgba(255,255,255,0.62)' }}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.9)' }}>
          {icon}
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#6e3b53' }}>{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function WaterTracker({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="rounded-[22px] border border-white/50 p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: '#6e3b53' }}>Water Intake</p>
        <span className="text-sm font-bold" style={{ color: '#6e3b53' }}>{value} / {max}</span>
      </div>
      <div className="flex items-end gap-2">
        {Array.from({ length: max }).map((_, index) => {
          const filled = index < value;
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(index + 1)}
              className="flex h-9 w-8 items-end justify-center rounded-t-[16px] border border-white/40"
              style={{
                background: filled ? 'linear-gradient(180deg, #9ed7f9 0%, #75c2eb 100%)' : 'rgba(255,255,255,0.7)',
                minHeight: filled ? `${24 + index * 4}px` : '22px',
              }}
            >
              <Droplets size={12} color={filled ? '#fff' : '#b995a9'} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-white/50 p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
      <span className="font-medium" style={{ color: '#6e3b53' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="rounded-full px-3 py-2 text-sm font-semibold"
        style={{ background: value ? '#f5a6c8' : 'rgba(255,255,255,0.8)', color: value ? '#fff' : '#7c415f' }}
      >
        {value ? '✓ Taken' : '○ Not taken'}
      </button>
    </div>
  );
}

function MealRow({ value, onChange }: { value: TrackerData; onChange: (field: keyof TrackerData, value: boolean) => void }) {
  const items = [
    { key: 'breakfast', label: '🥞 Breakfast' },
    { key: 'lunch', label: '🍛 Lunch' },
    { key: 'dinner', label: '🍲 Dinner' },
  ] as const;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color: '#6e3b53' }}>Meals</p>
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ key, label }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(key, !value[key])}
            className="rounded-[18px] border px-2 py-3 text-center text-xs font-semibold"
            style={{
              borderColor: value[key] ? '#f5a6c8' : 'rgba(255,255,255,0.7)',
              background: value[key] ? '#ffe8f3' : 'rgba(255,255,255,0.7)',
              color: '#6e3b53',
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ChoiceCardRow({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: { label: string; value: boolean | number }[];
  selected: boolean | number;
  onSelect: (value: boolean | number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color: '#6e3b53' }}>{title}</p>
      <div className="grid gap-2">
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <motion.button
              key={String(option.label)}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(option.value)}
              className="rounded-[18px] border px-3 py-3 text-left text-sm font-semibold"
              style={{
                borderColor: isSelected ? '#f5a6c8' : 'rgba(255,255,255,0.8)',
                background: isSelected ? '#fff1f7' : 'rgba(255,255,255,0.7)',
                color: '#6e3b53',
              }}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SliderRow({
  label,
  min,
  max,
  step,
  suffix,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-[22px] border border-white/50 p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium" style={{ color: '#6e3b53' }}>{label}</span>
        <span className="font-bold" style={{ color: '#6e3b53' }}>{value} {suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-pink-400"
      />
      <div className="mt-2 flex justify-between text-[10px]" style={{ color: '#8c6a76' }}>
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}

function EmojiPicker({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color: '#6e3b53' }}>{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => {
          const selected = value === index + 1;
          return (
            <motion.button
              key={option}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(index + 1)}
              className="rounded-[18px] border px-2 py-3 text-left text-sm font-semibold"
              style={{
                borderColor: selected ? '#f5a6c8' : 'rgba(255,255,255,0.7)',
                background: selected ? '#fff1f7' : 'rgba(255,255,255,0.7)',
                color: '#6e3b53',
              }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function MoodPicker({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold" style={{ color: '#6e3b53' }}>{label}</p>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option, index) => {
          const isSelected = value === index + 1;
          return (
            <button
              key={option}
              onClick={() => onChange(index + 1)}
              className="rounded-[18px] border px-2 py-3 text-center text-[11px] font-semibold"
              style={{
                borderColor: isSelected ? '#f5a6c8' : 'rgba(255,255,255,0.7)',
                background: isSelected ? '#fff1f7' : 'rgba(255,255,255,0.7)',
                color: '#6e3b53',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[26px] border border-white/50 p-4 shadow-soft" style={{ background: 'rgba(255,255,255,0.7)' }}>
      <div className="mb-2 h-2 rounded-full" style={{ background: accent }} />
      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: '#8c6a76' }}>{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color: '#6e3b53' }}>{value}</p>
    </div>
  );
}

export default App;
