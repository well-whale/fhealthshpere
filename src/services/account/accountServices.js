import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const getDetailAccount = async (id) => {
  try {
    return await axios.get(`${process.env.BE_PUBLIC_API_URL}/${id}`);
  } catch (error) {
    console.error(error);
  }
};

export const loginGGFirebase = async (firebaseIdToken) => {
  try {
    console.log(firebaseIdToken)
    const response = await axios({
      method: 'POST',
      url: 'https://fhealsphere.azurewebsites.net/api/auth/firebase-login',
      data: JSON.stringify(firebaseIdToken), // Convert to JSON string
      headers: {
        'Content-Type': 'application/json' // Change to JSON content type
      }
    });

    console.log(response.data);
    console.log('Response:', response.data);
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('Token', response.data.token);

      return response.data;
    }

    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getProgile = async (id) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://fhealsphere.azurewebsites.net/api/accounts/${id}`,
      headers: {
        'Content-Type': 'application/json' // Change to JSON content type
      }
    });

    if (response.data ) {
      await AsyncStorage.setItem('userName', response.data.fullName);

      return response.data;
    }

    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};