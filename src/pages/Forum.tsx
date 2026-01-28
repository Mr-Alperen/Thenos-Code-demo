import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Send, Paperclip, Code, Hash, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import defaultAvatar from '@/assets/default-avatar.jpg';

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  code_snippet: string | null;
  code_language: string | null;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

export default function Forum() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchChannels();
    }
  }, [user]);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChannels = async () => {
    const { data } = await supabase
      .from('forum_channels')
      .select('*')
      .order('created_at');

    if (data && data.length > 0) {
      setChannels(data);
      setActiveChannel(data[0].id);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('forum_messages')
      .select(`
        *,
        profile:profiles!forum_messages_user_id_fkey(full_name, avatar_url)
      `)
      .eq('channel_id', activeChannel)
      .order('created_at');

    if (data) {
      setMessages(data.map(msg => ({
        ...msg,
        profile: Array.isArray(msg.profile) ? msg.profile[0] : msg.profile
      })));
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${activeChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_messages',
          filter: `channel_id=eq.${activeChannel}`,
        },
        async (payload) => {
          // Fetch the new message with profile
          const { data } = await supabase
            .from('forum_messages')
            .select(`
              *,
              profile:profiles!forum_messages_user_id_fkey(full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const newMsg = {
              ...data,
              profile: Array.isArray(data.profile) ? data.profile[0] : data.profile
            };
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !codeSnippet.trim()) return;

    const { error } = await supabase.from('forum_messages').insert({
      channel_id: activeChannel,
      user_id: user!.id,
      content: newMessage,
      code_snippet: codeSnippet || null,
      code_language: codeSnippet ? codeLanguage : null,
    });

    if (!error) {
      setNewMessage('');
      setCodeSnippet('');
      setShowCodeInput(false);
    }
  };

  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'code': return Code;
      case 'megaphone': return Megaphone;
      default: return Hash;
    }
  };

  const currentChannel = channels.find((c) => c.id === activeChannel);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout
      title={currentChannel ? `# ${currentChannel.name}` : 'Forum'}
      activeChannel={activeChannel}
      onChannelSelect={setActiveChannel}
    >
      <div className="flex flex-col h-full">
        {/* Channel Header */}
        {currentChannel && (
          <div className="px-6 py-3 border-b border-border bg-card/30">
            <div className="flex items-center gap-2 text-muted-foreground">
              {(() => {
                const Icon = getChannelIcon(currentChannel.icon);
                return <Icon size={18} />;
              })()}
              <span className="font-medium text-foreground">{currentChannel.name}</span>
              {currentChannel.description && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-sm">{currentChannel.description}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Hash size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Bu kanalda henüz mesaj yok</p>
              <p className="text-sm">İlk mesajı sen yaz!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3 animate-fade-in group">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={message.profile?.avatar_url || defaultAvatar}
                    alt={message.profile?.full_name || 'Kullanıcı'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {message.profile?.full_name || 'Kullanıcı'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  
                  {message.code_snippet && (
                    <div className="mt-2 code-block">
                      <div className="text-xs text-muted-foreground mb-2">
                        {message.code_language}
                      </div>
                      <pre className="whitespace-pre-wrap">{message.code_snippet}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card/30">
          <form onSubmit={handleSendMessage} className="space-y-3">
            {showCodeInput && (
              <div className="space-y-2 animate-slide-up">
                <div className="flex items-center gap-2">
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-sm border border-border"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="sql">SQL</option>
                    <option value="bash">Bash</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    İptal
                  </button>
                </div>
                <Textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Kod snippet'inizi buraya yapıştırın..."
                  className="font-mono text-sm bg-secondary/50 min-h-[100px]"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-2 border border-border focus-within:border-primary/50 transition-colors">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`#${currentChannel?.name || 'kanal'} kanalına mesaj yaz...`}
                  className="border-0 bg-transparent focus-visible:ring-0 p-0"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className={`p-2 rounded-lg transition-colors ${
                      showCodeInput
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Code size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Paperclip size={18} />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                size="icon"
                className="bg-gradient-mint text-primary-foreground hover:opacity-90 h-11 w-11 rounded-xl"
                disabled={!newMessage.trim() && !codeSnippet.trim()}
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
