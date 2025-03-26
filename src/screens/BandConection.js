import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import socketService from "../services/HealthRecord/SocketService";

const BandConnection = () => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const [serverAddress, setServerAddress] = useState("");
  const navigation = useNavigation();

  // Khởi tạo và đồng bộ trạng thái kết nối
  useEffect(() => {
    const initializeConnection = async () => {
      // Khôi phục trạng thái từ AsyncStorage và socketService
      await socketService.initialize(); // Khôi phục kết nối nếu đã lưu trước đó
      const savedAddress = await AsyncStorage.getItem("serverAddress");
      const savedConnected = await AsyncStorage.getItem("isConnected") === "true";

      setServerAddress(savedAddress || socketService.getServerAddress() || "");
      setIsConnected(socketService.isConnected());

      // Nếu AsyncStorage báo đã kết nối nhưng socketService không, thử kết nối lại
      if (savedConnected && !socketService.isConnected() && savedAddress) {
        connectToServerSilently(savedAddress);
      }
    };

    initializeConnection();

    // Lắng nghe sự thay đổi trạng thái từ socketService
    const socket = socketService.getSocket();
    if (socket) {
      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
    }

    return () => {
      // Không cần ngắt kết nối ở đây, để socketService quản lý
    };
  }, []);

  // Hàm kết nối không hiển thị alert (dùng khi khôi phục)
  const connectToServerSilently = (address) => {
    socketService.connect(address, {
      onConnected: () => {
        setIsConnected(true);
        AsyncStorage.setItem("isConnected", "true");
      },
      onConnectError: (error) => {
        setIsConnected(false);
        console.log("Silent connect failed:", error.message);
      },
      onDevicesUpdate: (devices) => {
        AsyncStorage.setItem("connectedDevices", JSON.stringify(devices));
      },
      onDataReceived: async (data) => {
        const healthData = {
          systolic: data.systolic,
          diastolic: data.diastolic,
          pulse: data.pulse,
          timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem("latestHealthData", JSON.stringify(healthData));
      },
      onDisconnected: () => {
        setIsConnected(false);
        AsyncStorage.setItem("isConnected", "false");
      },
    });
  };

  // Hàm kết nối chính với thông báo
  const connectToServer = async () => {
    if (!serverAddress.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ server!");
      return;
    }

    try {
      await AsyncStorage.setItem("serverAddress", serverAddress);

      const success = socketService.connect(serverAddress, {
        onConnected: async () => {
          await AsyncStorage.setItem("isConnected", "true");
          setIsConnected(true);
          Alert.alert("Thành công", "Đã kết nối với server!");
          navigation.navigate("MainTabs");
        },
        onConnectError: (error) => {
          setIsConnected(false);
          Alert.alert("Lỗi", "Không thể kết nối: " + error.message);
        },
        onDevicesUpdate: (devices) => {
          AsyncStorage.setItem("connectedDevices", JSON.stringify(devices));
        },
        onDataReceived: async (data) => {
          const healthData = {
            systolic: data.systolic,
            diastolic: data.diastolic,
            pulse: data.pulse,
            timestamp: new Date().toISOString(),
          };
          await AsyncStorage.setItem("latestHealthData", JSON.stringify(healthData));
          const userData = await AsyncStorage.getItem("user");
          const userID = userData ? JSON.parse(userData).userId : null;
          if (userID) {
            // Giả sử firebaseService đã được định nghĩa
            firebaseService.saveHealthData(healthData, userID, data.brandID || "unknown", data.pulse);
          }
        },
        onDisconnected: async () => {
          setIsConnected(false);
          await AsyncStorage.setItem("isConnected", "false");
          Alert.alert("Thông báo", "Đã ngắt kết nối với server!");
        },
      });

      if (!success) {
        Alert.alert("Lỗi", "Không thể khởi tạo kết nối với server!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối với server: " + error.message);
    }
  };

  // Ngắt kết nối
  const disconnectFromServer = async () => {
    try {
      socketService.disconnect();
      await AsyncStorage.setItem("isConnected", "false");
      setIsConnected(false);
      Alert.alert("Thông báo", "Đã ngắt kết nối với server!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể ngắt kết nối: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết nối thiết bị qua Socket</Text>
      <View style={styles.statusContainer}>
        <Ionicons
          name={isConnected ? "wifi" : "wifi-outline"}
          size={50}
          color={isConnected ? "#4CAF50" : "#999"}
        />
        <Text style={styles.statusText}>
          Trạng thái: {isConnected ? "Đã kết nối" : "Chưa kết nối"}
        </Text>
      </View>

      {!isConnected && (
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ server (e.g., 192.168.1.100)"
          value={serverAddress}
          onChangeText={setServerAddress}
          placeholderTextColor="#999"
        />
      )}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isConnected ? "#ff3b30" : "#4CAF50" },
        ]}
        onPress={isConnected ? disconnectFromServer : connectToServer}
      >
        <Text style={styles.buttonText}>
          {isConnected ? "Ngắt kết nối" : "Kết nối"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  statusText: {
    fontSize: 18,
    color: "#333",
    marginTop: 10,
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#4CAF50",
  },
});

export default BandConnection;