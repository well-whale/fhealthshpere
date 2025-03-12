import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditPersonalInformationScreen = ({ navigation, route }) => {
  // Initial state with placeholders
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    phoneNumber: '',
    email: '',
  });

  // Animation value for save button
  const saveButtonScale = new Animated.Value(1);

  // State for date picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // State for blood type modal
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  
  // Blood type options
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Function to handle input changes
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Function to handle date selection
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      setFormData({ ...formData, dateOfBirth: formattedDate });
    }
  };

  // Function to handle blood type selection
  const selectBloodType = (type) => {
    setFormData({ ...formData, bloodType: type });
    setShowBloodTypeModal(false);
  };

  // Function to handle save button animation
  const animateSaveButton = () => {
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Function to handle save button
  const handleSave = () => {
    animateSaveButton();
    console.log('Saving form data:', formData);
    // Add logic to save data and navigate back
    // navigation.goBack();
  };

  // Function to handle back button
  const handleBack = () => {
    // navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f8ff" barStyle="dark-content" />
      
      {/* Header */}
      
        <View style={styles.header}>
          
          <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formInnerContainer}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <FontAwesome name="user" size={18} color="#0066cc" />
              <Text style={styles.label}>Full Name</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9e9e9e"
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <FontAwesome name="calendar" size={18} color="#0066cc" />
              <Text style={styles.label}>Date of Birth</Text>
            </View>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.dateInput}>
                <Text style={formData.dateOfBirth ? styles.dateText : styles.placeholderText}>
                  {formData.dateOfBirth || 'dd/mm/yyyy'}
                </Text>
                <Icon name="calendar-today" size={20} color="#0066cc" />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <FontAwesome name="venus-mars" size={18} color="#0066cc" />
              <Text style={styles.label}>Gender</Text>
            </View>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleChange('gender', 'Male')}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.radioButton,
                  formData.gender === 'Male' && styles.radioButtonActive
                ]}>
                  {formData.gender === 'Male' && <View style={styles.radioSelected} />}
                </View>
                <Text style={[
                  styles.radioLabel,
                  formData.gender === 'Male' && styles.radioLabelActive
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => handleChange('gender', 'Female')}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.radioButton,
                  formData.gender === 'Female' && styles.radioButtonActive
                ]}>
                  {formData.gender === 'Female' && <View style={styles.radioSelected} />}
                </View>
                <Text style={[
                  styles.radioLabel,
                  formData.gender === 'Female' && styles.radioLabelActive
                ]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Blood Type */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <FontAwesome name="tint" size={18} color="#0066cc" />
              <Text style={styles.label}>Blood Type</Text>
            </View>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowBloodTypeModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.selectInput}>
                <Text style={formData.bloodType ? styles.dateText : styles.placeholderText}>
                  {formData.bloodType || 'Select blood type'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#0066cc" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <FontAwesome name="phone" size={18} color="#0066cc" />
              <Text style={styles.label}>Phone Number</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9e9e9e"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange('phoneNumber', text)}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <FontAwesome name="envelope" size={18} color="#0066cc" />
              <Text style={styles.label}>Email Address</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#9e9e9e"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Blood Type Modal */}
      <Modal
        visible={showBloodTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBloodTypeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setShowBloodTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Blood Type</Text>
            <FlatList
              data={bloodTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectBloodType(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.bloodType === item && (
                    <Icon name="check" size={20} color="#0066cc" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
  },
  formInnerContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderRadius: 12,
  },
  dateInput: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  placeholderText: {
    fontSize: 15,
    color: '#9e9e9e',
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
    paddingVertical: 6,
  },
  radioButton: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#757575',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonActive: {
    borderColor: '#0066cc',
  },
  radioSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#0066cc',
  },
  radioLabel: {
    fontSize: 15,
    color: '#333',
  },
  radioLabelActive: {
    color: '#0066cc',
    fontWeight: '500',
  },
  selectInput: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default EditPersonalInformationScreen;