import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { FormSection } from "@/components/form/FormSection";
import { SaveButton } from "@/components/form/SaveButton";
import { Textarea } from "@/components/ui/Textarea";
import { useSettings, useUpdateSettings } from "@/features/shared/hooks";
import { settingsSchema, type SettingsFormValues } from "@/features/settings/settings.schema";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

type SettingsKey = keyof SettingsFormValues;
type JsonDrafts = Record<SettingsKey, string>;
const emptySettings: SettingsFormValues = { seo: {}, forms: {}, scheduling: {} };

function draftsFromSettings(settings: SettingsFormValues): JsonDrafts {
  return {
    seo: JSON.stringify(settings.seo, null, 2),
    forms: JSON.stringify(settings.forms, null, 2),
    scheduling: JSON.stringify(settings.scheduling, null, 2),
  };
}

export default function SettingsPage() {
  const query = useSettings();
  const update = useUpdateSettings();
  const saveWorkflow = useSaveWorkflow();
  const [drafts, setDrafts] = useState<JsonDrafts>(() => draftsFromSettings(emptySettings));
  const form = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema), defaultValues: emptySettings });

  useEffect(() => {
    if (!query.data) return;
    form.reset(query.data);
    setDrafts(draftsFromSettings(query.data));
  }, [form, query.data]);

  const submit = form.handleSubmit(async () => {
    try {
      const values = settingsSchema.parse({
        seo: JSON.parse(drafts.seo),
        forms: JSON.parse(drafts.forms),
        scheduling: JSON.parse(drafts.scheduling),
      });
      const saved = await saveWorkflow.save(() => update.mutateAsync(values));
      if (saved) form.reset(values);
    } catch (error) {
      if (error instanceof SyntaxError) saveWorkflow.validationError("Settings contain invalid JSON. Correct it before saving.");
      else if (error instanceof ZodError) saveWorkflow.validationError(error.issues[0]?.message ?? "Settings are invalid.");
      else throw error;
    }
  }, saveWorkflow.validationFailed);

  const jsonField = (name: SettingsKey) => (
    <FormField label={name}>
      <Textarea value={drafts[name]} onChange={(event) => setDrafts((current) => ({ ...current, [name]: event.target.value }))} />
    </FormField>
  );

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <FormSection title="Settings">{jsonField("seo")}{jsonField("forms")}{jsonField("scheduling")}</FormSection>
      <div className="sticky bottom-16 flex justify-end rounded-lg border border-border-subtle bg-surface p-3 lg:bottom-4">
        <SaveButton isSaving={saveWorkflow.isSaving} disabled={query.isLoading} />
      </div>
    </form>
  );
}
