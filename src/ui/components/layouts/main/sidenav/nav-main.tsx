import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "../../../sidebar";
import { cn } from "../../../../lib/utils";
import { renderIcon } from "../../../../lib/icon-utils";
import { DynamicDropdownMenu } from "../../../dropdown-menu";

export interface NavMainItem extends Record<string, any> {
  id: string;
  path?: string;
  isSeparator?: boolean;
  component?: React.FC<any>;
  icon?: React.FC<any> | string;
  label?: string;
  tooltip?: string;
  children?: NavMainItem[];
  hidden?: boolean;
  renderInHeaderDropdown?: boolean;
  renderInNavMenu?: boolean;
  hideAppSidebar?: boolean;
  allowedRoles?: string[];
  navigateTo?: string;
  navLabel?: string;
}

interface NavMainProps {
  items: NavMainItem[];
  createText?: string;
  className?: string;
  pathname?: string;
  currentUserRole?: string;
}

const isPathMatch = (currentPath: string, itemPath: string): boolean => {
  if (!currentPath || !itemPath) return false;

  // Split paths into segments
  const currentSegments = currentPath.split("/").filter(Boolean);
  const itemSegments = itemPath.split("/").filter(Boolean);

  // If item path has more segments than current path, it can't be a match
  if (itemSegments.length > currentSegments.length) return false;

  // Compare each segment
  return itemSegments.every((segment, index) => {
    // Handle wildcard segments (starting with :)
    if (segment.startsWith(":")) return true;
    return segment === currentSegments[index];
  });
};

interface RenderMenuItemProps {
  item: NavMainItem;
  parentPath?: string;
  depth?: number;
  parentOpen?: boolean;
  pathname?: string;
  currentUserRole?: string;
  state: string;
  openDropdowns: Record<string, boolean>;
  setOpenDropdowns: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  openItem: string | null;
  setOpenItem: React.Dispatch<React.SetStateAction<string | null>>;
  toggleDropdown: (id: string, e: React.MouseEvent) => void;
  renderNestedDropdownItems: (
    items: NavMainItem[],
    parentPath?: string
  ) => React.ReactNode;
}

interface MenuContentProps extends RenderMenuItemProps {
  fullPath: string;
  isExactlyActive: boolean;
  isInActiveTrail: boolean;
  isActive: boolean;
  hasChildren: boolean;
  isOpen: boolean;
}

const MenuContent: React.FC<MenuContentProps> = ({
  item,
  fullPath,
  depth,
  state,
  openItem,
  setOpenItem,
  toggleDropdown,
  renderNestedDropdownItems,
  isExactlyActive,
  isInActiveTrail,
  isActive,
  hasChildren,
  isOpen,
  pathname,
  openDropdowns,
  setOpenDropdowns,
}) => {
  const linkContent = (
    <>
      {item.icon &&
        renderIcon(item.icon, {
          className: "size-4 text-muted-foreground",
        })}
      <span className="flex-1 truncate">{item.label}</span>
      {hasChildren && (
        <ChevronRight
          className={cn(
            "ml-auto size-4 shrink-0 opacity-50 transition-transform duration-200",
            isOpen && "rotate-90 transform"
          )}
        />
      )}
    </>
  );

  const itemStyles = cn(
    "group relative flex w-full items-center gap-2 transition-all duration-200 ease-in-out",
    "before:absolute before:-left-[1px] before:top-0 before:h-full before:w-[2px] before:rounded-full before:bg-sidebar-accent before:opacity-0 before:transition-opacity",
    isActive && "before:opacity-100",
    isExactlyActive && "bg-accent text-accent-foreground font-medium",
    isInActiveTrail &&
      !isExactlyActive &&
      "bg-accent/20 text-accent-foreground",
    hasChildren && "pr-2",
    (depth || 0) > 0 && "text-[13px]"
  );

  return (
    <SidebarMenuItem className="relative">
      {state === "collapsed" && hasChildren ? (
        <DynamicDropdownMenu
          trigger={
            <SidebarMenuButton asChild tooltip={item.tooltip}>
              {fullPath ? (
                <a
                  href={
                    fullPath === pathname
                      ? item.navigateTo || fullPath
                      : fullPath
                  }
                  className={itemStyles}
                >
                  {item.icon &&
                    renderIcon(item.icon, {
                      className: "size-5 text-muted-foreground",
                    })}
                </a>
              ) : (
                <div className={cn(itemStyles, "cursor-pointer")}>
                  {item.icon &&
                    renderIcon(item.icon, {
                      className: "size-5 text-muted-foreground",
                    })}
                </div>
              )}
            </SidebarMenuButton>
          }
          items={item.children?.map((child) => ({
            label: child.label || "",
            icon: child.icon
              ? renderIcon(child.icon, {
                  className: "size-4 text-muted-foreground",
                })
              : undefined,
            onClick: () => {
              if (child.path) {
                if (child.path === pathname && child.navigateTo) {
                  window.location.href = child.navigateTo;
                } else {
                  window.location.href = child.path;
                }
              }
            },
            ...(child.children && {
              items: child.children.map((subChild) => ({
                label: subChild.label || "",
                icon: subChild.icon
                  ? renderIcon(subChild.icon, {
                      className: "size-4 text-muted-foreground",
                    })
                  : undefined,
                onClick: () => {
                  if (subChild.path) {
                    if (subChild.path === pathname && subChild.navigateTo) {
                      window.location.href = subChild.navigateTo;
                    } else {
                      window.location.href = subChild.path;
                    }
                  }
                },
              })),
            }),
          })) || []}
          position={{ side: "right", align: "start" }}
          className="min-w-48 rounded-lg"
        />
      ) : (
        <SidebarMenuButton asChild tooltip={item.tooltip}>
          {fullPath ? (
            <a
              href={
                fullPath === pathname ? item.navigateTo || fullPath : fullPath
              }
              onClick={(e) => {
                if (hasChildren) {
                  toggleDropdown(item.id, e);
                }
              }}
              className={itemStyles}
              style={{
                paddingLeft: (depth || 0) > 0 ? `${((depth || 0) + 1) * 12}px` : undefined,
              }}
            >
              {linkContent}
            </a>
          ) : (
            <div
              onClick={(e) => {
                if (hasChildren) {
                  toggleDropdown(item.id, e);
                }
              }}
              className={cn(itemStyles, "cursor-pointer")}
              style={{
                paddingLeft: (depth || 0) > 0 ? `${((depth || 0) + 1) * 12}px` : undefined,
              }}
            >
              {linkContent}
            </div>
          )}
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
};

const RenderMenuItem: React.FC<RenderMenuItemProps> = ({
  item,
  parentPath = "",
  depth = 0,
  parentOpen = true,
  pathname = "",
  currentUserRole,
  state,
  openDropdowns,
  setOpenDropdowns,
  openItem,
  setOpenItem,
  toggleDropdown,
  renderNestedDropdownItems,
}) => {
  // Early return conditions
  if (item.renderInHeaderDropdown || item.hidden) {
    return null;
  }

  if (
    item.allowedRoles &&
    currentUserRole &&
    !item.allowedRoles.includes(currentUserRole)
  ) {
    return null;
  }

  if (item.isSeparator) {
    return <SidebarSeparator />;
  }

  if (depth > 0 && !parentOpen) {
    return null;
  }

  // Build path
  const fullPath = item.path
    ? parentPath
      ? `${parentPath}${parentPath.endsWith("/") ? "" : "/"}${item.path}`
      : item.path
    : parentPath;

  // State calculations
  const isExactlyActive = pathname === fullPath;
  const isInActiveTrail = Boolean(fullPath && isPathMatch(pathname, fullPath));
  const isActive = isExactlyActive || isInActiveTrail;
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const isOpen = openDropdowns[item.id] || false;
  const hasActiveChild = item.children?.some((child) => {
    const childPath = child.path
      ? fullPath
        ? `${fullPath}${fullPath.endsWith("/") ? "" : "/"}${child.path}`
        : child.path
      : fullPath;
    return childPath && isPathMatch(pathname, childPath);
  });

  // Effect for auto-opening parent if child is active
  React.useEffect(() => {
    if (hasActiveChild && item.id && state !== "collapsed") {
      setOpenDropdowns((prev) => ({
        ...prev,
        [item.id]: true,
      }));
    }
  }, [pathname, item.id, hasActiveChild, state, setOpenDropdowns]);

  return (
    <div>
      <MenuContent
        {...{
          item,
          parentPath,
          depth,
          parentOpen,
          pathname,
          currentUserRole,
          state,
          openDropdowns,
          setOpenDropdowns,
          openItem,
          setOpenItem,
          toggleDropdown,
          renderNestedDropdownItems,
          fullPath,
          isExactlyActive,
          isInActiveTrail,
          isActive,
          hasChildren,
          isOpen,
        }}
      />
      {hasChildren && state !== "collapsed" && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {item.children?.map((child) => (
            <RenderMenuItem
              key={child.id}
              item={child}
              parentPath={fullPath}
              depth={(depth || 0) + 1}
              parentOpen={isOpen}
              pathname={pathname}
              currentUserRole={currentUserRole}
              state={state}
              openDropdowns={openDropdowns}
              setOpenDropdowns={setOpenDropdowns}
              openItem={openItem}
              setOpenItem={setOpenItem}
              toggleDropdown={toggleDropdown}
              renderNestedDropdownItems={renderNestedDropdownItems}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function NavMain({
  items,
  className,
  pathname,
  currentUserRole,
}: NavMainProps) {
  const { state } = useSidebar();
  const [openDropdowns, setOpenDropdowns] = React.useState<
    Record<string, boolean>
  >({});
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === "collapsed") {
      setOpenItem(openItem === id ? null : id);
    } else {
      setOpenDropdowns((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const renderNestedDropdownItems = (
    items: NavMainItem[],
    parentPath: string = ""
  ) => {
    return items.map((item) => {
      if (item.renderInHeaderDropdown || item.hidden) return null;
      if (
        item.allowedRoles &&
        currentUserRole &&
        !item.allowedRoles.includes(currentUserRole)
      )
        return null;
      return (
        <RenderMenuItem
          key={item.id}
          item={item}
          parentPath={parentPath}
          depth={1}
          parentOpen={true}
          pathname={pathname}
          currentUserRole={currentUserRole}
          state={state}
          openDropdowns={openDropdowns}
          setOpenDropdowns={setOpenDropdowns}
          openItem={openItem}
          setOpenItem={setOpenItem}
          toggleDropdown={toggleDropdown}
          renderNestedDropdownItems={renderNestedDropdownItems}
        />
      );
    });
  };

  return (
    <SidebarGroup className={cn("NavMain", className)}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <RenderMenuItem
              key={item.id}
              item={item}
              parentPath=""
              depth={0}
              parentOpen={true}
              pathname={pathname}
              currentUserRole={currentUserRole}
              state={state}
              openDropdowns={openDropdowns}
              setOpenDropdowns={setOpenDropdowns}
              openItem={openItem}
              setOpenItem={setOpenItem}
              toggleDropdown={toggleDropdown}
              renderNestedDropdownItems={renderNestedDropdownItems}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
