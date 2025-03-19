import { getMessaging, getToken, onMessage, onTokenRefresh, requestPermission } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Add this at the top of your file
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // This controls whether the notification appears as a banner
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
// Request notification permissions
export const requestUserPermission = async () => {
  try {
    // Request permission for Firebase messaging
    const messaging = getMessaging(getApp());
    const authStatus = await requestPermission(messaging);
    
    if (authStatus === 1 || authStatus === 2) { // 1 = AUTHORIZED, 2 = PROVISIONAL
      console.log('✅ Quyền thông báo đã được cấp.');
      await new HandleNotification().getFcmToken();
    } else {
      console.log('🚫 Người dùng từ chối quyền thông báo.');
    }
  } catch (error) {
    console.error('⚠️ Lỗi khi yêu cầu quyền thông báo:', error);
  }
};

// Listen for messages even when app is open
export const listenForMessages = () => {
  try {
    const messaging = getMessaging(getApp());

    // Set up foreground notification handler
    onMessage(messaging, async (remoteMessage) => {
      console.log('📩 Nhận được thông báo khi app đang mở:', remoteMessage);
      
      // Display notification using Expo notifications when app is in foreground
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'Thông báo mới',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
        },
        trigger: null, // Show immediately
      });
      
      // No Alert.alert() here
    });

   
  } catch (error) {
    console.error('⚠️ Lỗi khi lắng nghe thông báo:', error);
  }
};

// Send notification to device
export const sendNotification = async () => {
  let fcmToken = await AsyncStorage.getItem('fcmtoken');

  try {
    const message = {
      message: {
        token: fcmToken,
        notification: {
          title: "📢 Lời nhắc kiểm tra sức khỏe",
          body: "Đã đến lúc kiểm tra huyết áp của bạn!",
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channel_id: "health_reminder",
            visibility: "public",
            // Add this to ensure foreground notifications
            default_sound: true,
            default_vibrate_timings: true,
            default_light_settings: true,
          }
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              contentAvailable: true,
              // Add this to ensure foreground notifications on iOS
              badge: 1,
              mutable_content: 1,
            }
          }
        },
        // Add this to ensure the notification is displayed when app is in foreground
        data: {
          forceShow: "true",
        }
      }
    };

    await axios.post('https://fcm.googleapis.com/v1/projects/pushnotification-19d2c/messages:send', message, {
      headers: {
        'Authorization': 'Bearer YOUR_SERVER_KEY', // Replace with secure server key
        'Content-Type': 'application/json',
      }
    });

    console.log("✅ Thông báo đã gửi thành công.");
    listenForMessages();
  } catch (error) {
    console.error("⚠️ Lỗi khi gửi thông báo:", error);
  }
};


export class HandleNotification {
  // ✅ Lấy và lưu FCM Token
  async getFcmToken() {
    try {
      const messaging = getMessaging(getApp());
      let fcmToken = await AsyncStorage.getItem('fcmtoken');

      if (!fcmToken) {
        console.log('⚠️ Không tìm thấy FCM Token, đang lấy từ Firebase...');
        fcmToken = await getToken(messaging);

        if (fcmToken) {
          await AsyncStorage.setItem('fcmtoken', fcmToken);
          console.log('✅ FCM Token đã lưu:', fcmToken);
        } else {
          console.log('🚫 Không lấy được FCM Token từ Firebase.');
        }
      } else {
        console.log('✅ FCM Token đã tồn tại:', fcmToken);
      }
      // 🔄 Lắng nghe sự kiện cập nhật Token
      onTokenRefresh(messaging, async (newToken) => {
        console.log('🔄 FCM Token cập nhật:', newToken);
        await AsyncStorage.setItem('fcmtoken', newToken);
      });

    } catch (error) {
      console.error('⚠️ Lỗi khi lấy FCM token:', error);
    }
  }
}
