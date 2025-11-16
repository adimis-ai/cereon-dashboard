import React, { useMemo } from "react";
import { SidebarTrigger } from "../../../sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../breadcrumb";
import * as lucideIcons from "lucide-react";
import { NavUser, NavUserProps } from "./nav-user";
import { Home } from "lucide-react";
import { NavMainItem } from "./nav-main";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../../../navigation-menu";
import { Separator } from "../../../separator";
import { formatToTitleCase } from "../../../../lib/formatToTitleCase";

export interface BreadcrumbItemInterface {
  label: string;
  href?: string;
}

interface SiteHeaderProps {
  breadcrumbs?: BreadcrumbItemInterface[];
  user?: NavUserProps;
  autoGenerateBreadcrumbs?: boolean;
  excludeBreadcrumbPaths?: string[];
  pathname?: string;
  navMainItems?: NavMainItem[];
  currentUserRole?: string;
  hideSidebarTrigger?: boolean;
  actionItems?: React.ReactNode;
}

export function SiteHeader({
  breadcrumbs = [],
  user,
  autoGenerateBreadcrumbs = false,
  excludeBreadcrumbPaths = ["/environments"],
  pathname = "/",
  navMainItems = [],
  currentUserRole,
  hideSidebarTrigger = false,
  actionItems,
}: SiteHeaderProps) {
  const navItems = useMemo(
    () =>
      navMainItems?.filter((item) => {
        if (item.renderInNavMenu) {
          if (item.allowedRoles && currentUserRole) {
            return item.allowedRoles.includes(currentUserRole);
          }
          return true;
        }
        return false;
      }) || [],
    [navMainItems, currentUserRole]
  );

  const generatedBreadcrumbs = useMemo(() => {
    if (!autoGenerateBreadcrumbs) return breadcrumbs;

    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    if (excludeBreadcrumbPaths.some((path) => pathname.startsWith(path))) {
      return breadcrumbs;
    }

    const generateBreadcrumbs = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href };
    });

    return generateBreadcrumbs;
  }, [pathname, autoGenerateBreadcrumbs, excludeBreadcrumbPaths, breadcrumbs]);

  const activeBreadcrumbs = autoGenerateBreadcrumbs
    ? generatedBreadcrumbs
    : breadcrumbs;

  return (
    <header className="sticky top-0 z-20 bg-background rounded-t-lg flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-4">
        {" "}
        {!hideSidebarTrigger && (
          <>
            <SidebarTrigger className="size-6 text-muted-foreground" />
            <div className="h-4 w-px bg-border mx-2" />
          </>
        )}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="size-5 text-secondary-foreground" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {activeBreadcrumbs.length > 0 && (
              <>
                <BreadcrumbSeparator />
                {activeBreadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {index === activeBreadcrumbs.length - 1 ? (
                        <BreadcrumbPage>
                          {formatToTitleCase(item.label)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>
                          {formatToTitleCase(item.label)}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < activeBreadcrumbs.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2 min-w-0">
          {navItems.length > 0 && (
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => {
                  let IconComponent: any = null;
                  if (
                    typeof item.icon === "string" &&
                    item.icon in lucideIcons
                  ) {
                    IconComponent =
                      lucideIcons[item.icon as keyof typeof lucideIcons];
                  } else if (typeof item.icon !== "string") {
                    IconComponent = item.icon;
                  }
                  return (
                    <NavigationMenuItem key={item.path}>
                      <NavigationMenuLink
                        href={item.path}
                        data-active={pathname === item.path}
                        className="flex items-center justify-start gap-2 font-medium rounded-md h-7"
                      >
                        {IconComponent && (
                          <IconComponent className="size-4 shrink-0" />
                        )}
                        <span>{formatToTitleCase(item.label || "")}</span>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          )}
          {navItems.length > 1 && (
            <Separator
              orientation="vertical"
              className="ml-1 data-[orientation=vertical]:h-6"
            />
          )}
          {actionItems && (
            <div className="flex items-center gap-2">
              {actionItems}
              <Separator
                orientation="vertical"
                className="ml-1 data-[orientation=vertical]:h-6"
              />
            </div>
          )}
          {user && (
            <div className="flex items-center ml-2">
              <NavUser user={user} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
