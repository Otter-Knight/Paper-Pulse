import { notFound } from "next/navigation";
import { getPaperById, Paper } from "@/lib/actions";
import { PaperPageClient } from "@/components/paper-page-client";

interface PaperPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { id } = await params;
  const paper: Paper | null = await getPaperById(id);

  if (!paper) {
    notFound();
  }

  return <PaperPageClient paper={paper} />;
}
