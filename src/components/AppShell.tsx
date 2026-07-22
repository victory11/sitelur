"use client";
import { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import { ToastProvider } from "./Toast";
import { UserProvider } from "./UserContext";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <ToastProvider>
        <div className="min-h-screen">
          <Sidebar />
          <main className="lg:ml-64 min-h-screen transition-all duration-300">
            <div className="p-4 lg:p-6 pt-16 lg:pt-6">
              {children}
            </div>
          </main>
        </div>
      </ToastProvider>
    </UserProvider>
  );
}