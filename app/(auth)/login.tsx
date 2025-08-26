// app/login.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import AuthPage from '@/components/layouts/AuthPage';
import LoginScreen from '@/screens/LoginScreen';
import { useAppStore } from '@/hooks/useAppStore';

export default function Page() {
  const currentUserId = useAppStore((s) => s.currentUserId);

  useEffect(() => {
    if (currentUserId) {
      router.replace('/tabs'); // ✅ replace plutôt que push pour éviter le "back" vers login
    }
  }, [currentUserId]);

  if (currentUserId) {
    // pendant que la redirection se fait, tu peux retourner null ou un loader
    return null;
  }

  return (
    <AuthPage>
      <LoginScreen />
    </AuthPage>
  );
}
