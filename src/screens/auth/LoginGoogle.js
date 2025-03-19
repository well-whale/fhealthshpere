// import { signInWithGoogle } from "../../auth/google-authen"
// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   View,
//   StyleSheet,
//   Text,
//   SafeAreaView,
//   TouchableOpacity,
// } from "react-native";
// import auth from "@react-native-firebase/auth";
// import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

// export default function LoginScreen() {
//   // Set an initializing state whilst Firebase connects
//   const [initializing, setInitializing] = useState(true);
//   const [user, setUser] = useState();

//   // Handle user state changes
//   function onAuthStateChanged(user) {
//     console.log("user", user);
//     setUser(user);
//     if (initializing) setInitializing(false);
//   }

//   useEffect(() => {
//     const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
//     return subscriber; // unsubscribe on unmount
//   }, []);

//   if (initializing) return null;

//   if (!user) {
//     return (
//       <SafeAreaView
//         style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//       >
//         <GoogleSigninButton
//           size={GoogleSigninButton.Size.Wide}
//           color={GoogleSigninButton.Color.Dark}
//           onPress={signInWithGoogle}
//         />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <View style={{ justifyContent: "center", flex: 1, alignItems: "center" }}>
//       <Text>Welcome {user.email}</Text>
//       <TouchableOpacity onPress={() => auth().signOut()}>
//         <Text>Sign-out</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1, // Chiếm toàn bộ màn hình
//     justifyContent: "center", // Căn giữa theo chiều dọc
//     alignItems: "center", // Căn giữa theo chiều ngang
//   },
// });
