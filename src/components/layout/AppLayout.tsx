import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  activeChannel?: string;
  onChannelSelect?: (channelId: string) => void;
}

export default function AppLayout({ children, title, activeChannel, onChannelSelect }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeChannel={activeChannel} onChannelSelect={onChannelSelect} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
