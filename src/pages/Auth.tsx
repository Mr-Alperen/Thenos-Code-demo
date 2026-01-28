import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import thenosLogo from '@/assets/thenos-logo.jpg';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalı').max(100),
  birthDate: z.string().min(1, 'Doğum tarihi gereklidir'),
  gender: z.string().min(1, 'Cinsiyet seçiniz'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().length(16, 'Şifre tam olarak 16 karakter olmalıdır'),
  emergencyPassword: z.string().min(8, 'Acil durum şifresi en az 8 karakter olmalı'),
  githubUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
});

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emergencyPassword, setEmergencyPassword] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Doğrulama Hatası',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        title: 'Giriş Hatası',
        description: error.message === 'Invalid login credentials' 
          ? 'E-posta veya şifre hatalı' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      signupSchema.parse({
        fullName,
        birthDate,
        gender,
        email,
        password,
        emergencyPassword,
        githubUrl,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Doğrulama Hatası',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (signUpError) {
      toast({
        title: 'Kayıt Hatası',
        description: signUpError.message === 'User already registered'
          ? 'Bu e-posta adresi zaten kayıtlı'
          : signUpError.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        full_name: fullName,
        birth_date: birthDate,
        gender,
        email,
        emergency_password: emergencyPassword, // In production, hash this
        github_url: githubUrl || null,
        avatar_url: null,
      });

      if (profileError) {
        toast({
          title: 'Profil Oluşturma Hatası',
          description: profileError.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Hesap Oluşturuldu!',
          description: 'Thenos\'a hoş geldiniz!',
        });
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!fullName || !birthDate || !gender) {
        toast({
          title: 'Eksik Bilgi',
          description: 'Lütfen tüm alanları doldurun',
          variant: 'destructive',
        });
        return;
      }
    }
    if (step === 2) {
      if (!email || password.length !== 16) {
        toast({
          title: 'Eksik Bilgi',
          description: 'E-posta ve 16 haneli şifre gereklidir',
          variant: 'destructive',
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 glow-mint">
            <img src={thenosLogo} alt="Thenos" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-mint">Thenos</h1>
          <p className="text-muted-foreground text-sm mt-1">Timonto Technology</p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-2xl p-8 shadow-dark">
          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">E-posta</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="ornek@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-focus bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Şifre</Label>
                <div className="relative">
                  <Input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-focus bg-secondary/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-mint text-primary-foreground hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Hesap Oluştur
                </button>
              </p>
            </form>
          ) : (
            /* Signup Form - Multi-step */
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      s < step
                        ? 'bg-primary text-primary-foreground'
                        : s === step
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {s < step ? <Check size={16} /> : s}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input
                      id="fullName"
                      placeholder="Adınız Soyadınız"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-focus bg-secondary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Doğum Tarihi</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="input-focus bg-secondary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cinsiyet</Label>
                    <div className="flex gap-4">
                      {['Erkek', 'Kadın', 'Diğer'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                            gender === g
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-focus bg-secondary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Şifre <span className="text-muted-foreground text-xs">(16 karakter)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="16 haneli şifreniz"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={16}
                        className="input-focus bg-secondary/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {password.length}/16 karakter
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPassword">Acil Durum Şifresi</Label>
                    <Input
                      id="emergencyPassword"
                      type="password"
                      placeholder="İkincil güvenlik şifresi"
                      value={emergencyPassword}
                      onChange={(e) => setEmergencyPassword(e.target.value)}
                      className="input-focus bg-secondary/50"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">
                      GitHub Profil Linki <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                    </Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      placeholder="https://github.com/kullaniciadiniz"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="input-focus bg-secondary/50"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h4 className="font-medium text-sm mb-2">Özet</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="text-foreground">Ad:</span> {fullName}</p>
                      <p><span className="text-foreground">E-posta:</span> {email}</p>
                      <p><span className="text-foreground">Cinsiyet:</span> {gender}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Geri
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-gradient-mint text-primary-foreground hover:opacity-90"
                  >
                    İleri
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-mint text-primary-foreground hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
                  </Button>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setStep(1);
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Giriş Yap
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
