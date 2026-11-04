import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectShowcase from "@/components/ProjectShowcase";
import { getProject, projects } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.name, description: project.cardDescription } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return <ProjectShowcase projects={projects} initialSlug={slug} />;
}