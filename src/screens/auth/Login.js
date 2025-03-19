import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import BackButton from "../../components/Button/BackButton";
import { useNavigation } from "@react-navigation/native";

WebBrowser.maybeCompleteAuthSession();

// Get screen dimensions
const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  // Onboarding slides data
  const slides = [
    {
      image: require("../../../assets/imagelogin1.jpg"),
      title: "Help millions of people",
      subtitle: "everywhere, everytime!",
    },
    {
      image: require("../../../assets/imagelogin2.jpg"),
      title: "Expert doctors",
      subtitle: "available 24/7",
    },
    {
      image: require("../../../assets/imagelogin3.jpg"),
      title: "Easy appointments",
      subtitle: "book with one tap",
    },
    {
      image: require("../../../assets/imagelogin4.jpg"),
      title: "Secure conversations",
      subtitle: "private and confidential",
    },
  ];

  // Google Auth
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    clientId:
      "44086127203-slure7mgqba0mlncip5lbfi0r5j4hj96.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      setIsLoading(true);
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => {
          console.log("Google Sign-In successful!");
        })
        .catch((error) => console.error("Google Sign-In failed:", error))
        .finally(() => setIsLoading(false));
    }
  }, [response]);

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prevPage) =>
        prevPage === slides.length - 1 ? 0 : prevPage + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Main content */}
      <View style={styles.content}>
        {/* Doctor and patients image */}
        <View style={styles.imageContainer}>
          <Image
            source={slides[currentPage].image}
            style={styles.doctorImage}
            resizeMode="cover"
          />
        </View>

        {/* Text overlay */}
        <View style={styles.textContainer}>
          <Text style={styles.heading}>{slides[currentPage].title}</Text>
          <Text style={styles.subheading}>{slides[currentPage].subtitle}</Text>
        </View>

        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentPage === index ? styles.activeDot : {},
              ]}
            />
          ))}
        </View>

        {/* Button container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            // onPress={() => promptAsync()}
            onPress={() => navigation.navigate("LoginScreen")}
            disabled={!request || isLoading}
          >
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

        {/* Professional link */}
        <View style={styles.professionalContainer}>
          <Text style={styles.professionalText}>
            Are you a patient?{" "}
            <Text style={styles.professionalLink}>Get here!</Text>
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
    gap: 10, // Khoảng cách giữa chữ và icon
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "45%",
    alignItems: "center",
  },
  signupButtonText: {
    color: "#333",
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
