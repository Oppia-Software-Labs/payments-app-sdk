"use client";

import { Home, Archive, User } from "lucide-react";
import Dock from "./Dock";

const dockItems = [
  { icon: <Home size={22} />, label: "Home", href: "/" },
  { icon: <Archive size={22} />, label: "Archive", href: "/archive" },
  { icon: <User size={22} />, label: "Profile", href: "/profile" },
];

export default function AppDock() {
  return (
    <Dock
      items={dockItems}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
    />
  );
}
