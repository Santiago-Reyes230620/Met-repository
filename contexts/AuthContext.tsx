"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; requiresEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);

      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const mapAuthErrorMessage = (error: unknown, action: 'signIn' | 'signUp') => {
    const rawMessage = error instanceof Error ? error.message : 'Authentication failed';
    const normalized = rawMessage.toLowerCase();

    if (normalized.includes('invalid login credentials')) {
      return 'Invalid email or password. Please verify your credentials and try again.';
    }

    if (normalized.includes('email not confirmed')) {
      return 'Please confirm your email address before signing in.';
    }

    if (normalized.includes('user already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }

    if (normalized.includes('failed to fetch') || normalized.includes('networkerror')) {
      return 'Network error connecting to Supabase. Please verify your internet connection and Supabase settings.';
    }

    if (normalized.includes('invalid api key') || normalized.includes('jwt') || normalized.includes('apikey')) {
      return 'Supabase configuration is invalid. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
    }

    if (action === 'signUp') {
      return 'Failed to create account. Please try again.';
    }

    return 'Failed to sign in. Please try again.';
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (!data) {
      // Profile doesn't exist, try to create it
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'Student',
            level: 'beginner',
            total_points: 0,
            grammar_score: 0,
            vocabulary_score: 0,
            reading_score: 0,
            streak_days: 0,
          });

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          setProfile(newProfile);
        }
      }
    } else {
      setProfile(data);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Note: The profile will be created automatically via a trigger or manually after first login
      // For now, we'll attempt to create it, but it might fail due to RLS
      // This is handled in the auth state change listener

      return {
        error: null,
        requiresEmailConfirmation: !data.session,
      };
    } catch (error) {
      return { error: new Error(mapAuthErrorMessage(error, 'signUp')) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Keep auth in loading mode until Supabase emits the auth state change.
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (error) throw error;

      // Fallback: if auth state event is delayed/missed, sync session state directly.
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession ?? null);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }

      setLoading(false);

      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: new Error(mapAuthErrorMessage(error, 'signIn')) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
