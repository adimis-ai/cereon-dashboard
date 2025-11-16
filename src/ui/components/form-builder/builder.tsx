import * as React from "react";
import type {
  FormFieldSchema,
  FormFieldOrGroup,
  FieldVariants,
} from "../data-form/interface";
import { Button } from "../button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { FormProvider, useForm } from "react-hook-form";
import {
  PlusCircle,
  GripVertical,
  Settings,
  Copy,
  Trash,
  TextIcon,
  MailIcon,
  LockIcon,
  Hash,
  AlignLeft,
  ListIcon,
  CheckSquare,
  Image,
  SlidersHorizontal,
  Tags,
  Vault,
  GalleryVertical,
  Files,
  Radio,
  Calendar,
  Clock,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Palette,
  Link2,
  Phone,
  Search,
  EyeOff,
  Send,
  RotateCcw,
  Square,
  Database,
  Minus,
  Save,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "../badge";
import { FieldEditor } from "./editor";
import { Modal } from "../modal";
import { formatToTitleCase } from "../../lib/formatToTitleCase";
import { ListBulletIcon } from "@radix-ui/react-icons";
import { IconToggleLeft } from "@tabler/icons-react";
import { ConfigActions } from "./config-actions";

interface FormBuilderProps {
  title: string;
  initialSchema?: FormFieldOrGroup[];
  onChange?: (schema: FormFieldOrGroup[]) => void;
  onSubmit?: (schema: FormFieldOrGroup[]) => void | Promise<void>;
  disableCreateDelete?: boolean;
}

const FIELD_VARIANTS: {
  label: string;
  value: FieldVariants;
  icon: React.JSX.Element;
}[] = [
  { label: "Text", value: "text", icon: <TextIcon className="size-4" /> },
  { label: "Email", value: "email", icon: <MailIcon className="size-4" /> },
  {
    label: "Password",
    value: "password",
    icon: <LockIcon className="size-4" />,
  },
  { label: "Number", value: "number", icon: <Hash className="size-4" /> },
  {
    label: "Textarea",
    value: "textarea",
    icon: <AlignLeft className="size-4" />,
  },
  { label: "Select", value: "select", icon: <ListIcon className="size-4" /> },
  {
    label: "Multi Select",
    value: "multi-select",
    icon: <ListBulletIcon className="size-4" />,
  },
  {
    label: "Checkbox",
    value: "checkbox",
    icon: <CheckSquare className="size-4" />,
  },
  { label: "Radio", value: "radio", icon: <Radio className="size-4" /> },
  {
    label: "Toggle",
    value: "toggle",
    icon: <IconToggleLeft className="size-4" />,
  },
  { label: "Date", value: "date", icon: <Calendar className="size-4" /> },
  { label: "Time", value: "time", icon: <Clock className="size-4" /> },
  {
    label: "DateTime",
    value: "datetime-local",
    icon: <CalendarClock className="size-4" />,
  },
  { label: "Month", value: "month", icon: <CalendarDays className="size-4" /> },
  { label: "Week", value: "week", icon: <CalendarRange className="size-4" /> },
  { label: "Color", value: "color", icon: <Palette className="size-4" /> },
  {
    label: "Range",
    value: "range",
    icon: <SlidersHorizontal className="size-4" />,
  },
  { label: "URL", value: "url", icon: <Link2 className="size-4" /> },
  { label: "Phone", value: "tel", icon: <Phone className="size-4" /> },
  { label: "Search", value: "search", icon: <Search className="size-4" /> },
  { label: "Image", value: "image", icon: <Image className="size-4" /> },
  { label: "File", value: "file", icon: <Files className="size-4" /> },
  { label: "Hidden", value: "hidden", icon: <EyeOff className="size-4" /> },
  { label: "Submit", value: "submit", icon: <Send className="size-4" /> },
  { label: "Reset", value: "reset", icon: <RotateCcw className="size-4" /> },
  { label: "Button", value: "button", icon: <Square className="size-4" /> },
  {
    label: "Tags",
    value: "tags-input",
    icon: <Tags className="size-4" />,
  },
  { label: "Logo", value: "logo", icon: <Image className="size-4" /> },
  {
    label: "Carousel",
    value: "carousel",
    icon: <GalleryVertical className="size-4" />,
  },
  {
    label: "Separator",
    value: "separator",
    icon: <Minus className="size-4" />,
  },
  { label: "Record", value: "record", icon: <Database className="size-4" /> },
  {
    label: "Envs",
    value: "envs",
    icon: <Vault className="size-4" />,
  },
];

export function FormBuilder({
  title,
  onChange,
  initialSchema = [],
  onSubmit,
  disableCreateDelete,
}: FormBuilderProps) {
  const form = useForm();
  const [fields, setFields] = React.useState<FormFieldOrGroup[]>([]);
  const [editingField, setEditingField] = React.useState<{
    index: number;
    field: FormFieldSchema;
  } | null>(null);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialSchema && fields.length === 0 && initialSchema.length > 0) {
      setFields(initialSchema);
    }
  }, [initialSchema]);

  const addField = (variant: FieldVariants) => {
    const newField: FormFieldSchema = {
      name: `field_${fields.length}`,
      label: "New Field",
      variant,
    };
    setFields([...fields, newField]);
    setEditingField({ index: fields.length, field: newField });
    updateField(fields.length, newField);
  };

  const updateField = async (
    index: number,
    updates: Partial<FormFieldSchema>
  ) => {
    setEditingField({
      index,
      field: { ...(fields[index] as FormFieldSchema), ...updates },
    });
    const updatedFields = [...fields];
    if (!Array.isArray(updatedFields[index])) {
      updatedFields[index] = {
        ...(updatedFields[index] as FormFieldSchema),
        ...updates,
      };
      console.log("[updatedFields]", updatedFields);
      setFields(updatedFields);
      onChange?.(updatedFields);
    }
  };

  const duplicateField = (index: number) => {
    if (!Array.isArray(fields[index])) {
      const field = { ...(fields[index] as FormFieldSchema) };
      field.name = `${field.name}_copy`;
      setFields([...fields, field]);
      updateField(fields.length, field);
    }
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    onChange?.(updatedFields);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);

    // Add null check
    if (reorderedItem) {
      items.splice(result.destination.index, 0, reorderedItem);
      setFields(items);
      onChange?.(items);
    }
  };

  return (
    <FormProvider {...form}>
      <Card className="py-6 min-h-full">
        <CardHeader className="flex justify-between items-center">
          <div className="flex flex-col space-y-1.5">
            <CardTitle>Builder</CardTitle>
            <CardDescription className="max-w-md">
              Build the form for collecting data from users.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <ConfigActions
              title={title}
              onConfigUpload={(config) => {
                setFields(config);
                onChange?.(config);
              }}
              currentConfig={fields}
            />
            <Modal
              open={isAddFieldModalOpen}
              onOpenChange={setIsAddFieldModalOpen}
              title="Add New Field"
              disableSave={true}
              width="min-w-3xl"
              trigger={
                !disableCreateDelete
                  ? {
                      label: "New",
                      icon: <PlusCircle className="size-4 mr-2" />,
                      variant: "outline",
                      tooltip: "Add new field",
                      size: "sm",
                    }
                  : undefined
              }
            >
              <div className="grid grid-cols-6 gap-4 py-4">
                {FIELD_VARIANTS.map((variant) => (
                  <Button
                    key={variant.value}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-24"
                    icon={variant.icon}
                    onClick={() => {
                      addField(variant.value);
                      setIsAddFieldModalOpen(false);
                    }}
                  >
                    {variant.label}
                  </Button>
                ))}
              </div>
            </Modal>
            <Button
              variant="secondary"
              label="Save"
              size="sm"
              icon={<Save className="size-5" />}
              onClick={async (e) => {
                e.preventDefault();
                if (onSubmit) {
                  await onSubmit(fields);
                }
              }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {fields.map(
                    (field, index) =>
                      !Array.isArray(field) && (
                        <Draggable
                          key={field.name}
                          draggableId={field.name}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <Card className="px-3 py-1">
                                <div className="flex items-center gap-4">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                  </div>

                                  <div className="flex-1 justify-start items-center space-x-4 space-y-1">
                                    <span className="text-accent-foreground text-sm">
                                      {formatToTitleCase(field.label)}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-muted-foreground"
                                    >
                                      {field.name}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-muted-foreground"
                                    >
                                      {formatToTitleCase(
                                        field.variant || "text"
                                      )}
                                    </Badge>
                                    {field.required && (
                                      <Badge
                                        variant="secondary"
                                        className="text-muted-foreground"
                                      >
                                        Required
                                      </Badge>
                                    )}
                                    {field.conditionalLogic && (
                                      <Badge
                                        variant="secondary"
                                        className="text-muted-foreground"
                                      >
                                        Cond.
                                      </Badge>
                                    )}
                                    {field.needUserInput && (
                                      <Badge
                                        variant="secondary"
                                        className="text-muted-foreground"
                                      >
                                        User
                                      </Badge>
                                    )}
                                    {field.is_secret && (
                                      <Badge
                                        variant="secondary"
                                        className="text-muted-foreground"
                                      >
                                        Secret
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      icon={<Settings className="size-4" />}
                                      tooltip="Edit field"
                                      onClick={() =>
                                        setEditingField({ index, field })
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      icon={<Copy className="size-4" />}
                                      tooltip="Duplicate field"
                                      onClick={() => duplicateField(index)}
                                    />
                                    {!disableCreateDelete && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        icon={<Trash className="size-4" />}
                                        tooltip="Delete field"
                                        onClick={() => removeField(index)}
                                      />
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      )
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>

        {editingField && (
          <Modal
            open={!!editingField}
            onOpenChange={(open) => !open && setEditingField(null)}
            title={`Edit Field - ${formatToTitleCase(editingField.field.label)}`}
            width="min-w-4xl"
            onSave={() => setEditingField(null)}
            submitButton={{
              text: "Done",
            }}
            hideCancelButton
          >
            <div className="grid gap-4 py-4">
              <FieldEditor
                field={editingField.field}
                onChange={(updates) => updateField(editingField.index, updates)}
                availableFields={
                  fields.filter(
                    (f, i) => !Array.isArray(f) && i !== editingField.index
                  ) as FormFieldSchema[]
                }
                isFirstField={editingField.index === 0} // Add this line
              />
            </div>
          </Modal>
        )}
      </Card>
    </FormProvider>
  );
}
