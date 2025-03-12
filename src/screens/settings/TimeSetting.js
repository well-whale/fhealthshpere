import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  TextInput,
  SafeAreaView,
  ScrollView,
  Pressable,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MeasurementReminderScreen = () => {
  // States for form values
  const [reminderTime, setReminderTime] = useState('08:00 AM');
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState('AM');
  const [soundAlert, setSoundAlert] = useState(true);
  const [vibration, setVibration] = useState(false);
  const [snoozeReminder, setSnoozeReminder] = useState(true);
  const [note, setNote] = useState('');

  // Generate arrays for time picker
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const amPm = ['AM', 'PM'];

  // Format time display
  const formatTime = (hour, minute, ampm) => {
    return `${hour}:${minute < 10 ? '0' + minute : minute} ${ampm}`;
  };

  const WheelPicker = ({ data, selectedValue, onValueChange, itemHeight = 40 }) => {
    const scrollViewRef = useRef(null);
    const containerHeight = itemHeight * 3; // visible items: current + above + below
    const totalHeight = itemHeight * data.length;
    
    // Calculate initial scroll position to center the selected value
    useEffect(() => {
      if (scrollViewRef.current) {
        const selectedIndex = data.indexOf(selectedValue);
        if (selectedIndex >= 0) {
          // Scroll to position the selected item in the middle
          const scrollOffset = selectedIndex * itemHeight - itemHeight;
          scrollViewRef.current.scrollTo({ y: scrollOffset, animated: false });
        }
      }
    }, [selectedValue, data]);

    // Handle scroll end to snap to the nearest item
    const handleScrollEnd = (event) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / itemHeight);
      const finalIndex = Math.max(0, Math.min(index, data.length - 1));
      
      // Scroll to snap to item
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: finalIndex * itemHeight, animated: true });
      }
      
      // Update selected value
      if (data[finalIndex] !== selectedValue) {
        onValueChange(data[finalIndex]);
      }
    };
    
    return (
      <View style={[styles.wheelContainer, { height: containerHeight }]}>
        <View style={styles.wheelSelectionHighlight} />
        
        <ScrollView
          ref={scrollViewRef}
          style={{ height: containerHeight }}
          contentContainerStyle={{ paddingVertical: itemHeight }}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
        >
          {data.map((item) => (
            <View
              key={item.toString()}
              style={[
                styles.wheelItem,
                { height: itemHeight }
              ]}
            >
              <Text 
                style={[
                  styles.wheelItemText,
                  item === selectedValue && styles.selectedWheelItemText
                ]}
              >
                {typeof item === 'number' && item < 10 && data.length > 12 ? `0${item}` : item}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4b71fa" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Measurement Reminder</Text>
        <TouchableOpacity>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Reminder Time */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="time-outline" size={24} color="#4b71fa" />
              <Text style={styles.sectionLabel}>Reminder Time</Text>
            </View>
            <Text style={styles.timeValue}>{reminderTime}</Text>
          </View>
          
          {/* Time Picker */}
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerWrapper}>
              {/* Hour */}
              <WheelPicker
                data={hours}
                selectedValue={selectedHour}
                onValueChange={(value) => {
                  setSelectedHour(value);
                  setReminderTime(formatTime(value, selectedMinute, selectedAmPm));
                }}
              />
              
              <Text style={styles.pickerSeparator}>:</Text>
              
              {/* Minute */}
              <WheelPicker
                data={minutes}
                selectedValue={selectedMinute}
                onValueChange={(value) => {
                  setSelectedMinute(value);
                  setReminderTime(formatTime(selectedHour, value, selectedAmPm));
                }}
              />
              
              {/* AM/PM */}
              <View style={{width: 16}} />
              <WheelPicker
                data={amPm}
                selectedValue={selectedAmPm}
                onValueChange={(value) => {
                  setSelectedAmPm(value);
                  setReminderTime(formatTime(selectedHour, selectedMinute, value));
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />
        
        {/* Sound Alert */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="notifications-outline" size={24} color="#4b71fa" />
              <Text style={styles.sectionLabel}>Sound Alert</Text>
            </View>
            <Switch
              value={soundAlert}
              onValueChange={setSoundAlert}
              trackColor={{ false: '#e0e0e0', true: '#bfd1ff' }}
              thumbColor={soundAlert ? '#4b71fa' : '#f5f5f5'}
            />
          </View>
        </View>
        
        {/* Vibration */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="phone-portrait-outline" size={24} color="#4b71fa" />
              <Text style={styles.sectionLabel}>Vibration</Text>
            </View>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: '#e0e0e0', true: '#bfd1ff' }}
              thumbColor={vibration ? '#4b71fa' : '#f5f5f5'}
            />
          </View>
        </View>
        
        {/* Snooze Reminder */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.labelContainer}>
              <Ionicons name="alarm-outline" size={24} color="#4b71fa" />
              <Text style={styles.sectionLabel}>Snooze Reminder</Text>
            </View>
            <Switch
              value={snoozeReminder}
              onValueChange={setSnoozeReminder}
              trackColor={{ false: '#e0e0e0', true: '#bfd1ff' }}
              thumbColor={snoozeReminder ? '#4b71fa' : '#f5f5f5'}
            />
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Add Note */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Ionicons name="create-outline" size={24} color="#4b71fa" />
            <Text style={styles.sectionLabel}>Add Note</Text>
          </View>
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add any additional notes..."
              placeholderTextColor="#a0a0a0"
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b71fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  timeValue: {
    fontSize: 16,
    color: '#4b71fa',
    fontWeight: '500',
  },
  timePickerContainer: {
    marginTop: 16,
    backgroundColor: '#f5f8ff',
    borderRadius: 8,
    padding: 10,
    height: 150,
    justifyContent: 'center',
  },
  timePickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelSelectionHighlight: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: '33.33%',
    backgroundColor: 'rgba(75, 113, 250, 0.1)',
    borderRadius: 8,
    zIndex: 1,
  },
  wheelItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontSize: 18,
    color: '#666',
  },
  selectedWheelItemText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b71fa',
  },
  pickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  noteContainer: {
    marginTop: 12,
    backgroundColor: '#f5f8ff',
    borderRadius: 8,
    padding: 4,
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
});

export default MeasurementReminderScreen;