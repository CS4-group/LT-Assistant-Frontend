import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CalendarRange, Sparkles, Send, Trash2, Wand2, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TermKey = 'Fall' | 'Spring';
type YearKey = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';

type Course = {
  id: string;
  name: string;
};

type Planner = Record<YearKey, Record<TermKey, Course[]>>;

type DragInfo = {
  courseName: string;
  fromYear: YearKey;
  fromTerm: TermKey;
} | null;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const YEAR_ORDER: YearKey[] = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const TERM_ORDER: TermKey[] = ['Fall', 'Spring'];

function createEmptyPlanner(): Planner {
  return YEAR_ORDER.reduce((acc, year) => {
    acc[year] = { Fall: [], Spring: [] };
    return acc;
  }, {} as Planner);
}

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function titleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const YEAR_SYNONYMS: Record<string, YearKey> = {
  freshman: 'Freshman',
  '9th': 'Freshman',
  '9th grade': 'Freshman',
  'grade 9': 'Freshman',
  sophomore: 'Sophomore',
  '10th': 'Sophomore',
  '10th grade': 'Sophomore',
  'grade 10': 'Sophomore',
  junior: 'Junior',
  '11th': 'Junior',
  '11th grade': 'Junior',
  'grade 11': 'Junior',
  senior: 'Senior',
  '12th': 'Senior',
  '12th grade': 'Senior',
  'grade 12': 'Senior',
  'year 1': 'Freshman',
  'year 2': 'Sophomore',
  'year 3': 'Junior',
  'year 4': 'Senior'
};

const TERM_SYNONYMS: Record<string, TermKey> = {
  fall: 'Fall',
  autumn: 'Fall',
  spring: 'Spring'
};

type ParsedTarget = { year?: YearKey; term?: TermKey };
type ParsedCommand =
  | { type: 'add'; courses: string[]; target: ParsedTarget }
  | { type: 'remove'; courses: string[] }
  | { type: 'move'; course: string; from?: ParsedTarget; to: ParsedTarget }
  | { type: 'unknown' };

function parseCommand(inputRaw: string): ParsedCommand {
  const input = inputRaw.toLowerCase();

  // Extract course names in quotes first
  const quotedMatches = Array.from(inputRaw.matchAll(/"([^"]+)"|'([^']+)'/g));
  const quotedCourses = quotedMatches
    .map((m) => m[1] || m[2])
    .filter(Boolean)
    .map((c) => titleCase(c as string));

  // Detect target year/term phrases like: to junior spring / in sophomore fall
  const toMatch = input.match(/\b(?:to|in|for)\s+([a-z0-9\s]+?)(?:\.|,|$)/);
  const fromMatch = input.match(/\bfrom\s+([a-z0-9\s]+?)(?:\s+to|\.|,|$)/);

  function extractTarget(fragment?: string): ParsedTarget | undefined {
    if (!fragment) return undefined;
    const clean = fragment.trim();
    let foundYear: YearKey | undefined;
    let foundTerm: TermKey | undefined;
    for (const [k, v] of Object.entries(YEAR_SYNONYMS)) {
      if (clean.includes(k)) {
        foundYear = v;
        break;
      }
    }
    for (const [k, v] of Object.entries(TERM_SYNONYMS)) {
      if (clean.includes(k)) {
        foundTerm = v;
        break;
      }
    }
    return { year: foundYear, term: foundTerm };
  }

  const toTarget = extractTarget(toMatch?.[1]);
  const fromTarget = extractTarget(fromMatch?.[1]);

  // Identify intent keywords
  const isAdd = /(add|schedule|plan|include|take|put)\b/.test(input);
  const isRemove = /(remove|delete|drop)\b/.test(input);
  const isMove = /(move|switch|change|transfer|shift)\b/.test(input);

  // If no quoted courses, try to parse course list after add/remove/move verbs
  const extractAfterVerb = () => {
    const verbMatch = input.match(/\b(add|schedule|plan|include|take|put|remove|delete|drop|move|switch|change|transfer|shift)\b\s+(.+?)(?:\s+to|\s+from|\.|,|$)/);
    const raw = verbMatch?.[2];
    if (!raw) return [] as string[];
    return raw
      .split(/,|\band\b/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => titleCase(s));
  };

  const inferredCourses = quotedCourses.length > 0 ? quotedCourses : extractAfterVerb();

  if (isMove) {
    // Try to infer course name from quotes or from the text before 'to'
    let course = inferredCourses[0];
    if (!course) {
      const beforeTo = inputRaw.split(/\bto\b/i)[0];
      const maybe = beforeTo.replace(/^(.*\bmove\b)/i, '').trim();
      course = titleCase(maybe);
    }
    if (!course) return { type: 'unknown' };
    return { type: 'move', course, from: fromTarget, to: toTarget || {} };
  }

  if (isRemove) {
    if (inferredCourses.length === 0) return { type: 'unknown' };
    return { type: 'remove', courses: inferredCourses };
  }

  if (isAdd || inferredCourses.length > 0) {
    return { type: 'add', courses: inferredCourses, target: toTarget || {} };
  }

  return { type: 'unknown' };
}

function findNextOpenSlot(planner: Planner): { year: YearKey; term: TermKey } | null {
  // Choose the bucket with the fewest courses overall to distribute evenly
  let best: { year: YearKey; term: TermKey } | null = null;
  let minCount = Number.POSITIVE_INFINITY;
  for (const year of YEAR_ORDER) {
    for (const term of TERM_ORDER) {
      const count = planner[year][term].length;
      if (count < minCount) {
        minCount = count;
        best = { year, term };
      }
    }
  }
  return best;
}

function placeCourse(planner: Planner, courseName: string, target?: ParsedTarget): { planner: Planner; placed: { year: YearKey; term: TermKey } | null } {
  // Avoid duplicates anywhere
  const exists = YEAR_ORDER.some((year) => TERM_ORDER.some((term) => planner[year][term].some((c) => c.name.toLowerCase() === courseName.toLowerCase())));
  if (exists) return { planner, placed: null };

  const clone: Planner = JSON.parse(JSON.stringify(planner));
  const id = generateId('course');

  let year = target?.year;
  let term = target?.term;

  // If year not specified, pick first with space; if term not specified, pick first with space in that year
  if (!year || !term) {
    const next = findNextOpenSlot(clone);
    if (next) {
      year = year || next.year;
      term = term || next.term;
    }
  }

  if (!year || !term) return { planner, placed: null };

  clone[year][term].push({ id, name: titleCase(courseName) });
  return { planner: clone, placed: { year, term } };
}

function removeCourse(planner: Planner, courseName: string): { planner: Planner; removed: boolean } {
  const clone: Planner = JSON.parse(JSON.stringify(planner));
  let removed = false;
  for (const year of YEAR_ORDER) {
    for (const term of TERM_ORDER) {
      const before = clone[year][term].length;
      clone[year][term] = clone[year][term].filter((c) => c.name.toLowerCase() !== courseName.toLowerCase());
      if (clone[year][term].length !== before) removed = true;
    }
  }
  return { planner: clone, removed };
}

function moveCourse(planner: Planner, courseName: string, to: ParsedTarget, from?: ParsedTarget): { planner: Planner; moved: boolean; to?: { year: YearKey; term: TermKey } } {
  const clone: Planner = JSON.parse(JSON.stringify(planner));
  let found: { year: YearKey; term: TermKey; index: number } | null = null;

  const searchYears = from?.year ? [from.year] : YEAR_ORDER;
  const searchTerms = from?.term ? [from.term] : TERM_ORDER;

  for (const year of searchYears) {
    for (const term of searchTerms) {
      const index = clone[year][term].findIndex((c) => c.name.toLowerCase() === courseName.toLowerCase());
      if (index >= 0) {
        found = { year, term, index };
        break;
      }
    }
    if (found) break;
  }

  if (!found) return { planner, moved: false };

  const targetYear = to.year || found.year;
  const targetTerm = to.term || found.term;

  const [course] = clone[found.year][found.term].splice(found.index, 1);
  clone[targetYear][targetTerm].push(course);
  return { planner: clone, moved: true, to: { year: targetYear, term: targetTerm } };
}

export function CoursePlannerPage() {
  const navigate = useNavigate();
  const [planner, setPlanner] = useState<Planner>(() => createEmptyPlanner());
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: generateId('msg'),
    role: 'assistant',
    content: 'Hi! I can build your 4-year plan. Try: "Add Algebra 1 and Biology to Freshman Fall" or "Move Biology to Sophomore Spring".'
  }]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<YearKey | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState<'idle' | 'enter' | 'exit'>('idle');
  const [dragInfo, setDragInfo] = useState<DragInfo>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const totalCourses = useMemo(() => YEAR_ORDER.reduce((sum, y) => sum + TERM_ORDER.reduce((s, t) => s + planner[y][t].length, 0), 0), [planner]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: generateId('msg'), role: 'user', content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const parsed = parseCommand(trimmed);
      let reply = '';
      let newPlanner = planner;

      if (parsed.type === 'add') {
        const results: string[] = [];
        parsed.courses.forEach((c) => {
          const placed = placeCourse(newPlanner, c, parsed.target);
          newPlanner = placed.planner;
          if (placed.placed) {
            results.push(`Added ${titleCase(c)} to ${placed.placed.year} ${placed.placed.term}.`);
          } else {
            results.push(`${titleCase(c)} was already scheduled or no space available.`);
          }
        });
        reply = results.join(' ');
      } else if (parsed.type === 'remove') {
        const results: string[] = [];
        parsed.courses.forEach((c) => {
          const res = removeCourse(newPlanner, c);
          newPlanner = res.planner;
          results.push(res.removed ? `Removed ${titleCase(c)}.` : `${titleCase(c)} not found.`);
        });
        reply = results.join(' ');
      } else if (parsed.type === 'move') {
        const res = moveCourse(newPlanner, parsed.course, parsed.to, parsed.from);
        newPlanner = res.planner;
        reply = res.moved ? `Moved ${titleCase(parsed.course)} to ${res.to?.year} ${res.to?.term}.` : `${titleCase(parsed.course)} not found.`;
      } else {
        reply = "I can add, move, or remove courses. Try: Add 'Chemistry' to Sophomore Fall.";
      }

      setPlanner(newPlanner);
      setIsThinking(false);
      setMessages((m) => [...m, { id: generateId('msg'), role: 'assistant', content: reply }]);
    }, 700);
  };

  const handleClear = () => {
    setPlanner(createEmptyPlanner());
    setMessages([{ id: generateId('msg'), role: 'assistant', content: 'Cleared your plan. What should we add first?' }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Ambient gradient glows */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-primary/20 via-cyan-400/20 to-purple-500/20 blur-3xl animate-glow"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-rose-400/20 via-primary/20 to-amber-400/20 blur-3xl animate-glow [animation-delay:1.5s]"></div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-lg animate-pop">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Course Planner & AI</h1>
              <p className="text-sm text-gray-500">Planner on the left, chat on the right</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button variant="outline" onClick={handleClear} className="transition-all hover:scale-[1.02]">
              <Trash2 className="h-4 w-4 mr-2" /> Reset Plan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Planner Area - now on the left */}
          <Card className="relative overflow-hidden border-primary/10 shadow-md">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-shimmer" />
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><CalendarRange className="h-5 w-5 text-primary" /> 4-Year High School Plan</span>
                <span className="text-sm font-normal text-gray-500">{totalCourses} course{totalCourses === 1 ? '' : 's'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[78vh] flex flex-col">
              {/* Overview grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
                {YEAR_ORDER.map((year) => {
                  const totalYear = planner[year].Fall.length + planner[year].Spring.length;
                  return (
                    <div
                      key={year}
                      className="text-left rounded-xl border ring-1 ring-primary/10 bg-white/75 backdrop-blur-md shadow-sm animate-fade-in-up hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => { setSelectedYear(year); setIsDetailOpen(true); setOverlayPhase('enter'); setTimeout(() => setOverlayPhase('idle'), 170); }}
                        className="w-full px-4 py-3 flex items-center justify-between border-b hover:bg-primary/5 focus:outline-none"
                      >
                        <div className="font-semibold">{year} Year</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <ChevronDown className="h-3.5 w-3.5" />
                          {totalYear} courses
                        </div>
                      </button>
                      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TERM_ORDER.map((term) => (
                          <div
                            key={term}
                            className="rounded-lg border p-3 bg-gradient-to-br from-gray-50 to-white"
                            onDragOver={(e) => { e.preventDefault(); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (!dragInfo) return;
                              const { courseName, fromYear, fromTerm } = dragInfo;
                              setPlanner((p) => moveCourse(p, courseName, { year, term }, { year: fromYear, term: fromTerm }).planner);
                              setDragInfo(null);
                            }}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-700">{term}</div>
                              <div className="text-[10px] text-gray-400">{planner[year][term].length}</div>
                            </div>
                            <div className="min-h-[90px] space-y-2">
                              {planner[year][term].map((course) => (
                                <div
                                  key={course.id}
                                  className="group flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all animate-pop"
                                  draggable
                                  onDragStart={() => setDragInfo({ courseName: course.name, fromYear: year, fromTerm: term })}
                                >
                                  <span className="font-medium text-gray-800">{course.name}</span>
                                  <button
                                    title="Remove"
                                    onClick={() => setPlanner((p) => removeCourse(p, course.name).planner)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              {planner[year][term].length === 0 && (
                                <div className="text-xs text-gray-400 italic">No courses yet</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail overlay for selected year */}
              {isDetailOpen && selectedYear && (
                <div
                  className={`absolute inset-0 p-4 md:p-6 lg:p-8 bg-white/90 backdrop-blur-md rounded-b-lg shadow-xl ${overlayPhase === 'enter' ? 'overlay-enter overlay-enter-active' : overlayPhase === 'exit' ? 'overlay-exit overlay-exit-active' : ''}`}
                  role="dialog" aria-label={`${selectedYear} detail`}>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => { setOverlayPhase('exit'); setTimeout(() => { setIsDetailOpen(false); setSelectedYear(null); setOverlayPhase('idle'); }, 150); }}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to overview</span>
                    </Button>
                    <div className="text-sm text-gray-500">{planner[selectedYear].Fall.length + planner[selectedYear].Spring.length} courses</div>
                  </div>
                  <h2 className="text-xl font-semibold mb-3">{selectedYear} Year</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[52vh] overflow-y-auto pr-1">
                    {TERM_ORDER.map((term) => (
                      <div
                        key={term}
                        className="rounded-lg border p-3 bg-gradient-to-br from-gray-50 to-white"
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (!dragInfo || !selectedYear) return;
                          const { courseName, fromYear, fromTerm } = dragInfo;
                          setPlanner((p) => moveCourse(p, courseName, { year: selectedYear, term }, { year: fromYear, term: fromTerm }).planner);
                          setDragInfo(null);
                        }}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-700">{term}</div>
                          <div className="text-[10px] text-gray-400">{planner[selectedYear][term].length}</div>
                        </div>
                        <div className="min-h-[110px] space-y-2">
                          {planner[selectedYear][term].map((course) => (
                            <div
                              key={course.id}
                              className="group flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all animate-pop"
                              draggable
                              onDragStart={() => setDragInfo({ courseName: course.name, fromYear: selectedYear, fromTerm: term })}
                            >
                              <span className="font-medium text-gray-800">{course.name}</span>
                              <button
                                title="Remove"
                                onClick={() => setPlanner((p) => removeCourse(p, course.name).planner)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {planner[selectedYear][term].length === 0 && (
                            <div className="text-xs text-gray-400 italic">No courses yet</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area - now on the right */}
          <Card className="relative overflow-hidden border-primary/10 shadow-md">
            <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-transparent to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-bounce [animation-duration:2s]" />
                Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[70vh] p-0">
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-4 pr-2">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[85%] animate-fade-in-up ${m.role === 'assistant' ? 'self-start' : 'self-end ml-auto'}`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ring-1 ${m.role === 'assistant' ? 'bg-white ring-gray-200' : 'bg-primary text-white ring-primary/60'} `}>
                      <p className="leading-relaxed text-sm md:text-[0.95rem]">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="max-w-[70%] animate-fade-in-up">
                    <div className="rounded-2xl px-4 py-3 shadow-sm ring-1 bg-white ring-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                        <span className="inline-block h-2 w-2 rounded-full bg-gray-300 animate-pulse [animation-delay:150ms]" />
                        <span className="inline-block h-2 w-2 rounded-full bg-gray-300 animate-pulse [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-3 md:p-4">
                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Ask to add, move, or remove courses..."
                      className="pr-12 h-12 shadow-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <Button onClick={handleSend} className="h-12 px-4 md:px-5 shadow-md transition-all hover:scale-[1.02]" disabled={isThinking}>
                    <Send className="h-4 w-4 mr-2" /> Send
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 rounded-full bg-gray-100">Hint: Add "Algebra 1" to Freshman Fall</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100">Move Biology to Sophomore Spring</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CoursePlannerPage;


