import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RESQ-AI | Disaster Response Intelligence',
  description: 'Real-time disaster response command center with AI-powered analytics',
  keywords: ['disaster response', 'emergency management', 'AI', 'real-time', 'command center'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-resq-bg text-slate-100 font-[Inter] antialiased">
        {children}
      </body>
    </html>
  );
}