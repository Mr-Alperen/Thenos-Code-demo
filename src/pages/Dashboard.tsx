import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { MessageSquare, GitBranch, Users, Activity, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecentActivity {
  id: string;
  type: 'message' | 'file' | 'github';
  content: string;
  time: string;
  channel?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    // Fetch message count
    const { count } = await supabase
      .from('forum_messages')
      .select('*', { count: 'exact', head: true });
    
    setMessageCount(count || 0);

    // Fetch recent messages
    const { data: messages } = await supabase
      .from('forum_messages')
      .select('id, content, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (messages) {
      setRecentMessages(
        messages.map((msg) => ({
          id: msg.id,
          type: 'message' as const,
          content: msg.content.slice(0, 50) + (msg.content.length > 50 ? '...' : ''),
          time: new Date(msg.created_at).toLocaleString('tr-TR'),
        }))
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Toplam Mesaj',
      value: messageCount,
      icon: MessageSquare,
      color: 'text-primary',
    },
    {
      label: 'Aktif Kanallar',
      value: 3,
      icon: Users,
      color: 'text-thenos-info',
    },
    {
      label: 'GitHub Commits',
      value: '—',
      icon: GitBranch,
      color: 'text-thenos-success',
    },
    {
      label: 'Aktivite',
      value: 'Aktif',
      icon: Activity,
      color: 'text-thenos-warning',
    },
  ];

  return (
    <AppLayout title="Hashboard">
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="glass rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">
              Hoş geldin, <span className="text-gradient-mint">{profile?.full_name || 'Kullanıcı'}</span>!
            </h1>
            <p className="text-muted-foreground">
              Timonto Technology ekibinin aktivite merkezi
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="stat-card animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-secondary/50 ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Hızlı Erişim</h3>
            <div className="space-y-3">
              <Link
                to="/forum"
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Foruma Git</p>
                    <p className="text-sm text-muted-foreground">Ekiple sohbet et</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                to="/about-me"
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-thenos-success/10 text-thenos-success">
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <p className="font-medium">GitHub Profilim</p>
                    <p className="text-sm text-muted-foreground">İstatistiklerini gör</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-muted-foreground group-hover:text-thenos-success transition-colors" />
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.content}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                <p>Henüz aktivite yok</p>
                <p className="text-sm">Foruma gidip ilk mesajını yaz!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
