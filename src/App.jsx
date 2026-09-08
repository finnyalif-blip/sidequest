import { useState, useEffect, useRef } from "react";
import { Plus, Check, Flame, Trash2, X, MapPin, Briefcase, HeartPulse, Palette, Home, Sparkles, Crown, Shuffle, Compass, Dice5 } from "lucide-react";

const CATEGORIES = [
  { id: "errand", label: "Errand", color: "#A6441F", Icon: MapPin },
  { id: "work", label: "Work", color: "#2E4C6D", Icon: Briefcase },
  { id: "health", label: "Health", color: "#3F6C51", Icon: HeartPulse },
  { id: "creative", label: "Creative", color: "#6B4A80", Icon: Palette },
  { id: "home", label: "Home", color: "#C99A2E", Icon: Home },
  { id: "adventure", label: "Adventure", color: "#1E7A72", Icon: Compass },
];

const DIFFICULTIES = [
  { id: "quick", label: "Quick", xp: 10, hint: "~5 min" },
  { id: "medium", label: "Medium", xp: 25, hint: "~30 min" },
  { id: "epic", label: "Epic", xp: 50, hint: "the big one" },
];

const MAIN_TIERS = [
  { id: "major", label: "Major", xp: 75, hint: "a real project" },
  { id: "grand", label: "Grand", xp: 150, hint: "the big one" },
];

const QUEST_IDEAS = [
  { title: "Return that library book", category: "errand", difficulty: "quick" },
  { title: "Book the dentist appointment", category: "errand", difficulty: "quick" },
  { title: "Refill a prescription", category: "errand", difficulty: "quick" },
  { title: "Take out the recycling", category: "errand", difficulty: "quick" },
  { title: "Drop off the dry cleaning", category: "errand", difficulty: "medium" },
  { title: "Buy a card for someone's birthday", category: "errand", difficulty: "quick" },
  { title: "Clear your inbox to zero", category: "work", difficulty: "medium" },
  { title: "Update your task tracker", category: "work", difficulty: "quick" },
  { title: "Send that follow-up email", category: "work", difficulty: "quick" },
  { title: "Tidy your desktop files", category: "work", difficulty: "medium" },
  { title: "Draft tomorrow's to-do list", category: "work", difficulty: "quick" },
  { title: "Back up your laptop", category: "work", difficulty: "medium" },
  { title: "Drink a full glass of water", category: "health", difficulty: "quick" },
  { title: "Take a 10-minute walk", category: "health", difficulty: "quick" },
  { title: "Stretch for 5 minutes", category: "health", difficulty: "quick" },
  { title: "Go to bed 20 minutes earlier tonight", category: "health", difficulty: "quick" },
  { title: "Prep a healthy snack for tomorrow", category: "health", difficulty: "medium" },
  { title: "Do a few minutes of deep breathing", category: "health", difficulty: "quick" },
  { title: "Sketch something for 10 minutes", category: "creative", difficulty: "quick" },
  { title: "Write one journal entry", category: "creative", difficulty: "quick" },
  { title: "Learn 5 words in a new language", category: "creative", difficulty: "quick" },
  { title: "Free-write for 5 minutes, no editing", category: "creative", difficulty: "quick" },
  { title: "Take one photo you love from today", category: "creative", difficulty: "quick" },
  { title: "Learn a new chord or riff", category: "creative", difficulty: "medium" },
  { title: "Make the bed", category: "home", difficulty: "quick" },
  { title: "Wipe down the kitchen counters", category: "home", difficulty: "quick" },
  { title: "Water the plants", category: "home", difficulty: "quick" },
  { title: "Clear one cluttered surface", category: "home", difficulty: "medium" },
  { title: "Put away the clean laundry", category: "home", difficulty: "medium" },
  { title: "Wipe down the bathroom sink", category: "home", difficulty: "quick" },
  { title: "Learn to say hello in five new languages", category: "adventure", difficulty: "quick" },
  { title: "Take a class in something totally outside your skill set", category: "adventure", difficulty: "epic" },
  { title: "Get intentionally lost somewhere new, then find your way back", category: "adventure", difficulty: "medium" },
  { title: "Write a letter to yourself to open in a year", category: "adventure", difficulty: "quick" },
  { title: "Learn to identify five birds by their call", category: "adventure", difficulty: "medium" },
  { title: "Host a game night for people who don't all know each other", category: "adventure", difficulty: "medium" },
  { title: "Order the dish you've always been too nervous to try", category: "adventure", difficulty: "quick" },
  { title: "Sign up for the class you'd normally talk yourself out of", category: "adventure", difficulty: "epic" },
  { title: "Sleep outside under the stars for a night", category: "adventure", difficulty: "epic" },
  { title: "Learn one card trick well enough to fool someone", category: "adventure", difficulty: "medium" },
  { title: "Write and mail an actual letter to an old friend", category: "adventure", difficulty: "quick" },
  { title: "Try a sport you've never played, just once", category: "adventure", difficulty: "medium" },
  { title: "Spend an afternoon at a museum alone, no rushing", category: "adventure", difficulty: "medium" },
  { title: "Learn three chords on an instrument you don't own yet", category: "adventure", difficulty: "medium" },
  { title: "Plant something and keep it alive for a season", category: "adventure", difficulty: "medium" },
  { title: "Do something kind for a stranger and never mention it", category: "adventure", difficulty: "quick" },
  { title: "Take a spontaneous day trip somewhere you've never been", category: "adventure", difficulty: "epic" },
  { title: "Cook one dish completely from scratch, no shortcuts", category: "adventure", difficulty: "medium" },
  { title: "Go to an open mic, even just to watch", category: "adventure", difficulty: "quick" },
  { title: "Join a local club or meetup for something you're curious about", category: "adventure", difficulty: "medium" },
  { title: "Ask a stranger a real question and actually listen", category: "adventure", difficulty: "quick" },
  { title: "Learn to do one solid cartwheel or handstand", category: "adventure", difficulty: "medium" },
  { title: "Take yourself on a proper solo date", category: "adventure", difficulty: "medium" },
  { title: "Watch the sunrise somewhere that isn't your bedroom", category: "adventure", difficulty: "quick" },
  { title: "Say yes to a plan you'd normally decline", category: "adventure", difficulty: "quick" },
];

const FLAVOR = [
  "Quest complete. The board feels lighter.",
  "Logged in the annals of today.",
  "Another notch on the walking stick.",
  "Handled. On to the next marker.",
  "The trail bends forward.",
  "Filed under: done.",
  "Small victory. Those add up.",
  "Marked, sealed, delivered.",
];

const LEVEL_TITLES = [
  { min: 1, title: "Wandering Novice" },
  { min: 3, title: "Errand Ranger" },
  { min: 6, title: "Quest Adept" },
  { min: 10, title: "Trailblazer" },
  { min: 15, title: "Legend of the Daily Grind" },
];

const XP_PER_LEVEL = 100;
const STORAGE_KEY = "sidequest-state-v2";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
}

function levelFromXp(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function titleForLevel(level) {
  let t = LEVEL_TITLES[0].title;
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.min) t = entry.title;
  }
  return t;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function Sidequest() {
  const [quests, setQuests] = useState([]);
  const [mainQuests, setMainQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCompletionDate, setLastCompletionDate] = useState(null);
  const [dailyBonus, setDailyBonus] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1].id);

  const [mainTitle, setMainTitle] = useState("");
  const [mainTier, setMainTier] = useState(MAIN_TIERS[0].id);

  const [ideaPool, setIdeaPool] = useState([]);
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());
  const [ideaFilter, setIdeaFilter] = useState("all");

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setQuests(data.quests || []);
        setMainQuests(data.mainQuests || []);
        setCompleted(data.completed || []);
        setTotalXp(data.totalXp || 0);
        setStreak(data.streak || 0);
        setLastCompletionDate(data.lastCompletionDate || null);
        setDailyBonus(data.dailyBonus || null);
      }
    } catch (e) {
      // no saved state yet, or it was corrupted — start fresh
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const payload = JSON.stringify({
        quests, mainQuests, completed, totalXp, streak, lastCompletionDate, dailyBonus,
      });
      localStorage.setItem(STORAGE_KEY, payload);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  }, [quests, mainQuests, completed, totalXp, streak, lastCompletionDate, dailyBonus, loaded]);

  // Refresh the daily bonus quest whenever the calendar day changes.
  useEffect(() => {
    if (!loaded) return;
    const today = todayStr();
    if (!dailyBonus || dailyBonus.date !== today) {
      const idx = hashStr(today) % QUEST_IDEAS.length;
      setDailyBonus({ date: today, idea: QUEST_IDEAS[idx], completed: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, dailyBonus]);

  // Seed the idea pool once, on load.
  useEffect(() => {
    if (!loaded) return;
    if (ideaPool.length === 0) refreshPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  function rollForQuest() {
    const activeTitles = new Set([...quests, ...mainQuests].map((q) => q.title));
    const available = QUEST_IDEAS.filter((i) => !activeTitles.has(i.title));
    const pool = available.length > 0 ? available : QUEST_IDEAS;
    const idea = pool[Math.floor(Math.random() * pool.length)];
    const diff = DIFFICULTIES.find((d) => d.id === idea.difficulty);
    const q = { id: uid(), title: idea.title, category: idea.category, difficulty: idea.difficulty, xp: diff.xp, createdAt: Date.now() };
    setQuests((prev) => [q, ...prev]);
    setIdeaPool((prev) => prev.filter((i) => i.title !== idea.title));
    showToast(`Rolled: ${idea.title}`);
  }

  function refreshPool(filterId) {
    const f = filterId || ideaFilter;
    const activeTitles = new Set([...quests, ...mainQuests].map((q) => q.title));
    const source = f === "all" ? QUEST_IDEAS : QUEST_IDEAS.filter((i) => i.category === f);
    const available = source.filter((i) => !activeTitles.has(i.title));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    setIdeaPool(shuffled.slice(0, 6));
    setSelectedIdeas(new Set());
  }

  function setFilterAndRefresh(id) {
    setIdeaFilter(id);
    refreshPool(id);
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function registerCompletion(entry) {
    setCompleted((prev) => [entry, ...prev].slice(0, 200));
    setTotalXp((prev) => prev + entry.xp);
    const today = todayStr();
    setStreak((prevStreak) => {
      if (lastCompletionDate === today) return prevStreak;
      if (lastCompletionDate && isYesterday(lastCompletionDate)) return prevStreak + 1;
      return 1;
    });
    setLastCompletionDate(today);
  }

  function addQuest(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const diff = DIFFICULTIES.find((d) => d.id === difficulty);
    const q = { id: uid(), title: trimmed, category, difficulty, xp: diff.xp, createdAt: Date.now() };
    setQuests((prev) => [q, ...prev]);
    setTitle("");
  }

  function completeQuest(id) {
    const q = quests.find((x) => x.id === id);
    if (!q) return;
    setQuests((prev) => prev.filter((x) => x.id !== id));
    registerCompletion({ ...q, completedAt: Date.now(), type: "side" });
    showToast(FLAVOR[Math.floor(Math.random() * FLAVOR.length)]);
  }

  function abandonQuest(id) {
    setQuests((prev) => prev.filter((x) => x.id !== id));
  }

  function addMainQuest(e) {
    e.preventDefault();
    const trimmed = mainTitle.trim();
    if (!trimmed) return;
    const tier = MAIN_TIERS.find((t) => t.id === mainTier);
    const q = { id: uid(), title: trimmed, tier: tier.id, xp: tier.xp, createdAt: Date.now() };
    setMainQuests((prev) => [q, ...prev]);
    setMainTitle("");
  }

  function completeMainQuest(id) {
    const q = mainQuests.find((x) => x.id === id);
    if (!q) return;
    setMainQuests((prev) => prev.filter((x) => x.id !== id));
    registerCompletion({ ...q, completedAt: Date.now(), type: "main" });
    showToast("Main quest complete — that's the big one done.");
  }

  function abandonMainQuest(id) {
    setMainQuests((prev) => prev.filter((x) => x.id !== id));
  }

  function completeDailyBonus() {
    if (!dailyBonus || dailyBonus.completed) return;
    const entry = {
      id: uid(),
      title: dailyBonus.idea.title,
      category: dailyBonus.idea.category,
      xp: dailyBonus.idea.xp * 2,
      completedAt: Date.now(),
      type: "bonus",
    };
    registerCompletion(entry);
    setDailyBonus((prev) => ({ ...prev, completed: true }));
    showToast("Bonus quest claimed — double XP banked.");
  }

  function toggleIdeaSelect(ideaTitle) {
    setSelectedIdeas((prev) => {
      const next = new Set(prev);
      if (next.has(ideaTitle)) next.delete(ideaTitle);
      else next.add(ideaTitle);
      return next;
    });
  }

  function addSelectedIdeas() {
    const toAdd = ideaPool.filter((i) => selectedIdeas.has(i.title));
    if (toAdd.length === 0) return;
    const diffMap = Object.fromEntries(DIFFICULTIES.map((d) => [d.id, d]));
    const newQuests = toAdd.map((i) => ({
      id: uid(), title: i.title, category: i.category, difficulty: i.difficulty,
      xp: diffMap[i.difficulty].xp, createdAt: Date.now(),
    }));
    setQuests((prev) => [...newQuests, ...prev]);
    setIdeaPool((prev) => prev.filter((i) => !selectedIdeas.has(i.title)));
    setSelectedIdeas(new Set());
    showToast(newQuests.length === 1 ? "Quest added to the board." : `${newQuests.length} quests added to the board.`);
  }

  const level = levelFromXp(totalXp);
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const BOARD_SPACES = 10;
  const currentSpace = Math.min(BOARD_SPACES, Math.floor(xpIntoLevel / (XP_PER_LEVEL / BOARD_SPACES)) + 1);
  const todaysCompleted = completed.filter(
    (c) => new Date(c.completedAt).toDateString() === new Date().toDateString()
  );
  const typeLabel = { main: "Main", bonus: "Bonus" };

  return (
    <div className="sq-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&display=swap');

        .sq-root {
          --paper: #EDE3D0;
          --paper-deep: #E4D8C0;
          --ink: #2B2318;
          --ink-soft: #5A4E3C;
          --trail: #3F6C51;
          --rust: #A6441F;
          --gold: #C99A2E;
          --line: #C9BB9E;
          font-family: 'Work Sans', sans-serif;
          color: var(--ink);
          background: var(--paper);
          background-image: radial-gradient(circle at 1px 1px, rgba(43,35,24,0.06) 1px, transparent 0);
          background-size: 14px 14px;
          min-height: 100%;
          padding: 28px 20px 60px;
          box-sizing: border-box;
        }
        .sq-root *, .sq-root *::before, .sq-root *::after { box-sizing: border-box; }
        .sq-wrap {
          max-width: 660px; margin: 0 auto;
          border: 3px solid var(--ink);
          padding: 22px 22px 26px;
          position: relative;
          background: var(--paper);
        }
        .sq-wrap::before {
          content: ''; position: absolute; inset: 6px;
          border: 1px solid var(--line);
          pointer-events: none;
        }

        .sq-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
        .sq-title { font-family: 'Fraunces', serif; font-weight: 700; font-size: 34px; margin: 0; letter-spacing: -0.01em; }
        .sq-tagline { margin: 4px 0 0; color: var(--ink-soft); font-size: 14.5px; }
        .sq-die-btn {
          flex-shrink: 0; margin-top: 4px;
          display: flex; align-items: center; justify-content: center;
          width: 44px; height: 44px;
          background: var(--paper-deep); color: var(--rust);
          border: 1.5px solid var(--ink);
          cursor: pointer;
        }
        .sq-die-btn:hover { background: var(--rust); color: #fff; border-color: var(--rust); }
        .sq-die-btn:active { transform: rotate(12deg); }
        .sq-die-btn:focus-visible { outline: 2px solid var(--trail); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .sq-die-btn:active { transform: none; } }

        .sq-status { margin-top: 18px; border: 1.5px solid var(--ink); background: var(--paper-deep); padding: 14px 16px; position: relative; }
        .sq-status-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
        .sq-level-name { font-family: 'Fraunces', serif; font-weight: 600; font-size: 16px; }
        .sq-level-num { font-family: 'Fraunces', serif; font-weight: 700; color: var(--trail); }
        .sq-streak { display: flex; align-items: center; gap: 5px; font-size: 13.5px; color: var(--rust); font-weight: 500; white-space: nowrap; }

        .sq-board-path { margin-top: 12px; display: flex; gap: 4px; flex-wrap: wrap; }
        .sq-board-tile {
          width: 30px; height: 30px; flex-shrink: 0;
          border: 1.5px solid var(--ink); background: var(--paper);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-size: 12px; font-weight: 600; color: var(--ink-soft);
          position: relative;
        }
        .sq-board-tile.filled { background: var(--trail); border-color: var(--trail); color: #fff; }
        .sq-board-tile.current { background: var(--gold); border-color: var(--ink); }
        .sq-pawn { width: 12px; height: 12px; border-radius: 50%; background: var(--rust); border: 1.5px solid var(--ink); display: block; }
        .sq-tile-crown { position: absolute; top: -8px; right: -6px; color: var(--gold); background: var(--paper); border-radius: 50%; padding: 1px; }
        .sq-trail-label { margin-top: 8px; font-size: 12px; color: var(--ink-soft); }

        .sq-bonus { margin-top: 14px; border: 1.5px solid var(--gold); background: #F6EDD6; padding: 13px 14px; }
        .sq-bonus.done { opacity: 0.6; }
        .sq-bonus-head { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--gold); text-transform: uppercase; letter-spacing: 0.05em; }
        .sq-bonus-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 6px; }
        .sq-bonus-title { font-size: 15px; font-weight: 500; }
        .sq-bonus-meta { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
        .sq-bonus-btn { flex-shrink: 0; display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; padding: 8px 13px; background: var(--gold); color: #fff; border: 1.5px solid var(--gold); cursor: pointer; }
        .sq-bonus-btn:hover { background: #b3891f; }
        .sq-bonus-btn:disabled { background: transparent; color: var(--ink-soft); border-color: var(--line); cursor: default; }
        .sq-bonus-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

        .sq-form { margin-top: 24px; border: 1.5px solid var(--ink); background: var(--paper-deep); padding: 14px; }
        .sq-form-row { display: flex; gap: 8px; }
        .sq-input { flex: 1; font-family: 'Work Sans', sans-serif; font-size: 15px; padding: 10px 12px; border: 1.5px solid var(--ink); background: var(--paper); color: var(--ink); }
        .sq-input:focus-visible { outline: 2px solid var(--trail); outline-offset: 1px; }
        .sq-add-btn { display: flex; align-items: center; gap: 6px; font-family: 'Work Sans', sans-serif; font-weight: 600; font-size: 14.5px; padding: 10px 16px; background: var(--ink); color: var(--paper); border: 1.5px solid var(--ink); cursor: pointer; }
        .sq-add-btn:hover { background: var(--trail); border-color: var(--trail); }
        .sq-add-btn:focus-visible { outline: 2px solid var(--rust); outline-offset: 2px; }

        .sq-picker-row { display: flex; gap: 18px; margin-top: 12px; flex-wrap: wrap; }
        .sq-picker-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .sq-chip { display: flex; align-items: center; gap: 7px; font-size: 14.5px; font-weight: 600; padding: 9px 15px; border: 2px solid var(--line); background: var(--paper); color: var(--ink-soft); cursor: pointer; }
        .sq-chip.active { border-color: currentColor; background: #fff; box-shadow: inset 0 0 0 1px currentColor; }
        .sq-chip:hover { border-color: var(--ink); }
        .sq-chip:focus-visible { outline: 2px solid var(--trail); outline-offset: 1px; }

        .sq-section-label {
          font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--ink); margin: 26px 0 10px;
          display: flex; align-items: center; justify-content: space-between;
          border-left: 4px solid var(--gold); background: var(--paper-deep);
          padding: 6px 10px;
        }
        .sq-link-btn { display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--trail); font-weight: 600; font-size: 12.5px; text-transform: none; letter-spacing: 0; cursor: pointer; padding: 2px; }
        .sq-link-btn:hover { text-decoration: underline; }
        .sq-link-btn:focus-visible { outline: 2px solid var(--trail); outline-offset: 2px; }

        .sq-empty { border: 1.5px dashed var(--line); padding: 22px 16px; text-align: center; color: var(--ink-soft); font-size: 14px; }

        .sq-quest { position: relative; display: flex; align-items: stretch; background: #fff; border: 1.5px solid var(--ink); margin-bottom: 10px; }
        .sq-quest-spine { width: 6px; flex-shrink: 0; }
        .sq-quest-body { flex: 1; padding: 12px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
        .sq-quest-main { min-width: 0; }
        .sq-quest-title { font-size: 15px; font-weight: 500; word-break: break-word; }
        .sq-quest-meta { margin-top: 3px; font-size: 12px; color: var(--ink-soft); display: flex; align-items: center; gap: 5px; }
        .sq-quest-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .sq-icon-btn { border: 1.5px solid var(--ink); background: var(--paper); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .sq-icon-btn.complete:hover { background: var(--trail); color: #fff; border-color: var(--trail); }
        .sq-icon-btn.abandon { border-color: var(--line); color: var(--ink-soft); }
        .sq-icon-btn.abandon:hover { border-color: var(--rust); color: var(--rust); }
        .sq-icon-btn:focus-visible { outline: 2px solid var(--trail); outline-offset: 2px; }

        .sq-main-quest { position: relative; display: flex; align-items: stretch; background: var(--ink); color: var(--paper); border: 1.5px solid var(--ink); margin-bottom: 10px; }
        .sq-main-spine { width: 6px; flex-shrink: 0; background: var(--gold); }
        .sq-main-body { flex: 1; padding: 13px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
        .sq-main-title { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; word-break: break-word; }
        .sq-main-meta { margin-top: 3px; font-size: 12px; color: #C9BFA6; display: flex; align-items: center; gap: 5px; }
        .sq-main-icon-btn { border: 1.5px solid var(--paper); background: transparent; color: var(--paper); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .sq-main-icon-btn.complete:hover { background: var(--gold); border-color: var(--gold); color: var(--ink); }
        .sq-main-icon-btn.abandon:hover { background: var(--rust); border-color: var(--rust); }
        .sq-main-icon-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .sq-main-form { margin-top: 10px; border: 1.5px solid var(--ink); background: var(--paper-deep); padding: 14px; }

        .sq-idea-box { border: 1.5px solid var(--line); background: var(--paper-deep); padding: 12px; }
        .sq-idea-row { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-bottom: 1px solid var(--line); cursor: pointer; }
        .sq-idea-row:last-child { border-bottom: none; }
        .sq-idea-check { width: 17px; height: 17px; border: 1.5px solid var(--ink); flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--paper); }
        .sq-idea-check.checked { background: var(--trail); border-color: var(--trail); }
        .sq-idea-title { font-size: 14px; flex: 1; }
        .sq-idea-meta { font-size: 11.5px; color: var(--ink-soft); flex-shrink: 0; }
        .sq-idea-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
        .sq-idea-add-btn { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 13.5px; padding: 8px 14px; background: var(--trail); color: #fff; border: 1.5px solid var(--trail); cursor: pointer; }
        .sq-idea-add-btn:disabled { background: transparent; color: var(--line); border-color: var(--line); cursor: default; }
        .sq-idea-add-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

        .sq-log { display: flex; justify-content: space-between; padding: 8px 2px; font-size: 13.5px; border-bottom: 1px solid var(--line); color: var(--ink-soft); }
        .sq-log-title { color: var(--ink); }
        .sq-log-tag { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--gold); margin-left: 6px; }
        .sq-log-xp { color: var(--trail); font-weight: 500; }

        .sq-toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--paper); padding: 10px 18px; font-size: 13.5px; font-weight: 500; display: flex; align-items: center; gap: 7px; box-shadow: 0 6px 18px rgba(0,0,0,0.25); }

        @media (prefers-reduced-motion: reduce) { .sq-trail-fill { transition: none; } }
        @media (max-width: 420px) { .sq-title { font-size: 27px; } .sq-form-row { flex-direction: column; } .sq-add-btn { justify-content: center; } }
      `}</style>

      <div className="sq-wrap">
        <div className="sq-header">
          <div>
            <h1 className="sq-title">Sidequest</h1>
            <p className="sq-tagline">Turn today's to-dos into today's adventure.</p>
          </div>
          <button type="button" className="sq-die-btn" onClick={rollForQuest} aria-label="Roll the die for a random quest">
            <Dice5 size={26} strokeWidth={1.75} />
          </button>
        </div>

        <div className="sq-status">
          <div className="sq-status-row">
            <div>
              <span className="sq-level-num">Lv.{level}</span> <span className="sq-level-name">{titleForLevel(level)}</span>
            </div>
            {streak > 0 && (
              <div className="sq-streak"><Flame size={15} strokeWidth={2.5} />{streak}-day streak</div>
            )}
          </div>
          <div className="sq-board-path" role="progressbar" aria-valuenow={currentSpace} aria-valuemin={1} aria-valuemax={BOARD_SPACES} aria-label={`Space ${currentSpace} of ${BOARD_SPACES} toward level ${level + 1}`}>
            {Array.from({ length: BOARD_SPACES }, (_, i) => i + 1).map((n) => (
              <div key={n} className={`sq-board-tile ${n < currentSpace ? "filled" : ""} ${n === currentSpace ? "current" : ""}`}>
                {n === currentSpace ? <span className="sq-pawn" aria-hidden="true" /> : n}
                {n === BOARD_SPACES && <Crown size={11} className="sq-tile-crown" />}
              </div>
            ))}
          </div>
          <div className="sq-trail-label">{xpIntoLevel} / {XP_PER_LEVEL} xp to level {level + 1} · {totalXp} xp total</div>
        </div>

        {dailyBonus && (
          <div className={`sq-bonus ${dailyBonus.completed ? "done" : ""}`}>
            <div className="sq-bonus-head"><Sparkles size={13} />Today's bonus quest</div>
            <div className="sq-bonus-row">
              <div>
                <div className="sq-bonus-title">{dailyBonus.idea.title}</div>
                <div className="sq-bonus-meta">{CATEGORIES.find((c) => c.id === dailyBonus.idea.category)?.label} · {dailyBonus.idea.xp * 2}xp (double today only)</div>
              </div>
              <button className="sq-bonus-btn" onClick={completeDailyBonus} disabled={dailyBonus.completed}>
                {dailyBonus.completed ? <><Check size={14} />Claimed</> : "Mark complete"}
              </button>
            </div>
          </div>
        )}

        <div className="sq-section-label"><span>Main quests</span></div>
        {mainQuests.length === 0 ? (
          <div className="sq-empty">No main quest on the board. Add the big project you're working toward.</div>
        ) : (
          mainQuests.map((q) => {
            const tier = MAIN_TIERS.find((t) => t.id === q.tier);
            return (
              <div className="sq-main-quest" key={q.id}>
                <div className="sq-main-spine" />
                <div className="sq-main-body">
                  <div className="sq-quest-main">
                    <div className="sq-main-title">{q.title}</div>
                    <div className="sq-main-meta"><Crown size={12} />{tier?.label} · {q.xp}xp</div>
                  </div>
                  <div className="sq-quest-actions">
                    <button className="sq-main-icon-btn complete" onClick={() => completeMainQuest(q.id)} aria-label={`Complete ${q.title}`}><Check size={16} strokeWidth={2.5} /></button>
                    <button className="sq-main-icon-btn abandon" onClick={() => abandonMainQuest(q.id)} aria-label={`Abandon ${q.title}`}><X size={15} strokeWidth={2.5} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <form className="sq-main-form" onSubmit={addMainQuest}>
          <div className="sq-form-row">
            <input className="sq-input" placeholder="What's the big project? e.g. Finish the client proposal" value={mainTitle} onChange={(e) => setMainTitle(e.target.value)} maxLength={140} />
            <button className="sq-add-btn" type="submit"><Plus size={16} strokeWidth={2.5} />Add</button>
          </div>
          <div className="sq-picker-row">
            <div className="sq-picker-group">
              {MAIN_TIERS.map((t) => (
                <button type="button" key={t.id} className={`sq-chip ${mainTier === t.id ? "active" : ""}`} onClick={() => setMainTier(t.id)}>{t.label} · {t.xp}xp</button>
              ))}
            </div>
          </div>
        </form>

        <div className="sq-section-label"><span>Side quests</span></div>
        <form className="sq-form" onSubmit={addQuest}>
          <div className="sq-form-row">
            <input className="sq-input" placeholder="What needs doing? e.g. Reply to Mia's email" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} />
            <button className="sq-add-btn" type="submit"><Plus size={16} strokeWidth={2.5} />Add</button>
          </div>
          <div className="sq-picker-row">
            <div className="sq-picker-group">
              {CATEGORIES.map((c) => (
                <button type="button" key={c.id} className={`sq-chip ${category === c.id ? "active" : ""}`} onClick={() => setCategory(c.id)} style={{ color: c.color }}>
                  <c.Icon size={16} />{c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sq-picker-row">
            <div className="sq-picker-group">
              {DIFFICULTIES.map((d) => (
                <button type="button" key={d.id} className={`sq-chip ${difficulty === d.id ? "active" : ""}`} onClick={() => setDifficulty(d.id)}>{d.label} · {d.xp}xp</button>
              ))}
            </div>
          </div>
        </form>

        <div className="sq-section-label">
          <span>Need inspiration?</span>
          <button className="sq-link-btn" onClick={() => refreshPool()} type="button"><Shuffle size={13} />Shuffle</button>
        </div>
        <div className="sq-picker-row" style={{ marginTop: 0, marginBottom: 10 }}>
          <div className="sq-picker-group">
            <button type="button" className={`sq-chip ${ideaFilter === "all" ? "active" : ""}`} onClick={() => setFilterAndRefresh("all")}>All</button>
            {CATEGORIES.map((c) => (
              <button type="button" key={c.id} className={`sq-chip ${ideaFilter === c.id ? "active" : ""}`} onClick={() => setFilterAndRefresh(c.id)} style={{ color: c.color }}>
                <c.Icon size={16} />{c.label}
              </button>
            ))}
          </div>
        </div>
        {ideaPool.length === 0 ? (
          <div className="sq-empty">{ideaFilter === "all" ? "You've added every quest idea on the board. Nicely done." : `You've added every ${CATEGORIES.find((c) => c.id === ideaFilter)?.label} idea we've got. Try Shuffle or another category.`}</div>
        ) : (
          <div className="sq-idea-box">
            {ideaPool.map((i) => {
              const cat = CATEGORIES.find((c) => c.id === i.category);
              const diff = DIFFICULTIES.find((d) => d.id === i.difficulty);
              const checked = selectedIdeas.has(i.title);
              return (
                <div className="sq-idea-row" key={i.title} onClick={() => toggleIdeaSelect(i.title)}>
                  <div className={`sq-idea-check ${checked ? "checked" : ""}`}>{checked && <Check size={12} color="#fff" strokeWidth={3} />}</div>
                  <div className="sq-idea-title">{i.title}</div>
                  <div className="sq-idea-meta"><span style={{ color: cat?.color, fontWeight: 600 }}>{cat?.label}</span> · {diff?.xp}xp</div>
                </div>
              );
            })}
            <div className="sq-idea-actions">
              <span className="sq-trail-label">{selectedIdeas.size} selected</span>
              <button className="sq-idea-add-btn" onClick={addSelectedIdeas} disabled={selectedIdeas.size === 0}>
                <Plus size={14} strokeWidth={2.5} />Add {selectedIdeas.size > 0 ? selectedIdeas.size : ""} quest{selectedIdeas.size === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}

        <div className="sq-section-label"><span>Active side quests {quests.length > 0 ? `(${quests.length})` : ""}</span></div>
        {quests.length === 0 ? (
          <div className="sq-empty">The board is clear. Add a quest above, or pick one from the ideas.</div>
        ) : (
          quests.map((q) => {
            const cat = CATEGORIES.find((c) => c.id === q.category);
            const diff = DIFFICULTIES.find((d) => d.id === q.difficulty);
            return (
              <div className="sq-quest" key={q.id}>
                <div className="sq-quest-spine" style={{ background: cat.color }} />
                <div className="sq-quest-body">
                  <div className="sq-quest-main">
                    <div className="sq-quest-title">{q.title}</div>
                    <div className="sq-quest-meta"><cat.Icon size={13} style={{ color: cat.color }} />{cat.label} · {diff.label} · {q.xp}xp</div>
                  </div>
                  <div className="sq-quest-actions">
                    <button className="sq-icon-btn complete" onClick={() => completeQuest(q.id)} aria-label={`Complete ${q.title}`}><Check size={16} strokeWidth={2.5} /></button>
                    <button className="sq-icon-btn abandon" onClick={() => abandonQuest(q.id)} aria-label={`Abandon ${q.title}`}><X size={15} strokeWidth={2.5} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {todaysCompleted.length > 0 && (
          <>
            <div className="sq-section-label"><span>Completed today ({todaysCompleted.length})</span></div>
            {todaysCompleted.map((c) => (
              <div className="sq-log" key={c.id + c.completedAt}>
                <span><span className="sq-log-title">{c.title}</span>{typeLabel[c.type] && <span className="sq-log-tag">{typeLabel[c.type]}</span>}</span>
                <span className="sq-log-xp">+{c.xp}xp</span>
              </div>
            ))}
          </>
        )}
      </div>

      {toast && (<div className="sq-toast"><Sparkles size={14} />{toast}</div>)}
      {saveError && (<div className="sq-toast" style={{ bottom: 68, background: "#A6441F" }}>Couldn't save — your progress may not persist.</div>)}
    </div>
  );
}
