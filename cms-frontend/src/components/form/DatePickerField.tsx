import { Input } from "@/components/ui/Input";

export function DatePickerField(props: React.ComponentProps<typeof Input>) {
  return <Input type="date" {...props} />;
}
