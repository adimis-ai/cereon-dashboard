"use client";

import * as React from "react";
import { PlusIcon, GripVertical, X, Pencil } from "lucide-react";
import type { UniqueIdentifier } from "@dnd-kit/core";

import { cn } from "../lib/index";
import { formatToTitleCase } from "../lib/formatToTitleCase";
import { Button } from "./button";
import { Input } from "./input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "./sortable";

interface Tab {
  id: string;
  value: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface EditableDynamicTabsProps {
  tabs: Tab[];
  defaultValue: string;
  className?: string;
  readOnly?: boolean;
  onTabsChange?: (tabs: Tab[]) => void;
  onActiveTabChange?: (value: string) => void;
}

export function EditableDynamicTabs({
  tabs: initialTabs,
  defaultValue,
  className,
  readOnly,
  onTabsChange,
  onActiveTabChange,
}: EditableDynamicTabsProps) {
  const [tabs, setTabs] = React.useState<Tab[]>(initialTabs);
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const [editingTab, setEditingTab] = React.useState<string | null>(null);
  const [newTabName, setNewTabName] = React.useState("");
  const [isAddingTab, setIsAddingTab] = React.useState(false);

  // Update tabs when initialTabs changes
  React.useEffect(() => {
    setTabs(initialTabs);
  }, [initialTabs]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onActiveTabChange?.(value);
  };

  const handleTabsReorder = (items: { id: UniqueIdentifier }[]) => {
    const newTabs = items.map(
      (item) => tabs.find((tab) => tab.id === item.id)!
    );
    setTabs(newTabs);
    onTabsChange?.(newTabs);
  };

  const handleAddTab = () => {
    if (!newTabName || newTabName.trim().length === 0) return;

    const formattedName = formatToTitleCase(newTabName);
    const newTab: Tab = {
      id: crypto.randomUUID(),
      value: formattedName.toLowerCase().replace(/\s+/g, "-"),
      label: formattedName,
      content: null,
    };

    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    onTabsChange?.(updatedTabs);
    setNewTabName("");
    setIsAddingTab(false);
    setActiveTab(newTab.value);
  };

  const handleRemoveTab = (tabId: string) => {
    const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(updatedTabs);
    onTabsChange?.(updatedTabs);

    if (tabs.find((tab) => tab.id === tabId)?.value === activeTab) {
      setActiveTab(updatedTabs[0]?.value || "");
    }
  };

  const handleEditTabName = (tabId: string, newName: string) => {
    if (!newName || newName.trim().length === 0) return;

    const formattedName = formatToTitleCase(newName);
    const updatedTabs = tabs.map((tab) => {
      if (tab.id === tabId) {
        const newValue = formattedName.toLowerCase().replace(/\s+/g, "-");
        return {
          ...tab,
          label: formattedName,
          value: newValue,
        };
      }
      return tab;
    });
    setTabs(updatedTabs);
    onTabsChange?.(updatedTabs);
    setEditingTab(null);

    // Set the active tab to the newly edited tab
    const editedTab = updatedTabs.find((tab) => tab.id === tabId);
    if (editedTab) {
      setActiveTab(editedTab.value);
      onActiveTabChange?.(editedTab.value);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn("w-full", className)}
    >
      <div className="flex items-center border-b">
        <Sortable
          value={tabs.map((tab) => ({ id: tab.id }))}
          onValueChange={handleTabsReorder}
          orientation="horizontal"
        >
          <TabsList className="inline-flex h-11 items-center w-full justify-start rounded-none bg-transparent">
            {tabs.map((tab) => (
              <SortableItem key={tab.id} id={tab.id} value={tab.id}>
                <TabsTrigger
                  value={tab.value}
                  className="group inline-flex items-center justify-center gap-2 whitespace-nowrap py-1 text-sm relative h-9 rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <SortableDragHandle className="invisible group-hover:visible size-4 rounded opacity-60 hover:opacity-100 cursor-grab">
                      <div className="inline-flex items-center justify-center size-3">
                        <GripVertical className="size-3" />
                      </div>
                    </SortableDragHandle>

                    {editingTab === tab.id ? (
                      <Input
                        autoFocus
                        value={tab.label}
                        className="h-6 w-[120px] px-1 text-sm"
                        onBlur={(e) =>
                          handleEditTabName(tab.id, e.target.value)
                        }
                        onChange={(e) => {
                          const updatedTabs = tabs.map((t) =>
                            t.id === tab.id
                              ? { ...t, label: e.target.value }
                              : t
                          );
                          setTabs(updatedTabs);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditTabName(tab.id, e.currentTarget.value);
                          }
                        }}
                      />
                    ) : (
                      <>
                        {tab.icon}
                        <span>{formatToTitleCase(tab.label)}</span>
                      </>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="invisible group-hover:visible ml-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-sm hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTab(tab.id);
                        }}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-sm hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTab(tab.id);
                        }}
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  )}
                </TabsTrigger>
              </SortableItem>
            ))}
          </TabsList>
        </Sortable>

        {!readOnly && (
          <Dialog open={isAddingTab} onOpenChange={setIsAddingTab}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-none border-b hover:bg-muted"
              >
                <PlusIcon className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tab</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Enter tab name..."
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTab();
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingTab(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTab} disabled={!newTabName}>
                  Add Tab
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
