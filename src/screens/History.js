// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   ActivityIndicator,
//   FlatList
// } from 'react-native';
// import { BleManager } from 'react-native-ble-plx';
// import base64 from 'react-native-base64';

// // UUID constants - must match the sender app
// const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
// const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

// // Singleton BleManager
// let bleManagerInstance = null;

// const getBleManager = () => {
//   if (!bleManagerInstance) {
//     console.log('Creating new BleManager instance');
//     bleManagerInstance = new BleManager();
//   }
//   return bleManagerInstance;
// };

// const BluetoothReceiver = () => {
//   const [isScanning, setIsScanning] = useState(false);
//   const [devices, setDevices] = useState([]);
//   const [connectedDevice, setConnectedDevice] = useState(null);
//   const [receivedData, setReceivedData] = useState([]);
//   const [logs, setLogs] = useState([]);
//   const [bluetoothState, setBluetoothState] = useState('Unknown');
//   const [subscription, setSubscription] = useState(null);

//   // Add a log message
//   const addLog = (message) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
//     console.log(`[${timestamp}] ${message}`);
//   };

//   useEffect(() => {
//     let stateSubscription = null;
    
//     const initializeBluetooth = async () => {
//       try {
//         const manager = getBleManager();
        
//         // Initialize Bluetooth listener
//         stateSubscription = manager.onStateChange((state) => {
//           addLog(`Bluetooth state changed: ${state}`);
//           setBluetoothState(state);
          
//           if (state === 'PoweredOn') {
//             addLog('Bluetooth is ready to use');
//           }
//         }, true);
        
//         addLog('BLE Manager initialized successfully');
//       } catch (error) {
//         addLog(`Error initializing BLE: ${error.message}`);
//         Alert.alert('Initialization Error', 'Failed to initialize Bluetooth: ' + error.message);
//       }
//     };
    
//     initializeBluetooth();
    
//     return () => {
//       stopScan();
//       disconnectFromDevice();
//       if (stateSubscription) {
//         stateSubscription.remove();
//       }
//     };
//   }, []);

//   const startScan = async () => {
//     if (isScanning) {
//       return;
//     }

//     try {
//       setDevices([]);
//       setIsScanning(true);
//       addLog('Starting scan for devices...');
      
//       const manager = getBleManager();
      
//       // Check if Bluetooth is powered on
//       const state = await manager.state();
//       if (state !== 'PoweredOn') {
//         addLog(`Bluetooth is not powered on. Current state: ${state}`);
//         Alert.alert('Bluetooth Error', 'Please enable Bluetooth to scan for devices.');
//         setIsScanning(false);
//         return;
//       }
      
//       // Start scanning for devices with our service UUID
//       manager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
//         if (error) {
//           addLog(`Scan error: ${error.message}`);
//           setIsScanning(false);
//           return;
//         }
        
//         if (device) {
//           // Check if we've already found this device
//           setDevices(prevDevices => {
//             const existingDevice = prevDevices.find(d => d.id === device.id);
//             if (!existingDevice) {
//               addLog(`Found device: ${device.name || 'Unnamed'} (${device.id})`);
//               return [...prevDevices, device];
//             }
//             return prevDevices;
//           });
//         }
//       });
      
//       // Stop scanning after 10 seconds
//       setTimeout(() => {
//         stopScan();
//       }, 10000);
      
//     } catch (error) {
//       addLog(`Error starting scan: ${error.message}`);
//       setIsScanning(false);
//       Alert.alert('Scan Error', 'Failed to start scanning: ' + error.message);
//     }
//   };

//   const stopScan = () => {
//     if (isScanning) {
//       const manager = getBleManager();
//       manager.stopDeviceScan();
//       setIsScanning(false);
//       addLog('Scan stopped');
//     }
//   };

//   const connectToDevice = async (device) => {
//     try {
//       addLog(`Connecting to device: ${device.name || 'Unnamed'} (${device.id})`);
      
//       const manager = getBleManager();
      
//       // Connect to the device
//       const connectedDevice = await device.connect();
//       addLog('Connected, discovering services and characteristics...');
      
//       // Discover services and characteristics
//       const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
//       addLog('Services and characteristics discovered');
      
//       // Set the connected device
//       setConnectedDevice(discoveredDevice);
      
//       // Start listening for notifications
//       startNotifications(discoveredDevice);
      
//     } catch (error) {
//       addLog(`Connection error: ${error.message}`);
//       Alert.alert('Connection Error', 'Failed to connect to device: ' + error.message);
//     }
//   };

//   const disconnectFromDevice = async () => {
//     if (connectedDevice) {
//       try {
//         addLog(`Disconnecting from device: ${connectedDevice.name || 'Unnamed'} (${connectedDevice.id})`);
        
//         // Remove notification subscription
//         if (subscription) {
//           subscription.remove();
//           setSubscription(null);
//         }
        
//         // Disconnect from the device
//         await connectedDevice.cancelConnection();
//         setConnectedDevice(null);
//         addLog('Disconnected successfully');
        
//       } catch (error) {
//         addLog(`Disconnection error: ${error.message}`);
//         Alert.alert('Disconnection Error', 'Failed to disconnect from device: ' + error.message);
//       }
//     }
//   };

//   const startNotifications = async (device) => {
//     try {
//       // Set up notification for the characteristic
//       const sub = device.monitorCharacteristicForService(
//         SERVICE_UUID,
//         CHARACTERISTIC_UUID,
//         (error, characteristic) => {
//           if (error) {
//             addLog(`Notification error: ${error.message}`);
//             return;
//           }
          
//           if (characteristic?.value) {
//             const decodedValue = base64.decode(characteristic.value);
//             addLog(`Received data: ${decodedValue}`);
            
//             try {
//               // Try to parse JSON data
//               const jsonData = JSON.parse(decodedValue);
//               const timestamp = new Date().toLocaleTimeString();
              
//               setReceivedData(prev => [{
//                 id: Date.now().toString(),
//                 timestamp,
//                 value: jsonData.value,
//                 message: jsonData.message,
//                 isActive: jsonData.isActive
//               }, ...prev]);
//             } catch (parseError) {
//               addLog(`Error parsing data: ${parseError.message}`);
//             }
//           }
//         }
//       );
      
//       setSubscription(sub);
//       addLog('Started monitoring for notifications');
      
//     } catch (error) {
//       addLog(`Error setting up notifications: ${error.message}`);
//       Alert.alert('Error', 'Failed to monitor characteristic: ' + error.message);
//     }
//   };

//   const requestData = async () => {
//     if (!connectedDevice) {
//       addLog('No device connected');
//       return;
//     }
    
//     try {
//       addLog('Requesting data from device...');
      
//       // Write to the characteristic to request data
//       // You can send any value here that the sender will recognize as a request
//       const dataToSend = JSON.stringify({ type: 'request', timestamp: Date.now() });
//       const base64Data = base64.encode(dataToSend);
      
//       await connectedDevice.writeCharacteristicWithResponseForService(
//         SERVICE_UUID,
//         CHARACTERISTIC_UUID,
//         base64Data
//       );
      
//       addLog('Data request sent successfully');
      
//     } catch (error) {
//       addLog(`Error requesting data: ${error.message}`);
//       Alert.alert('Error', 'Failed to request data: ' + error.message);
//     }
//   };

//   const renderDeviceItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.deviceItem}
//       onPress={() => connectToDevice(item)}
//     >
//       <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
//       <Text style={styles.deviceId}>{item.id}</Text>
//       <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
//     </TouchableOpacity>
//   );

//   const renderDataItem = ({ item }) => (
//     <View style={styles.dataItem}>
//       <View style={styles.dataHeader}>
//         <Text style={styles.dataTimestamp}>{item.timestamp}</Text>
//         <View style={[
//           styles.statusIndicator, 
//           item.isActive ? styles.statusActive : styles.statusInactive
//         ]} />
//       </View>
//       <Text style={styles.dataValue}>Value: {item.value}</Text>
//       <Text style={styles.dataMessage}>{item.message}</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
//       <View style={styles.header}>
//         <Text style={styles.title}>Bluetooth Receiver</Text>
//         <Text style={styles.subtitle}>
//           Status: {connectedDevice ? 'Connected' : isScanning ? 'Scanning' : 'Ready'}
//         </Text>
//         <Text style={styles.bluetoothState}>Bluetooth: {bluetoothState}</Text>
//       </View>
      
//       {!connectedDevice ? (
//         <View style={styles.scanContainer}>
//           <View style={styles.buttonsContainer}>
//             <TouchableOpacity
//               style={[styles.button, isScanning ? styles.buttonStop : styles.buttonStart]}
//               onPress={isScanning ? stopScan : startScan}
//             >
//               <Text style={styles.buttonText}>
//                 {isScanning ? 'Stop Scan' : 'Start Scan'}
//               </Text>
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.sectionTitle}>
//             {devices.length > 0 ? 'Available Devices' : 'No devices found'}
//           </Text>
          
//           {isScanning && (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="small" color="#007bff" />
//               <Text style={styles.loadingText}>Scanning for devices...</Text>
//             </View>
//           )}
          
//           <FlatList
//             data={devices}
//             renderItem={renderDeviceItem}
//             keyExtractor={item => item.id}
//             style={styles.devicesList}
//             ListEmptyComponent={
//               <Text style={styles.emptyListText}>
//                 {isScanning ? 'Searching for devices...' : 'No devices found. Try scanning again.'}
//               </Text>
//             }
//           />
//         </View>
//       ) : (
//         <View style={styles.connectedContainer}>
//           <View style={styles.connectedDeviceInfo}>
//             <Text style={styles.connectedDeviceName}>
//               {connectedDevice.name || 'Unnamed Device'}
//             </Text>
//             <Text style={styles.connectedDeviceId}>{connectedDevice.id}</Text>
//           </View>
          
//           <View style={styles.buttonsContainer}>
//             <TouchableOpacity
//               style={[styles.button, styles.buttonRequest]}
//               onPress={requestData}
//             >
//               <Text style={styles.buttonText}>Request Data</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.button, styles.buttonDisconnect]}
//               onPress={disconnectFromDevice}
//             >
//               <Text style={styles.buttonText}>Disconnect</Text>
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.sectionTitle}>Received Data</Text>
          
//           <FlatList
//             data={receivedData}
//             renderItem={renderDataItem}
//             keyExtractor={item => item.id}
//             style={styles.dataList}
//             ListEmptyComponent={
//               <Text style={styles.emptyListText}>
//                 No data received yet. Try requesting data from the device.
//               </Text>
//             }
//           />
//         </View>
//       )}
      
//       <View style={styles.logsContainer}>
//         <Text style={styles.logsTitle}>Activity Logs</Text>
//         <ScrollView style={styles.logs}>
//           {logs.map((log, index) => (
//             <Text key={index} style={styles.logItem}>{log}</Text>
//           ))}
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#212529',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#495057',
//     marginTop: 5,
//   },
//   bluetoothState: {
//     fontSize: 14,
//     color: '#6c757d',
//     marginTop: 5,
//   },
//   scanContainer: {
//     flex: 1,
//   },
//   buttonsContainer: {
//     padding: 15,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   button: {
//     borderRadius: 8,
//     padding: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
//   buttonStart: {
//     backgroundColor: '#007bff',
//   },
//   buttonStop: {
//     backgroundColor: '#dc3545',
//   },
//   buttonRequest: {
//     backgroundColor: '#28a745',
//   },
//   buttonDisconnect: {
//     backgroundColor: '#dc3545',
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#212529',
//     padding: 15,
//     backgroundColor: '#ffffff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     backgroundColor: '#ffffff',
//   },
//   loadingText: {
//     marginLeft: 10,
//     color: '#6c757d',
//   },
//     devicesList: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   deviceItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   deviceName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#212529',
//   },
//   deviceId: {
//     fontSize: 12,
//     color: '#6c757d',
//     marginTop: 4,
//   },
//   deviceRssi: {
//     fontSize: 12,
//     color: '#6c757d',
//     marginTop: 2,
//   },
//   emptyListText: {
//     padding: 20,
//     textAlign: 'center',
//     color: '#6c757d',
//   },
//   connectedContainer: {
//     flex: 1,
//   },
//   connectedDeviceInfo: {
//     padding: 15,
//     backgroundColor: '#e9f7ef',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   connectedDeviceName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#212529',
//   },
//   connectedDeviceId: {
//     fontSize: 14,
//     color: '#6c757d',
//     marginTop: 5,
//   },
//   dataList: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   dataItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//     backgroundColor: '#f8f9fa',
//     marginHorizontal: 10,
//     marginVertical: 5,
//     borderRadius: 8,
//   },
//   dataHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   dataTimestamp: {
//     fontSize: 12,
//     color: '#6c757d',
//   },
//   statusIndicator: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//   },
//   statusActive: {
//     backgroundColor: '#28a745',
//   },
//   statusInactive: {
//     backgroundColor: '#dc3545',
//   },
//   dataValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#212529',
//     marginBottom: 4,
//   },
//   dataMessage: {
//     fontSize: 14,
//     color: '#495057',
//   },
//   logsContainer: {
//     height: 150,
//     padding: 15,
//     backgroundColor: '#ffffff',
//     borderTopWidth: 1,
//     borderTopColor: '#e9ecef',
//   },
//   logsTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#212529',
//     marginBottom: 10,
//   },
//   logs: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     padding: 10,
//   },
//   logItem: {
//     fontSize: 12,
//     color: '#212529',
//     marginBottom: 5,
//     fontFamily: 'monospace',
//   },
// });

// export default BluetoothReceiver;