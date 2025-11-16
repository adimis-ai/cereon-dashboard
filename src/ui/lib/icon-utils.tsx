import * as React from "react";
import * as LucideIcons from "lucide-react";
import * as TablerIcons from "@tabler/icons-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";

// Add all FA icons to the library
library.add(fas, far, fab);

// Function to check if a string is a URL
const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

export interface IconRenderOptions {
  className?: string;
  size?: number;
}

export const renderIcon = (
  icon: React.FC<any> | string,
  options: IconRenderOptions = {}
) => {
  if (!icon) return null;

  // If icon is already a React component
  if (typeof icon !== "string") {
    return React.createElement(icon, { className: options.className });
  }

  // Handle URL
  if (isValidUrl(icon)) {
    return (
      <Avatar className={options.className}>
        <AvatarImage src={icon} alt="Icon" />
        <AvatarFallback>IC</AvatarFallback>
      </Avatar>
    );
  }

  // Check Lucide Icons
  const LucideIcon = (LucideIcons as any)[icon];
  if (LucideIcon) {
    return <LucideIcon className={options.className} />;
  }

  // Check Tabler Icons (handle both formats: 'file' and 'IconFile')
  let tablerIconName = icon;
  if (!icon.startsWith('Icon') && !icon.startsWith('TablerIcon')) {
    // Convert 'file' to 'IconFile'
    tablerIconName = 'Icon' + icon.charAt(0).toUpperCase() + icon.slice(1);
  }
  const TablerIcon = (TablerIcons as any)[tablerIconName];
  if (TablerIcon) {
    return <TablerIcon className={options.className} />;
  }

  // Handle Font Awesome icons
  if (typeof icon === "string") {
    if (icon.startsWith("fa-") || icon.startsWith("fas-") || icon.startsWith("far-") || icon.startsWith("fab-")) {
      if (icon.startsWith("fa-")) {
        // Handle format: 'fa-solid fa-user'
        const parts = icon.split(" ");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const style = parts[0].replace("fa-", "") as "solid" | "regular" | "brands";
          const name = parts[1].replace("fa-", "");
          const prefix = style === "solid" ? "fas" : style === "regular" ? "far" : "fab";
          return (
            <FontAwesomeIcon
              icon={[prefix, name] as IconProp}
              className={options.className}
            />
          );
        }
      } else {
        // Handle format: 'fas-user', 'far-user', 'fab-user'
        const [prefix, name] = icon.split("-");
        if (prefix && name && ["fas", "far", "fab"].includes(prefix)) {
          return (
            <FontAwesomeIcon
              icon={[prefix, name] as IconProp}
              className={options.className}
            />
          );
        }
      }
    }
  }

  // If no matching icon found, return first letter in an Avatar
  return (
    <Avatar className={options.className}>
      <AvatarFallback>{icon.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
