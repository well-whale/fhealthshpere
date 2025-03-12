import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PersionalDetailScreen = () => {
  const navigation = useNavigation();

  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'John Smith',
    dateOfBirth: '15 Mar 1990',
    gender: 'Male',
    bloodType: 'A+',
    phone: '+1234 567 890',
    email: 'john.smith@email.com',
    address: '123 Street, City',
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Jane Smith', relationship: 'Spouse', phone: '+1234 567 891' },
    { id: 2, name: 'Robert Smith', relationship: 'Brother', phone: '+1234 567 892' },
    { id: 3, name: 'Mary Johnson', relationship: 'Friend', phone: '+1234 567 893' },
  ]);


const handleAddEmergencyContact = () => {
  // Function to handle adding emergency contact
  console.log('Add emergency contact');
};

const handleEditContact = (contactId) => {
  // Function to handle editing emergency contact
  console.log('Edit contact', contactId);
};

const handleDeleteContact = (contactId) => {
  // Function to handle deleting emergency contact
  console.log('Delete contact', contactId);
};

return (
  <SafeAreaView style={styles.container}>
    <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

    <ScrollView style={styles.content}>
      {/* Personal Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal & Contact Information</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Edit Personal Information', { personalInfo })}>
            <Icon name="edit" size={20} color="#4285F4" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          {Object.entries(personalInfo).map(([key, value], index) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace('Email', 'E-mail'); // Special case for email

            return (
              <View key={key} style={[
                styles.infoRow,
                index !== Object.entries(personalInfo).length - 1 && styles.infoRowWithBorder
              ]}>
                <Text style={styles.infoLabel}>{formattedKey}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Emergency Contacts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Add Emergency Contact')}>
            <Icon name="add" size={24} color="#4285F4" />
          </TouchableOpacity>
        </View>

        <View style={styles.contactsContainer}>
          {emergencyContacts.map((contact, index) => (
            <View
              key={contact.id}
              style={[
                styles.contactCard,
                index !== emergencyContacts.length - 1 && styles.contactCardWithMargin
              ]}
            >
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Name</Text>
                <Text style={styles.contactValue}>{contact.name}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Relationship</Text>
                <Text style={styles.contactValue}>{contact.relationship}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{contact.phone}</Text>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity onPress={() => navigation.navigate('Update Emergency Contact', { contact })}>
                  <Icon name="edit" size={20} color="#4285F4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteContact(contact.id)}>
                  <Icon name="delete" size={20} color="#FF0000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoRowWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#333333',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    maxWidth: '60%',
    textAlign: 'right',
  },
  contactsContainer: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactCardWithMargin: {
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 14,
    color: '#333333',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 4,
  },
});

export default PersionalDetailScreen;