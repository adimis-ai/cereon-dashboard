"use client";

import * as React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../sidebar";
import { Link } from "react-router-dom";
import { renderIcon } from "../../../../lib/icon-utils";

export interface NavSecondaryItem {
  id: string;
  path?: string;
  icon?: React.FC<any> | string;
  label: string;
  component?: React.FC<any>;
}

interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: NavSecondaryItem[];
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  return (
    items.length !== 0 && (
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <a
                    href={item.path}
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    {item.icon &&
                      renderIcon(item.icon, {
                        className: "size-4 text-muted-foreground",
                      })}
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  );
}
