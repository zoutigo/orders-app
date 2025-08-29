// app/tabs/profile/edit.tsx

import AuthPage from '@/components/layouts/AuthPage';
import TabsEditProfileScreen from '@/screens/TabsProfileEditScreen';

export default function EditPage() {
  return (
    <AuthPage>
      <TabsEditProfileScreen />
    </AuthPage>
  );
}
