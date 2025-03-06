import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BackButton() {
        const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    backButton: {
        color: "black",
        width: "40%",
        aspectRatio: 2,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        // marginBottom: 10,
        color: "black",
        height: "5%"
    }
})