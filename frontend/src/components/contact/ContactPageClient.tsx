"use client";

import { ContactHub } from "@/components/contact/ContactHub";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { useContact } from "@/hooks/useContact";
import { apiErrorMessage } from "@/types/common.types";

export function ContactPageClient() {
  const query = useContact();
  if (query.isLoading) return <main className="section-container"><SkeletonBlock variant="row" count={3} /></main>;
  if (query.isError || !query.data) return <main className="section-container"><ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} /></main>;
  return <ContactHub content={query.data} />;
}
