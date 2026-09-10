import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Resume } from "@/lib/models/Resume";
import TemplateRenderer from "@/components/TemplateRenderer";

export const dynamic = "force-dynamic";

export default async function PublicResumePage({ params }: { params: { slug: string } }) {
  await connectToDatabase();
  const resume = await Resume.findOne({ shareSlug: params.slug, isPublic: true }).lean();

  if (!resume) notFound();

  return (
    <main className="min-h-screen bg-paper py-10 dark:bg-ink">
      <div className="mx-auto max-w-[8.5in] px-4">
        <TemplateRenderer
          templateId={(resume as any).templateId}
          resume={resume as any}
          accent={(resume as any).theme?.accent}
          density={(resume as any).theme?.density}
        />
        <p className="mt-4 text-center text-xs text-ink-faint">
          Made with ResumeForge — the free AI resume builder
        </p>
      </div>
    </main>
  );
}
