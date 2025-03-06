import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";

import Home from "../screens/Home";
import Schedule from "../screens/Schedule";
import History from "../screens/History";
import Notification from "../screens/Notification"
import Profile from "../screens/Profile";
import Login from "../screens/auth/Login";
import Register from "../screens/Register";
import { TouchableOpacity } from "react-native";
import BloodPressureScreen from "../screens/BloodPressureScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }
      }
    >
      <Stack.Screen name="HomeMain" component={Home} options={{ headerBackTitle: "Back" }} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerBackTitle: "Back" }} />
      <Stack.Screen name="Login" component={Login} options={{ headerBackTitle: "Back" }} />
      <Stack.Screen name="Register" component={Register} options={{ headerBackTitle: "Back" }} />
      <Stack.Screen name="BloodPressure" component={BloodPressureScreen}  />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
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
    name="History" 
    component={History} 
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

    </NavigationContainer>
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
