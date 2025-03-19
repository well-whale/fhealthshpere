import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const Notification = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'warning',
      title: 'High Blood Pressure Warning',
      message: 'Your blood pressure has exceeded the normal threshold (150/95 mmHg)',
      time: '2 hours ago',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isNew: true,
      iconName: 'warning',
    },
    {
      id: '2',
      type: 'device',
      title: 'New Login',
      message: 'New login detected from iPhone 13',
      time: '5 hours ago',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isNew: true,
      iconName: 'phone-portrait',
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Blood Pressure Reminder',
      message: 'It is time for your morning blood pressure measurement',
      time: 'Yesterday',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isNew: false,
      iconName: 'notifications',
    },
    {
      id: '4',
      type: 'report',
      title: 'Weekly Blood Pressure Report',
      message: 'View detailed weekly blood pressure report',
      time: '2 days ago',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isNew: false,
      iconName: 'document-text',
    },
  ]);

  // Format date for comparison
  const formatDate = (date) => {
    return date ? new Date(date.setHours(0, 0, 0, 0)) : null;
  };

  // Lọc thông báo dựa trên tìm kiếm và bộ lọc
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter = activeFilter === 'unread' ? notification.isNew : true;

    const notificationDate = formatDate(notification.date);
    const filterDate = formatDate(selectedDate);
    const matchesDate = filterDate ? 
      notificationDate.getTime() === filterDate.getTime() : true;

    return matchesSearch && matchesFilter && matchesDate;
  });

  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  // Reset date filter
  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isNew: false
    }));
    setNotifications(updatedNotifications);
    Alert.alert("Success", "All notifications marked as read");
  };

  // Mark single notification as read
  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, isNew: false } : notification
    );
    setNotifications(updatedNotifications);
  };

  // Biểu tượng và màu sắc dựa trên loại thông báo
  const getIconBackground = (type) => {
    switch (type) {
      case 'warning':
        return '#ffebee';
      case 'device':
        return '#e3f2fd';
      case 'reminder':
        return '#e8eaf6';
      case 'report':
        return '#e0f2f1';
      default:
        return '#f5f5f5';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'warning':
        return '#f44336';
      case 'device':
        return '#2196f3';
      case 'reminder':
        return '#3f51b5';
      case 'report':
        return '#009688';
      default:
        return '#757575';
    }
  };

  // Render một mục thông báo
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        item.isNew ? styles.unreadItem : null
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View
        style={[
          styles.notificationIcon,
          { backgroundColor: getIconBackground(item.type) }
        ]}
      >
        <Ionicons
          name={item.iconName}
          size={20}
          color={getIconColor(item.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {item.isNew && <View style={styles.newBadge}><Text style={styles.badgeText}>New</Text></View>}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  // Empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No notifications found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
            <View style={{ height: 50 }} />
      
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Thanh tìm kiếm */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notifications"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bộ lọc */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' ? styles.activeFilter : styles.inactiveFilter
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'all' ? styles.activeFilterText : styles.inactiveFilterText
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'unread' ? styles.activeFilter : styles.inactiveFilter
          ]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'unread' ? styles.activeFilterText : styles.inactiveFilterText
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.calendarButton,
            selectedDate ? styles.activeCalendar : null
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={18} color={selectedDate ? "#1976d2" : "#333"} />
          <Text style={[
            styles.calendarText,
            selectedDate ? styles.activeCalendarText : null
          ]}>
            {selectedDate ? selectedDate.toLocaleDateString() : 'Filter by date'}
          </Text>
        </TouchableOpacity>

        {selectedDate && (
          <TouchableOpacity onPress={clearDateFilter} style={styles.clearDateButton}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Danh sách thông báo */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        style={styles.notificationList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={filteredNotifications.length === 0 ? {flex: 1} : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    position: 'absolute',
    left: 26,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 36,
    fontSize: 15,
  },
  clearIcon: {
    position: 'absolute',
    right: 26,
    zIndex: 1,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#e1ebfd',
  },
  inactiveFilter: {
    backgroundColor: '#f5f5f5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#1976d2',
  },
  inactiveFilterText: {
    color: '#333',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCalendar: {
    backgroundColor: '#e1ebfd',
  },
  calendarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  activeCalendarText: {
    color: '#1976d2',
  },
  clearDateButton: {
    padding: 4,
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  unreadItem: {
    backgroundColor: '#fafafa',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#202020',
  },
  newBadge: {
    backgroundColor: '#2196f3',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});

export default Notification;