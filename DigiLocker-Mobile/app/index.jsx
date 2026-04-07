import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated
    ? <Redirect href="/(app)" />
    : <Redirect href="/(auth)/login" />;
}
