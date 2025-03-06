import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'

export default function Schedule() {
  const data = [
    {
      id: 1,
      time: "Today @ 05:20 pm",
      sys: "120",
      dia: "80",
      pulse: "70",
      weight: "70.0",
      date: "mmHg",
    },
    {
      id: 2,
      time: "Fri, 20 Dec 2020 @ 12:13 pm",
      sys: "120",
      dia: "80",
      pulse: "70",
      weight: "70.0",
      date: "mmHg",
    },
    {
      id: 3,
      time: "Fri, 20 Dec 2020 @ 12:13 pm",
      sys: "120",
      dia: "80",
      pulse: "70",
      weight: "70.0",
      date: "mmHg",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryUnit}>mmHg</Text>
        <Text style={styles.timeRange}>Past 3 Months</Text>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cellHeader}>SYS</Text>
            <Text style={styles.cell}>120</Text>
            <Text style={styles.cell}>120</Text>
            <Text style={styles.cell}>120</Text>
            <Text style={styles.cell}>5.2</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellHeader}>DIA</Text>
            <Text style={styles.cell}>120</Text>
            <Text style={styles.cell}>52</Text>
            <Text style={styles.cell}>120</Text>
            <Text style={styles.cell}>5.2</Text>
          </View>
        </View>
      </View>

      {/* Blood Pressure History */}
      {data.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.timeText}>{item.time}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>SYS - DIA</Text>
              <Text style={styles.infoValue}>
                {item.sys} - {item.dia}
              </Text>
              <Text style={styles.infoUnit}>{item.date}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Pulse</Text>
              <Text style={styles.infoValue}>{item.pulse}</Text>
              <Text style={styles.infoUnit}>BPM</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{item.weight}</Text>
              <Text style={styles.infoUnit}>kgs</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
    // paddingTop: 50,

  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryUnit: {
    fontSize: 14,
    color: "gray",
  },
  timeRange: {
    fontSize: 14,
    color: "gray",
    textAlign: "right",
  },
  table: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  cellHeader: {
    fontWeight: "bold",
    width: "20%",
  },
  cell: {
    width: "20%",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoBlock: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "gray",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoUnit: {
    fontSize: 12,
    color: "gray",
  },
});
