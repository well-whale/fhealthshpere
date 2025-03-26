import { getMessaging, getToken, onMessage, onTokenRefresh, requestPermission } from "@react-native-firebase/messaging";
import { getApp } from "@react-native-firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Thay YOUR_SERVER_KEY bằng giá trị thực tế từ Firebase Console
const YOUR_SERVER_KEY = "ya29.a0AeXRPp6Tyq8QMAnIcEnnma5RC-uvB-syTMGOck6sIrVST3myKvmF9lerZTkfG43rYIPY4Uhrr4j1EwJW58Q0vVfSFmy9GUDvgyEW7jkfmzV3W1axjL3DcYjQ_vm3GGBWyWZDOJH95fs0IP8AukUyPc-NSf3qsi3O9fmz6O-vJdJ7MC4aCgYKAb8SARISFQHGX2Mi7Giesx2oHvW8q-kU8bKZNw0182";

export const requestUserPermission = async () => {
  try {
    const messaging = getMessaging(getApp());
    const authStatus = await requestPermission(messaging);

    if (authStatus === 1 || authStatus === 2) {
      console.log("✅ Quyền thông báo đã được cấp.");
      await new HandleNotification().getFcmToken();
    } else {
      console.log("🚫 Người dùng từ chối quyền thông báo.");
    }
  } catch (error) {
    console.error("⚠️ Lỗi khi yêu cầu quyền thông báo:", error);
  }
};

export const listenForMessages = () => {
  try {
    const messaging = getMessaging(getApp());

    onMessage(messaging, async (remoteMessage) => {
      console.log("📩 Nhận được thông báo khi app đang mở:", remoteMessage);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || "Thông báo mới",
          body: remoteMessage.notification?.body || "",
          data: remoteMessage.data,
        },
        trigger: null,
      });
    });
  } catch (error) {
    console.error("⚠️ Lỗi khi lắng nghe thông báo:", error);
  }
};

export const sendNotification = async () => {
  let fcmToken = await AsyncStorage.getItem("fcmtoken");

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
            default_sound: true,
            default_vibrate_timings: true,
            default_light_settings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              contentAvailable: true,
              badge: 1,
              mutable_content: 1,
            },
          },
        },
        data: {
          forceShow: "true",
        },
      },
    };

    await axios.post("https://fcm.googleapis.com/v1/projects/fhealth-sphere---login/messages:send", message, {
      headers: {
        Authorization: `Bearer ${YOUR_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Thông báo đã gửi thành công.");
    listenForMessages();
  } catch (error) {
    console.error("⚠️ Lỗi khi gửi thông báo:", error);
  }
};

export const sendConnectionReminder = async () => {
  let fcmToken = await AsyncStorage.getItem("fcmtoken");

  try {
    const message = {
      message: {
        token: fcmToken,
        notification: {
          title: "📢 Nhắc nhở kết nối",
          body: "Vui lòng kết nối thiết bị để tiếp tục sử dụng!",
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channel_id: "health_reminder",
            visibility: "public",
            default_sound: true,
            default_vibrate_timings: true,
            default_light_settings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              contentAvailable: true,
              badge: 1,
              mutable_content: 1,
            },
          },
        },
        data: {
          forceShow: "true",
        },
      },
    };

    await axios.post("https://fcm.googleapis.com/v1/projects/fhealth-sphere---login/messages:send", message, {
      headers: {
        Authorization: `Bearer ${YOUR_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Thông báo nhắc nhở kết nối đã gửi.");
  } catch (error) {
    console.error("⚠️ Lỗi khi gửi thông báo nhắc nhở:", error);
  }
};

// Hàm kiểm tra trạng thái huyết áp và gửi thông báo cảnh báo
export const checkAndSendBPAlert = async (systolic, diastolic) => {
  const getBPStatus = () => {
    if (systolic === 0 || diastolic === 0)
      return { text: "Waiting...", color: "#A0AEC0" };
    if (systolic < 120 && diastolic < 80)
      return { text: "Normal", color: "#48BB78" };
    if (systolic >= 120 && systolic <= 129 && diastolic < 80)
      return { text: "Elevated", color: "#ECC94B" };
    if (
      (systolic >= 130 && systolic <= 139) ||
      (diastolic >= 80 && diastolic <= 89)
    )
      return { text: "Hypertension Stage 1", color: "#ED8936" };
    if (systolic >= 140 || diastolic >= 90)
      return { text: "Hypertension Stage 2", color: "#E53E3E" };
    if (systolic > 180 || diastolic > 120)
      return { text: "Hypertensive Crisis", color: "#C53030" };
    return { text: "Undefined", color: "#718096" };
  };

  const status = getBPStatus();
  let fcmToken = await AsyncStorage.getItem("fcmtoken");

  // Gửi thông báo nếu huyết áp vượt ngưỡng (Hypertension Stage 2 hoặc Hypertensive Crisis)
  if (
    status.text === "Hypertension Stage 2" ||
    status.text === "Hypertensive Crisis"
  ) {
    try {
      const message = {
        message: {
          token: fcmToken,
          notification: {
            title: "🚨 Cảnh báo huyết áp",
            body: `Huyết áp của bạn đang ở mức ${status.text}: ${systolic}/${diastolic} mmHg. Vui lòng kiểm tra ngay!`,
          },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              channel_id: "health_reminder",
              visibility: "public",
              default_sound: true,
              default_vibrate_timings: true,
              default_light_settings: true,
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "default",
                contentAvailable: true,
                badge: 1,
                mutable_content: 1,
              },
            },
          },
          data: {
            forceShow: "true",
          },
        },
      };

      await axios.post("https://fcm.googleapis.com/v1/projects/fhealth-sphere---login/messages:send", message, {
        headers: {
          Authorization: `Bearer ${YOUR_SERVER_KEY}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Thông báo cảnh báo huyết áp đã gửi.");
    } catch (error) {
      console.error("⚠️ Lỗi khi gửi thông báo cảnh báo huyết áp:", error);
    }
  }
};

export class HandleNotification {
  async getFcmToken() {
    try {
      const messaging = getMessaging(getApp());
      let fcmToken = await AsyncStorage.getItem("fcmtoken");

      if (!fcmToken) {
        console.log("⚠️ Không tìm thấy FCM Token, đang lấy từ Firebase...");
        fcmToken = await getToken(messaging);

        if (fcmToken) {
          await AsyncStorage.setItem("fcmtoken", fcmToken);
          console.log("✅ FCM Token đã lưu:", fcmToken);
        } else {
          console.log("🚫 Không lấy được FCM Token từ Firebase.");
        }
      } else {
        console.log("✅ FCM Token đã tồn tại:", fcmToken);
      }

      onTokenRefresh(messaging, async (newToken) => {
        console.log("🔄 FCM Token cập nhật:", newToken);
        await AsyncStorage.setItem("fcmtoken", newToken);
      });
    } catch (error) {
      console.error("⚠️ Lỗi khi lấy FCM token:", error);
    }
  }
}