import React, { useState, useEffect, useRef } from 'react';
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
    Modal
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
import io from 'socket.io-client';

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width - 40, 380);

export default function BloodPressureScreen() {
    // State cho dữ liệu huyết áp và nhịp tim
    const [heartRate, setHeartRate] = useState(0);
    const [systolic, setSystolic] = useState(0);
    const [diastolic, setDiastolic] = useState(0);
    const [measuring, setMeasuring] = useState(false);
    const [progress, setProgress] = useState(0);
    const [heartBeat, setHeartBeat] = useState(false);
    const [pulsePoints, setPulsePoints] = useState(Array(20).fill(50));
    
    // State kết nối server
    const [serverAddress, setServerAddress] = useState('');
    const [serverConnected, setServerConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [history, setHistory] = useState([]);
    const [showConnectionModal, setShowConnectionModal] = useState(false);

    // Animated values
    const animatedScale = useState(new Animated.Value(1))[0];
    const animatedProgress = useState(new Animated.Value(0))[0];
    
    // Mô phỏng đo
    const simulationTimer = useRef(null);
    const simulationStep = useRef(0);
    const simulationData = useRef({
        systolic: 0,
        diastolic: 0,
        pulse: 0
    });

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (socket) socket.disconnect();
            if (simulationTimer.current) clearTimeout(simulationTimer.current);
        };
    }, [socket]);

    // Kết nối tới server
    const connectToServer = () => {
        if (!serverAddress) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ server');
            return;
        }

        const socketUrl = serverAddress.includes('http') ? serverAddress : `http://${serverAddress}:3000`;
        try {
            const newSocket = io(socketUrl, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000
            });

            newSocket.on('connect', () => {
                setServerConnected(true);
                setSocket(newSocket);
                setShowConnectionModal(false);
                Alert.alert('Thành công', 'Đã kết nối đến server');
            });

            newSocket.on('connect_error', (error) => {
                Alert.alert('Lỗi', `Kết nối thất bại: ${error.message}`);
                setServerConnected(false);
            });

            newSocket.on('latestData', (data) => {
                setMeasuring(false);
                setSystolic(data.systolic);
                setDiastolic(data.diastolic);
                setHeartRate(data.pulse);
                setHistory(prev => [{ ...data, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
            });

            newSocket.on('disconnect', () => {
                setServerConnected(false);
                Alert.alert('Mất kết nối', 'Đã mất kết nối đến server');
            });
        } catch (error) {
            Alert.alert('Lỗi', `Không thể kết nối: ${error.message}`);
        }
    };

    // Ngắt kết nối server
    const disconnectFromServer = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setServerConnected(false);
        }
    };
    
    // Mô phỏng quá trình đo huyết áp
    const simulateMeasurement = () => {
        setMeasuring(true);
        setProgress(0);
        animatedProgress.setValue(0);
        simulationStep.current = 0;
        
        // Khởi tạo giá trị ngẫu nhiên trong khoảng bình thường
        simulationData.current = {
            systolic: Math.floor(Math.random() * 40) + 100, // 100-140
            diastolic: Math.floor(Math.random() * 20) + 60, // 60-80
            pulse: Math.floor(Math.random() * 30) + 60 // 60-90
        };
        
        // Bắt đầu mô phỏng đo
        advanceSimulation();
    };
    
    // Tiến trình mô phỏng theo từng bước
    const advanceSimulation = () => {
        simulationStep.current += 1;
        
        // Cập nhật tiến trình
        const newProgress = Math.min(100, simulationStep.current * 5);
        setProgress(newProgress);
        animatedProgress.setValue(newProgress);
        
        // Mô phỏng các bước đo khác nhau
        if (simulationStep.current === 5) {
            // Bắt đầu hiển thị nhịp tim
            setHeartRate(Math.floor(simulationData.current.pulse * 0.7));
        } else if (simulationStep.current === 10) {
            // Bắt đầu hiển thị huyết áp tâm trương
            setDiastolic(Math.floor(simulationData.current.diastolic * 0.8));
        } else if (simulationStep.current === 15) {
            // Cập nhật nhịp tim
            setHeartRate(simulationData.current.pulse);
        } else if (simulationStep.current === 20) {
            // Hoàn thành quá trình đo
            setSystolic(simulationData.current.systolic);
            setDiastolic(simulationData.current.diastolic);
            setHeartRate(simulationData.current.pulse);
            setHistory(prev => [{
                systolic: simulationData.current.systolic,
                diastolic: simulationData.current.diastolic,
                pulse: simulationData.current.pulse,
                timestamp: new Date().toLocaleTimeString()
            }, ...prev].slice(0, 10));
            setMeasuring(false);
            return;
        }
        
        // Lặp lại sau 200ms
        simulationTimer.current = setTimeout(advanceSimulation, 200);
    };

    // Bắt đầu đo
    const startMeasurement = () => {
        if (socket && serverConnected) {
            // Nếu có server, sẽ gửi yêu cầu đến server
            requestLatestData();
        } else {
            // Không có server, mô phỏng quá trình đo
            simulateMeasurement();
        }
    };
    
    // Yêu cầu dữ liệu mới nhất từ server
    const requestLatestData = () => {
        if (!socket || !serverConnected) {
            Alert.alert('Lỗi', 'Vui lòng kết nối server trước');
            return;
        }
        setMeasuring(true);
        setProgress(0);
        animatedProgress.setValue(0);

        Animated.timing(animatedProgress, {
            toValue: 100,
            duration: 5000, // Thời gian đo lâu hơn để thực tế hơn
            useNativeDriver: false,
        }).start(() => {
            socket.emit('requestLatestData');
        });
    };

    // Animation cho nhịp tim
    useEffect(() => {
        let interval;
        if (heartRate > 0) {
            interval = setInterval(() => {
                setHeartBeat(prev => !prev);
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

                setPulsePoints(prev => {
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

    // Cập nhật tiến trình đo
    useEffect(() => {
        const listener = animatedProgress.addListener(({ value }) => {
            setProgress(value);
        });
        return () => animatedProgress.removeListener(listener);
    }, [animatedProgress]);

    // Xác định trạng thái huyết áp
    const getBPStatus = () => {
        if (systolic === 0 || diastolic === 0) return { text: "Đang chờ...", color: "#A0AEC0" };
        if (systolic < 120 && diastolic < 80) return { text: "Bình thường", color: "#48BB78" };
        if (systolic >= 120 && systolic <= 129 && diastolic < 80) return { text: "Huyết áp cao", color: "#ECC94B" };
        if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return { text: "Tăng huyết áp giai đoạn 1", color: "#ED8936" };
        if (systolic >= 140 || diastolic >= 90) return { text: "Tăng huyết áp giai đoạn 2", color: "#E53E3E" };
        if (systolic > 180 || diastolic > 120) return { text: "Tăng huyết áp nghiêm trọng", color: "#C53030" };
        return { text: "Không xác định", color: "#718096" };
    };

    const status = getBPStatus();

    // Tính toán phần trăm cho vòng tròn tiến trình
    const systolicPercentage = systolic > 0 ? (systolic / 200) * 100 : 0;
    const diastolicPercentage = diastolic > 0 ? (diastolic / 120) * 100 : 0;
    const heartRatePercentage = heartRate > 0 ? (heartRate / 150) * 100 : 0;

    // Tạo đường tròn tiến trình
    const createCirclePath = (percentage) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        return circumference - (percentage / 100) * circumference;
    };

    // Tạo sóng nhịp tim
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

    // Hiển thị tim
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

    // Hiển thị vòng tròn tiến trình
    const renderProgressCircle = (value, percentage, color, title) => (
        <View style={styles.circleContainer}>
            <Text style={styles.circleTitle}>{title}</Text>
            <Svg height={100} width={100} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                <Circle
                    cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={createCirclePath(percentage)} rotation="-90" origin="50, 50"
                />
                <SvgText x="50" y="50" textAnchor="middle" fontWeight="bold" fontSize="18" fill="#333" dy="5">
                    {value || "--"}
                </SvgText>
                <SvgText x="50" y="65" textAnchor="middle" fontSize="10" fill="#666">
                    {title === "Nhịp tim" ? "BPM" : "mmHg"}
                </SvgText>
            </Svg>
        </View>
    );

    // Modal kết nối server
    const renderConnectionModal = () => (
        <Modal
            visible={showConnectionModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowConnectionModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Kết nối Server</Text>
                    <TextInput
                        style={styles.input}
                        value={serverAddress}
                        onChangeText={setServerAddress}
                        placeholder="VD: 192.168.1.100"
                        placeholderTextColor="#A0AEC0"
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={styles.modalButtonCancel} 
                            onPress={() => setShowConnectionModal(false)}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.modalButtonConnect} 
                            onPress={connectToServer}
                        >
                            <Text style={styles.buttonText}>Kết nối</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Hiển thị trạng thái kết nối
    const renderConnectionStatus = () => (
        <View style={styles.connectionStatus}>
            {serverConnected ? (
                <View style={styles.connectedIndicator}>
                    <View style={styles.statusDot} />
                    <Text style={styles.connectedText}>Đã kết nối</Text>
                    <TouchableOpacity 
                        style={styles.disconnectButton} 
                        onPress={disconnectFromServer}
                    >
                        <Text style={styles.disconnectText}>Ngắt kết nối</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity 
                    style={styles.connectButton} 
                    onPress={() => setShowConnectionModal(true)}
                >
                    <Text style={styles.connectText}>Kết nối với Server</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Hiển thị lịch sử đo
    const renderHistoryPanel = () => {
        if (history.length === 0) return null;
        return (
            <View style={styles.historyPanel}>
                <Text style={styles.panelTitle}>Lịch sử đo</Text>
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
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>CardioVision</Text>
                        <Text style={styles.subtitle}>Theo dõi tim mạch thời gian thực</Text>
                    </View>

                    {/* Trạng thái kết nối */}
                    {renderConnectionStatus()}
                    {renderConnectionModal()}

                    {/* Hiển thị chính */}
                    <View style={styles.mainDisplay}>
                        <View style={styles.heartContainer}>
                            {renderHeart()}
                        </View>
                        <View style={styles.pulseContainer}>
                            {createPulseWave()}
                        </View>
                    </View>

                    {/* Vòng tròn tiến trình */}
                    <View style={styles.circlesRow}>
                        {renderProgressCircle(systolic, systolicPercentage, '#ff3a5e', 'Tâm thu')}
                        {renderProgressCircle(diastolic, diastolicPercentage, '#3a7fff', 'Tâm trương')}
                    </View>
                    <View style={styles.heartRateContainer}>
                        {renderProgressCircle(heartRate, heartRatePercentage, '#9c3aff', 'Nhịp tim')}
                    </View>

                    {/* Trạng thái */}
                    <View style={[styles.statusContainer, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.text}</Text>
                    </View>

                    {/* Thanh tiến trình */}
                    {measuring && (
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressLabel}>Đang đo...</Text>
                            <View style={styles.progressBarBackground}>
                                <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                        </View>
                    )}

                    {/* Nút đo */}
                    <TouchableOpacity
                        onPress={startMeasurement}
                        disabled={measuring}
                        style={[
                            styles.buttonMeasure,
                            measuring ? styles.buttonDisabled : null
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {measuring ? 'Đang đo...' : 'Bắt đầu đo'}
                        </Text>
                    </TouchableOpacity>

                    {/* Lịch sử đo */}
                    {renderHistoryPanel()}

                    {/* Hướng dẫn */}
                    {!measuring && !systolic && !diastolic && (
                        <View style={styles.instructions}>
                            <Text style={styles.instructionText}>
                                Bấm "Bắt đầu đo" để tiến hành đo huyết áp
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
        backgroundColor: '#EDF2F7',
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
    },
    connectionStatus: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    connectButton: {
        backgroundColor: '#4299E1',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    connectText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    connectedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#48BB78',
        marginRight: 8,
    },
    connectedText: {
        color: '#48BB78',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disconnectButton: {
        backgroundColor: '#FC8181',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    disconnectText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButtonCancel: {
        backgroundColor: '#A0AEC0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '48%',
        alignItems: 'center',
    },
    modalButtonConnect: {
        backgroundColor: '#4299E1',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '48%',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#2D3748',
        backgroundColor: '#F7FAFC',
    },
    mainDisplay: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
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
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    circleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#718096',
        marginBottom: 5,
    },
    heartRateContainer: {
        backgroundColor: '#fff',
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
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    progressContainer: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4299E1',
        marginBottom: 8,
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
    buttonMeasure: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: '#4299E1',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    historyPanel: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    historyScrollView: {
        maxHeight: 150,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    historyTime: {
        fontSize: 14,
        color: '#718096',
    },
    historyValue: {
        fontSize: 14,
        color: '#2D3748',
    },
    instructions: {
        marginTop: 20,
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFF5F5',
        borderRadius: 15,
        width: '100%',
        maxWidth: MAX_WIDTH,
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    instructionText: {
        fontSize: 14,
        color: '#822727',
        textAlign: 'center',
    },
    realtimeBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#48BB78',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    realtimeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    deviceInfoText: {
        fontSize: 14,
        color: '#718096',
    },
    serverInfo: {
        marginTop: 5,
        padding: 10,
        backgroundColor: '#F7FAFC',
        borderRadius: 10,
        width: '100%',
    },
    serverInfoText: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        width: '80%',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    loadingIndicator: {
        height: 80,
    },
    measurementPhase: {
        marginTop: 10,
        fontSize: 14,
        color: '#4299E1',
    }
});
