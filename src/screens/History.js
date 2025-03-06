import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function History() {
  return (
    <ScrollView style={styles.container}>
      {/* Card chi tiết đo huyết áp */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.icon}></View>
          <Text style={styles.dateText}>13 Feb 25 15:00</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>SYS</Text>
            <Text style={styles.unit}>mmHg</Text>
          </View>
          <Text style={styles.value}>120</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>DIA</Text>
            <Text style={styles.unit}>mmHg</Text>
          </View>
          <Text style={styles.value}>70</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Pulse</Text>
            <Text style={styles.unit}>BPM</Text>
          </View>
          <Text style={styles.value}>80</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.unit}>kgs</Text>
          </View>
          <Text style={styles.value}>65.0</Text>
        </View>
        <Text style={styles.footerText}>PP: 0 mmHg  |  MAP: 0 mmHg</Text>
      </View>

      {/* Summary Table */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryUnit}>mmHg</Text>
          <Text style={styles.timeRange}>Past 3 Months</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.rowHeader}>
            <Text style={styles.cellHeader}>Avg</Text>
            <Text style={styles.cellHeader}>Low</Text>
            <Text style={styles.cellHeader}>High</Text>
            <Text style={styles.cellHeader}>StdDev</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cellBold}>SYS</Text>
            <Text style={styles.cell}>120</Text>
            <Text style={[styles.cell, styles.greenText]}>118</Text>
            <Text style={[styles.cell, styles.redText]}>150</Text>
            <Text style={styles.cell}>5.2</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.cellBold}>DIA</Text>
            <Text style={styles.cell}>120</Text>
            <Text style={styles.cell}>70</Text>
            <Text style={[styles.cell, styles.redText]}>100</Text>
            <Text style={styles.cell}>5.2</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
    paddingTop: 50,

  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  icon: {
    width: 20,
    height: 20,
    backgroundColor: "black",
    borderRadius: 10,
  },
  dateText: {
    fontSize: 14,
    color: "gray",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  column: {
    flexDirection: "column",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 12,
    color: "gray",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
  },
  table: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    fontWeight: "bold",
  },
  cellHeader: {
    width: "25%",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  cell: {
    width: "25%",
    textAlign: "center",
    fontSize: 14,
  },
  cellBold: {
    width: "25%",
    fontSize: 14,
    fontWeight: "bold",
  },
  greenText: {
    color: "green",
  },
  redText: {
    color: "red",
  },
});

