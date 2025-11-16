"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import type { NavMainItem } from "./sidenav/nav-main";
import type { NavUserProps, NavUserMenuItem } from "./sidenav/nav-user";
import {
  BreadcrumbItemInterface,
  SiteHeader,
} from "./sidenav/site-header";
import {
  AppSidebar,
  AppSidebarProps,
  MainNavProps,
  DocumentNavProps,
  SecondaryNavProps,
} from "./sidenav/app-sidebar";
import { SidebarInset, SidebarProvider } from "../../sidebar";
import { cn } from "../../../lib/index";

export type NavConfig = {
  navMain?: MainNavProps;
  navSecondary?: SecondaryNavProps;
  navDocuments?: DocumentNavProps;
};

export interface MainLayoutProps<PATH extends string = string> {
  nav: {
    [P in PATH]: NavConfig;
  };
  brand?: {
    name: string;
    icon?: React.FC<any>;
    path?: string;
  };
  sideNavHeaderSlot?: React.ReactNode;
  sideNavHeaderClassName?: string;
  sideNavOpen?: boolean;
  toggleSidebar?: (open: boolean) => void;
  autoDetectActiveItem?: boolean;
  user?: NavUserProps;
  breadcrumbs?: BreadcrumbItemInterface[];
  autoGenerateBreadcrumbs?: boolean;
  excludeBreadcrumbPaths?: string[];
  className?: string;
  children?: React.ReactNode;
  pathname?: string;
  actionItems?: React.ReactNode;
  hideSidebar?: boolean
}

export function MainLayout<PATH extends string = string>({
  nav,
  user,
  children,
  pathname = "/",
  className,
  breadcrumbs,
  excludeBreadcrumbPaths,
  autoGenerateBreadcrumbs = true,
  brand,
  sideNavHeaderSlot,
  sideNavHeaderClassName,
  sideNavOpen,
  toggleSidebar,
  actionItems,
  hideSidebar
}: MainLayoutProps<PATH>) {
  // Create enhanced user object with additional menu items from nav
  const enhancedUser = React.useMemo(() => {
    if (!user) return undefined;

    // Collect all nav items that should be in header dropdown
    const headerDropdownItems: NavMainItem[] = [];
    (Object.values(nav) as NavConfig[]).forEach((config) => {
      const mainNavItems = config.navMain?.items;
      if (Array.isArray(mainNavItems)) {
        mainNavItems.forEach((item) => {
          if (
            item.renderInHeaderDropdown &&
            (!item.allowedRoles ||
              (user.role && item.allowedRoles.includes(user.role)))
          ) {
            headerDropdownItems.push(item);
          }
        });
      }
    });

    // Convert nav items to menu items
    const additionalMenuItems: NavUserMenuItem[] = headerDropdownItems.map(
      (item) => ({
        icon:
          item.icon && typeof item.icon === "string"
            ? (Icons as any)[item.icon]
              ? React.createElement((Icons as any)[item.icon])
              : null
            : item.icon
              ? React.createElement(item.icon)
              : null,
        label: item.label || "",
        onClick: () => {
          if (item.path) {
            window.location.href = item.path;
          }
        },
      })
    );

    // Return enhanced user object with combined menu items
    return {
      ...user,
      menuItems: [...(user.menuItems || []), ...additionalMenuItems],
    };
  }, [nav, user]);

  const [currentNav, setCurrentNav] = React.useState<NavConfig | undefined>(
    undefined
  );

  React.useEffect(() => {
    console.log("[MainLayout] useEffect running for pathname:", pathname);
    if (pathname && pathname in nav) {
      setCurrentNav(nav[pathname as PATH]);
    }
  }, [pathname, nav]);

  // Check if sidebar should be hidden based on current path
  const shouldHideSidebar = React.useMemo(() => {
    const flattenItems = (items: NavMainItem[] = []): NavMainItem[] => {
      return items.reduce((acc, item) => {
        if (item.children) {
          return [...acc, item, ...flattenItems(item.children)];
        }
        return [...acc, item];
      }, [] as NavMainItem[]);
    };

    if(hideSidebar) return true;

    const navSections = Object.values(nav) as NavConfig[];
    const allNavItems = navSections.reduce((acc: NavMainItem[], section) => {
      const items = section.navMain?.items as NavMainItem[] | undefined;
      if (items) {
        return [...acc, ...flattenItems(items)];
      }
      return acc;
    }, []);

    return allNavItems.some((item) => {
      if (!item.path) return false;
      if (pathname === item.path) return item.hideAppSidebar ?? false;
      if (pathname.startsWith(item.path + "/"))
        return item.hideAppSidebar ?? false;
      return false;
    });
  }, [pathname, nav]);

  const sidebarProps: Partial<AppSidebarProps> = {
    brand,
    headerSlot: sideNavHeaderSlot,
    headerClassName: sideNavHeaderClassName,
    sideNavOpen,
    toggleSidebar,
    ...currentNav,
    pathname,
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {!shouldHideSidebar && (
        <AppSidebar
          user={user}
          variant="inset"
          {...sidebarProps}
          navMain={pathname in nav ? nav[pathname as PATH].navMain : { items: [] }}
          navSecondary={pathname in nav ? nav[pathname as PATH].navSecondary : { items: [] }}
          navDocuments={pathname in nav ? nav[pathname as PATH].navDocuments : { items: [] }}
        />
      )}
      <SidebarInset
        className={cn(
          "bg-sidebar-accent flex flex-col h-full",
          shouldHideSidebar && "p-2"
        )}
      >
        <SidebarInset
          className={cn(
            "rounded-2xl shadow-lg flex flex-col h-full"
          )}
        >
          <SiteHeader
            breadcrumbs={breadcrumbs}
            autoGenerateBreadcrumbs={autoGenerateBreadcrumbs}
            excludeBreadcrumbPaths={excludeBreadcrumbPaths}
            user={enhancedUser}
            pathname={pathname}
            navMainItems={currentNav?.navMain?.items}
            hideSidebarTrigger={shouldHideSidebar}
            actionItems={actionItems}
          />
          <div
            className={cn(
              "flex-1 flex flex-col overflow-y-auto",
              className
            )}
            style={{ minHeight: "calc(100vh - 7vh)" }}
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarInset>
    </SidebarProvider>
  );
}
