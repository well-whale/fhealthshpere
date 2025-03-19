import { View, Text, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';

export default function Register() {
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('fcmtoken');
      console.log('🔑 FCM Token:', token);
      setFcmToken(token);
    };
    fetchToken();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.tokenText}
        value={fcmToken}
        // editable={false}
        multiline={true}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
    padding: 20,
  },
  tokenText: {
    fontSize: 13,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    textAlignVertical: 'top',
  },
});