import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Menu Item Component - Tạo thành phần MenuItem riêng để tái sử dụng
const MenuItem = ({ icon, text, rightElement, onPress, isActive = false }) => (
    <TouchableOpacity
        style={[styles.menuItem, isActive && styles.activeItem]}
        onPress={onPress}
        disabled={!onPress}
    >
        <Ionicons name={icon} size={24} color={isActive ? "#007AFF" : "#333"} />
        <Text style={[
            styles.menuText,
            isActive && styles.boldText,
            isActive && styles.activeText
        ]}>
            {text}
        </Text>
        {rightElement}
    </TouchableOpacity>
);

// Section Header Component - Tạo thành phần SectionHeader riêng
const SectionHeader = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

export default function Profile() {
    const navigation = useNavigation();
    const [isWeightMonitoring, setIsWeightMonitoring] = useState(false);
    const [expandedBPMonitor, setExpandedBPMonitor] = useState(true);

    // Chuẩn bị các thành phần bên phải cho mỗi mục
    const forwardIcon = <Ionicons name="chevron-forward-outline" size={20} color="#999" />;
    const downIcon = <Ionicons name="chevron-down-outline" size={20} color="#007AFF" />;
    const toggleSwitch = (
        <Switch
            value={isWeightMonitoring}
            onValueChange={setIsWeightMonitoring}
            trackColor={{ false: "#ccc", true: "#007AFF50" }}
            thumbColor={isWeightMonitoring ? "#007AFF" : "#f4f3f4"}
        />
    );
    const route = useRoute();
    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (route.params?.scrollToBottom) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 500); // Đợi một chút để đảm bảo nội dung đã tải xong
        }
    }, [route.params]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <ScrollView
                    style={styles.container_content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Section: More */}
                    {/* <SectionHeader title="More" /> */}

                    <MenuItem
                        icon="person-outline"
                        text="Personal Details"
                        onPress={() => navigation.navigate('Personal Detail')}
                    />

                    <MenuItem
                        icon="bar-chart-outline"
                        text="Limit Values"
                        // rightElement={forwardIcon}
                        onPress={() => navigation.navigate('BP Alert Settings')}
                    />

                    <MenuItem
                        icon="time-outline"
                        text="Measurement Reminder"
                        // rightElement={forwardIcon}
                        onPress={() => navigation.navigate('Set Measurement Reminder')}
                    />

                    {/* <MenuItem 
                        icon="fitness-outline" 
                        text="Weight Monitoring" 
                        rightElement={toggleSwitch}
                    />

                    <MenuItem 
                        icon="pulse-outline" 
                        text="BP Monitor" 
                        rightElement={downIcon}
                        isActive={expandedBPMonitor}
                        onPress={() => setExpandedBPMonitor(!expandedBPMonitor)} 
                    /> */}

                    {/* BP Monitor Expanded Content - Nếu đã mở rộng */}
                    {/* {expandedBPMonitor && (
                        <View style={styles.expandedContent}>
                            <MenuItem 
                                icon="analytics-outline" 
                                text="Connection Settings" 
                                onPress={() => navigation.navigate('BPSettings')} 
                            />
                            <MenuItem 
                                icon="time-outline" 
                                text="Measurement History" 
                                onPress={() => navigation.navigate('BPHistory')} 
                            />
                        </View>
                    )} */}

                    {/* Section: Help */}
                    <SectionHeader title="Help" />

                    <MenuItem
                        icon="document-text-outline"
                        text="FAQ's"
                        onPress={() => navigation.navigate('FAQs')}
                    />

                    <MenuItem
                        icon="help-circle-outline"
                        text="Support"
                        onPress={() => navigation.navigate('Support')}
                    />

                    <MenuItem
                        icon="chatbubble-ellipses-outline"
                        text="Feedback"
                        onPress={() => navigation.navigate('Feedback')}
                    />

                    {/* Section: About */}
                    <SectionHeader title="About" />

                    <MenuItem
                        icon="document-outline"
                        text="Terms & Conditions"
                        onPress={() => navigation.navigate('Terms')}
                    />

                    <MenuItem
                        icon="lock-closed-outline"
                        text="Privacy Policy"
                        onPress={() => navigation.navigate('Privacy')}
                    />

                    <View style={styles.authSection}>
                        <MenuItem
                            icon="log-in-outline"
                            text="Login"
                            onPress={() => navigation.navigate('Login')}
                        />

                        <MenuItem
                            icon="person-add-outline"
                            text="Register"
                            onPress={() => navigation.navigate('Register')}
                        />
                    </View>

                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
    },
    container_content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    backButton: {
        marginTop: 10,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 30,
        marginBottom: 15,
        color: "#333",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 15,
        color: "#333",
    },
    activeItem: {
        backgroundColor: "#f7f9ff",
        borderRadius: 12,
        paddingHorizontal: 15,
        marginHorizontal: -15,
        borderBottomWidth: 0,
    },
    boldText: {
        fontWeight: "600",
    },
    activeText: {
        color: "#007AFF",
    },
    expandedContent: {
        marginLeft: 20,
        borderLeftWidth: 1,
        borderLeftColor: "#ddd",
        paddingLeft: 15,
    },
    authSection: {
        marginTop: 10,
        backgroundColor: "#f7f9ff",
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    versionText: {
        textAlign: "center",
        color: "#999",
        fontSize: 14,
        marginTop: 20,
    }
});