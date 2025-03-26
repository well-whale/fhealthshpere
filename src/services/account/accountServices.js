
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const checkDeviceConnection = async () => {
  const isConnected = await AsyncStorage.getItem("isConnected");
  return isConnected === "true";
};

export const connectToDevice = async () => {
  // Giả lập kết nối với thiết bị thực tế (cần thay bằng logic thực tế nếu không dùng Socket.IO)
  await AsyncStorage.setItem("isConnected", "true");
};

export const maintainDeviceConnection = async () => {
  // Giả lập duy trì kết nối (cần thay bằng logic thực tế nếu không dùng Socket.IO)
  const isConnected = await checkDeviceConnection();
  if (isConnected) {
    console.log("Maintaining device connection...");
  }
};

export const fetchLatestData = (socket) => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      reject(new Error("Socket is not connected"));
      return;
    }

    // Gửi yêu cầu lấy dữ liệu mới nhất từ server
    socket.emit("requestLatestData");

    // Lắng nghe dữ liệu trả về từ server
    socket.once("latestData", (data) => {
      resolve(data); // Trả về dữ liệu nhận được
    });

    // Timeout nếu không nhận được dữ liệu trong 10 giây
    setTimeout(() => {
      reject(new Error("Timeout waiting for latest data"));
    }, 10000);
  });
};
export const getDetailAccount = async (id) => {
  try {
    return await axios.get(`${process.env.BE_PUBLIC_API_URL}/${id}`);
  } catch (error) {
    console.error(error);
  }
};

export const loginGGFirebase = async (firebaseIdToken) => {
  try {
    console.log(firebaseIdToken);
    const response = await axios({
      method: "POST",
      url: "https://fhealsphere.azurewebsites.net/api/auth/firebase-login",
      data: JSON.stringify(firebaseIdToken),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response:", response.data);
    if (response.data && response.data.token) {
      await AsyncStorage.setItem("Token", response.data.token);
      return response.data;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getProgile = async (id) => {
  try {
    const response = await axios({
      method: "GET",
      url: `https://fhealsphere.azurewebsites.net/api/accounts/${id}`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data) {
      await AsyncStorage.setItem("userName", response.data.fullName);
      return response.data;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
