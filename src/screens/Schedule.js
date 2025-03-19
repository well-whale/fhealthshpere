import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Schedule = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [readings, setReadings] = useState([]);

  // Sample data
  const sampleData = {
    day: [
      { id: 1, time: '8:00 AM', systolic: 138, diastolic: 88, heartRate: 76, status: 'Elevated' },
      { id: 2, time: '12:30 PM', systolic: 128, diastolic: 82, heartRate: 72, status: 'Normal' }
    ],
    week: [
      { id: 1, date: 'Mon, Jan 15', time: '8:00 AM', systolic: 125, diastolic: 82, heartRate: 75, status: 'Normal' },
      { id: 2, date: 'Mon, Jan 15', time: '2:30 PM', systolic: 135, diastolic: 88, heartRate: 78, status: 'Elevated' },
      { id: 3, date: 'Tue, Jan 16', time: '8:30 AM', systolic: 130, diastolic: 85, heartRate: 73, status: 'Normal' },
      { id: 4, date: 'Wed, Jan 17', time: '9:00 AM', systolic: 128, diastolic: 83, heartRate: 70, status: 'Normal' },
      { id: 5, date: 'Thu, Jan 18', time: '8:15 AM', systolic: 132, diastolic: 86, heartRate: 74, status: 'Normal' },
      { id: 6, date: 'Fri, Jan 19', time: '7:45 AM', systolic: 140, diastolic: 90, heartRate: 80, status: 'Elevated' },
    ],
    month: [
      { id: 1, week: 'Week 1 (Jan 1-7)', avgSystolic: 132, avgDiastolic: 84, avgHeartRate: 74, readings: 8 },
      { id: 2, week: 'Week 2 (Jan 8-14)', avgSystolic: 129, avgDiastolic: 83, avgHeartRate: 73, readings: 7 },
      { id: 3, week: 'Week 3 (Jan 15-21)', avgSystolic: 130, avgDiastolic: 85, avgHeartRate: 75, readings: 9 },
      { id: 4, week: 'Week 4 (Jan 22-28)', avgSystolic: 135, avgDiastolic: 87, avgHeartRate: 76, readings: 8 },
    ]
  };

  useEffect(() => {
    // Load data based on active tab
    switch (activeTab) {
      case 'Day':
        setReadings(sampleData.day);
        break;
      case 'Week':
        setReadings(sampleData.week);
        break;
      case 'Month':
        setReadings(sampleData.month);
        break;
      default:
        setReadings(sampleData.day);
    }
  }, [activeTab]);

  // Navigate to previous day/week/month
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (activeTab === 'Day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (activeTab === 'Week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next day/week/month
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (activeTab === 'Day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (activeTab === 'Week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Format date based on active tab
  const getFormattedDate = () => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    if (activeTab === 'Day') {
      return currentDate.toLocaleDateString('en-US', options);
    } else if (activeTab === 'Week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
      const startDay = startOfWeek.getDate();
      const endDay = endOfWeek.getDate();
      const year = endOfWeek.getFullYear();
      
      if (startMonth === endMonth) {
        return `Week of ${startMonth} ${startDay} - ${endDay}, ${year}`;
      } else {
        return `Week of ${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Calculate average readings
  const getAverages = () => {
    if (readings.length === 0) return { systolic: 0, diastolic: 0, heartRate: 0, count: 0 };

    if (activeTab === 'Month') {
      let totalSystolic = 0;
      let totalDiastolic = 0;
      let totalHeartRate = 0;
      let totalReadings = 0;
      
      readings.forEach(week => {
        totalSystolic += week.avgSystolic;
        totalDiastolic += week.avgDiastolic;
        totalHeartRate += week.avgHeartRate;
        totalReadings += week.readings;
      });
      
      return {
        systolic: Math.round(totalSystolic / readings.length),
        diastolic: Math.round(totalDiastolic / readings.length),
        heartRate: Math.round(totalHeartRate / readings.length),
        count: totalReadings
      };
    } else {
      let totalSystolic = 0;
      let totalDiastolic = 0;
      let totalHeartRate = 0;
      
      readings.forEach(reading => {
        totalSystolic += reading.systolic;
        totalDiastolic += reading.diastolic;
        totalHeartRate += reading.heartRate;
      });
      
      return {
        systolic: Math.round(totalSystolic / readings.length),
        diastolic: Math.round(totalDiastolic / readings.length),
        heartRate: Math.round(totalHeartRate / readings.length),
        count: readings.length
      };
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal':
        return '#4CAF50'; // Green
      case 'Elevated':
        return '#FF9800'; // Orange
      case 'High':
        return '#F44336'; // Red
      default:
        return '#4CAF50';
    }
  };

  // Get reading status based on BP values
  const getStatus = (systolic, diastolic) => {
    if (systolic < 120 && diastolic < 80) {
      return 'Normal';
    } else if ((systolic >= 120 && systolic <= 129) && diastolic < 80) {
      return 'Elevated';
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      return 'High (Stage 1)';
    } else if (systolic >= 140 || diastolic >= 90) {
      return 'High (Stage 2)';
    } else if (systolic > 180 || diastolic > 120) {
      return 'Crisis';
    }
    return 'Normal';
  };

  const averages = getAverages();

  // Render day readings
  const renderDayReadings = () => {
    return (
      <>
        {readings.map((reading) => (
          <View key={reading.id} style={styles.readingItem}>
            <View style={styles.readingTimeContainer}>
              <Text style={styles.readingTime}>{reading.time}</Text>
            </View>
            <View style={styles.readingDetails}>
              <View style={styles.bpContainer}>
                <Text style={styles.bpValue}>{`${reading.systolic}/${reading.diastolic}`}</Text>
                <Text style={styles.bpUnit}>mmHg</Text>
              </View>
              <View style={styles.hrContainer}>
                <Ionicons name="heart" size={16} color="#FF5252" />
                <Text style={styles.hrValue}>{`${reading.heartRate} bpm`}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reading.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(reading.status) }]}>{reading.status}</Text>
            </View>
          </View>
        ))}
      </>
    );
  };

  // Render week readings
  const renderWeekReadings = () => {
    return (
      <>
        {readings.map((reading) => (
          <View key={reading.id} style={styles.readingItem}>
            <View style={styles.readingTimeContainer}>
              <Text style={styles.readingDate}>{reading.date}</Text>
              <Text style={styles.readingTime}>{reading.time}</Text>
            </View>
            <View style={styles.readingDetails}>
              <View style={styles.bpContainer}>
                <Text style={styles.bpValue}>{`${reading.systolic}/${reading.diastolic}`}</Text>
                <Text style={styles.bpLabel}>Systolic/Diastolic</Text>
              </View>
              <View style={styles.hrContainer}>
                <Ionicons name="heart" size={16} color="#FF5252" />
                <Text style={styles.hrValue}>{reading.heartRate}</Text>
                <Text style={styles.hrLabel}>Heart Rate</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reading.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(reading.status) }]}>{reading.status}</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  };

  // Render month readings (weekly averages)
  const renderMonthReadings = () => {
    return (
      <>
        {readings.map((week) => (
          <View key={week.id} style={styles.weekItem}>
            <Text style={styles.weekTitle}>{week.week}</Text>
            <View style={styles.weekSummary}>
              <View style={styles.weekSummaryItem}>
                <Text style={styles.weekSummaryValue}>{`${week.avgSystolic}/${week.avgDiastolic}`}</Text>
                <Text style={styles.weekSummaryLabel}>Avg BP</Text>
              </View>
              <View style={styles.weekSummaryItem}>
                <Text style={styles.weekSummaryValue}>{week.avgHeartRate}</Text>
                <Text style={styles.weekSummaryLabel}>Avg HR</Text>
              </View>
              <View style={styles.weekSummaryItem}>
                <Text style={styles.weekSummaryValue}>{week.readings}</Text>
                <Text style={styles.weekSummaryLabel}>Readings</Text>
              </View>
              <TouchableOpacity style={styles.weekDetailsButton}>
                <Text style={styles.weekDetailsText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={{ height: 50 }} />
      
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['Day', 'Week', 'Month'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.activeTabButton : null
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab ? styles.activeTabText : null
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={goToPrevious} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{getFormattedDate()}</Text>
        <TouchableOpacity onPress={goToNext} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Daily Average */}
      <View style={styles.averageContainer}>
        <Text style={styles.averageTitle}>Daily Average</Text>
        <View style={styles.averageCards}>
          <View style={styles.bpCard}>
            <Text style={styles.bpAverageValue}>{`${averages.systolic}/${averages.diastolic}`}</Text>
            <Text style={styles.averageLabel}>Blood Pressure</Text>
          </View>
          <View style={styles.hrCard}>
            <Text style={styles.hrAverageValue}>{averages.heartRate}</Text>
            <Text style={styles.averageLabel}>Heart Rate</Text>
          </View>
          <View style={styles.readingsCard}>
            <Text style={styles.readingsValue}>{averages.count}</Text>
            <Text style={styles.averageLabel}>Readings</Text>
          </View>
        </View>
      </View>
      
      {/* Today's Readings */}
      <View style={styles.readingsContainer}>
        <Text style={styles.readingsTitle}>
          {activeTab === 'Day' ? "Today's Readings" : 
           activeTab === 'Week' ? "This Week's Readings" : 
           "Monthly Summary"}
        </Text>
        
        <ScrollView style={styles.readingsList}>
          {activeTab === 'Day' && renderDayReadings()}
          {activeTab === 'Week' && renderWeekReadings()}
          {activeTab === 'Month' && renderMonthReadings()}
        </ScrollView>
         <View style={{ height: 100 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#1976d2',
  },
  tabText: {
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 12,
  },
  averageContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  averageTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  averageCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bpCard: {
    flex: 1,
    marginRight: 8,
  },
  hrCard: {
    flex: 1,
    alignItems: 'center',
  },
  readingsCard: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  bpAverageValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  hrAverageValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  readingsValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#673AB7',
    marginBottom: 4,
  },
  averageLabel: {
    fontSize: 12,
    color: '#666',
  },
  readingsContainer: {
    flex: 1,
    padding: 16,
  },
  readingsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  readingsList: {
    flex: 1,
  },
  readingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  readingTimeContainer: {
    width: 70,
  },
  readingTime: {
    fontSize: 13,
    color: '#666',
  },
  readingDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  readingDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpContainer: {
    marginRight: 16,
  },
  bpValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  bpUnit: {
    fontSize: 12,
    color: '#999',
  },
  bpLabel: {
    fontSize: 11,
    color: '#999',
  },
  hrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hrValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  hrLabel: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  weekItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  weekTitle: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekSummary: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  weekSummaryItem: {
    flex: 1,
  },
  weekSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  weekSummaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  weekDetailsButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  weekDetailsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Schedule;