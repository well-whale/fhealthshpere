import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Cấu hình Google Sign-In
GoogleSignin.configure({
  webClientId:
    "44086127203-slure7mgqba0mlncip5lbfi0r5j4hj96.apps.googleusercontent.com", // Lấy từ Firebase Console
});

export async function signInWithGoogle() {
  try {
    // Đảm bảo người dùng đã đăng xuất trước đó (tùy chọn)
    await GoogleSignin.signOut();
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    // Try the new style of google-sign in result, from v13+ of that module
    idToken = signInResult.data?.idToken;

    console.log("idToken", idToken);

    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = signInResult.idToken;
    }
    if (!idToken) {
      throw new Error("No ID token found");
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(
      signInResult.data.idToken
    );

    // Sign-in the user with the credential
    console.log("googleCredential", googleCredential);
    const userCredential = await auth().signInWithCredential(googleCredential);
    console.log("userCredential", userCredential);
    //return userCredential;

    // Lấy Firebase ID token
    const firebaseIdToken = await userCredential.user.getIdToken();
    console.log("Firebase ID Token:", firebaseIdToken);

    // Gửi ID token về backend

    return firebaseIdToken;
    //return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    throw error;
  }
}
