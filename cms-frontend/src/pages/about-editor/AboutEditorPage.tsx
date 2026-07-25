import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { FormSection } from "@/components/form/FormSection";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { aboutSchema, type AboutFormValues } from "@/features/about/about.schema";
import { useAbout, useUpdateAbout } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

export default function AboutEditorPage() {
  const query = useAbout();
  const update = useUpdateAbout();
  const saveWorkflow = useSaveWorkflow();
  const form = useForm<AboutFormValues>({ resolver: zodResolver(aboutSchema), defaultValues: { bio: [], highlights: [] } });
  useEffect(() => { if (query.data) form.reset(query.data as AboutFormValues); }, [form, query.data]);
  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => saveWorkflow.save(() => update.mutateAsync(values)), saveWorkflow.validationFailed)}>
      <FormSection title="About">
        <FormField label="Bio Paragraph"><Textarea value={(form.watch("bio.0") as any)?.text ?? ""} onChange={(event) => form.setValue("bio", [{ id: "about-intro", type: "paragraph", text: event.target.value }] as any)} /></FormField>
        <FormField label="Profile Image URL"><Input {...form.register("profileImage.url")} /></FormField>
        <FormField label="Profile Image Alt"><Input {...form.register("profileImage.alt")} /></FormField>
        <FormField label="Resume URL"><Input {...form.register("resumeUrl")} /></FormField>
        <FormField label="Highlights"><Input value={(form.watch("highlights") ?? []).join(", ")} onChange={(event) => form.setValue("highlights", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></FormField>
      </FormSection>
      <div className="sticky bottom-16 flex justify-end rounded-lg border border-border-subtle bg-surface p-3 lg:bottom-4">
        <SaveButton isSaving={saveWorkflow.isSaving} disabled={query.isLoading} />
      </div>
    </form>
  );
}
