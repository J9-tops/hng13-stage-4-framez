import { AuthProvider } from '@/context/AuthContext';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot /> 
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
