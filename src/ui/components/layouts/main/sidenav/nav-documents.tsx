"use client";

import { IconDots } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../../sidebar";
import React from "react";
import { renderIcon } from "../../../../lib/icon-utils";

export interface NavDocumentItem {
  id: string;
  path?: string;
  component?: React.FC<any>;
  icon?: React.FC<any> | string;
  label: string;
  actions?: NavDocumentItemAction[];
}

export interface NavDocumentItemAction {
  label: string;
  icon: React.FC<any> | string;
  onClick?: () => void;
  variant?: "default" | "destructive";
}

interface NavDocumentProps {
  title?: string;
  className?: string;
  items: NavDocumentItem[];
  defaultActions?: NavDocumentItemAction[];
  onItemSelect?: (item: NavDocumentItem) => void;
}

export function NavDocuments({
  items,
  title,
  className,
  defaultActions,
  onItemSelect,
}: NavDocumentProps) {
  const { isMobile } = useSidebar();

  return (
    items.length !== 0 && (
      <SidebarGroup
        className={`group-data-[collapsible=icon]:hidden ${className}`}
      >
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id} onClick={() => onItemSelect?.(item)}>
              <SidebarMenuButton asChild>
                <a href={item.path} className="flex items-center gap-2">
                  {item.icon &&
                    renderIcon(item.icon, {
                      className: "size-4 text-muted-foreground",
                    })}
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm"
                  >
                    <IconDots />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  {(item.actions ?? defaultActions!).map((action, index) => (
                    <React.Fragment key={`${item.id}-action-${index}`}>
                      <DropdownMenuItem
                        onClick={action.onClick}
                        variant={action.variant}
                        className="flex items-center gap-2"
                      >
                        {action.icon &&
                          renderIcon(action.icon, { className: "size-4" })}
                        <span>{action.label}</span>
                      </DropdownMenuItem>
                      {index < (item.actions ?? defaultActions!).length - 1 &&
                        action.variant === "destructive" && (
                          <DropdownMenuSeparator />
                        )}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  );
}
