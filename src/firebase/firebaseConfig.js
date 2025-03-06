/**@format */
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth,getReactNativePersistence } from "firebase/auth"; // Thêm dòng này
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDAb-RLJ3xiHjYf-admj-i5rgOtU7lybzc",
  authDomain: "fhealth-sphere---login.firebaseapp.com",
  projectId: "fhealth-sphere---login",
  storageBucket: "fhealth-sphere---login.firebasestorage.app",
  messagingSenderId: "44086127203",
  appId: "1:44086127203:web:444374eafa3a617d8aa656",
  measurementId: "G-YN8ZXTDCQX"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth, app };


