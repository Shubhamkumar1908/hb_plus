import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { LoginScreen } from '../src/screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#3157D5" /></View>;
  if (user) return <Redirect href="/dashboard" />;
  return <LoginScreen />;
}