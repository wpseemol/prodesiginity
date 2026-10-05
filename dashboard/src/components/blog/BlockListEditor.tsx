import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  FilmIcon,
  HeadingIcon,
  Heading2Icon,
  ImageIcon,
  InfoIcon,
  ListIcon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogMediaInput } from "./BlogMediaInput";
import {
  BLOCK_LABELS,
  EDITABLE_BLOCK_TYPES,
  emptyBlock,
  type BlogPostFormValues,
  type EditableBlockType,
} from "./blogTypes";

const BLOCK_ICONS: Record<EditableBlockType, LucideIcon> = {
  paragraph: PilcrowIcon,
  heading: HeadingIcon,
  subheading: Heading2Icon,
  list: ListIcon,
  quote: QuoteIcon,
  callout: InfoIcon,
  image: ImageIcon,
  video: FilmIcon,
  divider: MinusIcon,
};

const TONES = { info: "Info", warning: "Warning", success: "Success" } as const;

type Form = UseFormReturn<BlogPostFormValues>;

function TextField({
  form,
  index,
  name,
  label,
  multiline,
  rows = 3,
  placeholder,
  optional,
}: {
  form: Form;
  index: number;
  name: "text" | "title" | "attribution" | "alt" | "caption" | "items";
  label: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <Controller
      name={`body.${index}.${name}`}
      control={form.control}
      render={({ field, fieldState }) => {
        const id = `block-${index}-${name}`;
        const props = {
          ...field,
          value: String(field.value ?? ""),
          id,
          placeholder,
          "aria-invalid": fieldState.invalid,
        };
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>
              {label}
              {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
            </FieldLabel>
            {multiline ? <Textarea {...props} rows={rows} /> : <Input {...props} />}
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        );
      }}
    />
  );
}

function BlockFields({ form, index, type }: { form: Form; index: number; type: string }) {
  switch (type) {
    case "heading":
      return (
        <>
          <TextField form={form} index={index} name="text" label="Heading" placeholder="Section title" />
          <FieldDescription>Headings appear in the article’s table of contents.</FieldDescription>
        </>
      );
    case "subheading":
      return <TextField form={form} index={index} name="text" label="Sub-heading" />;
    case "paragraph":
      return (
        <TextField
          form={form}
          index={index}
          name="text"
          label="Text"
          multiline
          rows={5}
          placeholder="Write plain text. Links and emails become clickable automatically."
        />
      );
    case "list":
      return (
        <>
          <TextField
            form={form}
            index={index}
            name="items"
            label="Items (one per line)"
            multiline
            rows={4}
          />
          <Controller
            name={`body.${index}.ordered`}
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch id={`block-${index}-ordered`} checked={field.value} onCheckedChange={field.onChange} />
                <FieldLabel htmlFor={`block-${index}-ordered`}>Numbered list</FieldLabel>
              </Field>
            )}
          />
        </>
      );
    case "quote":
      return (
        <>
          <TextField form={form} index={index} name="text" label="Quote" multiline />
          <TextField form={form} index={index} name="attribution" label="Who said it" optional />
        </>
      );
    case "callout":
      return (
        <>
          <Controller
            name={`body.${index}.tone`}
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Style</FieldLabel>
                <Select value={field.value} onValueChange={(v) => field.onChange(v ?? "info")}>
                  <SelectTrigger className="w-40">
                    <SelectValue>{TONES[field.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TONES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <TextField form={form} index={index} name="title" label="Title" optional />
          <TextField form={form} index={index} name="text" label="Text" multiline />
        </>
      );
    case "image":
    case "video":
      return (
        <>
          <Controller
            name={`body.${index}.src`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`block-${index}-src`}>{type === "image" ? "Image" : "Video"}</FieldLabel>
                <BlogMediaInput
                  id={`block-${index}-src`}
                  kind={type}
                  compact
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          {type === "image" ? (
            <TextField
              form={form}
              index={index}
              name="alt"
              label="Alt text"
              placeholder="Describe the image for search engines and screen readers"
            />
          ) : (
            <TextField form={form} index={index} name="title" label="Video title" optional />
          )}
          <TextField form={form} index={index} name="caption" label="Caption" optional />
        </>
      );
    case "divider":
      return <p className="text-xs text-muted-foreground">A horizontal line between sections.</p>;
    default:
      return (
        <p className="text-xs text-muted-foreground">
          This “{type}” block was added outside the dashboard. It is kept as is and can be moved or removed.
        </p>
      );
  }
}

function InsertBlockMenu({ onPick }: { onPick: (type: EditableBlockType) => void }) {
  return (
    <div className="group/insert relative flex h-6 items-center justify-center">
      <div className="absolute inset-x-4 top-1/2 h-px bg-primary/40 opacity-0 transition-opacity group-hover/insert:opacity-100" />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Insert a block here"
          className="relative flex h-5 items-center gap-1 rounded-full border bg-background px-2 text-[11px] text-muted-foreground opacity-60 transition hover:border-primary/50 hover:text-primary hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
        >
          <PlusIcon className="size-3" />
          Insert
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {EDITABLE_BLOCK_TYPES.map((type) => {
            const Icon = BLOCK_ICONS[type];
            return (
              <DropdownMenuItem key={type} onClick={() => onPick(type)}>
                <Icon />
                {BLOCK_LABELS[type]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function BlockListEditor({ form }: { form: Form }) {
  const { fields, append, insert, remove, move } = useFieldArray({ control: form.control, name: "body" });
  const rootError = form.formState.errors.body?.root?.message ?? form.formState.errors.body?.message;

  return (
    <div className="grid gap-0">
      {fields.map((block, index) => {
        const type = block.type as EditableBlockType;
        const Icon = BLOCK_ICONS[type] ?? InfoIcon;
        const hasError = Boolean(form.formState.errors.body?.[index]);
        return (
          <div key={block.id}>
            {index > 0 ? <InsertBlockMenu onPick={(t) => insert(index, emptyBlock(t))} /> : null}
          <div
            id={`post-block-${index}`}
            className={`grid scroll-mt-32 gap-3 rounded-xl border bg-card p-3 transition-shadow sm:p-4 ${hasError ? "border-destructive/50" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-3.5" />
              </span>
              <span className="text-sm font-medium">{BLOCK_LABELS[type] ?? block.type}</span>
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
              <div className="ml-auto flex items-center gap-0.5">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Duplicate block"
                  title="Duplicate"
                  onClick={() => insert(index + 1, { ...form.getValues(`body.${index}`), anchor: "" })}
                >
                  <CopyIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Move block up"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Move block down"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowDownIcon />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove block"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    const removed = form.getValues(`body.${index}`);
                    remove(index);
                    toast(`${BLOCK_LABELS[type] ?? "Block"} removed`, {
                      action: { label: "Undo", onClick: () => insert(index, removed) },
                    });
                  }}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
            <BlockFields form={form} index={index} type={block.type} />
          </div>
          </div>
        );
      })}

      {rootError ? <p className="mt-3 text-sm text-destructive">{rootError}</p> : null}

      <div className="mt-3 flex flex-wrap gap-1.5 rounded-xl border border-dashed p-2">
        <span className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Add block:</span>
        {EDITABLE_BLOCK_TYPES.map((type) => {
          const Icon = BLOCK_ICONS[type];
          return (
            <Button key={type} type="button" size="sm" variant="outline" onClick={() => append(emptyBlock(type))}>
              <Icon />
              {BLOCK_LABELS[type]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
