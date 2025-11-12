import { StackNavigationProp } from '@react-navigation/stack';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,

  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
   const router = useRouter(); 
const { fromLogout } = useLocalSearchParams<{ fromLogout?: string }>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)/Home")
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          {!fromLogout && (
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => router.back()}
  >
    <Text style={styles.backButtonText}>←</Text>
  </TouchableOpacity>
)}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Framez</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#C7C7CD"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor="#C7C7CD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIconText}>{showPassword ? <EyeOff /> : <Eye />}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/SignUp')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardView: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center'
  },
  backButtonText: {
    fontSize: 32,
    color: '#000000'
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center'
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 60,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000'
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordInput: {
    paddingRight: 50
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center'
  },
  eyeIconText: {
    fontSize: 20
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  loginButtonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600'
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24
  },
  signupText: {
    fontSize: 15,
    color: '#8E8E93'
  },
  signupLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600'
  }
});

export default LoginScreen;