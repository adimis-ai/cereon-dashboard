import * as React from "react";

import {
  NavDocumentItem,
  NavDocuments,
} from "./nav-documents";
import { NavMain, NavMainItem } from "./nav-main";
import {
  NavSecondary,
  NavSecondaryItem,
} from "./nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "../../../sidebar";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { NavUserProps } from "./nav-user";
import { Link } from "react-router-dom";
import { cn } from "../../../../lib/utils";

export interface MainNavProps {
  items: NavMainItem[];
  className?: string;
}

export interface SecondaryNavProps {
  items: NavSecondaryItem[];
  className?: string;
}

export interface DocumentNavProps {
  items: NavDocumentItem[];
  title?: string;
  className?: string;
  defaultActions?: Array<{
    label: string;
    icon: React.FC<any>;
    onClick?: () => void;
    variant?: "default" | "destructive";
  }>;
  onItemSelect?: (item: NavDocumentItem) => void;
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: NavUserProps;
  navMain?: MainNavProps;
  navSecondary?: SecondaryNavProps;
  navDocuments?: DocumentNavProps;
  brand?: {
    name: string;
    icon?: React.FC<any>;
    path?: string;
  };
  headerSlot?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  sideNavOpen?: boolean;
  pathname?: string;
  toggleSidebar?: (open: boolean) => void;
}

export function AppSidebar({
  user,
  brand,
  headerSlot,
  navMain,
  navSecondary,
  navDocuments,
  className,
  headerClassName,
  sideNavOpen,
  pathname,
  toggleSidebar: toggleSidenav,
  ...props
}: AppSidebarProps) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="inset" {...props} className="flex">
      <SidebarHeader className={cn("p-0 mt-1 mb-1", headerClassName)}>
        {headerSlot || (
          <SidebarMenu>
            <a
              href={brand?.path}
              className={cn(
                "flex items-center shadow-md rounded-lg bg-background",
                state !== "collapsed" ? "p-1 mx-3 justify-start" : "mx-1 justify-center"
              )}
            >
              <img
                src={"/cereon.png"}
                alt="Cereon OS Logo"
                className={cn(
                  "rounded-full object-contain border-none shadow-none",
                  state === "collapsed" ? "size-12" : "size-10"
                )}
                style={{ background: "none" }}
              />
              {state !== "collapsed" && (
                <span className="text-xl font-semibold">
                  {brand?.name || "Cereon OS"}
                </span>
              )}
            </a>
          </SidebarMenu>
        )}
      </SidebarHeader>

      <SidebarContent className={className}>
        <div>
          {navMain && (
            <NavMain
              items={navMain.items}
              className={navMain.className}
              pathname={pathname}
              currentUserRole={user?.role}
            />
          )}
          {navDocuments && (
            <NavDocuments
              items={navDocuments.items}
              title={navDocuments.title}
              className={navDocuments.className}
              defaultActions={navDocuments.defaultActions}
              onItemSelect={navDocuments.onItemSelect}
            />
          )}
          {navSecondary && (
            <NavSecondary
              items={navSecondary.items}
              className={navSecondary.className ?? "mt-auto"}
            />
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
