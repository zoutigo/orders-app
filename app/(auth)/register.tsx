// app/login.tsx

import AuthPage from '@/components/layouts/AuthPage';
import RegisterScreen from '@/screens/RegisterScreen';
export default function Page() {
  return (
    <AuthPage>
      <RegisterScreen />
    </AuthPage>
  );
}
