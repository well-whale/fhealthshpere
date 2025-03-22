import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, SafeAreaView, StatusBar, Platform, TextInput } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import * as ExpoLocation from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a singleton instance of BleManager
let bleManagerInstance = null;

const getBleManager = () => {
  if (!bleManagerInstance) {
    console.log('Creating new BleManager instance');
    bleManagerInstance = new BleManager();
  }
  return bleManagerInstance;
};

const BluetoothScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [bluetoothState, setBluetoothState] = useState('Unknown');
  const [managerInitialized, setManagerInitialized] = useState(false);
  // Track devices we've seen to prevent duplicates
  const [seenDevices, setSeenDevices] = useState({});
  // For MAC address search
  const [searchMac, setSearchMac] = useState('');
  // Signal strength threshold (RSSI) to filter out weak signals
  const RSSI_THRESHOLD = -80; // Only show devices with RSSI > -80 dBm
  const navigation = useNavigation();

  useEffect(() => {
    let stateSubscription = null;

    const initializeBleManager = async () => {
      try {
        const manager = getBleManager();

        // Initialize Bluetooth listener
        stateSubscription = manager.onStateChange((state) => {
          console.log('Bluetooth state changed:', state);
          setBluetoothState(state);

          if (state === 'PoweredOn') {
            setPermissionsGranted(true);
          }
        }, true);

        setManagerInitialized(true);
        console.log('BleManager initialized successfully');

        // Request permissions after manager is initialized
        requestPermissions();
      } catch (error) {
        console.error('Error initializing BleManager:', error);
        Alert.alert('Initialization Error', 'Failed to initialize Bluetooth manager: ' + error.message);
      }
    };

    initializeBleManager();

    // Clean up on component unmount
    return () => {
      if (isScanning) {
        try {
          const manager = getBleManager();
          manager.stopDeviceScan();
          console.log('Device scan stopped during cleanup');
        } catch (error) {
          console.error('Error stopping scan during cleanup:', error);
        }
      }

      if (stateSubscription) {
        stateSubscription.remove();
      }

      // Do NOT destroy the manager here - it's a singleton!
      // We'll let the app lifecycle handle BleManager destruction
    };
  }, []);

  // Apply search filter when devices list or search text changes
  useEffect(() => {
    filterDevices();
  }, [devices, searchMac]);

  // Filter devices based on search input
  const filterDevices = () => {
    if (!searchMac.trim()) {
      setFilteredDevices(devices);
      return;
    }

    const searchTerm = searchMac.trim().toLowerCase();
    const filtered = devices.filter(device =>
      device.id.toLowerCase().includes(searchTerm)
    );

    setFilteredDevices(filtered);
  };

  // Create a function to sort devices by signal strength and name
  const sortDevices = (deviceList) => {
    return deviceList.sort((a, b) => {
      // Sort by having a name first
      if (a.name && !b.name) return -1;
      if (!a.name && b.name) return 1;

      // Then sort by signal strength (RSSI) - higher (less negative) is better
      // Note: RSSI is negative, so we reverse the comparison
      if (a.rssi && b.rssi) return b.rssi - a.rssi;
      if (a.rssi && !b.rssi) return -1;
      if (!a.rssi && b.rssi) return 1;

      // If all else is equal, sort alphabetically by name or id
      const aName = a.name || a.id;
      const bName = b.name || b.id;
      return aName.localeCompare(bName);
    });
  };

  const requestPermissions = async () => {
    try {
      // For Android, we need location and Bluetooth permissions
      const { status: locationStatus } = await ExpoLocation.requestForegroundPermissionsAsync();

      // For Android 12+ (API level 31+), we need to request additional Bluetooth permissions
      let bluetoothPermissionsGranted = true;

      if (Platform.OS === 'android' && parseInt(Platform.Version) >= 31) {
        // We need to use the PermissionsAndroid API directly
        const PermissionsAndroid = require('react-native').PermissionsAndroid;

        const bluetoothScanStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: "Bluetooth Scan Permission",
            message: "This app needs permission to scan for Bluetooth devices",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        const bluetoothConnectStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: "Bluetooth Connect Permission",
            message: "This app needs permission to connect to Bluetooth devices",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        bluetoothPermissionsGranted =
          bluetoothScanStatus === PermissionsAndroid.RESULTS.GRANTED &&
          bluetoothConnectStatus === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (locationStatus === 'granted' && bluetoothPermissionsGranted) {
        setPermissionsGranted(true);
      } else {
        Alert.alert(
          'Permission Required',
          'Location and Bluetooth permissions are required to scan for devices',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert(
        'Permission Error',
        'There was an error requesting the required permissions: ' + error.message,
        [{ text: 'OK' }]
      );
    }
  };

  const checkBluetoothState = async () => {
    try {
      if (!managerInitialized) {
        console.log('BleManager not yet initialized');
        Alert.alert('Not Ready', 'Bluetooth manager is initializing. Please try again in a moment.');
        return false;
      }

      const manager = getBleManager();
      const state = await manager.state();
      console.log('Current Bluetooth state:', state);

      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth to scan for devices',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
      Alert.alert('Bluetooth Error', 'Could not check Bluetooth state: ' + error.message);
      return false;
    }
  };

  const startScan = async () => {
    console.log('Attempting to start scan, permissions granted:', permissionsGranted);

    if (!managerInitialized) {
      console.log('BleManager not yet initialized');
      Alert.alert('Not Ready', 'Bluetooth manager is initializing. Please try again in a moment.');
      return;
    }

    if (!permissionsGranted) {
      await requestPermissions();
      if (!permissionsGranted) {
        console.log('Permissions not granted after request');
        return;
      }
    }

    const bluetoothEnabled = await checkBluetoothState();
    if (!bluetoothEnabled) {
      console.log('Bluetooth not enabled');
      return;
    }

    // Clear previous devices before starting a new scan
    setDevices([]);
    setFilteredDevices([]);
    setSeenDevices({});
    setIsScanning(true);
    console.log('Starting device scan...');

    try {
      const manager = getBleManager();

      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (scannedDevice) {
          console.log('Raw device found:', scannedDevice.id, 'RSSI:', scannedDevice.rssi);
        }
        if (error) {
          console.error('Scanning error:', error);
          setIsScanning(false);
          Alert.alert('Scanning Error', 'Error while scanning: ' + error.message);
          return;
        }

        // Only add device to list if it has an id and good signal strength
        if (scannedDevice && scannedDevice.id) {
          console.log('Found device:', scannedDevice.name || scannedDevice.id, 'RSSI:', scannedDevice.rssi);

          // Skip devices with weak signals - simulate real phone behavior
          // if (scannedDevice.rssi < RSSI_THRESHOLD) {
          //   console.log('Skipping device with weak signal:', scannedDevice.rssi, 'dBm');
          //   return;
          // }

          // Check if we've already seen this device within the current scan
          setDevices(prevDevices => {
            // Find if this device exists in our current list
            const existingDeviceIndex = prevDevices.findIndex(d => d.id === scannedDevice.id);

            // Make a copy of the current devices list
            const updatedDevices = [...prevDevices];

            if (existingDeviceIndex !== -1) {
              // If we've seen this device before, update its information (especially RSSI)
              updatedDevices[existingDeviceIndex] = {
                ...updatedDevices[existingDeviceIndex],
                name: scannedDevice.name || updatedDevices[existingDeviceIndex].name,
                rssi: scannedDevice.rssi
              };
            } else {
              // If this is a new device, add it to our list
              updatedDevices.push(scannedDevice);
            }

            // Sort the devices by signal strength and return
            return sortDevices(updatedDevices);
          });
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        stopScan();
      }, 10000);
    } catch (error) {
      console.error('Error starting scan:', error);
      setIsScanning(false);
      Alert.alert('Error', 'Failed to start scan: ' + error.message);
    }
  };

  const stopScan = () => {
    if (isScanning && managerInitialized) {
      try {
        console.log('Stopping device scan...');
        const manager = getBleManager();
        manager.stopDeviceScan();
        setIsScanning(false);
      } catch (error) {
        console.error('Error stopping scan:', error);
      }
    }
  };

  const connectToDevice = async (device) => {
    setSelectedDevice(device);
    stopScan();

    if (!managerInitialized) {
      console.log('BleManager not yet initialized');
      Alert.alert('Not Ready', 'Bluetooth manager is initializing. Please try again in a moment.');
      return;
    }

    Alert.alert(
      'Connect to Device',
      `Do you want to connect to ${device.name || device.id}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: async () => {
            // Handle connection logic here
            try {
              console.log('Connecting to device:', device.id);
              Alert.alert('Connecting', `Connecting to ${device.name || device.id}...`);

              const connectedDevice = await device.connect();
              console.log('Device connected');

              const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();
              console.log('Discovered services and characteristics');

              Alert.alert('Success', `Connected to ${connectedDevice.name || connectedDevice.id}`);

              // Here you could navigate to another screen or perform actions with the device
            } catch (error) {
              console.error('Connection error:', error);
              Alert.alert('Connection Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>MAC: {item.id}</Text>
        {item.rssi && (
          <View style={styles.signalContainer}>
            <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
            <View style={styles.signalStrength}>
              <View
                style={[
                  styles.signalBar,
                  { width: `${Math.min(100, Math.max(0, (item.rssi + 100) * 2))}%` }
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.header}>
        <Text style={styles.title}>Bluetooth Device Scanner</Text>
        <Text style={styles.subtitle}>
          {isScanning ? 'Scanning for devices...' : filteredDevices.length > 0 ? `Found ${filteredDevices.length} devices` : 'Press scan to find devices'}
        </Text>
        <Text style={styles.bluetoothState}>Bluetooth: {bluetoothState}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by MAC address"
          value={searchMac}
          onChangeText={setSearchMac}
          placeholderTextColor="#999"
        />
        {searchMac.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchMac('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {isScanning && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Scanning for nearby devices...</Text>
          </View>
        )}

        <FlatList
          data={filteredDevices}
          renderItem={renderDeviceItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isScanning && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchMac ? 'No matching devices found' : 'No nearby devices found'}
                </Text>
                <Text style={styles.emptySubText}>
                  {searchMac
                    ? 'Try a different MAC address or clear the search'
                    : 'Make sure Bluetooth is enabled on nearby devices'}
                </Text>
              </View>
            )
          }
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isScanning ? styles.buttonStop : styles.buttonScan]}
          onPress={isScanning ? stopScan : startScan}
          disabled={!permissionsGranted || !managerInitialized || bluetoothState !== 'PoweredOn'}
        >
          <Text style={styles.buttonText}>{isScanning ? 'Stop Scan' : 'Scan for Devices'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => { // Make the function async
            try {
              await AsyncStorage.setItem('setupCompleted', 'true');
              navigation.navigate('MainTabs'); // Ensure only one navigation call if needed
            } catch (error) {
              console.error("Error saving setupCompleted:", error);
            }
          }}
        >
          <Text style={styles.buttonText}>Skip to home page</Text>
        </TouchableOpacity>

      </View>
      <View style={{ height: 100 }} />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  bluetoothState: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  deviceItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  deviceId: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  signalContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceRssi: {
    fontSize: 12,
    color: '#888888',
    width: 85,
  },
  signalStrength: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  signalBar: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: 3,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonScan: {
    backgroundColor: '#0066cc',
  },
  buttonStop: {
    backgroundColor: '#cc0000',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default BluetoothScanner;