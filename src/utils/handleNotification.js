import { getMessaging, getToken, onMessage, requestPermission, onTokenRefresh } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { getInstallations } from 'firebase/installations';// ✅ Yêu cầu quyền thông báo từ người dùng
import app from '@react-native-firebase/app';
import installations from "@react-native-firebase/installations";
export const requestUserPermission = async () => {
  try {
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

// ✅ Lắng nghe thông báo ngay cả khi app đang mở
export const listenForMessages = () => {
  try {
    const messaging = getMessaging(getApp());

    onMessage(messaging, (remoteMessage) => {
      console.log('📩 Nhận được thông báo:', remoteMessage);
      Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
    });
  } catch (error) {
    console.error('⚠️ Lỗi khi lắng nghe thông báo:', error);
  }
};

// ✅ Gửi thông báo đến thiết bị
export const sendNotification = async () => {
  let fcmToken = await AsyncStorage.getItem('fcmtoken');

  try {
    const message = {
      message: {
        token: fcmToken,  // Thay bằng FCM token của thiết bị
        notification: {
          title: "📢 Lời nhắc kiểm tra sức khỏe",
          body: "Đã đến lúc kiểm tra huyết áp của bạn!",
        },
        android: {
          priority: "high", // Giúp tăng độ ưu tiên khi app tắt
          notification: {
            sound: "default",
            channel_id: "health_reminder",  // Tạo kênh thông báo trên Android 8+
          }
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              contentAvailable: true,
            }
          }
        }
      }
    };

    await axios.post('https://fcm.googleapis.com/v1/projects/pushnotification-19d2c/messages:send', message, {
      headers: {
        'Authorization': 'Bearer ya29.a0AXeO80Q7UinJXtJUSZOgFKflUZRB4e6nWtf628tvs5kM5g3gZvsWiJpqwBbjNBH8RyEWseMvlsaLFXWxWpoo3jgl7R4xiFzU_oJnWDT6l-JUi-pYDS7OpJKw0-LrH5V6j-EMJNnrlK0AN6PUdCZ5R3C9eAT-jwB7FflOu0gOL331RgaCgYKAc0SARISFQHGX2MiSS6wEKaRFkcseJhWJ2DBog0181',
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
      try {
        const installationId = await installations().getId();
        console.log("Firebase Installation ID:", installationId);
      } catch (error) {
        console.error("Lỗi khi lấy Installation ID:", error);
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
