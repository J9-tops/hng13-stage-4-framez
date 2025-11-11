import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// Import screens



export default function App() {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#007AFF' }}>Loading...</Text>
      </View>
    );
  }

  return user ? <Redirect href="/Home" /> : <Redirect href="/Welcome" />;
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93'
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8
  },
  createButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -4
  }
});