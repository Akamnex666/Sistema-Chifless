"use client";

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ChatbotFloating } from '@/components/chat/ChatbotFloating';
import AuthGate from '@/components/AuthGate';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthGate />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <ChatbotFloating />
    </>
  );
}
