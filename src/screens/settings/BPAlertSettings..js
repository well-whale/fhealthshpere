import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BPAlertSettings = () => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [systolicPressure, setSystolicPressure] = useState(140);
  const [diastolicPressure, setDiastolicPressure] = useState(90);

  const handlePressureChange = (type, value) => {
    if (type === 'systolic') {
      setSystolicPressure(Math.max(90, Math.min(200, systolicPressure + value)));
    } else {
      setDiastolicPressure(Math.max(40, Math.min(120, diastolicPressure + value)));
    }
  };

  const resetDefaults = () => {
    setSystolicPressure(140);
    setDiastolicPressure(90);
    setAlertsEnabled(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Alert Thresholds Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alert Thresholds</Text>
            <View style={styles.switchContainer}>
              <Ionicons name="notifications" size={20} color="#F9A825" style={styles.alertIcon} />
              <Switch
                value={alertsEnabled}
                onValueChange={setAlertsEnabled}
                trackColor={{ false: '#E0E0E0', true: '#BBD6FF' }}
                thumbColor={alertsEnabled ? '#007AFF' : '#F5F5F5'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>
          
          {/* Systolic Pressure */}
          <View style={styles.pressureSection}>
            <View>
              <Text style={styles.pressureLabel}>Systolic (Upper) Pressure</Text>
              <View style={styles.pressureValueContainer}>
                <Ionicons name="arrow-up" size={20} color="#F44336" />
                <Text style={styles.pressureValue}>{systolicPressure}</Text>
                <Text style={styles.pressureUnit}>mmHg</Text>
              </View>
            </View>
            
            <View style={styles.pressureControls}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.decrementButton]}
                onPress={() => handlePressureChange('systolic', -1)}
              >
                <Ionicons name="remove" size={22} color="#757575" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.controlButton, styles.incrementButton]}
                onPress={() => handlePressureChange('systolic', 1)}
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Diastolic Pressure */}
          <View style={styles.pressureSection}>
            <View>
              <Text style={styles.pressureLabel}>Diastolic (Lower) Pressure</Text>
              <View style={styles.pressureValueContainer}>
                <Ionicons name="arrow-down" size={20} color="#2196F3" />
                <Text style={styles.pressureValue}>{diastolicPressure}</Text>
                <Text style={styles.pressureUnit}>mmHg</Text>
              </View>
            </View>
            
            <View style={styles.pressureControls}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.decrementButton]}
                onPress={() => handlePressureChange('diastolic', -1)}
              >
                <Ionicons name="remove" size={22} color="#757575" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.controlButton, styles.incrementButton]}
                onPress={() => handlePressureChange('diastolic', 1)}
              >
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Warning Message */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#F9A825" />
          <Text style={styles.warningText}>
            You will receive alerts when your blood pressure exceeds these thresholds. 
            Consult with your healthcare provider about your optimal blood pressure targets.
          </Text>
        </View>
        
        {/* Recommendation Message */}
        <View style={styles.recommendationContainer}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.recommendationText}>
            We recommend keeping notifications enabled to ensure you never miss 
            important alerts about your blood pressure levels.
          </Text>
        </View>
        
        {/* Action Buttons */}
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetDefaults}>
          <Text style={styles.resetButtonText}>Reset to Default</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 8,
  },
  pressureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pressureLabel: {
    fontSize: 16,
    color: '#616161',
    marginBottom: 4,
  },
  pressureValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressureValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginHorizontal: 4,
  },
  pressureUnit: {
    fontSize: 14,
    color: '#757575',
  },
  pressureControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  decrementButton: {
    backgroundColor: '#F1F1F1',
  },
  incrementButton: {
    backgroundColor: '#007AFF',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 12,
  },
  recommendationContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#0277BD',
    marginLeft: 12,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#616161',
    fontSize: 16,
  },
});

export default BPAlertSettings;