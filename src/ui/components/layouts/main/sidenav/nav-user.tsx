import { IconLogout } from "@tabler/icons-react";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../../../avatar";
import { DynamicDropdownMenu } from "../../../dropdown-menu";
import type { MenuItem } from "../../../dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../sidebar";
import { Badge } from "../../../badge";
import { cn } from "../../../../lib/utils";
import { renderIcon } from "../../../../lib/icon-utils";

export interface NavUserMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void | Promise<void>;
  variant?: "default" | "destructive";
  children?: NavUserMenuItem[];
}

export interface NavUserProps {
  email: string;
  avatar?: string;
  lastName?: string;
  firstName?: string;
  role?: string;
  menuItems?: NavUserMenuItem[];
  onLogout?: () => void | Promise<void>;
  theme?: "light" | "dark" | "system";
  setTheme?: (theme: "light" | "dark" | "system") => void;
}

export function NavUser({ user }: { user: NavUserProps }) {
  const { theme = "system", setTheme = () => {} } = user;
  // Construct display name
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName
        ? `${user.firstName}`
        : "Unknown User";

  // Get initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      if (user.onLogout) {
        await user.onLogout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userAvatar = (
    <SidebarMenuButton variant={"icon"}>
      <Avatar className="h-8 w-8 border-2 border-sidebar-accent">
        <AvatarImage
          src={user.avatar}
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="font-bold">{initials}</AvatarFallback>
      </Avatar>
    </SidebarMenuButton>
  );

  // Transform user menu items to DynamicDropdownMenu format
  const transformUserMenuItem = (item: NavUserMenuItem): MenuItem => {
    const menuItem: MenuItem = {
      label: item.label,
      icon:
        typeof item.icon === "string"
          ? renderIcon(item.icon, {
              className: "size-4 mr-1",
            })
          : item.icon,
      onClick: item.onClick,
      disabled: false,
    };

    if (item.children) {
      return {
        ...menuItem,
        items: item.children.map(transformUserMenuItem),
      };
    }

    return menuItem;
  };

  // Create menu items array including user info, theme toggle, and logout
  const menuItems: MenuItem[] = [
    {
      label: "",
      icon: (
        <div className="flex justify-start items-center gap-3 p-2 w-full">
          <Avatar
            className={cn(
              user.role && user.role !== "user" ? "h-14 w-14" : "h-10 w-10"
            )}
          >
            <AvatarImage
              src={user.avatar}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback
              className={cn(user.role && user.role !== "user" && "text-lg")}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.role && user.role !== "user" && (
              <Badge variant="outline" className="ml-auto">
                {user.role}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    // Separator after user info
    { label: "", renderSeparator: true },
    // User menu items if they exist
    ...(user.menuItems?.map(transformUserMenuItem) || []),
    // Theme submenu
    {
      label: "Theme",
      icon:
        theme === "light" ? (
          <SunIcon className="size-4 mr-1" />
        ) : theme === "dark" ? (
          <MoonIcon className="size-4 mr-1" />
        ) : (
          <LaptopIcon className="size-4 mr-1" />
        ),
      items: [
        {
          label: "Dark",
          icon: <MoonIcon />,
          onClick: () => setTheme("dark"),
        },
        {
          label: "Light",
          icon: <SunIcon />,
          onClick: () => setTheme("light"),
        },
        {
          label: "System",
          icon: <LaptopIcon />,
          onClick: () => setTheme("system"),
        },
      ],
    },
    // Separator before logout
    { label: "", renderSeparator: true },
    // Logout option
    {
      label: "Log out",
      icon: <IconLogout className="mr-2" />,
      onClick: handleLogout,
    },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DynamicDropdownMenu
          trigger={userAvatar}
          items={menuItems}
          position={{ side: "bottom", align: "end" }}
          className="w-64 rounded-lg"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
