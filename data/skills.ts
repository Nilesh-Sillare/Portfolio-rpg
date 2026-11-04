// All Skills page content lives here.
//
// To unlock a skill, add these fields to its line:
//   unlocked: true, rank: 2, summary: "...", topics: ["...", "...", "...", "..."], appliedIn: ["..."]
//
// rank: 1 Novice, 2 Apprentice, 3 Adept, 4 Master, 5 Legendary
// kind: "active" = hands-on skill, "passive" = concept

export type ClassId = "programming" | "frontend" | "backend" | "engineering" | "security";
export type EmblemKey = "sword" | "eye" | "staff" | "gear" | "shield";
export type SkillKind = "active" | "passive";
export type IconKey =
  | "javascript" | "typescript" | "python" | "java" | "cpp" | "oop" | "dsa"
  | "html" | "css" | "tailwind" | "react" | "nextjs" | "uiux"
  | "nodejs" | "rest" | "dbdesign" | "sql" | "postgres" | "mongodb" | "supabase"
  | "testing" | "cicd" | "systemdesign" | "cloud"
  | "cyber" | "auth";

export interface SkillClass {
  id: ClassId;
  label: string;
  fantasyName: string;
  tagline: string;
  emblem: EmblemKey;
}

export interface Skill {
  id: string;
  name: string;
  classId: ClassId;
  kind: SkillKind;
  icon: IconKey;
  unlocked: boolean;
  rank: 0 | 1 | 2 | 3 | 4 | 5;
  summary: string;
  topics: string[];
  appliedIn: string[];
}

export const RANKS = ["Locked", "Novice", "Apprentice", "Adept", "Master", "Legendary"] as const;

export const classes: SkillClass[] = [
  { id: "programming", label: "Programming", fantasyName: "Spellblade", tagline: "Logic and language: the blade I swing.", emblem: "sword" },
  { id: "frontend", label: "Frontend", fantasyName: "Illusionist", tagline: "What the user sees and feels.", emblem: "eye" },
  { id: "backend", label: "Backend", fantasyName: "Archmage", tagline: "The hidden power behind every screen.", emblem: "staff" },
  { id: "engineering", label: "Engineering & Automation", fantasyName: "Artificer", tagline: "Systems that build and run themselves.", emblem: "gear" },
  { id: "security", label: "Security", fantasyName: "Guardian", tagline: "Protecting what matters.", emblem: "shield" },
];

const base: Omit<Skill, "id" | "name" | "classId" | "kind" | "icon"> = {
  unlocked: false,
  rank: 0,
  summary: "",
  topics: [],
  appliedIn: [],
};

export const skills: Skill[] = [
  // ---- Programming ----
  {
    ...base, id: "javascript", name: "JavaScript", classId: "programming", kind: "active", icon: "javascript",
    unlocked: true, rank: 3,
    summary: "The language of the web: logic and interactivity.",
    topics: ["Functions, scope and closures", "DOM manipulation", "Async code and fetch", "Modern ES6+ features"],
    appliedIn: [],
  },
  {
    ...base, id: "typescript", name: "TypeScript", classId: "programming", kind: "active", icon: "typescript",
    unlocked: true, rank: 1,
    summary: "JavaScript with types, for safer code.",
    topics: ["Basic types", "Interfaces and type aliases", "Generics", "Using it with React"],
    appliedIn: [],
  },
  {
    ...base, id: "python", name: "Python", classId: "programming", kind: "active", icon: "python",
    unlocked: true, rank: 1,
    summary: "General-purpose language for scripting and data work.",
    topics: ["Core syntax and data types", "Functions and modules", "Working with files", "Problem solving"],
    appliedIn: [],
  },
  // Java stays locked
  { ...base, id: "java", name: "Java", classId: "programming", kind: "active", icon: "java" },
  {
    ...base, id: "cpp", name: "C++", classId: "programming", kind: "active", icon: "cpp",
    unlocked: true, rank: 1,
    summary: "Fast, low-level language with strong control over memory.",
    topics: ["Syntax and data types", "Pointers and references", "Classes and objects", "Standard library basics"],
    appliedIn: [],
  },
  {
    ...base, id: "oop", name: "OOP", classId: "programming", kind: "passive", icon: "oop",
    unlocked: true, rank: 1,
    summary: "Designing code around objects and their behavior.",
    topics: ["Classes and objects", "Encapsulation", "Inheritance", "Polymorphism"],
    appliedIn: [],
  },
  {
    ...base, id: "dsa", name: "DSA", classId: "programming", kind: "passive", icon: "dsa",
    unlocked: true, rank: 1,
    summary: "Organizing data and solving problems efficiently.",
    topics: ["Arrays and linked lists", "Stacks and queues", "Sorting and searching", "Time complexity"],
    appliedIn: [],
  },

  // ---- Frontend ----
  {
    ...base, id: "html", name: "HTML", classId: "frontend", kind: "active", icon: "html",
    unlocked: true, rank: 3,
    summary: "The structure and meaning of every web page.",
    topics: ["Semantic markup", "Forms and inputs", "Accessibility basics", "Links and media"],
    appliedIn: [],
  },
  {
    ...base, id: "css", name: "CSS", classId: "frontend", kind: "active", icon: "css",
    unlocked: true, rank: 3,
    summary: "Styling, layout and responsive design.",
    topics: ["Flexbox and Grid", "Responsive layouts", "Animations and transitions", "Custom properties"],
    appliedIn: [],
  },
  {
    ...base, id: "tailwind", name: "Tailwind CSS", classId: "frontend", kind: "active", icon: "tailwind",
    unlocked: true, rank: 2,
    summary: "Utility-first CSS framework for fast, consistent styling.",
    topics: ["Utility classes", "Responsive variants", "Design tokens and theming", "Hover and state styling"],
    appliedIn: ["SuggDoc"],
  },
  {
    ...base, id: "react", name: "React.js", classId: "frontend", kind: "active", icon: "react",
    unlocked: true, rank: 2,
    summary: "Component-based UI library.",
    topics: ["Components and props", "State and event handling", "Hooks and context", "Building interactive interfaces"],
    appliedIn: ["SuggDoc", "FitSync"],
  },
  {
    ...base, id: "nextjs", name: "Next.js", classId: "frontend", kind: "active", icon: "nextjs",
    unlocked: true, rank: 1,
    summary: "React framework for routing and full web apps.",
    topics: ["App Router and pages", "Layouts and components", "Server and client components", "Static assets and metadata"],
    appliedIn: ["WarriorPortfolio"],
  },
  {
    ...base, id: "uiux", name: "UI/UX Design", classId: "frontend", kind: "passive", icon: "uiux",
    unlocked: true, rank: 1,
    summary: "Making interfaces clear, usable and good to look at.",
    topics: ["Layout and hierarchy", "Color and typography", "Consistency and spacing", "Designing for mobile"],
    appliedIn: ["WarriorPortfolio"],
  },

  // ---- Backend ----
  {
    ...base, id: "nodejs", name: "Node.js", classId: "backend", kind: "active", icon: "nodejs",
    unlocked: true, rank: 1,
    summary: "JavaScript runtime for server-side code.",
    topics: ["Modules and npm", "Servers and routes", "Working with databases", "Async programming"],
    appliedIn: ["FitSync"],
  },
  { ...base, id: "rest", name: "REST APIs", classId: "backend", kind: "active", icon: "rest" },
  { ...base, id: "dbdesign", name: "Database Design", classId: "backend", kind: "passive", icon: "dbdesign" },
  {
    ...base, id: "sql", name: "SQL", classId: "backend", kind: "active", icon: "sql",
    unlocked: true, rank: 1,
    summary: "The language for querying relational databases.",
    topics: ["SELECT and filtering", "Joins", "Aggregation and grouping", "Creating and updating tables"],
    appliedIn: [],
  },
  {
    ...base, id: "postgres", name: "PostgreSQL", classId: "backend", kind: "active", icon: "postgres",
    unlocked: true, rank: 1,
    summary: "Powerful open-source relational database.",
    topics: ["Tables and relations", "Queries and joins", "Constraints and keys", "Working through Supabase"],
    appliedIn: ["SuggDoc"],
  },
  {
    ...base, id: "mongodb", name: "MongoDB", classId: "backend", kind: "active", icon: "mongodb",
    unlocked: true, rank: 1,
    summary: "Document-oriented NoSQL database.",
    topics: ["Collections and documents", "CRUD operations", "Schema modeling", "Querying and filtering"],
    appliedIn: ["FitSync"],
  },
  {
    ...base, id: "supabase", name: "Supabase", classId: "backend", kind: "active", icon: "supabase",
    unlocked: true, rank: 1,
    summary: "Open-source backend platform built on Postgres.",
    topics: ["Hosted Postgres database", "Authentication", "Querying from the client", "File storage"],
    appliedIn: ["SuggDoc"],
  },

  // ---- Engineering & Automation ----
  { ...base, id: "testing", name: "Automated Testing", classId: "engineering", kind: "active", icon: "testing" },
  { ...base, id: "cicd", name: "CI/CD", classId: "engineering", kind: "active", icon: "cicd" },
  { ...base, id: "systemdesign", name: "System Design", classId: "engineering", kind: "passive", icon: "systemdesign" },
  {
    ...base, id: "cloud", name: "Cloud Computing", classId: "engineering", kind: "active", icon: "cloud",
    unlocked: true, rank: 1,
    summary: "Running and hosting applications on remote infrastructure.",
    topics: ["Cloud basics and services", "Hosting and deployment", "Storage and databases", "Scaling concepts"],
    appliedIn: [],
  },

  // ---- Security ----
  {
    ...base, id: "cyber", name: "Cybersecurity Basics", classId: "security", kind: "passive", icon: "cyber",
    unlocked: true, rank: 1,
    summary: "Core ideas for keeping software and data safe.",
    topics: ["Common web threats", "Safe password handling", "Input validation", "Principle of least privilege"],
    appliedIn: [],
  },
  { ...base, id: "auth", name: "Auth & Authorization", classId: "security", kind: "active", icon: "auth" },
];