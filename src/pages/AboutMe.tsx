import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { 
  GitBranch, 
  Users, 
  BookOpen, 
  Star, 
  Calendar,
  ExternalLink,
  MessageSquare,
  MapPin,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import defaultAvatar from '@/assets/default-avatar.jpg';

interface GitHubStats {
  avatar_url: string;
  name: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
  created_at: string;
}

export default function AboutMe() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.github_url) {
      fetchGitHubData();
    }
  }, [profile]);

  const fetchGitHubData = async () => {
    if (!profile?.github_url) return;

    setGithubLoading(true);
    setGithubError(null);

    try {
      // Extract username from GitHub URL
      const urlParts = profile.github_url.split('/');
      const username = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];

      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (!response.ok) {
        throw new Error('GitHub profili bulunamadı');
      }

      const data = await response.json();
      setGithubStats(data);
    } catch (error) {
      setGithubError(error instanceof Error ? error.message : 'GitHub verisi alınamadı');
    } finally {
      setGithubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = githubStats ? [
    { label: 'Public Repos', value: githubStats.public_repos, icon: BookOpen },
    { label: 'Takipçi', value: githubStats.followers, icon: Users },
    { label: 'Takip Edilen', value: githubStats.following, icon: Star },
  ] : [];

  return (
    <AppLayout title="About Me">
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Card */}
        <div className="glass rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-primary/20 ring-offset-4 ring-offset-background glow-mint">
              <img
                src={githubStats?.avatar_url || profile?.avatar_url || defaultAvatar}
                alt={profile?.full_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold mb-2">{profile?.full_name}</h1>
              <p className="text-muted-foreground mb-4">{profile?.email}</p>
              
              {githubStats?.bio && (
                <p className="text-sm text-foreground/80 mb-4 max-w-md">
                  {githubStats.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {githubStats?.location && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    {githubStats.location}
                  </span>
                )}
                {githubStats?.company && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 size={14} />
                    {githubStats.company}
                  </span>
                )}
                {profile?.birth_date && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    {new Date(profile.birth_date).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Stats */}
        {profile?.github_url ? (
          <>
            {githubLoading ? (
              <div className="glass rounded-2xl p-8 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : githubError ? (
              <div className="glass rounded-2xl p-8 text-center">
                <GitBranch size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">{githubError}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchGitHubData}
                >
                  Tekrar Dene
                </Button>
              </div>
            ) : githubStats ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="stat-card animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Icon size={24} />
                          </div>
                          <div>
                            <p className="text-3xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* GitHub Link */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-secondary">
                        <GitBranch size={24} />
                      </div>
                      <div>
                        <p className="font-medium">GitHub Profili</p>
                        <p className="text-sm text-muted-foreground">
                          Timonto Technology organizasyonu üyesi
                        </p>
                      </div>
                    </div>
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <span className="text-sm font-medium">Görüntüle</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <GitBranch size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">GitHub Bağlı Değil</p>
            <p className="text-muted-foreground text-sm mb-4">
              GitHub profilinizi bağlayarak istatistiklerinizi görüntüleyebilirsiniz
            </p>
          </div>
        )}

        {/* Quick Action */}
        <div className="flex justify-center">
          <Link to="/forum">
            <Button className="bg-gradient-mint text-primary-foreground hover:opacity-90 px-8">
              <MessageSquare size={18} className="mr-2" />
              Foruma Git
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
