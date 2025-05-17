'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, getAdditionalUserInfo, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      router.push('/onboarding');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;

      router.push(isNewUser ? '/onboarding' : '/home');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join WatchAI to get personalized video recommendations</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
            <Input
              id="username"
              placeholder="john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleRegister}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Register
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm bg-white px-2 text-gray-500">
              or continue with
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2"
          >
            <FcGoogle className="w-5 h-5" />
            Sign up with Google
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
