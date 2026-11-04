// data/achievements.ts
export type BranchId = "frontend" | "programming" | "backend" | "tools" | "projects" | "career";
export type Tier = "normal" | "epic" | "legendary";

export interface Evidence {
  title: string;
  issuer: string;
  date: string;
  url?: string;
  image?: string;
}

export type AutoRule =
  | { type: "projectsCompleted"; count: number }
  | { type: "requiresUnlocked" };

export interface Rank {
  label: string;
  requirement: string;
  evidence?: Evidence;
  auto?: AutoRule;
  inProgress?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  fantasyName: string;
  icon: string;
  description: string;
  branch?: BranchId;
  tier?: Tier;
  requires?: string[];
  inProgress?: boolean;
  ranks: Rank[];
}

export interface BranchMeta {
  id: BranchId;
  name: string;
  pathName: string;
  tagline: string;
  color: string;
  nodes: string[]; // the 5 normal achievements, ordered from the trunk outward
  epic: string;
}

export const branches: BranchMeta[] = [
  { id: "frontend", name: "Frontend", pathName: "The Grand Creator", tagline: "Craft what people see", color: "#34d399", nodes: ["rwd", "tailwind", "react", "next", "uiux"], epic: "epic-frontend" },
  { id: "programming", name: "Programming", pathName: "The Codeforger", tagline: "Write the logic", color: "#ff3b4e", nodes: ["js", "ts", "python", "java", "testing"], epic: "epic-programming" },
  { id: "backend", name: "Backend & Data", pathName: "The Oracle of Data", tagline: "Command the core", color: "#a855f7", nodes: ["reldb", "sql", "node", "backend", "mongodb"], epic: "epic-backend" },
  { id: "tools", name: "Tools & DevOps", pathName: "The Rune Engineer", tagline: "Build and deploy", color: "#3b9eff", nodes: ["git", "linux", "deploy", "docker", "cicd"], epic: "epic-tools" },
  { id: "projects", name: "Projects", pathName: "The Iron Architect", tagline: "Turn ideas into reality", color: "#f5b942", nodes: ["first-project", "portfolio", "fullstack", "master", "opensource"], epic: "epic-projects" },
  { id: "career", name: "Challenges & Career", pathName: "The Scholar's Seal", tagline: "Go beyond", color: "#cbd5e1", nodes: ["english", "problem", "bca", "hackathon", "role"], epic: "epic-career" },
];

// Proof for things built in this portfolio (Next.js + Tailwind + TypeScript).
const SITE: Evidence = { title: "WarriorPortfolio", issuer: "Personal project", date: "Oct 2026", url: "" };

const complete = (requirement: string, label = "Complete"): Rank[] => [
  { label, requirement, auto: { type: "requiresUnlocked" } },
];

export const achievements: Achievement[] = [
  // ===================== FRONTEND =====================
  {
    id: "rwd", branch: "frontend", name: "Responsive Web Design", fantasyName: "Veil of Many Forms", icon: "layout",
    description: "Building web pages with HTML and CSS that adapt cleanly to any screen size.",
    ranks: [{ label: "Certified", requirement: "Earn the Responsive Web Design certificate",
      evidence: { title: "Responsive Web Design", issuer: "freeCodeCamp", date: "Oct 2026", url: "", image: "" } }],
  },
  {
    id: "tailwind", branch: "frontend", name: "Tailwind CSS", fantasyName: "The Stormthread", icon: "wind",
    description: "Styling interfaces quickly and consistently with utility classes and design tokens.",
    requires: ["rwd"],
    ranks: [{ label: "Shipped", requirement: "Ship a project styled with Tailwind CSS", evidence: SITE }],
  },
  {
    id: "react", branch: "frontend", name: "React", fantasyName: "Weaver of Living Glass", icon: "atom",
    description: "Building interactive interfaces from components, state and hooks.",
    requires: ["rwd"],
    ranks: [{ label: "Certified", requirement: "Earn a React certificate",
      evidence: { title: "React", issuer: "HackerRank", date: "Oct 2026", url: "", image: "" } }],
  },
  {
    id: "next", branch: "frontend", name: "Next.js", fantasyName: "Keep of Instant Realms", icon: "castle",
    description: "Building full web applications with routing, server rendering and API routes.",
    requires: ["react"],
    ranks: [{ label: "Shipped", requirement: "Ship a Next.js app with routing and dynamic pages", evidence: SITE }],
  },
  {
    id: "uiux", branch: "frontend", name: "UI/UX & Accessibility", fantasyName: "The Lantern Painter", icon: "palette",
    description: "Designing interfaces that are clear, usable, accessible and pleasant to look at.",
    requires: ["tailwind"],
    ranks: [{ label: "Audited", requirement: "Design and ship a UI scoring 90+ on Lighthouse accessibility" }],
  },

  // ===================== PROGRAMMING =====================
  {
    id: "js", branch: "programming", name: "JavaScript", fantasyName: "The Living Rune", icon: "braces",
    description: "Writing the language of the web: functions, objects, async code and the DOM.",
    ranks: [{ label: "Certified", requirement: "Earn the JavaScript certificate",
      evidence: { title: "JavaScript", issuer: "freeCodeCamp", date: "Oct 2026", url: "", image: "" } }],
  },
  {
    id: "ts", branch: "programming", name: "TypeScript", fantasyName: "The Binding Oath", icon: "code",
    description: "Adding static types to JavaScript for safer, easier-to-maintain code.",
    requires: ["js"],
    ranks: [{ label: "Shipped", requirement: "Ship a strict TypeScript project", evidence: SITE }],
  },
  {
    id: "python", branch: "programming", name: "Python", fantasyName: "The Serpent's Tongue", icon: "file-code",
    description: "Writing clear programs and scripts in Python.",
    ranks: [{ label: "Certified", requirement: "Earn a Python certificate or complete a Python course" }],
  },
  {
    id: "java", branch: "programming", name: "Java & OOP", fantasyName: "The Iron Covenant", icon: "coffee",
    description: "Object-oriented programming in Java: classes, inheritance and interfaces.",
    ranks: [{ label: "Certified", requirement: "Earn a Java certificate or complete a Java course" }],
  },
  {
    id: "testing", branch: "programming", name: "Testing", fantasyName: "The Sentinel's Ward", icon: "flask",
    description: "Writing automated tests so code keeps working as it grows.",
    requires: ["ts"],
    ranks: [{ label: "Tested", requirement: "Ship a project with automated tests and a coverage report" }],
  },

  // ===================== BACKEND & DATA =====================
  {
    id: "reldb", branch: "backend", name: "Relational Databases", fantasyName: "Keeper of the Ledger", icon: "database",
    description: "Designing relational databases with tables, keys and relationships.",
    ranks: [{ label: "Certified", requirement: "Earn the Relational Database certificate" }],
  },
  {
    id: "sql", branch: "backend", name: "SQL", fantasyName: "Oracle of Queries", icon: "scroll",
    description: "Querying and shaping data with SQL.",
    requires: ["reldb"],
    ranks: [{ label: "Certified", requirement: "Earn an SQL certificate (for example on HackerRank)" }],
  },
  {
    id: "node", branch: "backend", name: "Node.js", fantasyName: "The Ironbound Engine", icon: "server",
    description: "Running JavaScript on the server with Node.js.",
    ranks: [{ label: "Intermediate", requirement: "Earn the Node.js (Intermediate) certificate",
      evidence: { title: "Node.js (Intermediate)", issuer: "HackerRank", date: "Oct 2026", url: "", image: "" } }],
  },
  {
    id: "backend", branch: "backend", name: "Backend & APIs", fantasyName: "The Gate Warden", icon: "shield",
    description: "Building backend services and REST APIs. Rank I is the freeCodeCamp certificate, rank II is the HackerRank certificate.",
    requires: ["node"], inProgress: true,
    ranks: [
      { label: "freeCodeCamp", requirement: "Earn the freeCodeCamp Backend Development and APIs certificate" },
      { label: "HackerRank", requirement: "Earn the HackerRank backend certificate" },
    ],
  },
  {
    id: "mongodb", branch: "backend", name: "MongoDB & NoSQL", fantasyName: "The Shifting Vault", icon: "leaf",
    description: "Storing and querying data in document databases like MongoDB.",
    requires: ["sql"],
    ranks: [{ label: "Certified", requirement: "Earn a MongoDB certificate or ship a project that uses MongoDB" }],
  },

  // ===================== TOOLS & DEVOPS =====================
  {
    id: "git", branch: "tools", name: "Git & GitHub", fantasyName: "Chronicler of Timelines", icon: "git",
    description: "Tracking changes, branching and collaborating with Git and GitHub.",
    ranks: [{ label: "Proven", requirement: "Use a real branch and pull-request workflow across several repos" }],
  },
  {
    id: "linux", branch: "tools", name: "Linux & Command Line", fantasyName: "Whisperer of the Shell", icon: "terminal",
    description: "Working confidently in the Linux terminal and command line.",
    ranks: [{ label: "Certified", requirement: "Complete a Linux or command-line course with a certificate" }],
  },
  {
    id: "deploy", branch: "tools", name: "Deployment & Hosting", fantasyName: "The Beacon Bearer", icon: "cloud",
    description: "Putting a project live on the web with hosting and environment settings.",
    requires: ["git"], inProgress: true,
    ranks: [{ label: "Deployed", requirement: "Deploy a project to a public URL" }],
  },
  {
    id: "docker", branch: "tools", name: "Docker & Containers", fantasyName: "The Vessel-Binder", icon: "container",
    description: "Packaging an application in a container so it runs the same everywhere.",
    requires: ["linux", "deploy"],
    ranks: [{ label: "Containerised", requirement: "Dockerise a full-stack app with docker-compose" }],
  },
  {
    id: "cicd", branch: "tools", name: "CI/CD Pipelines", fantasyName: "The Arcane Conduit", icon: "workflow",
    description: "Automating tests and deployment so every push ships safely.",
    requires: ["deploy"],
    ranks: [{ label: "Automated", requirement: "Build a GitHub Actions pipeline that tests and deploys automatically" }],
  },

  // ===================== PROJECTS =====================
  {
    id: "first-project", branch: "projects", name: "First Project Shipped", fantasyName: "The First Strike", icon: "rocket",
    description: "Finishing and shipping your first full project. Unlocks by itself from your projects data.",
    ranks: [{ label: "Shipped", requirement: "Complete your first project", auto: { type: "projectsCompleted", count: 1 } }],
  },
  {
    id: "portfolio", branch: "projects", name: "Portfolio Launched", fantasyName: "The Banner Raised", icon: "globe",
    description: "Putting your own portfolio website live so anyone can see your work.",
    requires: ["first-project"], inProgress: true,
    ranks: [{ label: "Live", requirement: "Publish your portfolio website" }],
  },
  {
    id: "fullstack", branch: "projects", name: "Full-Stack Application", fantasyName: "The Twin-Realm Builder", icon: "layers",
    description: "Building one project where a frontend, a backend and a database work together.",
    requires: ["first-project"], inProgress: true,
    ranks: [{ label: "Built", requirement: "Ship a project with a frontend, backend and database" }],
  },
  {
    id: "master", branch: "projects", name: "Master Builder", fantasyName: "Master Blacksmith", icon: "hammer",
    description: "Finishing all four featured projects: SuggesDoc, FitSync, Dropick and WarriorType. Unlocks by itself from your projects data.",
    requires: ["fullstack"],
    ranks: [{ label: "All projects completed", requirement: "Complete all four featured projects", auto: { type: "projectsCompleted", count: 4 } }],
  },
  {
    id: "opensource", branch: "projects", name: "Open Source Contribution", fantasyName: "The Wandering Smith", icon: "pull-request",
    description: "Getting a pull request merged into someone else's open-source project.",
    requires: ["portfolio"],
    ranks: [{ label: "Merged", requirement: "Have a pull request merged in an open-source repository" }],
  },

  // ===================== CHALLENGES & CAREER =====================
  {
    id: "english", branch: "career", name: "Spoken English", fantasyName: "Voice of the Realm", icon: "languages",
    description: "Certified English proficiency. Rank I is the A2 certificate, rank II is the B1 certificate.",
    ranks: [
      { label: "A2", requirement: "Earn the A2 English certificate",
        evidence: { title: "A2 English", issuer: "", date: "Oct 2026", url: "", image: "" } },
      { label: "B1", requirement: "Earn the B1 English certificate",
        evidence: { title: "B1 English", issuer: "", date: "Oct 8, 2026", url: "", image: "" } },
    ],
  },
  {
    id: "problem", branch: "career", name: "Problem Solving", fantasyName: "The Riddlebreaker", icon: "puzzle",
    description: "Solving algorithm and data-structure problems under time pressure.",
    ranks: [{ label: "Certified", requirement: "Earn a Problem Solving certificate (for example on HackerRank)" }],
  },
  {
    id: "bca", branch: "career", name: "BCA Degree", fantasyName: "The Scholar's Seal", icon: "graduation",
    description: "Bachelor of Computer Applications. You are in your final year.",
    ranks: [{ label: "Graduated", requirement: "Complete your BCA degree", inProgress: true }],
  },
  {
    id: "hackathon", branch: "career", name: "Hackathon", fantasyName: "Arena Challenger", icon: "trophy",
    description: "Rank I is taking part in a hackathon. Rank II is winning one.",
    ranks: [
      { label: "Participant", requirement: "Take part in a hackathon" },
      { label: "Winner", requirement: "Win a hackathon" },
    ],
  },
  {
    id: "role", branch: "career", name: "First Professional Role", fantasyName: "The Wanderer's Contract", icon: "compass",
    description: "Starting your first internship or developer job.",
    ranks: [{ label: "Started", requirement: "Start your first internship or developer job" }],
  },

  // ===================== EPIC (one per path, auto-unlock) =====================
  {
    id: "epic-frontend", tier: "epic", branch: "frontend", name: "Frontend Specialist", fantasyName: "The Grand Creator", icon: "monitor",
    description: "The whole frontend path: responsive design, Tailwind, React, Next.js and an accessible UI.",
    requires: ["rwd", "tailwind", "react", "next", "uiux"],
    ranks: complete("Unlock all five Frontend achievements"),
  },
  {
    id: "epic-programming", tier: "epic", branch: "programming", name: "Polyglot Programmer", fantasyName: "The Codeforger", icon: "cpu",
    description: "Fluent in more than one language and disciplined enough to test your work.",
    requires: ["js", "ts", "python", "java", "testing"],
    ranks: complete("Unlock all five Programming achievements"),
  },
  {
    id: "epic-backend", tier: "epic", branch: "backend", name: "Backend & Data Specialist", fantasyName: "The Oracle of Data", icon: "hard-drive",
    description: "The whole backend path: databases, SQL, Node.js, APIs and NoSQL.",
    requires: ["reldb", "sql", "node", "backend", "mongodb"],
    ranks: complete("Unlock all five Backend & Data achievements"),
  },
  {
    id: "epic-tools", tier: "epic", branch: "tools", name: "DevOps Practitioner", fantasyName: "The Rune Engineer", icon: "wrench",
    description: "Comfortable with everything around the code: Git, Linux, deployment, containers and pipelines.",
    requires: ["git", "linux", "deploy", "docker", "cicd"],
    ranks: complete("Unlock all five Tools & DevOps achievements"),
  },
  {
    id: "epic-projects", tier: "epic", branch: "projects", name: "Software Craftsman", fantasyName: "The Iron Architect", icon: "folder",
    description: "A body of finished work: shipped, live, full-stack and open source.",
    requires: ["first-project", "portfolio", "fullstack", "master", "opensource"],
    ranks: complete("Unlock all five Projects achievements"),
  },
  {
    id: "epic-career", tier: "epic", branch: "career", name: "Career Ready", fantasyName: "The Scholar's Seal", icon: "briefcase",
    description: "Ready for the working world: English, problem solving, a degree, a hackathon and a first role.",
    requires: ["english", "problem", "bca", "hackathon", "role"],
    ranks: complete("Unlock all five Challenges & Career achievements"),
  },

  // ===================== LEGENDARY =====================
  {
    id: "successful", tier: "legendary", name: "Successful", fantasyName: "The Crowned Warrior", icon: "crown",
    description: "The end of the first journey: every epic path conquered.",
    requires: ["epic-frontend", "epic-programming", "epic-backend", "epic-tools", "epic-projects", "epic-career"],
    ranks: complete("Complete all six epic paths", "Ascended"),
  },
];