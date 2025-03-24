import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import Svg, {
  Circle,
  Path,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Polyline,
} from "react-native-svg";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, ref, push, set } from "../firebase/firebaseConfig";

const { width } = Dimensions.get("window");
const MAX_WIDTH = Math.min(width - 40, 380);

export default function BloodPressureScreen() {
  // Blood pressure and heart rate data
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [measuring, setMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartBeat, setHeartBeat] = useState(false);
  const [pulsePoints, setPulsePoints] = useState(Array(20).fill(50));

  // Server connection states
  const [serverAddress, setServerAddress] = useState("");
  const [serverConnected, setServerConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [history, setHistory] = useState([]);
  const [brandID, setBrandID] = useState("");
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [userID, setUserID] = useState("");
  const [connectedDevices, setConnectedDevices] = useState([]);

  // Animated values
  const animatedScale = useState(new Animated.Value(1))[0];
  const animatedProgress = useState(new Animated.Value(0))[0];

  // Simulation references
  const simulationTimer = useRef(null);
  const simulationStep = useRef(0);
  const simulationData = useRef({
    systolic: 0,
    diastolic: 0,
    pulse: 0,
  });

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
      if (simulationTimer.current) clearTimeout(simulationTimer.current);
    };
  }, [socket]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setUserID(user.userId);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // Connect to server
  const connectToServer = () => {
    if (!serverAddress) {
      Alert.alert("Error", "Please enter a server address");
      return;
    }

    const socketUrl = serverAddress.includes("http")
      ? serverAddress
      : `http://${serverAddress}:3000`;
    
    try {
      const newSocket = io(socketUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        setServerConnected(true);
        setSocket(newSocket);
        setShowConnectionModal(false);
        Alert.alert("Success", "Connected to server");
        
        // Request available devices
        newSocket.emit("getConnectedDevices");
      });

      newSocket.on("connect_error", (error) => {
        Alert.alert("Error", `Connection failed: ${error.message}`);
        setServerConnected(false);
      });

      newSocket.on("connectedDevices", (devices) => {
        setConnectedDevices(devices || []);
      });

      newSocket.on("latestData", (data) => {
        setMeasuring(false);
        setSystolic(data.systolic);
        setDiastolic(data.diastolic);
        setHeartRate(data.pulse);
        setBrandID(data.brandID);
        
        const newMeasurement = {
          ...data,
          timestamp: new Date().toLocaleTimeString(),
          userId: userID
        };
        
        setHistory((prev) => [newMeasurement, ...prev].slice(0, 10));
        
        // Save to Firebase after receiving data
        saveDataToFirebase(newMeasurement);
      });

      newSocket.on("disconnect", () => {
        setServerConnected(false);
        setConnectedDevices([]);
        Alert.alert("Disconnected", "Lost connection to server");
      });
    } catch (error) {
      Alert.alert("Error", `Unable to connect: ${error.message}`);
    }
  };

  // Disconnect from server
  const disconnectFromServer = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setServerConnected(false);
      setConnectedDevices([]);
    }
  };

  // Simulate blood pressure measurement
  const simulateMeasurement = () => {
    setMeasuring(true);
    setProgress(0);
    animatedProgress.setValue(0);
    simulationStep.current = 0;

    // Initialize random values within normal range
    simulationData.current = {
      systolic: Math.floor(Math.random() * 40) + 100, // 100-140
      diastolic: Math.floor(Math.random() * 20) + 60, // 60-80
      pulse: Math.floor(Math.random() * 30) + 60, // 60-90
    };

    // Start simulation
    advanceSimulation();
  };

  // Save data to Firebase
  const saveDataToFirebase = async (measurementData) => {
    try {
      const newData = {
        BandId: measurementData.brandID || brandID || 1,
        GhiChu: "user" + userID,
        PatientId: parseInt(userID) || 0,
        RecordMetricItems: {
          0: {
            HealthRecordId: 0,
            MetricId: 1,
            RecordId: 0,
            Type: "string",
            Value: measurementData.systolic.toString()
          },
          1: {
            HealthRecordId: 0,
            MetricId: 2,
            RecordId: 0,
            Type: "string",
            Value: measurementData.diastolic.toString()
          },
          2: {
            HealthRecordId: 0,
            MetricId: 3,
            RecordId: 0,
            Type: "string",
            Value: (measurementData.pulse || heartRate).toString()
          }
        }
      };
      
      const newPostKey = push(ref(db, "healthRecords")).key;
      console.log(newPostKey)
      console.log(newData)

      await set(ref(db, `healthRecords/${newPostKey}`), newData);
      console.log("Data saved successfully to Firebase with key:", newPostKey);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      Alert.alert("Error", "Could not save data to Firebase");
    }
  };
  // Advance simulation step by step
  const advanceSimulation = () => {
    simulationStep.current += 1;

    // Update progress
    const newProgress = Math.min(100, simulationStep.current * 5);
    setProgress(newProgress);
    animatedProgress.setValue(newProgress);

    // Simulate different measurement phases
    if (simulationStep.current === 5) {
      // Start showing heart rate
      setHeartRate(Math.floor(simulationData.current.pulse * 0.7));
    } else if (simulationStep.current === 10) {
      // Start showing diastolic pressure
      setDiastolic(Math.floor(simulationData.current.diastolic * 0.8));
    } else if (simulationStep.current === 15) {
      // Update heart rate
      setHeartRate(simulationData.current.pulse);
    } else if (simulationStep.current === 20) {
      // Complete measurement
      setSystolic(simulationData.current.systolic);
      setDiastolic(simulationData.current.diastolic);
      setHeartRate(simulationData.current.pulse);
      
      const newMeasurement = {
        systolic: simulationData.current.systolic,
        diastolic: simulationData.current.diastolic,
        pulse: simulationData.current.pulse,
        timestamp: new Date().toLocaleTimeString(),
        userId: userID
      };
      
      setHistory((prev) => [newMeasurement, ...prev].slice(0, 10));
      setMeasuring(false);
      
      // Save to Firebase after simulation
      saveDataToFirebase(newMeasurement);
      return;
    }

    // Repeat after 200ms
    simulationTimer.current = setTimeout(advanceSimulation, 200);
  };

  // Start measurement
  const startMeasurement = () => {
    if (socket && serverConnected) {
      // If connected to server, request data
      requestLatestData();
    } else {
      // Otherwise, simulate measurement
      simulateMeasurement();
    }
  };

  // const startMeasurement = () => {
  //   if (socket && serverConnected) {
  //     // If connected to server, request data
  //     requestLatestData();
  //   } else {
  //     // Instead of simulating measurement, show a connection message
  //     Alert.alert(
  //       "No Connection", 
  //       "Please connect to a server to get real measurement data.",
  //       [
  //         { 
  //           text: "Connect", 
  //           onPress: () => setShowConnectionModal(true) 
  //         },
  //         { 
  //           text: "Cancel", 
  //           style: "cancel" 
  //         }
  //       ]
  //     );
  //   }
  // };

  // Request latest data from server
  const requestLatestData = () => {
    if (!socket || !serverConnected) {
      Alert.alert("Error", "Please connect to server first");
      return;
    }
    setMeasuring(true);
    setProgress(0);
    animatedProgress.setValue(0);

    Animated.timing(animatedProgress, {
      toValue: 100,
      duration: 5000,
      useNativeDriver: false,
    }).start(() => {
      socket.emit("requestLatestData");
    });
  };

  // Heart beat animation
  useEffect(() => {
    let interval;
    if (heartRate > 0) {
      interval = setInterval(() => {
        setHeartBeat((prev) => !prev);
        Animated.sequence([
          Animated.timing(animatedScale, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(animatedScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.cubic),
          }),
        ]).start();

        setPulsePoints((prev) => {
          const newPoints = [...prev];
          newPoints.shift();
          const baseValue = 50;
          const randomFactor = heartBeat ? 30 : 10;
          const newValue = baseValue + Math.random() * randomFactor;
          newPoints.push(newValue);
          return newPoints;
        });
      }, 60000 / heartRate / 2);
    }
    return () => clearInterval(interval);
  }, [heartRate, heartBeat, animatedScale]);

  // Update measurement progress
  useEffect(() => {
    const listener = animatedProgress.addListener(({ value }) => {
      setProgress(value);
    });
    return () => animatedProgress.removeListener(listener);
  }, [animatedProgress]);

  // Determine blood pressure status
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

  // Calculate percentages for progress circles
  const systolicPercentage = systolic > 0 ? (systolic / 200) * 100 : 0;
  const diastolicPercentage = diastolic > 0 ? (diastolic / 120) * 100 : 0;
  const heartRatePercentage = heartRate > 0 ? (heartRate / 150) * 100 : 0;

  // Create circle progress path
  const createCirclePath = (percentage) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    return circumference - (percentage / 100) * circumference;
  };

  // Create pulse wave visualization
  const createPulseWave = () => {
    const height = 80;
    const width = MAX_WIDTH - 40;
    const padding = 10;
    const points = pulsePoints
      .map((point, index) => {
        const x =
          (index / (pulsePoints.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((point / 100) * (height - padding * 2) + padding);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <Svg
        width="100%"
        height={80}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#ff3a5e" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#ff3a5e" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Polyline
          points={points}
          fill="none"
          stroke="url(#pulseGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };

  // Render heart
  const renderHeart = () => (
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      <Svg width={70} height={70} viewBox="0 0 100 100">
        <Path
          d="M50,30 C35,10 0,10 0,40 C0,65 50,90 50,90 C50,90 100,65 100,40 C100,10 65,10 50,30 Z"
          fill={heartBeat ? "#ff3a5e" : "#ff6b8b"}
        />
      </Svg>
      <View style={styles.heartRateText}>
        <Text style={styles.heartRateValue}>{heartRate || "--"}</Text>
      </View>
    </Animated.View>
  );

  // Render progress circle
  const renderProgressCircle = (value, percentage, color, title) => (
    <View style={styles.circleContainer}>
      <Text style={styles.circleTitle}>{title}</Text>
      <Svg height={80} width={80} viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="8"
        />
        <Circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 40}
          strokeDashoffset={createCirclePath(percentage)}
          rotation="-90"
          origin="50, 50"
        />
        <SvgText
          x="50"
          y="50"
          textAnchor="middle"
          fontWeight="bold"
          fontSize="18"
          fill="#333"
          dy="5"
        >
          {value || "--"}
        </SvgText>
        <SvgText x="50" y="65" textAnchor="middle" fontSize="10" fill="#666">
          {title === "Pulse" ? "BPM" : "mmHg"}
        </SvgText>
      </Svg>
    </View>
  );

  // Render server connection modal
  const renderConnectionModal = () => (
    <Modal
      visible={showConnectionModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowConnectionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Connect to Server</Text>
          <TextInput
            style={styles.input}
            value={serverAddress}
            onChangeText={setServerAddress}
            placeholder="e.g. 192.168.1.100"
            placeholderTextColor="#A0AEC0"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setShowConnectionModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonConnect}
              onPress={connectToServer}
            >
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render connected devices panel
  const renderConnectedDevices = () => (
    <View style={styles.devicesPanel}>
      <Text style={styles.panelTitle}>Connected Devices</Text>
      {serverConnected ? (
        <>
          {connectedDevices.length > 0 ? (
            <ScrollView style={styles.devicesList}>
              {connectedDevices.map((device, index) => (
                <View key={index} style={styles.deviceItem}>
                  <View style={styles.deviceIcon} />
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name || "Device " + (index + 1)}</Text>
                    <Text style={styles.deviceId}>{device.id || "ID: Unknown"}</Text>
                  </View>
                  <View style={styles.deviceStatus}>
                    <View style={styles.statusIndicator} />
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noDevices}>
              <Text style={styles.noDevicesText}>No devices connected</Text>
            </View>
          )}
          <View style={styles.serverInfo}>
            <Text style={styles.serverInfoText}>
              Connected to: {serverAddress}
            </Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnectFromServer}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => setShowConnectionModal(true)}
        >
          <Text style={styles.connectText}>Connect to Server</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render measurement history panel
  const renderHistoryPanel = () => (
    <View style={styles.historyPanel}>
      <Text style={styles.panelTitle}>Measurement History</Text>
      {history.length > 0 ? (
        <ScrollView style={styles.historyScrollView}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyTime}>{item.timestamp}</Text>
              <Text style={styles.historyValue}>
                {item.systolic}/{item.diastolic} mmHg, {item.pulse} BPM
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noHistory}>
          <Text style={styles.noHistoryText}>No measurement history</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          {/* Main content area */}
          <View style={styles.mainContent}>
            {/* Left side - Connected devices */}
            <View style={styles.leftPanel}>
              {renderConnectedDevices()}
              <View style={styles.pulseContainer}>
                {renderHeart()}
                {createPulseWave()}
              </View>
            </View>
            
            {/* Right side - Measurements */}
            <View style={styles.rightPanel}>
              {/* Status indicator */}
              <View
                style={[styles.statusContainer, { backgroundColor: status.color }]}
              >
                <Text style={styles.statusText}>{status.text}</Text>
              </View>
              
              {/* Measurement circles */}
              <View style={styles.measurementsContainer}>
                {renderProgressCircle(
                  systolic,
                  systolicPercentage,
                  "#ff3a5e",
                  "Systolic"
                )}
                {renderProgressCircle(
                  diastolic,
                  diastolicPercentage,
                  "#3a7fff",
                  "Diastolic"
                )}
                {renderProgressCircle(
                  heartRate,
                  heartRatePercentage,
                  "#9c3aff",
                  "Pulse"
                )}
              </View>
            </View>
          </View>
          
          {/* Progress indicator */}
          {measuring && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Measuring...</Text>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
                />
              </View>
            </View>
          )}
          
          {/* Measurement button */}
          <TouchableOpacity
            onPress={startMeasurement}
            disabled={measuring}
            style={[
              styles.buttonMeasure,
              measuring ? styles.buttonDisabled : null,
            ]}
          >
            <Text style={styles.buttonText}>
              {measuring ? "Measuring..." : "Start Measurement"}
            </Text>
          </TouchableOpacity>
          
          {/* History panel */}
          {renderHistoryPanel()}
          
          {/* Connection modal */}
          {renderConnectionModal()}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
    textAlign: "center",
  },
  mainContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  leftPanel: {
    flex: 1,
    marginRight: 8,
  },
  rightPanel: {
    flex: 1,
    marginLeft: 8,
  },
  devicesPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  devicesList: {
    maxHeight: 120,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  deviceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4FD1C5",
    marginRight: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
  },
  deviceId: {
    fontSize: 12,
    color: "#718096",
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#48BB78",
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#48BB78",
  },
  noDevices: {
    padding: 16,
    alignItems: "center",
  },
  noDevicesText: {
    color: "#A0AEC0",
    fontSize: 14,
  },
  serverInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#EDF2F7",
    borderRadius: 8,
  },
  serverInfoText: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 8,
  },
  pulseContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  heartRateText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  measurementsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  circleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  circleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 8,
  },
  progressContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4299E1",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#EBF8FF",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4299E1",
  },
  buttonMeasure: {
    backgroundColor: "#4299E1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#A0AEC0",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  historyPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyScrollView: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  historyTime: {
    fontSize: 14,
    color: "#718096",
  },
  historyValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3748",
  },
  noHistory: {
    padding: 16,
    alignItems: "center",
  },
  noHistoryText: {
    color: "#A0AEC0",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#2D3748",
    backgroundColor: "#F7FAFC",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButtonCancel: {
    backgroundColor: "#A0AEC0",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  modalButtonConnect: {
    backgroundColor: "#4299E1",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  connectButton: {
    backgroundColor: "#4299E1",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  connectText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disconnectButton: {
    backgroundColor: "#FC8181",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  disconnectText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 12,
  },
});