// app/welcome.tsx

import AuthPage from '@/components/layouts/AuthPage';
import WelcomeScreen from '@/screens/WelcomeScreen';

export default function Page() {
  return (
    <AuthPage>
      <WelcomeScreen />
    </AuthPage>
  );
}
