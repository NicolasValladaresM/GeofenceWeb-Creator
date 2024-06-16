import React from 'react';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirebaseAuth } from './firebase/config';
import { useRouter } from "next/navigation";

const AuthProvider = ({ children }) => {
  const auth = getFirebaseAuth(); 
const [user] = useAuthState(auth);
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      
      router.push('/')
    }
  }, [user,router]);

  return children;
};

export default AuthProvider;
