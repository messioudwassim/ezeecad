import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: 'client' | 'designer') => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
      return;
    }

    // Filet de securite : le trigger cote base a peut-etre echoue.
    // On est ici forcement dans une session authentifiee (fetchProfile
    // n'est appele qu'apres un signIn/signUp/onAuthStateChange reussi),
    // donc auth.uid() = uid et la policy "profiles_insert_own" autorise
    // cette creation cote client.
    const { data: userData } = await supabase.auth.getUser();
    const meta = (userData.user?.user_metadata ?? {}) as { full_name?: string; role?: 'client' | 'designer' };
    const { data: created, error: createErr } = await supabase
      .from('profiles')
      .insert({
        id: uid,
        full_name: meta.full_name ?? '',
        role: meta.role ?? 'client',
      })
      .select()
      .maybeSingle();

    if (!createErr && created) setProfile(created as Profile);
    else setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        (async () => {
          await fetchProfile(newSession.user.id);
        })();
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'client' | 'designer'
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });
    if (error) return { error: error.message, needsEmailConfirmation: false };

    // Si la confirmation email est desactivee sur le projet, une session
    // est deja active ici : le trigger cote base a deja cree le profil,
    // on le recupere juste pour peupler le contexte tout de suite.
    if (data.session && data.user) {
      await fetchProfile(data.user.id);
      return { error: null, needsEmailConfirmation: false };
    }
    return { error: null, needsEmailConfirmation: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}