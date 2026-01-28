import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hash, Code, Megaphone, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import thenosLogo from '@/assets/thenos-logo.jpg';

const channels = [
  { id: 'genel', name: 'genel', icon: Hash, description: 'Genel sohbet' },
  { id: 'gelistirme', name: 'geliştirme', icon: Code, description: 'Kod tartışmaları' },
  { id: 'duyurular', name: 'duyurular', icon: Megaphone, description: 'Duyurular' },
];

const navItems = [
  { path: '/dashboard', label: 'Hashboard', icon: LayoutDashboard },
  { path: '/forum', label: 'Forum', icon: MessageSquare },
  { path: '/about-me', label: 'About Me', icon: User },
];

interface SidebarProps {
  activeChannel?: string;
  onChannelSelect?: (channelId: string) => void;
}

export default function Sidebar({ activeChannel, onChannelSelect }: SidebarProps) {
  const location = useLocation();

  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'code': return Code;
      case 'megaphone': return Megaphone;
      default: return Hash;
    }
  };

  return (
    <aside className="w-64 h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden glow-mint-sm">
            <img src={thenosLogo} alt="Thenos" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gradient-mint">Thenos</h1>
            <p className="text-xs text-muted-foreground">Timonto Technology</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`channel-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Forum Channels */}
        {location.pathname === '/forum' && (
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kanallar
            </h3>
            <div className="space-y-1">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const isActive = activeChannel === channel.id;
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => onChannelSelect?.(channel.id)}
                    className={`channel-item w-full text-left ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{channel.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 Timonto Technology
        </p>
      </div>
    </aside>
  );
}
