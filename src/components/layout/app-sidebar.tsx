"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
    </div>
  );
}
