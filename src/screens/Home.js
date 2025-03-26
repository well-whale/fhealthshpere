import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Alert,
  RefreshControl, // Thêm RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";
import { getProgile } from "../services/account/accountServices";
import socketService from "../services/HealthRecord/SocketService";

export default function Home() {
  const [username, setUsername] = useState("");
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [lastReadingTime, setLastReadingTime] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Thêm state cho RefreshControl
  const navigation = useNavigation();

  const popularFeatures = [
    { id: 1, name: "Emergency Contact", icon: "call", color: "#FFE0E0" },
    { id: 2, name: "Limit Value", icon: "build", color: "#E0F0FF" },
    { id: 3, name: "Band Conection", icon: "bluetooth", color: "#E0FFE0" },
  ];

  const translateX1 = useRef(new Animated.Value(0)).current;
  const translateX2 = useRef(new Animated.Value(300)).current;

  const fetchLatestData = async () => {
    const latestData = await AsyncStorage.getItem("latestHealthData");
    if (latestData) {
      const { systolic, diastolic, timestamp } = JSON.parse(latestData);
      setSystolic(systolic);
      setDiastolic(diastolic);
      setLastReadingTime(timestamp);
    }
  };

  // Hàm xử lý khi vuốt xuống để làm mới
  const onRefresh = async () => {
    setRefreshing(true); // Hiển thị vòng xoay làm mới
    try {
      const isConnected = await AsyncStorage.getItem("isConnected");
      setIsConnected(isConnected === "true");

      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const profile = await getProgile(user.userId);
        setUsername(profile.fullName);
      }

      await fetchLatestData();

      
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data.");
    } finally {
      setRefreshing(false); // Ẩn vòng xoay khi hoàn tất
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const isConnected = await AsyncStorage.getItem("isConnected");
        setIsConnected(isConnected === "true");

        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          const profile = await getProgile(user.userId);
          setUsername(profile.fullName);
        }

        await fetchLatestData();
      };

      loadData();

      if (isConnected) {
        const animation1 = Animated.loop(
          Animated.timing(translateX1, {
            toValue: -300,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        const animation2 = Animated.loop(
          Animated.timing(translateX2, {
            toValue: 0,
            duration: 5000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        animation1.start();
        animation2.start();

        return () => {
          animation1.stop();
          animation2.stop();
        };
      }
    }, [isConnected])
  );

  const handleCheckNow = async () => {
    if (!socketService.isConnected()) {
      Alert.alert("Error", "Please connect to a device first");
      navigation.navigate("BandConnection");
      return;
    }

    navigation.navigate("BloodPressure");
    // socketService.requestLatestData();
    // setTimeout(async () => {
    //   await fetchLatestData();
    // }, 6000); // Chờ 6 giây để nhận dữ liệu mới
  };

  const heartbeatPath = "M0,30 L40,30 L50,10 L60,50 L70,10 L80,50 L90,30 L130,30 L140,10 L150,50 L160,10 L170,50 L180,30 L220,30 L230,10 L240,50 L250,10 L260,50 L270,30 L300,30";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ height: 50 }} />
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E45858"]} // Màu vòng xoay phù hợp với theme đỏ
            tintColor="#E45858" // Màu trên iOS
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.bloodPressureCard}>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hello</Text>
                <Text style={styles.username}>{username || "User"}</Text>
              </View>
              <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate("Profile")}>
                <Ionicons name="person-circle-outline" size={40} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.latestReadingTitle}>
              Latest Reading {lastReadingTime ? `(${lastReadingTime})` : ""}
            </Text>
            <View style={styles.readingsContainer}>
              <View style={styles.readingBox}>
                <Text style={styles.measurement}>{systolic || "--"}</Text>
                <Text style={styles.measurementText}>Systolic</Text>
              </View>
              <View style={styles.readingDivider} />
              <View style={styles.readingBox}>
                <Text style={styles.measurement}>{diastolic || "--"}</Text>
                <Text style={styles.measurementText}>Diastolic</Text>
              </View>
            </View>

            <View style={styles.heartbeatLineContainer}>
              {isConnected && (
                <>
                  <Animated.View style={{ position: "absolute", transform: [{ translateX: translateX1 }] }}>
                    <Svg height="60" width="300">
                      <Path d={heartbeatPath} stroke="white" strokeWidth="2" fill="none" />
                    </Svg>
                  </Animated.View>
                  <Animated.View style={{ position: "absolute", transform: [{ translateX: translateX2 }] }}>
                    <Svg height="60" width="300">
                      <Path d={heartbeatPath} stroke="white" strokeWidth="2" fill="none" />
                    </Svg>
                  </Animated.View>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.checkNowButton} onPress={handleCheckNow}>
              <Text style={styles.checkNowText}>Check Now</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(228, 88, 88, 0.91)" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Popular</Text>
            <View style={styles.gridContainer}>
              {popularFeatures.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.featureBox, { backgroundColor: item.color }]}
                  onPress={() => {
                    if (item.name === "Band Conection") {
                      navigation.navigate("BandConnection");
                    } else if (item.name === "Emergency Contact") {
                      navigation.navigate("Personal Detail", { scrollToBottom: true });
                    } else if (item.name === "Limit Value") {
                      navigation.navigate("BP Alert Settings");
                    }
                  }}
                >
                  <View style={styles.featureIconContainer}>
                    <Ionicons name={item.icon} size={28} color="rgba(228, 88, 88, 0.91)" />
                  </View>
                  <Text style={styles.featureText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => navigation.navigate("AllAppointments")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.appointmentCard}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>12</Text>
                <Text style={styles.dayText}>Tue</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentTime}>08:30 AM</Text>
                <Text style={styles.appointmentTitle}>Blood Pressure Check</Text>
                <Text style={styles.appointmentDescription}>Regular monitoring appointment</Text>
              </View>
              <TouchableOpacity style={styles.appointmentActionButton}>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Health Tip</Text>
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={24} color="rgba(228, 88, 88, 0.91)" />
              <Text style={styles.tipText}>
                Regular monitoring of blood pressure helps in early detection of hypertension. Try to measure at the
                same time each day.
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  bloodPressureCard: {
    backgroundColor: "rgba(228, 88, 88, 0.91)",
    borderRadius: 25,
    padding: 20,
    marginTop: -20,
    marginHorizontal: -20,
    paddingTop: 40,
    paddingBottom: 30,
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 16, color: "rgba(255, 255, 255, 0.7)" },
  username: { fontSize: 28, fontWeight: "bold", color: "white", width: "90%" },
  profileIcon: { padding: 5 },
  latestReadingTitle: { fontSize: 16, color: "rgba(255, 255, 255, 0.8)", marginBottom: 10 },
  readingsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  readingBox: { flex: 1, alignItems: "flex-start" },
  readingDivider: { width: 1, height: 50, backgroundColor: "rgba(255, 255, 255, 0.3)", marginHorizontal: 20 },
  measurement: { fontSize: 44, fontWeight: "800", color: "white" },
  measurementText: { fontSize: 16, color: "rgba(255, 255, 255, 0.7)" },
  checkNowButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 30,
  },
  checkNowText: { fontSize: 16, fontWeight: "600", color: "rgba(228, 88, 88, 0.91)", marginRight: 5 },
  section: { marginTop: 25 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 10 },
  viewAllText: { fontSize: 14, color: "rgba(228, 88, 88, 0.91)" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  featureBox: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: { fontSize: 12, textAlign: "center", fontWeight: "500", color: "#444" },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateBox: {
    width: 50,
    height: 60,
    backgroundColor: "rgba(228, 88, 88, 0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  dateText: { fontSize: 20, fontWeight: "bold", color: "rgba(228, 88, 88, 0.91)" },
  dayText: { fontSize: 14, color: "rgba(228, 88, 88, 0.91)" },
  appointmentDetails: { flex: 1 },
  appointmentTime: { fontSize: 14, color: "#888" },
  appointmentTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginVertical: 3 },
  appointmentDescription: { fontSize: 14, color: "#888" },
  appointmentActionButton: { padding: 5 },
  tipCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: { flex: 1, fontSize: 14, color: "#555", marginLeft: 10, lineHeight: 20 },
  heartbeatLineContainer: { height: 60, overflow: "hidden", position: "relative", marginHorizontal: -10 },
});