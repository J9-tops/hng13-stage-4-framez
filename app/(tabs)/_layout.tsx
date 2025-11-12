import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tabs } from 'expo-router';
import { House, UserRound } from 'lucide-react-native';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 24,
          paddingTop: 8,
          height: 100,
          marginBottom: 0,
          borderTopWidth: 1,
          borderTopColor: '#F2F2F7'
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIcon}>
              <Text style={{ fontSize: 24, color }}><House /></Text>
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="CreatePost"
       
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={styles.createButton}>
              <Text style={styles.createButtonText}>+</Text>
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="Profile"
       
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIcon}>
              <Text style={{ fontSize: 24, color }}><UserRound /></Text>
            </View>
          )
        }}
      />
    </Tabs>
  );
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