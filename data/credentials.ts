// ============================================================
// CREDENTIALS — add your REAL certificates here, nothing else.
// The page counts, filters and cards update by themselves.
// ============================================================

export type CredentialCategory =
  | "development"
  | "database"
  | "cloud"
  | "design"
  | "others";

export type CredentialRarity = "common" | "rare" | "epic" | "legendary";

export type Credential = {
  id: string; // unique, lowercase, no spaces (example: "react-basic-hackerrank")
  title: string; // certificate name
  issuer: string; // who gave it (HackerRank, Coursera, ...)
  date: string; // completion month as "YYYY-MM" (example: "2026-10")
  category: CredentialCategory; // development | database | cloud | design | others
  description: string; // 1 to 3 sentences about what you learned or showed
  tags: string[]; // short skills, WITHOUT the # (example: ["React", "Frontend"])
  url?: string; // link to the certificate or its verification page (optional)
  image?: string; // certificate picture, saved in public/certificates/ (optional)
  icon?: string; // optional custom icon; leave out to use the category icon
  rarity?: CredentialRarity; // common | rare | epic | legendary (default: common)
  featured?: boolean; // true on ONE certificate to show it first (optional)
};

// Locked "relic" slots = certificates you plan to earn.
// They show as locked cards and make the "x of y collected" counter work.
// Edit, add or delete these freely. When you earn one, move it into `credentials`.
export type PlannedCredential = {
  id: string;
  hint: string; // shown as "Next quest · <hint>"
  category: CredentialCategory;
  icon?: string;
};

// Sidebar category names (order = order in the sidebar)
export const categories: { id: CredentialCategory; label: string }[] = [
  { id: "development", label: "Development" },
  { id: "database", label: "Database" },
  { id: "cloud", label: "Cloud & DevOps" },
  { id: "design", label: "Design & UI" },
  { id: "others", label: "Others" },
];

// If you add a url, the card shows a "Verified" badge and a link icon.
// If you leave url out, it shows "Completed" and no link (no fake links).

export const credentials: Credential[] = [
  // ---------- HackerRank ----------
  {
    id: "react-frontend-hackerrank",
    title: "Frontend Developer (React)",
    issuer: "HackerRank",
    date: "2026-10",
    category: "development",
    rarity: "epic",
    description:
      "This certificate demonstrates my knowledge of frontend development using React. It validates my ability to work with React concepts and apply them to build interactive user interfaces. Earning this certificate involved passing HackerRank’s role certification test, which helped me assess my practical understanding of frontend development.",
    tags: ["React", "Frontend"],
    url: "https://www.hackerrank.com/certificates/ff14ddd50c34",
    image: "/certificates/Hackerrank-React.png",
    featured: true,
  },
  {
    id: "nodejs-intermediate-hackerrank",
    title: "Node.js (Intermediate)",
    issuer: "HackerRank",
    date: "2026-10", // TODO: put the real month
    category: "development",
    rarity: "rare",
    description:
      "HackerRank skill certification for intermediate Node.js, showing my understanding of server-side JavaScript and building backend logic.",
    tags: ["Node.js", "Backend"],
    // url: "PASTE YOUR HACKERRANK LINK HERE",
    // image: "/certificates/Hackerrank-Nodejs.png",
  },
  {
    id: "sql-advanced-hackerrank",
    title: "SQL (Advanced)",
    issuer: "HackerRank",
    date: "2026-10", // TODO: put the real month
    category: "database",
    rarity: "epic",
    description:
      "HackerRank skill certification for advanced SQL, showing my ability to write complex queries and work with relational data.",
    tags: ["SQL", "Database"],
    // url: "PASTE YOUR HACKERRANK LINK HERE",
    // image: "/certificates/Hackerrank-SQL.png",
  },

  // ---------- freeCodeCamp ----------
  {
    id: "javascript-freecodecamp",
    title: "JavaScript",
    issuer: "freeCodeCamp",
    date: "2026-10", // TODO: put the real month
    category: "development",
    rarity: "rare",
    description:
      "freeCodeCamp's JavaScript certification, covering core language concepts, problem solving and working with the DOM.",
    tags: ["JavaScript"],
    // url: "PASTE YOUR FREECODECAMP LINK HERE",
    // image: "/certificates/FCC-JavaScript.png",
  },
  {
    id: "responsive-web-design-freecodecamp",
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    date: "2026-10", // TODO: put the real month
    category: "design",
    rarity: "rare",
    description:
      "freeCodeCamp's Responsive Web Design certification, covering HTML, CSS and building layouts that adapt to any screen size.",
    tags: ["HTML", "CSS", "Responsive"],
    // url: "PASTE YOUR FREECODECAMP LINK HERE",
    // image: "/certificates/FCC-Responsive-Web-Design.png",
  },
  {
    id: "a2-english-freecodecamp",
    title: "A2 English for Developers",
    issuer: "freeCodeCamp",
    date: "2026-10", // TODO: put the real month
    category: "others",
    rarity: "common",
    description:
      "freeCodeCamp's A2 English for Developers certification (Beta), focused on communicating clearly in a technical setting.",
    tags: ["English", "Communication"],
    // url: "PASTE YOUR FREECODECAMP LINK HERE",
    // image: "/certificates/FCC-A2-English.png",
  },
  {
    id: "b1-english-freecodecamp",
    title: "B1 English for Developers",
    issuer: "freeCodeCamp",
    date: "2026-10", // TODO: put the real month
    category: "others",
    rarity: "common",
    description:
      "freeCodeCamp's B1 English for Developers certification (Beta), the next level of technical English communication.",
    tags: ["English", "Communication"],
    // url: "PASTE YOUR FREECODECAMP LINK HERE",
    // image: "/certificates/FCC-B1-English.png",
  },
];

// Locked slots (your roadmap). These are only placeholders, not earned certificates.
export const plannedCredentials: PlannedCredential[] = [
  { id: "planned-typescript", hint: "TypeScript", category: "development" },
  { id: "planned-mongodb", hint: "MongoDB", category: "database" },
  { id: "planned-git", hint: "Git & GitHub", category: "development" },
];