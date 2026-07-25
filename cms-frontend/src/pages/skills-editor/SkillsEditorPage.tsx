import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { FormSection } from "@/components/form/FormSection";
import { SaveButton } from "@/components/form/SaveButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { skillsSchema, type SkillsFormValues } from "@/features/skills/skills.schema";
import { useSkills, useUpdateSkills } from "@/features/shared/hooks";
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow";

export default function SkillsEditorPage() {
  const query = useSkills();
  const update = useUpdateSkills();
  const saveWorkflow = useSaveWorkflow();
  const form = useForm<SkillsFormValues>({ resolver: zodResolver(skillsSchema), defaultValues: { categories: [], learningItems: [] } });
  const categories = useFieldArray({ control: form.control, name: "categories" });
  const learning = useFieldArray({ control: form.control, name: "learningItems" });
  useEffect(() => { if (query.data) form.reset(query.data); }, [form, query.data]);
  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => saveWorkflow.save(() => update.mutateAsync(values)), saveWorkflow.validationFailed)}>
      <FormSection title="Skill Categories">
        <div className="grid gap-3 md:col-span-2">
          {categories.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-md border border-border-subtle p-3 md:grid-cols-3">
              <FormField label="Title"><Input {...form.register(`categories.${index}.title`)} /></FormField>
              <FormField label="Items"><Input value={(form.watch(`categories.${index}.items`) ?? []).join(", ")} onChange={(event) => form.setValue(`categories.${index}.items`, event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></FormField>
              <FormField label="Order"><Input type="number" {...form.register(`categories.${index}.orderIndex`, { valueAsNumber: true })} /></FormField>
            </div>
          ))}
        </div>
      </FormSection>
      <FormSection title="Currently Learning">
        <div className="grid gap-3 md:col-span-2">
          {learning.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-md border border-border-subtle p-3 md:grid-cols-4">
              <FormField label="Label"><Input {...form.register(`learningItems.${index}.label`)} /></FormField>
              <FormField label="Icon"><Select {...form.register(`learningItems.${index}.icon`)}><option>Sparkles</option><option>Cloud</option><option>Network</option></Select></FormField>
              <FormField label="Progress"><Input type="number" {...form.register(`learningItems.${index}.progressPercent`, { valueAsNumber: true })} /></FormField>
              <FormField label="Order"><Input type="number" {...form.register(`learningItems.${index}.orderIndex`, { valueAsNumber: true })} /></FormField>
            </div>
          ))}
        </div>
      </FormSection>
      <div className="sticky bottom-16 flex justify-end rounded-lg border border-border-subtle bg-surface p-3 lg:bottom-4">
        <SaveButton isSaving={saveWorkflow.isSaving} disabled={query.isLoading} />
      </div>
    </form>
  );
}
