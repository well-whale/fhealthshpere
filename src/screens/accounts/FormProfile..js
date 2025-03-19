import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Pressable,
    Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const FormProfile = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        dateOfBirth: new Date(),
        gender: '',
        phone: '',
        address: '',
        bloodType: '',
        medicalConditions: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        gender: '',
        phone: '',
        address: '',
        bloodType: '',
        medicalConditions: ''
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const navigation = useNavigation();

    // Gender options
    const genderOptions = ['Male', 'Female', 'Other'];

    // Blood type options
    const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const validateStep = (currentStep) => {
        let isValid = true;
        const newErrors = { ...errors };

        if (currentStep === 1) {
            // Validate name
            if (!formData.name.trim()) {
                newErrors.name = 'Name is required';
                isValid = false;
            } else {
                newErrors.name = '';
            }

            // Validate gender
            if (!formData.gender) {
                newErrors.gender = 'Please select a gender';
                isValid = false;
            } else {
                newErrors.gender = '';
            }
        } else if (currentStep === 2) {
            // Validate phone
            if (!formData.phone.trim()) {
                newErrors.phone = 'Phone number is required';
                isValid = false;
            } else if (!/^\d{10,}$/.test(formData.phone.trim())) {
                newErrors.phone = 'Please enter a valid phone number';
                isValid = false;
            } else {
                newErrors.phone = '';
            }

            // Validate address
            if (!formData.address.trim()) {
                newErrors.address = 'Address is required';
                isValid = false;
            } else {
                newErrors.address = '';
            }

            // Validate blood type
            if (!formData.bloodType) {
                newErrors.bloodType = 'Please select a blood type';
                isValid = false;
            } else {
                newErrors.bloodType = '';
            }
        } else if (currentStep === 3) {
            // Validate medical conditions
            if (!formData.medicalConditions.trim()) {
                newErrors.medicalConditions = 'Please enter medical conditions or "None" if not applicable';
                isValid = false;
            } else {
                newErrors.medicalConditions = '';
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        } else {
            //   Alert.alert(
            //     "Incomplete Form",
            //     "Please fill in all required fields before proceeding.",
            //     [{ text: "OK" }]
            //   );
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = () => {
        if (validateStep(step)) {
            console.log('Form submitted:', formData);
            // Handle form submission - e.g., API call
            //   Alert.alert(
            //     "Form Submitted",
            //     "Your information has been submitted successfully!",
            //     [{ text: "OK" }]
            //   );
            navigation.navigate("Band Conection")
        } else {
            Alert.alert(
                "Incomplete Form",
                "Please fill in all required fields before submitting.",
                [{ text: "OK" }]
            );
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || formData.dateOfBirth;
        setShowDatePicker(false);
        setFormData({ ...formData, dateOfBirth: currentDate });
    };

    const formatDate = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const SelectionOption = ({ options, selectedValue, onSelect, label, error }) => {
        return (
            <View style={styles.selectionContainer}>
                <Text style={styles.label}>{label} <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.optionsContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.optionButton,
                                selectedValue === option && styles.selectedOption
                            ]}
                            onPress={() => onSelect(option)}
                        >
                            <Text style={[
                                styles.optionText,
                                selectedValue === option && styles.selectedOptionText
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
        );
    };

    // Step 1: Personal Details (Name, Date of Birth, Gender)
    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Enter Your Details</Text>

            <Text style={styles.label}>Name <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your full name"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <Text style={styles.label}>Date of Birth <Text style={styles.requiredStar}>*</Text></Text>
            <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
            >
                <Text>{formatDate(formData.dateOfBirth)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={formData.dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            <SelectionOption
                label="Gender"
                options={genderOptions}
                selectedValue={formData.gender}
                onSelect={(value) => setFormData({ ...formData, gender: value })}
                error={errors.gender}
            />

            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );

    // Step 2: Contact Information (Phone Number, Address, Blood Type)
    const renderStep2 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Contact Information</Text>

            <Text style={styles.label}>Phone Number <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

            <Text style={styles.label}>Address <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
                style={[styles.input, errors.address ? styles.inputError : null]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter your address"
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

            <SelectionOption
                label="Blood Type"
                options={bloodTypeOptions}
                selectedValue={formData.bloodType}
                onSelect={(value) => setFormData({ ...formData, bloodType: value })}
                error={errors.bloodType}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={handleBack}>
                    <Text style={styles.buttonTextSecondary}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Step 3: Medical Information
    const renderStep3 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.stepTitle}>Medical Information</Text>

            <Text style={styles.label}>Existing Medical Conditions</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.medicalConditions}
                onChangeText={(text) => setFormData({ ...formData, medicalConditions: text })}
                placeholder="List any existing medical conditions"
                multiline
                numberOfLines={4}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={handleBack}>
                    <Text style={styles.buttonTextSecondary}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSubmit} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            <View style={styles.stepProgressContainer}>
                <View style={[styles.stepProgress, { width: `${(step / 3) * 100}%` }]} />
            </View>
            <View style={styles.stepLabels}>
                <Text style={[styles.stepLabel, step >= 1 && styles.activeStepLabel]}>
                    Personal Details
                </Text>
                <Text style={[styles.stepLabel, step >= 2 && styles.activeStepLabel]}>
                    Contact Info
                </Text>
                <Text style={[styles.stepLabel, step >= 3 && styles.activeStepLabel]}>
                    Medical Info
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {renderStepIndicator()}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </ScrollView>

            <View style={styles.noteContainer}>
                <Text style={styles.noteText}>
                    <Text style={styles.requiredStar}>*</Text> All fields marked with an asterisk are required
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    backButton: {
        padding: 10,
    },
    closeButton: {
        padding: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 80, // Extra space for the note at bottom
    },
    stepIndicator: {
        padding: 20,
        paddingBottom: 0,
        backgroundColor: '#fff',
    },
    stepProgressContainer: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        marginBottom: 10,
    },
    stepProgress: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 3,
    },
    stepLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
    },
    stepLabel: {
        fontSize: 12,
        color: '#999',
    },
    activeStepLabel: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#ff3b30',
    },
    dateInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 15,
        flex: 1,
    },
    buttonSecondary: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 15,
        marginRight: 10,
        flex: 1,
    },
    buttonSubmit: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 15,
        flex: 1,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    buttonTextSecondary: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    selectionContainer: {
        marginBottom: 15,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    optionButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f5f5f5',
    },
    selectedOption: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4CAF50',
    },
    optionText: {
        color: '#333',
    },
    selectedOptionText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 10,
    },
    requiredStar: {
        color: '#ff3b30',
        fontWeight: 'bold',
    },
    noteContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    noteText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default FormProfile;