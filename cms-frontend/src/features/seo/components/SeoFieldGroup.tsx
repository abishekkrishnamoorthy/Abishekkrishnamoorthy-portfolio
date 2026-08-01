import { FormField } from "@/components/form/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

function counterClass(length: number, ideal: number, max: number) {
  if (length > max) return "text-danger";
  if (length > ideal) return "text-accent";
  return "text-muted";
}

export function SeoFieldGroup({
  titleValue,
  descriptionValue,
  onTitleChange,
  onDescriptionChange,
  titleLabel,
  descriptionLabel,
  titleError,
  descriptionError,
}: {
  titleValue: string;
  descriptionValue: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleLabel: string;
  descriptionLabel: string;
  titleError?: string;
  descriptionError?: string;
}) {
  return (
    <>
      <FormField label={titleLabel} error={titleError} hint={`${titleValue.length}/60 recommended`}>
        <Input value={titleValue} onChange={(event) => onTitleChange(event.target.value)} />
        <span className={`mt-1 block text-xs ${counterClass(titleValue.length, 60, 70)}`}>Search titles usually perform best around 50-60 characters.</span>
      </FormField>
      <FormField label={descriptionLabel} error={descriptionError} hint={`${descriptionValue.length}/160 recommended`}>
        <Textarea value={descriptionValue} onChange={(event) => onDescriptionChange(event.target.value)} />
        <span className={`mt-1 block text-xs ${counterClass(descriptionValue.length, 160, 180)}`}>Descriptions usually perform best around 150-160 characters.</span>
      </FormField>
    </>
  );
}
