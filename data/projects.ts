export type Status = "Completed" | "In development" | "Planned";

export type ProjectLink = { label: string; url: string; primary?: boolean };
export type ProjectSection = { title: string; items: string[] };

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  cardDescription: string;
  description: string;
  status: Status;
  tech: string[];
  links?: ProjectLink[];
  sections?: ProjectSection[];
  screenshot?: string; // e.g. "/projects/suggesdoc.png" (image goes in public/projects)
  hidden?: boolean; // true = not shown on the portfolio
  accent?: string; // 6-digit hex, e.g. "#ff2d55"; picked automatically if omitted
  icon?: string; // built-in name ("heart-pulse", "dumbbell", "file-transfer", "swords", "code"), an image path like "/projects/logo.svg", or an emoji
  category?: string; // pill under the name, e.g. "Healthcare App"
  background?: string; // optional per-project background, e.g. "/backgrounds/suggesdoc.jpg"
};

export const statusStyles: Record<Status, string> = {
  Completed: "border-emerald-500/30 text-emerald-300",
  "In development": "border-rose-500/40 text-rose-300",
  Planned: "border-zinc-500/40 text-zinc-300",
};

const todo = ["Add what you built here"];

// Builds the two buttons on every project:
//   1st value = LIVE DEMO link  (button "Live Demo")
//   2nd value = GITHUB link     (button "GitHub")
// Leave a value as "" and its button shows greyed out as "coming soon".
const defaultLinks = (live = "", github = ""): ProjectLink[] => [
  { label: "Live Demo", url: live, primary: true },
  { label: "GitHub", url: github },
];

// "My Contribution" and "What I Learned" lists shown on each project page.
// Replace the "Add what you built here" text in the projects below with your own points.
const defaultSections = (contribution = todo, learned = todo): ProjectSection[] => [
  { title: "My Contribution", items: contribution },
  { title: "What I Learned", items: learned },
];

// The order of this list is the order shown everywhere on the site.
// "accent" sets each project's colour and glow (6-digit hex).
const allProjects: Project[] = [
  // ───────────────────────── 1. SuggesDoc ─────────────────────────
  {
    slug: "suggesdoc",
    name: "SuggesDoc",
    tagline: "Doctor Suggestion & Digital Token Platform",
    cardDescription:
      "Find doctors by symptoms and city, and book an appointment with a digital token.",
    description:
      "SuggesDoc helps patients find the right doctor based on their symptoms, filtered by city. Patients and doctors both use its digital token system to manage appointments.",
    status: "Completed",
    icon: "heart-pulse",
    category: "Healthcare App",
    accent: "#1ec8b4", // greenish blue
    tech: [
      "Tailwind CSS",
      "HTML",
      "JavaScript",
      "React.js",
      "Node.js",
      "Supabase",
      "Git",
    ],
    links: defaultLinks(
      "https://sugges-doc.vercel.app/", // LIVE DEMO link
      "https://github.com/Nilesh-Sillare/SuggesDoc", // GITHUB link
    ),
    sections: defaultSections(
      // "My Contribution" points
      [
        "Built Everything From Scratch",
        "Set Up Sign-up and Email Authorization",
        "Contacted Real Doctor to ask for support on the Token System",
        "Connected Symptom-Speciality-Doctors to browse",
      ],
      // "What I Learned" points
      [
        "The Supabase Authorization Feature",
        "Integrating Email-Verification in WebApps",
        "Creation and Working of Search Bar",
        "How Filtering Works in Webpages",
      ],
    ),
    screenshot: "/Project%20preview/SuggesDoc.png",
  },

  // ───────────────────────── 2. Dropick ─────────────────────────
  {
    slug: "dropick",
    name: "Dropick",
    tagline: "Peer-to-Peer File Transfer",
    cardDescription: "Send files straight from device to device over WebRTC. No server, no login.",
    description:
      "Dropick transfers files directly between devices using WebRTC, with no server in between and no login. People share files straight from one device to another.",
    status: "Completed",
    icon: "file-transfer",
    category: "P2P File Sharing",
    // no accent set: the colour is picked automatically (purple)
    tech: ["Node.js", "HTML", "Tailwind CSS", "React.js", "Git", "WebRTC", "TypeScript"],
    links: defaultLinks(
      "https://dropick-eight.vercel.app", // LIVE DEMO link
      "https://github.com/Nilesh-Sillare/Dropick", // GITHUB link
    ),
    sections: defaultSections(
      // "My Contribution" points
      [
        "Build a Dynamic UI for First Time",
        "Dropik’s backend generates a unique room temporarily",
        "Used Websockets To Connect Two Users",
        "Worked on it From Scratch",
      ],
      // "What I Learned" points
      [
        "Websocket Connections through webRTC",
        "Dynamic CSS",
        "Creating Temporary Room in Memory",
        "Advance Javascript",
      ],
    ),
    screenshot: "/Project%20preview/Dropick.png",
  },

  // ───────────────────────── 3. FitSync ─────────────────────────
  {
    slug: "fitsync",
    name: "FitSync",
    tagline: "Gym Membership Management Platform",
    cardDescription:
      "Gym membership tracking for owners and trainers, plus workout routines, diet plans and exercise form GIFs.",
    description:
      "FitSync keeps track of gym memberships for the trainer or owner. It also provides workout routines, diet and supplement plans, and GIFs showing the form and technique of exercises.",
    status: "In development",
    icon: "dumbbell",
    category: "Gym Management Platform",
    accent: "#ff244f", // red
    tech: ["Next.js", "MongoDB", "Tailwind CSS", "JavaScript", "Git", "Razorpay"],
    links: defaultLinks(
      "https://Fitsync.Vercel.app/", // LIVE DEMO link
      "", // GITHUB link: paste it between the quotes when you have one
    ),
    sections: defaultSections(
      // "My Contribution" points (draft: edit to match what you built)
      [
        "Building the whole platform from scratch with Next.js",
        "Designing the membership dashboard for gym owners and trainers",
        "Storing members, plans and workouts in MongoDB",
        "Adding online membership payments with Razorpay",
      ],
      // "What I Learned" points (draft)
      [
        "Next.js App Router and server components",
        "Modelling data in MongoDB collections",
        "Taking online payments with Razorpay",
        "Planning an app with more than one kind of user",
      ],
    ),
    screenshot: "/Project%20preview/Fitsync.png",
  },

  // ───────────────────────── 4. WarriorType ─────────────────────────
  {
    slug: "warriortype",
    name: "WarriorType",
    tagline: "Typing Speed Game",
    cardDescription:
      "A typing game where your keystrokes power a stickman warrior, and it gets faster as you play.",
    description:
      "WarriorType is a typing speed test. It shows random keys to press, and each correct key makes a stickman warrior fight or defend. The game gets faster as time goes on.",
    status: "In development",
    icon: "swords",
    category: "Typing Game",
    // no accent set: the colour is picked automatically
    tech: ["Node.js", "React.js", "MongoDB", "TypeScript", "Tailwind CSS"],
    links: defaultLinks(
      "https://Typeright.vercel.app/", // LIVE DEMO link
      "", // GITHUB link: paste it between the quotes when you have one
    ),
    sections: defaultSections(
      // "My Contribution" points (draft: edit to match what you built)
      [
        "Building the typing game from scratch with React and TypeScript",
        "Showing random keys and checking every keypress",
        "Animating a stickman warrior that fights or defends on each correct key",
        "Making the game speed up the longer you play",
      ],
      // "What I Learned" points (draft)
      [
        "Handling keyboard events in React",
        "Timing and game loops in the browser",
        "Keeping animation in sync with game state",
        "Typing game state safely with TypeScript",
      ],
    ),
    screenshot: "/Project%20preview/type.png",
  },
];

export const projects = allProjects.filter((p) => !p.hidden);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}