import React, { createRef, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

// Import các màn hình
import Home from "../screens/Home";
import Schedule from "../screens/Schedule";
import History from "../screens/History";
import Notification from "../screens/Notification";
import Profile from "../screens/accounts/Profile";
import Login from "../screens/auth/Login";
import BloodPressureScreen from "../screens/BloodPressureScreen";
import PersionalDetailScreen from "../screens/accounts/PersonalDetail";
import EditPersonalInformationScreen from "../screens/accounts/EditPersonalDetail";
import EmergencyContactForm from "../screens/accounts/AddEmergency";
import EmergencyContactEdit from "../screens/accounts/EditEmergency";
import BPAlertSettings from "../screens/settings/BPAlertSettings.";
import MeasurementReminderScreen from "../screens/settings/TimeSetting";
import Register from "../screens/Register";
import BandConnection from "../screens/BandConection";
import BluetoothReceiver from "../screens/History";
import FormProfile from "../screens/accounts/FormProfile.";

// Tạo navigation reference để có thể điều hướng từ bên ngoài component
export const navigationRef = createRef();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Login" component={Login} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Register" component={Register} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="BloodPressure" component={BloodPressureScreen} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Personal Detail" component={PersionalDetailScreen} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Edit Personal Information" component={EditPersonalInformationScreen} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Add Emergency Contact" component={EmergencyContactForm} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Update Emergency Contact" component={EmergencyContactEdit} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="BP Alert Settings" component={BPAlertSettings} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Set Measurement Reminder" component={MeasurementReminderScreen} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Band Conection" component={BandConnection} options={{ headerBackTitle: "Back", headerShown: true }} />
      <Stack.Screen name="Form Profile" component={FormProfile} options={{ headerBackTitle: "Back", headerShown: true }} />

    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Schedule") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Notification") {
            iconName = focused ? "notifications" : "notifications-outline";
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#7D7D7D",
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: focused => focused ? "600" : "400",
          marginBottom: 5,
        },
        tabBarStyle: {
          height: 80,
          borderRadius: 25,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          paddingHorizontal: 5,
          marginLeft:5,
          marginRight:5
        },
        tabBarItemStyle: {
          marginTop: 10,
          marginBottom: 10,
          borderRadius: 20,
        },
        headerShown: false,
      })}
      tabBarOptions={{
        showLabel: true,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarButton: (props) => (
            <TabBarCustomButton 
              {...props} 
              containerStyle={{
                backgroundColor: props.accessibilityState.selected ? "rgba(228, 88, 88, 0.91)" : "transparent",
                borderRadius: 20,
                flex: 1,
                marginHorizontal: 5,
              }}
            />
          )
        }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={Schedule} 
        options={{
          tabBarButton: (props) => (
            <TabBarCustomButton 
              {...props} 
              containerStyle={{
                backgroundColor: props.accessibilityState.selected ? "rgba(228, 88, 88, 0.91)" : "transparent",
                borderRadius: 20,
                flex: 1,
                marginHorizontal: 5,
              }}
            />
          )
        }}
      />
      
      <Tab.Screen 
        name="Notification" 
        component={Notification} 
        options={{
          tabBarButton: (props) => (
            <TabBarCustomButton 
              {...props} 
              containerStyle={{
                backgroundColor: props.accessibilityState.selected ? "rgba(228, 88, 88, 0.91)" : "transparent", 
                borderRadius: 20,
                flex: 1,
                marginHorizontal: 5,
              }}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
}

// Custom button component for tab bar items
const TabBarCustomButton = ({ children, containerStyle, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        },
        containerStyle
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default function Navigation() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerBackTitle: "Back", headerShown: true }} />
        <Stack.Screen name="Login" component={Login} options={{ headerBackTitle: "Back", headerShown: true }} />
        <Stack.Screen name="Register" component={Register} options={{ headerBackTitle: "Back", headerShown: true }} />
        <Stack.Screen name="BloodPressure" component={BloodPressureScreen} options={{ headerBackTitle: "Back", headerShown: true }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}