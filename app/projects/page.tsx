import ProjectsCarousel from "@/components/ProjectsCarousel";
import SceneBackground from "@/components/SceneBackground";
import BackArrow from "@/components/BackArrow";
import { projects } from "@/data/projects";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <SceneBackground images={["/backgrounds/Projects.png"]} />
      <BackArrow fallback="/home" />
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1500px] flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
        <ProjectsCarousel projects={projects} />
      </main>
    </>
  );
}