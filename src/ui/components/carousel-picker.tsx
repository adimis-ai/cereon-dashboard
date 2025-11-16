"use client";

import { FC, useEffect, useState } from "react";
import { cn } from "../lib/index";
import {
  ImageIcon,
  Plus,
  Trash2,
  GripVertical,
  RefreshCw,
  Loader,
  FileImage,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableContainer,
} from "./table";
import { GalleryCarousel } from "./gallery";
import { DynamicTabs } from "./tabs";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { LogoPicker } from "./logo-picker";
import { AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "./alert";
import {
  Sortable,
  SortableItem,
  SortableDragHandle,
} from "./sortable";
import { Modal } from "./modal";

// Add UUID generation function
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface SlideshowSlide {
  id: string; // Make id optional
  title: string;
  description: string;
  image_url: string;
}

export interface AddSlide {
  title: string;
  description: string;
  image: File;
}

export interface RemoveSlide {
  index: number;
}

interface CarouselPickerProps {
  className?: string;
  value?: SlideshowSlide[];
  disabled?: boolean;
  onChange?: (value: SlideshowSlide[]) => void | Promise<void>;
  onAdd?: (slide: AddSlide) => void | Promise<void>;
  onRemove?: (index: number) => void | Promise<void>;
  loadSlideshows?: () => Promise<SlideshowSlide[]>;
}

export const CarouselPicker: FC<CarouselPickerProps> = ({
  className,
  value = [],
  disabled = false,
  onAdd,
  onRemove,
  loadSlideshows,
  onChange,
}) => {
  const [slides, setSlides] = useState<SlideshowSlide[]>(value);
  const [newSlide, setNewSlide] = useState<Partial<AddSlide>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    console.log("CarouselPicker: Slides updated:", slides);
  }, [slides]);

  useEffect(() => {
    const loadSlides = async () => {
      if (loadSlideshows) {
        setIsLoading(true);
        try {
          const loadedSlides = await loadSlideshows();
          // Add IDs to slides if they don't have them
          const slidesWithIds = loadedSlides.map((slide, index) => ({
            ...slide,
            id: slide.id || `slide-${index}`,
          }));
          setSlides(slidesWithIds);
          onChange?.(slidesWithIds);
        } catch (error) {
          console.error("Failed to load slides:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadSlides();
  }, []);

  useEffect(() => {
    // Ensure all slides have IDs when value changes
    const slidesWithIds = value.map((slide, index) => ({
      ...slide,
      id: slide.id || `slide-${index}`,
    }));
    setSlides(slidesWithIds);
  }, [value]);

  const handleAddSlide = async () => {
    if (!newSlide.title || !newSlide.description || !newSlide.image) return;

    setIsSaving(true);
    try {
      await onAdd?.({
        title: newSlide.title,
        description: newSlide.description,
        image: newSlide.image,
      });
      setNewSlide({});
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add slide:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSlide = async (index: number) => {
    setIsSaving(true);
    try {
      await onRemove?.(index);
    } catch (error) {
      console.error("Failed to remove slide:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!slides.length) return;

    setIsSaving(true);
    try {
      for (const [index] of slides.entries()) {
        await onRemove?.(index);
      }
      setSlides([]);
      onChange?.([]);
    } catch (error) {
      console.error("Failed to clear slides:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add reordering function
  const handleReorder = (values: SlideshowSlide[]) => {
    setSlides(values);
    onChange?.(values);
  };

  const AddSlideModal = (
    <Modal
      open={isAddModalOpen}
      onOpenChange={setIsAddModalOpen}
      title="Add New Slide"
      description="Add a new slide to your carousel. Upload an image and provide a title and description."
      onSave={handleAddSlide}
      disableSave={!newSlide.title || !newSlide.description || !newSlide.image}
      submitButton={{
        text: "Add Slide",
        icon: <Plus className="h-4 w-4" />,
      }}
    >
      <div className="grid gap-6 py-4">
        <div className="space-y-2">
          <LogoPicker
            variant="rectangle"
            value={newSlide.image}
            onChange={(file) =>
              setNewSlide({ ...newSlide, image: file as File })
            }
            disabled={disabled || isSaving}
            showConfirmation={false}
          />
          <p className="text-xs text-muted-foreground text-center">
            Upload a high-quality image (16:9 ratio recommended)
          </p>
        </div>
        <Input
          placeholder="Slide Title"
          value={newSlide.title || ""}
          onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
          disabled={disabled || isSaving}
        />
        <Textarea
          placeholder="Slide Description"
          value={newSlide.description || ""}
          onChange={(e) =>
            setNewSlide({ ...newSlide, description: e.target.value })
          }
          disabled={disabled || isSaving}
          className="min-h-[100px]"
        />
      </div>
    </Modal>
  );

  const UploaderContent = (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading slides...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearAll}
              disabled={disabled || isSaving || !slides.length}
              tooltip="Clear all slides"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={() => setIsAddModalOpen(true)}
              disabled={disabled || isSaving}
              tooltip="Add new slide"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {slides.length === 0 ? (
            <Alert>
              <AlertDescription>
                No slides added yet. Click the "+" button to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <Sortable
              value={slides}
              onValueChange={handleReorder}
              orientation="vertical"
            >
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[120px]">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {slides.map((slide, index) => (
                        <SortableItem
                          key={index}
                          value={slide.id}
                          className="relative group"
                          asChild
                        >
                          <TableRow>
                            <TableCell>
                              <SortableDragHandle
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <GripVertical className="h-4 w-4" />
                              </SortableDragHandle>
                            </TableCell>
                            <TableCell>
                              <div className="relative h-16 w-24 rounded-md overflow-hidden border bg-muted">
                                <img
                                  src={slide.image_url}
                                  alt={slide.title}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </TableCell>
                            <TableCell>{slide.title}</TableCell>
                            <TableCell className="max-w-[300px]">
                              <p className="text-sm text-muted-foreground truncate">
                                {slide.description}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSlide(index)}
                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={disabled || isSaving}
                                tooltip="Remove slide"
                              >
                                {isSaving ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        </SortableItem>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>
            </Sortable>
          )}
        </>
      )}
      {AddSlideModal}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <DynamicTabs
        defaultValue="uploader"
        tabs={[
          {
            label: "Manage Slides",
            value: "uploader",
            icon: <FileImage className="h-4 w-4" />,
            content: UploaderContent,
          },
          {
            label: "Preview Gallery",
            value: "preview",
            icon: <ImageIcon className="h-4 w-4" />,
            content:
              slides.length > 0 ? (
                <GalleryCarousel
                  items={slides.map((slide, index) => ({
                    id: index,
                    image: slide.image_url,
                    title: slide.title,
                    description: slide.description,
                  }))}
                  showControls
                  showPagination
                  showFullscreen
                  allowKeyboardNavigation
                  allowSwipe
                  disabled={disabled || isLoading || isSaving}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Add some slides first to preview your gallery.
                  </AlertDescription>
                </Alert>
              ),
          },
        ]}
      />
    </div>
  );
};
