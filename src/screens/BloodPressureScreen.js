import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import Svg, {
    Circle,
    Path,
    Text as SvgText,
    Defs,
    LinearGradient,
    Stop,
    Polyline,
} from 'react-native-svg';
import { BleManager } from 'react-native-ble-plx';
import { StatusBar } from 'expo-status-bar';
// import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width - 40, 380);

// Initialize Bluetooth manager
const bleManager = new BleManager();

const BloodPressureScreen = () => {
    // State for heart rate and blood pressure values
    const [heartRate, setHeartRate] = useState(75);
    const [systolic, setSystolic] = useState(120);
    const [diastolic, setDiastolic] = useState(80);
    const [measuring, setMeasuring] = useState(false);
    const [progress, setProgress] = useState(0);
    const [heartBeat, setHeartBeat] = useState(false);
    const [showInfo, setShowInfo] = useState(null);
    const [pulsePoints, setPulsePoints] = useState(Array(20).fill(50));
    const [isConnected, setIsConnected] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [deviceName, setDeviceName] = useState('No Device');

    // Animated values
    const animatedScale = useState(new Animated.Value(1))[0];
    const animatedProgress = useState(new Animated.Value(0))[0];
    const animatedHeartRate = useState(new Animated.Value(0))[0];
    const animatedSystolic = useState(new Animated.Value(0))[0];
    const animatedDiastolic = useState(new Animated.Value(0))[0];

    // Request Bluetooth permissions
    //   const requestBluetoothPermissions = async () => {
    //     if (Platform.OS === 'android') {
    //       const bluetoothScanPermission = await request(
    //         PERMISSIONS.ANDROID.BLUETOOTH_SCAN
    //       );
    //       const bluetoothConnectPermission = await request(
    //         PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
    //       );
    //       const fineLocationPermission = await request(
    //         PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    //       );

    //       return (
    //         bluetoothScanPermission === RESULTS.GRANTED &&
    //         bluetoothConnectPermission === RESULTS.GRANTED &&
    //         fineLocationPermission === RESULTS.GRANTED
    //       );
    //     } else if (Platform.OS === 'ios') {
    //       const bluetoothPermission = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    //       return bluetoothPermission === RESULTS.GRANTED;
    //     }
    //     return false;
    //   };

    // Scan for Bluetooth devices
    //   const scanForDevices = async () => {
    //     const hasPermission = await requestBluetoothPermissions();

    //     if (!hasPermission) {
    //       Alert.alert('Permission Error', 'Bluetooth permissions are required');
    //       return;
    //     }

    //     if (scanning) return;

    //     setScanning(true);

    //     // Stop scanning after 10 seconds
    //     setTimeout(() => {
    //       bleManager.stopDeviceScan();
    //       setScanning(false);
    //     }, 10000);

    //     try {
    //       bleManager.startDeviceScan(null, null, (error, device) => {
    //         if (error) {
    //           console.error('Scan error:', error);
    //           setScanning(false);
    //           return;
    //         }

    //         // Look for blood pressure monitor devices
    //         // This is a simplified example - real implementation would filter by specific services
    //         if (device.name && (
    //             device.name.toLowerCase().includes('bp') || 
    //             device.name.toLowerCase().includes('blood') || 
    //             device.name.toLowerCase().includes('pressure') ||
    //             device.name.toLowerCase().includes('heart')
    //           )) {
    //           bleManager.stopDeviceScan();
    //           connectToDevice(device);
    //         }
    //       });
    //     } catch (error) {
    //       console.error('Error starting scan:', error);
    //       setScanning(false);
    //     }
    //   };

    // Connect to a Bluetooth device
    //   const connectToDevice = async (device) => {
    //     try {
    //       const connectedDevice = await device.connect();
    //       setDeviceName(device.name || 'Unknown Device');
    //       setIsConnected(true);
    //       setScanning(false);

    //       Alert.alert('Connected', `Connected to ${device.name || 'device'}`);

    //       // In a real app, you would discover services and characteristics here
    //       // and set up listeners for incoming data
    //     } catch (error) {
    //       console.error('Connection error:', error);
    //       setIsConnected(false);
    //       Alert.alert('Connection Failed', 'Could not connect to device');
    //     }
    //   };

    // Disconnect from Bluetooth device
    //   const disconnectDevice = async () => {
    //     if (isConnected) {
    //       try {
    //         await bleManager.cancelDeviceConnection(deviceName);
    //         setIsConnected(false);
    //         setDeviceName('No Device');
    //       } catch (error) {
    //         console.error('Disconnect error:', error);
    //       }
    //     }
    //   };

    // Cleanup Bluetooth manager on unmount
    useEffect(() => {
        return () => {
            bleManager.destroy();
        };
    }, []);

    // Handle measurement process
    const startMeasurement = () => {
        if (measuring) return;

        setMeasuring(true);
        setProgress(0);
        animatedProgress.setValue(0);

        // Reset values
        setSystolic(0);
        setDiastolic(0);
        setHeartRate(0);

        Animated.timing(animatedProgress, {
            toValue: 100,
            duration: 10000,
            useNativeDriver: false,
        }).start();
    };

    // Animation for heartbeat and pulse wave
    useEffect(() => {
        let interval;
        if (measuring || heartRate > 0) {
            interval = setInterval(() => {
                setHeartBeat(prev => !prev);

                // Start heart beat animation
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

                // Update pulse wave animation data
                setPulsePoints(prev => {
                    const newPoints = [...prev];
                    newPoints.shift();

                    // Create some variation in the heart rate line
                    const baseValue = heartRate > 0 ? 50 : 20;
                    const randomFactor = heartBeat ? 30 : 10;
                    const newValue = baseValue + Math.random() * randomFactor;

                    newPoints.push(newValue);
                    return newPoints;
                });
            }, heartRate > 0 ? 60000 / heartRate / 2 : 1000);
        }

        return () => clearInterval(interval);
    }, [measuring, heartBeat, heartRate, animatedScale]);

    // Simulation of measurement process
    useEffect(() => {
        // Listen to animated progress value changes
        const listener = animatedProgress.addListener(({ value }) => {
            setProgress(value);

            // Update values gradually as the measurement progresses
            if (value >= 30 && value < 31 && heartRate === 0) {
                const newHeartRate = Math.floor(65 + Math.random() * 20);
                setHeartRate(newHeartRate);
                Animated.timing(animatedHeartRate, {
                    toValue: newHeartRate,
                    duration: 500,
                    useNativeDriver: false,
                }).start();
            }

            if (value >= 70 && value < 71 && diastolic === 0) {
                const newDiastolic = Math.floor(75 + Math.random() * 15);
                setDiastolic(newDiastolic);
                Animated.timing(animatedDiastolic, {
                    toValue: newDiastolic,
                    duration: 500,
                    useNativeDriver: false,
                }).start();
            }

            if (value >= 99 && systolic === 0) {
                const newSystolic = Math.floor(110 + Math.random() * 30);
                setSystolic(newSystolic);
                Animated.timing(animatedSystolic, {
                    toValue: newSystolic,
                    duration: 500,
                    useNativeDriver: false,
                }).start();
                setMeasuring(false);
            }
        });

        return () => {
            animatedProgress.removeListener(listener);
        };
    }, [animatedProgress, heartRate, systolic, diastolic, animatedHeartRate, animatedSystolic, animatedDiastolic]);

    // Calculate status based on blood pressure readings
    const getBPStatus = () => {
        if (systolic === 0 || diastolic === 0) return { text: "Waiting...", color: "#A0AEC0" };

        if (systolic < 120 && diastolic < 80)
            return { text: "Normal", color: "#48BB78" };
        else if ((systolic >= 120 && systolic <= 129) && diastolic < 80)
            return { text: "Elevated", color: "#ECC94B" };
        else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89))
            return { text: "Stage 1 Hypertension", color: "#ED8936" };
        else if (systolic >= 140 || diastolic >= 90)
            return { text: "Stage 2 Hypertension", color: "#E53E3E" };
        else if (systolic > 180 || diastolic > 120)
            return { text: "Hypertensive Crisis", color: "#C53030" };

        return { text: "Unknown", color: "#718096" };
    };

    const status = getBPStatus();

    // Calculate circular progress percentages
    const systolicPercentage = systolic > 0 ? (systolic / 200) * 100 : 0;
    const diastolicPercentage = diastolic > 0 ? (diastolic / 120) * 100 : 0;
    const heartRatePercentage = heartRate > 0 ? (heartRate / 150) * 100 : 0;

    // Create SVG path for progress circles
    const createCirclePath = (percentage) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        return offset;
    };

    // Create custom heart rate visualization
    const createPulseWave = () => {
        const height = 80;
        const width = MAX_WIDTH - 40;
        const padding = 10;
        const points = pulsePoints.map((point, index) => {
            const x = (index / (pulsePoints.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((point / 100) * (height - padding * 2) + padding);
            return `${x},${y}`;
        }).join(' ');

        return (
            <Svg width="100%" height={80} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
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

    // Information tooltips content
    const infoContent = {
        systolic: "Systolic pressure is the force exerted by blood on the artery walls when the heart contracts. It's the top number in a blood pressure reading.",
        diastolic: "Diastolic pressure is the force exerted by blood on the artery walls when the heart is at rest between beats. It's the bottom number in a blood pressure reading.",
        heartrate: "Heart rate is the number of times your heart beats per minute. A normal resting heart rate is typically between 60-100 beats per minute.",
    };

    // Render heart SVG
    const renderHeart = () => (
        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
                <Path
                    d="M50,30 C35,10 0,10 0,40 C0,65 50,90 50,90 C50,90 100,65 100,40 C100,10 65,10 50,30 Z"
                    fill={heartBeat ? '#ff3a5e' : '#ff6b8b'}
                />
            </Svg>
            <View style={styles.heartRateText}>
                <Text style={styles.heartRateValue}>{heartRate || "--"}</Text>
            </View>
        </Animated.View>
    );

    // Render circular progress indicator
    const renderProgressCircle = (value, percentage, color, title, infoKey) => (
        <View style={styles.circleContainer}>
            <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setShowInfo(showInfo === infoKey ? null : infoKey)}
            >
                <Text style={styles.infoButtonText}>i</Text>
            </TouchableOpacity>

            {showInfo === infoKey && (
                <View style={styles.infoTooltip}>
                    <Text style={styles.infoTooltipText}>{infoContent[infoKey]}</Text>
                </View>
            )}

            <Text style={styles.circleTitle}>{title}</Text>
            <View style={styles.circleWrapper}>
                <Svg height={100} width={100} viewBox="0 0 100 100">
                    {/* Background circle */}
                    <Circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx="50" cy="50" r="40"
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
                        x="50" y="50"
                        textAnchor="middle"
                        fontWeight="bold"
                        fontSize="18"
                        fill="#333"
                        dy="5"
                    >
                        {value || "--"}
                    </SvgText>
                    <SvgText
                        x="50" y="65"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#666"
                    >
                        {title === "Systolic" || title === "Diastolic" ? "mmHg" : "BPM"}
                    </SvgText>
                </Svg>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>CardioVision</Text>
                        <Text style={styles.subtitle}>Interactive Heart Monitoring System</Text>
                    </View>

                    {/* Main display container */}
                    <View style={styles.mainDisplay}>


                        {/* Custom Heart Rate Visualization */}
                        <View style={styles.pulseContainer}>
                            {createPulseWave()}
                        </View>
                    </View>

                    {/* Circular Progress Indicators */}
                    <View style={styles.circlesRow}>
                        {renderProgressCircle(
                            systolic,
                            systolicPercentage,
                            '#ff3a5e',
                            'Systolic',
                            'systolic'
                        )}

                        {renderProgressCircle(
                            diastolic,
                            diastolicPercentage,
                            '#3a7fff',
                            'Diastolic',
                            'diastolic'
                        )}
                    </View>

                    {/* Heart Rate */}
                    <View style={styles.heartRateContainer}>
                        {renderProgressCircle(
                            heartRate,
                            heartRatePercentage,
                            '#9c3aff',
                            'Heart Rate',
                            'heartrate'
                        )}
                    </View>

                    {/* Status */}
                    <View style={[styles.statusContainer, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.text}</Text>
                    </View>

                    {/* Progress Bar */}
                    {measuring && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressLabelContainer}>
                                <Text style={styles.progressLabel}>Measuring</Text>
                                <Text style={styles.progressValue}>{Math.floor(progress)}%</Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${progress}%` }
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    {/* Bluetooth Status */}
                    <View style={styles.bluetoothStatus}>
                        <Text style={styles.deviceText}>
                            {isConnected ? `Connected to: ${deviceName}` : 'Not connected'}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            onPress={startMeasurement}
                            disabled={measuring}
                            style={[
                                styles.button,
                                measuring ? styles.buttonDisabled : styles.buttonMeasure
                            ]}
                        >
                            <Text style={styles.buttonText}>
                                {measuring ? 'Measuring...' : 'Start Measurement'}
                            </Text>
                        </TouchableOpacity>

                        {/* <TouchableOpacity
          onPress={isConnected ? disconnectDevice : scanForDevices}
          style={[
            styles.button,
            isConnected ? styles.buttonDisconnect : styles.buttonConnect,
            scanning ? styles.buttonDisabled : null
          ]}
          disabled={scanning}
        >
          <Text style={styles.buttonText}>
            {scanning 
              ? 'Scanning...' 
              : isConnected 
                ? 'Disconnect' 
                : 'Connect Bluetooth Device'}
          </Text>
        </TouchableOpacity> */}
                    </View>

                    {/* Instructions */}
                    {!measuring && !heartRate && (
                        <View style={styles.instructions}>
                            <Text style={styles.instructionText}>
                                Tap the button above to start monitoring your vital signs
                            </Text>
                            <Text style={styles.instructionText}>
                                Place your finger on the sensor for accurate readings
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>


    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        // backgroundColor: "rgba(228, 88, 88, 0.91)",
        backgroundColor: "rgb(255, 255, 255)",

    },
    container: {
        flex: 1,
        backgroundColor: '#EDF2F7',
        padding: 20,
        alignItems: 'center',
        paddingTop: 40

    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4A5568',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
    },
    mainDisplay: {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: MAX_WIDTH,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    heartContainer: {
        alignItems: 'center',
        marginVertical: 15,
    },
    heartRateText: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartRateValue: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },
    pulseContainer: {
        height: 80,
        backgroundColor: '#F7FAFC',
        borderRadius: 10,
        padding: 5,
        overflow: 'hidden',
    },
    circlesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: MAX_WIDTH,
        marginBottom: 15,
    },
    circleContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        position: 'relative',
    },
    circleTitle: {
        color: '#718096',
        fontWeight: '600',
        marginBottom: 5,
    },
    circleWrapper: {
        position: 'relative',
    },
    infoButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    infoButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#718096',
    },
    infoTooltip: {
        position: 'absolute',
        top: -70,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 2,
    },
    infoTooltipText: {
        fontSize: 12,
        color: '#4A5568',
    },
    heartRateContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        width: '100%',
        maxWidth: MAX_WIDTH,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    statusContainer: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    progressContainer: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    progressLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4299E1',
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4299E1',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#EBF8FF',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4299E1',
    },
    bluetoothStatus: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    deviceText: {
        color: '#4A5568',
        fontWeight: '500',
    },
    buttonsContainer: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        gap: 10,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonMeasure: {
        backgroundColor: '#4299E1',
    },
    buttonConnect: {
        backgroundColor: '#48BB78',
    },
    buttonDisconnect: {
        backgroundColor: '#ED8936',
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    instructions: {
        marginTop: 15,
        alignItems: 'center',
    },
    instructionText: {
        color: '#718096',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
    },
});

export default BloodPressureScreen;