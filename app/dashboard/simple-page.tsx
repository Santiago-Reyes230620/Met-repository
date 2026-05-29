"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SimpleDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>
    </div>
  );
}
