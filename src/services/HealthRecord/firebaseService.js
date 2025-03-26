import { db, ref, push, set } from "../../firebase/firebaseConfig";
import { Alert } from "react-native";

class FirebaseService {
  async saveHealthData(measurementData, userID, brandID, heartRate) {
    try {
      const newData = {
        BandId: measurementData.brandID || brandID || 1,
        GhiChu: "user" + userID,
        PatientId: parseInt(userID) || 0,
        RecordMetricItems: {
          0: {
            HealthRecordId: 0,
            MetricId: 1,
            RecordId: 0,
            Type: "string",
            Value: measurementData.systolic.toString()
          },
          1: {
            HealthRecordId: 0,
            MetricId: 2,
            RecordId: 0,
            Type: "string",
            Value: measurementData.diastolic.toString()
          },
          2: {
            HealthRecordId: 0,
            MetricId: 3,
            RecordId: 0,
            Type: "string",
            Value: (measurementData.pulse || heartRate).toString()
          }
        }
      };
      
      const newPostKey = push(ref(db, "healthRecords")).key;
      await set(ref(db, `healthRecords/${newPostKey}`), newData);
      console.log("Data saved successfully to Firebase with key:", newPostKey);
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      Alert.alert("Error", "Could not save data to Firebase");
    }
  }
}

export default new FirebaseService();