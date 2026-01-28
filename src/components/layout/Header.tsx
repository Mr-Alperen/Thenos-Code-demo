import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import defaultAvatar from '@/assets/default-avatar.jpg';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <img
                src={profile?.avatar_url || defaultAvatar}
                alt={profile?.full_name || 'Kullanıcı'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium">{profile?.full_name || 'Kullanıcı'}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-strong">
          <DropdownMenuItem onClick={() => navigate('/about-me')} className="cursor-pointer">
            <User size={16} className="mr-2" />
            Profilim
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings size={16} className="mr-2" />
            Ayarlar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
            <LogOut size={16} className="mr-2" />
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
