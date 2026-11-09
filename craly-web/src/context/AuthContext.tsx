'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { cralyApi, getAuthToken, setAuthToken } from '@/services/api';
import {
  auth,
  getFirebaseIdTokenFromCredentials,
  getFirebaseIdTokenFromGoogle,
  createFirebaseUser,
  resetFirebasePassword,
  signOutFirebase,
} from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void> | void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  toggleLikeTool: (toolId: string) => void;
  toggleLikeWorkflow: (workflowId: string) => void;
  toggleLikePost: (postId: string) => void;
  isLikedTool: (toolId: string) => boolean;
  isLikedWorkflow: (workflowId: string) => boolean;
  isLikedPost: (postId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestSavedTools, setGuestSavedTools] = useState<string[]>([]);
  const [guestFollowedWorkflows, setGuestFollowedWorkflows] = useState<string[]>([]);
  const [guestLikedPosts, setGuestLikedPosts] = useState<string[]>([]);

  useEffect(() => {
    // Load local guest saved bookmarks (strictly real user interactions)
    try {
      const gTools = localStorage.getItem('craly_guest_saved_tools');
      if (gTools) setGuestSavedTools(JSON.parse(gTools));
      const gWfs = localStorage.getItem('craly_guest_followed_workflows');
      if (gWfs) setGuestFollowedWorkflows(JSON.parse(gWfs));
      const gPosts = localStorage.getItem('craly_guest_liked_posts');
      if (gPosts) setGuestLikedPosts(JSON.parse(gPosts));
    } catch {}

    const savedToken = getAuthToken();
    const savedUser = localStorage.getItem('craly_user_profile');

    if (savedToken) {
      setTokenState(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {}
      }
      cralyApi.getUserProfile().then((profile) => {
        if (profile) {
          setUser(profile);
          localStorage.setItem('craly_user_profile', JSON.stringify(profile));
        }
      });
    }

    // Subscribe to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const freshToken = await fbUser.getIdToken();
          setTokenState(freshToken);
          setAuthToken(freshToken);

          const profile = await cralyApi.getUserProfile();
          if (profile) {
            setUser(profile);
            localStorage.setItem('craly_user_profile', JSON.stringify(profile));
          } else {
            // Fallback user object from Firebase auth if backend user is being created
            setUser((prev) => prev || {
              id: fbUser.uid,
              _id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'AI Creator',
              photoUrl: fbUser.photoURL || undefined,
            });
          }
        } catch (e) {
          console.warn('[AuthContext] Error syncing user on auth change:', e);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);

    // 1. Authenticate with Firebase to get valid ID token
    const fbRes = await getFirebaseIdTokenFromCredentials(email, pass);
    if (!fbRes.success || !fbRes.idToken) {
      setIsLoading(false);
      return {
        success: false,
        message: fbRes.message || 'Invalid email or password.',
      };
    }

    // 2. Exchange Firebase ID token with Craly backend
    const apiRes = await cralyApi.loginWithFirebaseIdToken(fbRes.idToken);
    setIsLoading(false);

    if (apiRes.success && apiRes.data) {
      const activeToken = fbRes.idToken;
      const profile = apiRes.data.user || apiRes.data.data?.user || apiRes.data;

      setTokenState(activeToken);
      setAuthToken(activeToken);

      if (profile && typeof profile === 'object') {
        setUser(profile);
        localStorage.setItem('craly_user_profile', JSON.stringify(profile));
      }
      return { success: true };
    }

    // Even if backend had a temporary hiccup, if Firebase authenticated, we can store token and attempt profile fetch
    if (fbRes.idToken) {
      setTokenState(fbRes.idToken);
      setAuthToken(fbRes.idToken);
      const profile = await cralyApi.getUserProfile();
      if (profile) {
        setUser(profile);
        localStorage.setItem('craly_user_profile', JSON.stringify(profile));
        return { success: true };
      }
    }

    return {
      success: false,
      message: apiRes.message || 'Failed to authenticate with backend server.',
    };
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const fbRes = await getFirebaseIdTokenFromGoogle();
    if (!fbRes.success || !fbRes.idToken) {
      setIsLoading(false);
      return {
        success: false,
        message: fbRes.message || 'Google sign-in was cancelled or failed.',
      };
    }

    const apiRes = await cralyApi.loginWithGoogle(fbRes.idToken);
    setIsLoading(false);

    if (apiRes.success && apiRes.data) {
      const activeToken = fbRes.idToken;
      const profile = apiRes.data.user || apiRes.data.data?.user || apiRes.data;

      setTokenState(activeToken);
      setAuthToken(activeToken);

      if (profile && typeof profile === 'object') {
        setUser(profile);
        localStorage.setItem('craly_user_profile', JSON.stringify(profile));
      }
      return { success: true };
    }

    // Fallback if backend returned format difference
    if (fbRes.idToken) {
      setTokenState(fbRes.idToken);
      setAuthToken(fbRes.idToken);
      const profile = await cralyApi.getUserProfile();
      if (profile) {
        setUser(profile);
        localStorage.setItem('craly_user_profile', JSON.stringify(profile));
        return { success: true };
      }
    }

    return {
      success: false,
      message: apiRes.message || 'Google authentication failed with backend.',
    };
  };

  const signup = async (email: string, pass: string, name: string) => {
    setIsLoading(true);

    // 1. Tell backend to create user
    await cralyApi.signup(email, pass, name);

    // 2. Create in Firebase or get credentials
    const fbRes = await createFirebaseUser(email, pass, name);
    if (!fbRes.success || !fbRes.idToken) {
      setIsLoading(false);
      return {
        success: false,
        message: fbRes.message || 'Could not complete registration.',
      };
    }

    // 3. Sync with backend
    const apiRes = await cralyApi.loginWithFirebaseIdToken(fbRes.idToken);
    setIsLoading(false);

    const activeToken = fbRes.idToken;
    setTokenState(activeToken);
    setAuthToken(activeToken);

    if (apiRes.success && apiRes.data) {
      const profile = apiRes.data.user || apiRes.data;
      if (profile && typeof profile === 'object') {
        setUser(profile);
        localStorage.setItem('craly_user_profile', JSON.stringify(profile));
      }
    }

    return { success: true };
  };

  const resetPassword = async (email: string) => {
    return resetFirebasePassword(email);
  };

  const logout = async () => {
    // 1. Sign out of Firebase Auth
    try {
      await signOutFirebase();
    } catch (err) {
      console.warn('[AuthContext] Firebase signOut error:', err);
    }

    // 2. Reset in-memory auth and guest bookmarks
    setTokenState(null);
    setAuthToken(null);
    setUser(null);
    setGuestSavedTools([]);
    setGuestFollowedWorkflows([]);
    setGuestLikedPosts([]);

    // 3. Clear ALL local data and session storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (err) {
        console.warn('[AuthContext] Error clearing local storage:', err);
      }

      // 4. Clear all accessible cookies
      try {
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
        });
      } catch (err) {
        console.warn('[AuthContext] Error clearing cookies:', err);
      }

      // 5. Notify all contexts & components to reset in-memory state
      window.dispatchEvent(new CustomEvent('aura:logout'));
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('craly_user_profile', JSON.stringify(updated));
    await cralyApi.updateUserProfile(updates);
    return true;
  };

  const toggleLikeTool = (toolId: string) => {
    if (user) {
      const current = user.savedTools || [];
      const exists = current.includes(toolId);
      const updated = exists ? current.filter((id) => id !== toolId) : [...current, toolId];
      updateProfile({ savedTools: updated });
    } else {
      setGuestSavedTools((prev) => {
        const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
        localStorage.setItem('craly_guest_saved_tools', JSON.stringify(next));
        return next;
      });
    }
    cralyApi.likeTool(toolId);
  };

  const toggleLikeWorkflow = (workflowId: string) => {
    if (user) {
      const current = user.followedWorkflows || [];
      const exists = current.includes(workflowId);
      const updated = exists ? current.filter((id) => id !== workflowId) : [...current, workflowId];
      updateProfile({ followedWorkflows: updated });
    } else {
      setGuestFollowedWorkflows((prev) => {
        const next = prev.includes(workflowId) ? prev.filter((id) => id !== workflowId) : [...prev, workflowId];
        localStorage.setItem('craly_guest_followed_workflows', JSON.stringify(next));
        return next;
      });
    }
    cralyApi.likeWorkflow(workflowId);
  };

  const toggleLikePost = (postId: string) => {
    if (user) {
      const current = user.likedPosts || [];
      const exists = current.includes(postId);
      const updated = exists ? current.filter((id) => id !== postId) : [...current, postId];
      updateProfile({ likedPosts: updated });
    } else {
      setGuestLikedPosts((prev) => {
        const next = prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId];
        localStorage.setItem('craly_guest_liked_posts', JSON.stringify(next));
        return next;
      });
    }
    cralyApi.likePost(postId);
  };

  const isLikedTool = (toolId: string) => {
    return user ? !!user.savedTools?.includes(toolId) : guestSavedTools.includes(toolId);
  };

  const isLikedWorkflow = (workflowId: string) => {
    return user ? !!user.followedWorkflows?.includes(workflowId) : guestFollowedWorkflows.includes(workflowId);
  };

  const isLikedPost = (postId: string) => {
    return user ? !!user.likedPosts?.includes(postId) : guestLikedPosts.includes(postId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        resetPassword,
        logout,
        updateProfile,
        toggleLikeTool,
        toggleLikeWorkflow,
        toggleLikePost,
        isLikedTool,
        isLikedWorkflow,
        isLikedPost,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
