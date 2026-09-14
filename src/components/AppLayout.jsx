import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-paper-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="px-8 py-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
