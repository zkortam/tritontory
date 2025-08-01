"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  User,
  UserCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useRouter } from "next/navigation";

interface UserRole {
  role: 'admin' | 'editor' | 'author' | 'viewer';
  department?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string, redirectTo?: string) => Promise<UserCredential>;
  signInWithGoogle: (redirectTo?: string) => Promise<UserCredential>;
  signUpWithGoogle: (redirectTo?: string) => Promise<{ userCredential: UserCredential; isNewUser: boolean }>;
  signOut: () => Promise<void>;
  createUser: (email: string, password: string, redirectTo?: string) => Promise<UserCredential>;
  updateUserProfile: (firstName: string, lastName: string) => Promise<void>;
  hasRole: (requiredRole: UserRole['role']) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  setRedirectUrl: (url: string) => void;
  getRedirectUrl: () => string | null;
  clearRedirectUrl: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  signIn: async () => {
    throw new Error("AuthContext not initialized");
  },
  signInWithGoogle: async () => {
    throw new Error("AuthContext not initialized");
  },
  signUpWithGoogle: async () => {
    throw new Error("AuthContext not initialized");
  },
  signOut: async () => {
    throw new Error("AuthContext not initialized");
  },
  createUser: async () => {
    throw new Error("AuthContext not initialized");
  },
  updateUserProfile: async () => {
    throw new Error("AuthContext not initialized");
  },
  hasRole: () => false,
  hasPermission: () => false,
  isAdmin: () => false,
  setRedirectUrl: () => {},
  getRedirectUrl: () => null,
  clearRedirectUrl: () => {},
});

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrlState] = useState<string | null>(null);
  const router = useRouter();

  // Redirect URL management
  const setRedirectUrl = useCallback((url: string) => {
    setRedirectUrlState(url);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authRedirectUrl', url);
    }
  }, []);

  const getRedirectUrl = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authRedirectUrl') || redirectUrl;
    }
    return redirectUrl;
  }, [redirectUrl]);

  const clearRedirectUrl = useCallback(() => {
    setRedirectUrlState(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authRedirectUrl');
    }
  }, []);

  // Handle redirect after successful authentication
  const handleSuccessfulAuth = useCallback(() => {
    const redirectTo = getRedirectUrl();
    if (redirectTo && redirectTo !== '/auth') {
      clearRedirectUrl();
      router.push(redirectTo);
    } else {
      router.push('/');
    }
  }, [getRedirectUrl, clearRedirectUrl, router]);

  // Fetch user role from Firestore
  const fetchUserRole = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole({
          role: userData.role || 'viewer',
          department: userData.department,
          isAdmin: userData.isAdmin || false,
        });
      } else {
        // Create user document if it doesn't exist
        await setDoc(doc(db, "users", userId), {
          role: 'viewer',
          isAdmin: false,
          createdAt: new Date(),
        });
        setUserRole({ role: 'viewer', isAdmin: false });
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole({ role: 'viewer', isAdmin: false });
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserRole(user.uid);
        // Only handle redirect if there's a stored redirect URL (indicating recent sign-in)
        const redirectTo = getRedirectUrl();
        if (redirectTo && redirectTo !== '/auth') {
          handleSuccessfulAuth();
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [handleSuccessfulAuth, getRedirectUrl]);

  // Sign in function
  const signIn = async (email: string, password: string, redirectTo?: string) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google sign in function
  const signInWithGoogle = async (redirectTo?: string) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Sign out function
  const signOut = async () => {
    return firebaseSignOut(auth);
  };

  // Create user function
  const createUser = async (email: string, password: string, redirectTo?: string) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Google sign up function that returns whether user is new
  const signUpWithGoogle = async (redirectTo?: string) => {
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if this is a new user by looking at creation time vs last sign in time
    const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;
    
    return { userCredential, isNewUser };
  };

  // Update user profile with first and last name
  const updateUserProfile = async (firstName: string, lastName: string) => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }
    
    try {
      // Update user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email: user.email,
        role: 'viewer',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
      
      // Update the user role state
      setUserRole(prev => ({
        ...prev,
        role: 'viewer',
        isAdmin: false,
      }));
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  };

  // Check if user has admin privileges
  const isAdmin = (): boolean => {
    if (!userRole) return false;
    return userRole.isAdmin === true;
  };

  // Check if user has a specific role
  const hasRole = (requiredRole: UserRole['role']): boolean => {
    if (!userRole) return false;
    
    // First check if user is admin
    if (userRole.isAdmin === true) return true;
    
    const roleHierarchy = {
      'admin': 4,
      'editor': 3,
      'author': 2,
      'viewer': 1,
    };
    
    return roleHierarchy[userRole.role] >= roleHierarchy[requiredRole];
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!userRole) return false;
    
    // Admin users have all permissions
    if (userRole.isAdmin === true) return true;
    
    const permissions = {
      'admin': ['all'],
      'editor': ['read', 'write', 'publish', 'edit'],
      'author': ['read', 'write'],
      'viewer': ['read'],
    };
    
    const userPermissions = permissions[userRole.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  // Context value
  const value = {
    user,
    userRole,
    loading,
    signIn,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
    createUser,
    updateUserProfile,
    hasRole,
    hasPermission,
    isAdmin,
    setRedirectUrl,
    getRedirectUrl,
    clearRedirectUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Hook to automatically track current page for redirect after auth
export function useRedirectOnAuth() {
  const { setRedirectUrl } = useAuth();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      // Don't set redirect for auth page itself
      if (currentPath !== '/auth') {
        setRedirectUrl(currentPath);
      }
    }
  }, [setRedirectUrl]);
}
