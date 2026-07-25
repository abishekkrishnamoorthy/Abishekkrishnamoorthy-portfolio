import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { FormSection } from "@/components/form/FormSection";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { contactSchema, type ContactFormValues } from "@/features/contact/contact.schema";
import { useContact, useUpdateContact } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

export default function ContactEditorPage() {
  const query = useContact();
  const update = useUpdateContact();
  const saveWorkflow = useSaveWorkflow();
  const form = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });
  useEffect(() => { if (query.data) form.reset(query.data); }, [form, query.data]);
  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => saveWorkflow.save(() => update.mutateAsync(values)), saveWorkflow.validationFailed)}>
      <FormSection title="Contact Content">
        <FormField label="Title"><Input {...form.register("hero.title")} /></FormField>
        <FormField label="Description"><Textarea {...form.register("hero.description")} /></FormField>
        <FormField label="Email Label"><Input {...form.register("contact.email.label")} /></FormField>
        <FormField label="Email"><Input {...form.register("contact.email.value")} /></FormField>
        <FormField label="Location Label"><Input {...form.register("contact.location.label")} /></FormField>
        <FormField label="Location"><Input {...form.register("contact.location.value")} /></FormField>
      </FormSection>
      <div className="sticky bottom-16 flex justify-end rounded-lg border border-border-subtle bg-surface p-3 lg:bottom-4">
        <SaveButton isSaving={saveWorkflow.isSaving} disabled={query.isLoading} />
      </div>
    </form>
  );
}
