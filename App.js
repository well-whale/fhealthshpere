import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Navigation from './src/routers/Navigation';
import { useEffect } from 'react';
import { listenForMessages, requestUserPermission } from './src/utils/handleNotification';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from './src/routers/Navigation';

// Define the notification channel creation function
const createNotificationChannel = () => {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('health_reminder', {
      name: 'Health Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
};

export default function App() {
  useEffect(() => {
    // Create notification channel when app starts
    createNotificationChannel();
    // Request notification permissions when app starts
    requestUserPermission();
    // Set up listener for foreground notifications
    listenForMessages();

    // Check for tokens in AsyncStorage
    const checkTokens = async () => {
      const idToken = await AsyncStorage.getItem('idToken');
      const firebaseIdToken = await AsyncStorage.getItem('firebaseIdToken');
      if (!idToken || !firebaseIdToken) {
        navigationRef.current?.navigate('Login');
      } else {
        navigationRef.current?.navigate('MainTabs');
      }
    };

    checkTokens();

    return () => {
      // Clean up listener when component unmounts
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Navigation />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});