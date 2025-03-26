import { StatusBar } from "expo-status-bar";
import { StyleSheet, Platform } from "react-native";
import Navigation from "./src/routers/Navigation";
import { useEffect, useRef } from "react";
import {
  checkAndSendBPAlert,
  listenForMessages,
  requestUserPermission,
  sendConnectionReminder,
} from "./src/utils/handleNotification";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "./src/routers/Navigation";
import socketService from "./src/services/HealthRecord/SocketService";
import firebaseService from "./src/services/HealthRecord/firebaseService";

const createNotificationChannel = () => {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("health_reminder", {
      name: "Health Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }
};

export default function App() {
  const connectionIntervalRef = useRef(null);
  const dataIntervalRef = useRef(null);
  const notificationIntervalRef = useRef(null);
  const userIDRef = useRef(null);

  const initializeSocket = async () => {
    const serverAddress = await AsyncStorage.getItem("serverAddress") || "192.168.1.100";
    const userData = await AsyncStorage.getItem("user");
    const user = JSON.parse(userData);
    console.log("asads",user.userId)
  

    if (!socketService.isConnected()) {
      socketService.connect(serverAddress, {
        onConnected: async () => {
          console.log("Socket connected");
          await AsyncStorage.setItem("isConnected", "true");
          clearInterval(connectionIntervalRef.current);
          clearInterval(notificationIntervalRef.current);
          startDataFetching();
        },
        onConnectError: (error) => {
          console.log("Socket connection failed:", error);
          AsyncStorage.setItem("isConnected", "false");
          startConnectionReminder();
          startNotificationReminder();
        },
        onDevicesUpdate: (devices) => {
          AsyncStorage.setItem("connectedDevices", JSON.stringify(devices));
        },
        onDataReceived: async (data) => {
          // Lấy thời gian hiện tại
          const now = new Date();
          const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            date.setHours(date.getHours() + 7); // UTC+7
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${year}-${month}-${day} ${hours}:${minutes}`;
          };
          // Định dạng dữ liệu giống như trong BloodPressureScreen
          const newMeasurement = {
            systolic: data.systolic,
            diastolic: data.diastolic,
            pulse: data.pulse,
            timestamp: now.toLocaleTimeString(), // Dùng toLocaleTimeString như trong đoạn code của bạn
            userId: user.userId,
            brandID: data.brandID || "unknown",
          };
          console.log("Received health data:", newMeasurement);

          // Dữ liệu cho AsyncStorage và các trang khác
          const healthData = {
            systolic: newMeasurement.systolic,
            diastolic: newMeasurement.diastolic,
            pulse: newMeasurement.pulse,
            timestamp: newMeasurement.timestamp,
          };

          console.log("Received health data:", newMeasurement);

          // Lưu vào AsyncStorage để các trang khác sử dụng
          await AsyncStorage.setItem("latestHealthData", JSON.stringify(healthData));
          console.log("latestHealthData 5p saved:", healthData);

          // Lưu lịch sử đo (giới hạn 10 bản ghi)
          const history = await AsyncStorage.getItem("measurementHistory");
          let updatedHistory = history ? JSON.parse(history) : [];
          updatedHistory = [newMeasurement, ...updatedHistory].slice(0, 10);
          await AsyncStorage.setItem("measurementHistory", JSON.stringify(updatedHistory));
          console.log("Measurement history updated:", updatedHistory);
          await checkAndSendBPAlert(data.systolic, data.diastolic);
          // Đẩy dữ liệu lên Firebase nếu có userID
          if (user.userId) {
            try {
              await firebaseService.saveHealthData(
                {
                  systolic: data.systolic,
                  diastolic: data.diastolic,
                  pulse: data.pulse,
                  timestamp: formatDate(now), // Dùng định dạng UTC+7 cho Firebase
                },
                user.userId,
                data.brandID || "unknown",
                data.pulse
              );
              console.log("Data successfully pushed to Firebase");
            } catch (error) {
              console.error("Error pushing data to Firebase:", error);
            }
          }
        },
        onDisconnected: async () => {
          console.log("Socket disconnected");
          await AsyncStorage.setItem("isConnected", "false");
          clearInterval(dataIntervalRef.current);
          startConnectionReminder();
          startNotificationReminder();
        },
      });
    } else {
      startDataFetching();
    }
  };

  const startDataFetching = () => {
    if (!dataIntervalRef.current) {
      console.log("Starting automatic data fetching every 5 minutes");
      dataIntervalRef.current = setInterval(async () => {
        if (socketService.isConnected()) {
          console.log("Requesting latest data...");
          socketService.requestLatestData();
        } else {
          console.log("Socket not connected, skipping data fetch");
        }
      }, 1 * 60 * 1000); // 5 phút
    }
  };

  const startConnectionReminder = () => {
    if (!connectionIntervalRef.current) {
      connectionIntervalRef.current = setInterval(async () => {
        const isConnected = await AsyncStorage.getItem("isConnected");
        if (isConnected !== "true") {
          navigationRef.current?.navigate("BandConnection");
          alert("Please connect to a device to continue.");
        }
      }, 5 * 60 * 1000); // 5 phút
    }
  };

  const startNotificationReminder = () => {
    if (!notificationIntervalRef.current) {
      notificationIntervalRef.current = setInterval(() => {
        sendConnectionReminder();
      }, 15 * 60 * 1000); // 15 phút
    }
  };

  useEffect(() => {
    createNotificationChannel();
    requestUserPermission();
    listenForMessages();

    const checkTokensAndConnection = async () => {
      const idToken = await AsyncStorage.getItem("idToken");
      const firebaseIdToken = await AsyncStorage.getItem("firebaseIdToken");
      const isConnected = await AsyncStorage.getItem("isConnected");

      if (!idToken || !firebaseIdToken) {
        navigationRef.current?.navigate("Login");
      } else {
        await initializeSocket();

        if (isConnected === "true") {
          navigationRef.current?.navigate("MainTabs");
          startDataFetching();
        } else {
          navigationRef.current?.navigate("BandConnection");
          startConnectionReminder();
          startNotificationReminder();
        }
      }
    };

    checkTokensAndConnection();

    return () => {
      if (connectionIntervalRef.current) clearInterval(connectionIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      if (notificationIntervalRef.current) clearInterval(notificationIntervalRef.current);
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Navigation />
    </>
  );
}