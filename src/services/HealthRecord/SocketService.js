import io from "socket.io-client";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.serverAddress = null;
    this.callbacks = {};
  }

  async initialize() {
    const savedAddress = await AsyncStorage.getItem("serverAddress");
    const isConnected = await AsyncStorage.getItem("isConnected") === "true";
    if (savedAddress && isConnected && !this.connected) {
      this.connect(savedAddress, {
        onConnected: () => console.log("Reconnected to server"),
        onConnectError: () => console.log("Reconnection failed"),
        onDevicesUpdate: () => {},
        onDataReceived: () => {},
        onDisconnected: () => {},
      });
    }
  }

  connect(serverAddress, callbacks) {
    if (!serverAddress) {
      Alert.alert("Error", "Please enter a server address");
      return false;
    }

    const socketUrl = serverAddress.includes("http")
      ? serverAddress
      : `http://${serverAddress}:3000`;

    this.serverAddress = serverAddress;
    this.callbacks = callbacks;

    if (this.socket && this.connected) {
      return true; // Already connected
    }

    try {
      this.socket = io(socketUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket.on("connect", () => {
        this.connected = true;
        AsyncStorage.setItem("isConnected", "true");
        AsyncStorage.setItem("serverAddress", serverAddress);
        callbacks.onConnected();
        this.socket.emit("getConnectedDevices");
      });

      this.socket.on("connect_error", (error) => {
        this.connected = false;
        callbacks.onConnectError(error);
      });

      this.socket.on("connectedDevices", (devices) => {
        callbacks.onDevicesUpdate(devices || []);
      });

      this.socket.on("latestData", (data) => {
        callbacks.onDataReceived(data);
      });

      this.socket.on("disconnect", () => {
        this.connected = false;
        AsyncStorage.setItem("isConnected", "false");
        callbacks.onDisconnected();
      });

      return true;
    } catch (error) {
      Alert.alert("Error", `Unable to connect: ${error.message}`);
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      AsyncStorage.setItem("isConnected", "false");
    }
  }

  requestLatestData() {
    if (this.socket && this.connected) {
      this.socket.emit("requestLatestData");
    }
  }

  isConnected() {
    return this.connected;
  }

  getSocket() {
    return this.socket;
  }

  getServerAddress() {
    return this.serverAddress;
  }
}

const socketService = new SocketService();
export default socketService;