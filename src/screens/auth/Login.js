import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProgile, loginGGFirebase } from '../../services/account/accountServices';

const { width, height } = Dimensions.get('window');

GoogleSignin.configure({
  webClientId: '44086127203-slure7mgqba0mlncip5lbfi0r5j4hj96.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  scopes: ['profile', 'email'],
});

export default function LoginScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const slides = [
    { image: require('../../../assets/imagelogin1.jpg'), title: 'Help millions of people', subtitle: 'everywhere, everytime!' },
    { image: require('../../../assets/imagelogin2.jpg'), title: 'Expert doctors', subtitle: 'available 24/7' },
    { image: require('../../../assets/imagelogin3.jpg'), title: 'Easy appointments', subtitle: 'book with one tap' },
    { image: require('../../../assets/imagelogin4.jpg'), title: 'Secure conversations', subtitle: 'private and confidential' },
  ];

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data.idToken;
      if (!idToken) throw new Error('Could not find idToken in Google response');

      await AsyncStorage.setItem('idToken', idToken);
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('firebaseIdToken', firebaseIdToken);
      const response = await loginGGFirebase(firebaseIdToken);
      if (response.email) {
        const setupCompleted = await AsyncStorage.getItem('setupCompleted');
        await AsyncStorage.setItem('user', JSON.stringify(response)); // Ensure userId is stored as a string
        if (!setupCompleted) {
          navigation.navigate('FormProfile');
        } else {
          navigation.navigate('MainTabs');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Đăng nhập thất bại', 'Không thể đăng nhập bằng Google. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage === slides.length - 1 ? 0 : prevPage + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={slides[currentPage].image} style={styles.doctorImage} resizeMode="cover" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>{slides[currentPage].title}</Text>
          <Text style={styles.subheading}>{slides[currentPage].subtitle}</Text>
        </View>
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.paginationDot, currentPage === index ? styles.activeDot : {}]} />
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.loginButtonText}>Continue with Google</Text>
                <Ionicons name="logo-google" size={26} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.professionalContainer}>
          <Text style={styles.professionalText}>
            Are you a patient? <Text style={styles.professionalLink}>Get here!</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  content: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  imageContainer: {
    width: width,
    height: height * 0.5,
    overflow: "hidden",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    padding: 20,
    marginTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subheading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonContainer: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  loginButton: {
    backgroundColor: "rgba(228, 88, 88, 0.91)",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  professionalContainer: {
    marginTop: 10,
  },
  professionalText: {
    color: "#666",
    fontSize: 14,
  },
  professionalLink: {
    color: "#20B2AA",
    fontWeight: "bold",
  },
});