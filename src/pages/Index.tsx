import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import thenosLogo from '@/assets/thenos-logo.jpg';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-3xl overflow-hidden mb-6 glow-mint animate-pulse-mint">
            <img src={thenosLogo} alt="Thenos" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-gradient-mint">Thenos</span>
          </h1>
          <p className="text-lg text-muted-foreground">by Timonto Technology</p>
        </div>

        {/* Description */}
        <p className="text-xl text-foreground/80 max-w-md mx-auto mb-8">
          Ekip iletişimi, kod paylaşımı ve GitHub entegrasyonu için modern platform
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => navigate('/auth')}
          className="bg-gradient-mint text-primary-foreground hover:opacity-90 px-8 py-6 text-lg font-semibold group"
        >
          Başla
          <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { title: 'Forum', desc: 'Gerçek zamanlı ekip sohbeti' },
            { title: 'GitHub', desc: 'Profil entegrasyonu' },
            { title: 'Kod', desc: 'Syntax highlight desteği' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-xl p-4 hover:border-primary/30 transition-all"
            >
              <h3 className="font-semibold text-primary mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
