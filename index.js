import { registerRootComponent } from 'expo';

import App from './App';
import messaging from '@react-native-firebase/messaging';

// Xử lý thông báo ngay cả khi ứng dụng bị đóng (Force Close)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("📩 Nhận thông báo khi app đóng:", remoteMessage);
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
