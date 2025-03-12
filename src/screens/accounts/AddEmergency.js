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
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'react-native-svg';

const EmergencyContactForm = ({ navigation, route }) => {
    // Check if we're editing an existing contact or creating a new one
    const isEditing = route?.params?.contact ? true : false;
    const initialContact = route?.params?.contact || {
        name: '',
        relationship: '',
        phone: '',
    };

    // State for form data
    const [formData, setFormData] = useState(initialContact);

    // Animation value for save button
    const saveButtonScale = new Animated.Value(1);

    // Function to handle input changes
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
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

    // Function to validate form
    const validateForm = () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return false;
        }
        if (!formData.relationship.trim()) {
            Alert.alert('Error', 'Relationship is required');
            return false;
        }
        if (!formData.phone.trim()) {
            Alert.alert('Error', 'Phone number is required');
            return false;
        }
        return true;
    };

    // Function to handle save button
    const handleSave = () => {
        animateSaveButton();

        if (!validateForm()) return;

        console.log('Saving emergency contact:', formData);
        // Add logic to save data
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
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        
                    </TouchableOpacity>
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
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <FontAwesome name="user" size={18} color="#0066cc" />
                            <Text style={styles.label}>Name</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter contact name"
                                placeholderTextColor="#9e9e9e"
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                            />
                        </View>
                    </View>

                    {/* Relationship */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <FontAwesome name="users" size={18} color="#0066cc" />
                            <Text style={styles.label}>Relationship</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter relationship"
                                placeholderTextColor="#9e9e9e"
                                value={formData.relationship}
                                onChangeText={(text) => handleChange('relationship', text)}
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <FontAwesome name="phone" size={18} color="#0066cc" />
                            <Text style={styles.label}>Phone</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter phone number"
                                placeholderTextColor="#9e9e9e"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => handleChange('phone', text)}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
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
    // List styles
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    listHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    contactCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        padding: 16,
    },
    contactInfo: {
        marginBottom: 10,
    },
    contactField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    contactLabel: {
        fontSize: 14,
        color: '#666',
    },
    contactValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'right',
    },
    contactActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    editButton: {
        padding: 6,
    },
    deleteButton: {
        padding: 6,
    },
});

export default EmergencyContactForm;