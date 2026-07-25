import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { FormSection } from "@/components/form/FormSection";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { homeSchema, type HomeFormValues } from "@/features/home/home.schema";
import { useHome, useUpdateHome } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

export default function HomeEditorPage() {
  const query = useHome();
  const update = useUpdateHome();
  const saveWorkflow = useSaveWorkflow();
  const form = useForm<HomeFormValues>({ resolver: zodResolver(homeSchema) });
  useEffect(() => { if (query.data) form.reset(query.data); }, [form, query.data]);
  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => saveWorkflow.save(() => update.mutateAsync(values)), saveWorkflow.validationFailed)}>
      <FormSection title="Hero">
        <FormField label="Role Badge" error={form.formState.errors.hero?.roleBadge?.message}><Input {...form.register("hero.roleBadge")} /></FormField>
        <FormField label="Headline" error={form.formState.errors.hero?.headline?.message}><Input {...form.register("hero.headline")} /></FormField>
        <FormField label="Highlighted Headline" error={form.formState.errors.hero?.highlightedHeadline?.message}><Input {...form.register("hero.highlightedHeadline")} /></FormField>
        <FormField label="Subheadline" error={form.formState.errors.hero?.subheadline?.message}><Textarea {...form.register("hero.subheadline")} /></FormField>
        <FormField label="Primary CTA" error={form.formState.errors.hero?.cta?.primaryLabel?.message}><Input {...form.register("hero.cta.primaryLabel")} /></FormField>
        <FormField label="Secondary CTA" error={form.formState.errors.hero?.cta?.secondaryLabel?.message}><Input {...form.register("hero.cta.secondaryLabel")} /></FormField>
        <FormField label="Status Enabled" error={form.formState.errors.hero?.status?.enabled?.message}>
          <label className="inline-flex min-h-11 items-center gap-3 rounded-md border border-border-subtle bg-surface px-3 text-sm text-primary">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...form.register("hero.status.enabled")} />
            <span>Show availability status</span>
          </label>
        </FormField>
        <FormField label="Availability Status" error={form.formState.errors.hero?.status?.text?.message}><Input {...form.register("hero.status.text")} /></FormField>
        <FormField label="LinkedIn URL" error={form.formState.errors.hero?.socialLinks?.linkedIn?.message}><Input {...form.register("hero.socialLinks.linkedIn")} /></FormField>
        <FormField label="GitHub URL" error={form.formState.errors.hero?.socialLinks?.gitHub?.message}><Input {...form.register("hero.socialLinks.gitHub")} /></FormField>
        <FormField label="Email Address" error={form.formState.errors.hero?.socialLinks?.email?.message}><Input type="email" {...form.register("hero.socialLinks.email")} /></FormField>
      </FormSection>
      <div className="sticky bottom-16 flex justify-end rounded-lg border border-border-subtle bg-surface p-3 lg:bottom-4">
        <SaveButton isSaving={saveWorkflow.isSaving} disabled={query.isLoading} />
      </div>
    </form>
  );
}
