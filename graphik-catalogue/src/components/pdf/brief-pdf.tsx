import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#171717" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 12, color: "#737373", marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    padding: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingVertical: 8,
  },
  rowHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#a3a3a3",
    paddingVertical: 8,
    fontWeight: "bold",
  },
  col1: { width: "40%" },
  col2: { width: "20%" },
  col3: { width: "15%", textAlign: "center" },
  col4: { width: "25%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#171717",
  },
  totalLabel: { fontSize: 14, fontWeight: "bold" },
  totalValue: { fontSize: 16, fontWeight: "bold" },
})

export function BriefPDF({ brief }: { brief: any }) {
  const clientName =
    [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") ||
    brief.user.email

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Devis {brief.store.name}</Text>
            <Text style={styles.subtitle}>
              Réf: {brief.id.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>GRAPHIK</Text>
            <Text style={styles.subtitle}>
              {new Date(brief.updatedAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Client</Text>
          <Text>{brief.store.name}</Text>
          <Text>
            {clientName} ({brief.user.email})
          </Text>
          {brief.logistics?.contactPhone && (
            <Text>Tél: {brief.logistics.contactPhone}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestations</Text>
          <View style={styles.rowHeader}>
            <Text style={styles.col1}>Désignation</Text>
            <Text style={styles.col2}>Dimensions</Text>
            <Text style={styles.col3}>Quantité</Text>
            <Text style={styles.col4}>Total HT</Text>
          </View>
          {brief.lines.map((line: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.col1}>
                {line.customName || line.product?.name || "Prestation"}
              </Text>
              <Text style={styles.col2}>
                {line.width && line.height
                  ? `${line.width}m x ${line.height}m`
                  : "—"}
              </Text>
              <Text style={styles.col3}>{line.quantity}</Text>
              <Text style={styles.col4}>
                {line.totalPriceHT.toFixed(2)} €
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT Estimé</Text>
            <Text style={styles.totalValue}>{brief.totalHT.toFixed(2)} €</Text>
          </View>
        </View>
        <View style={{ marginTop: 40, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#e5e5e5" }}>
           <Text style={{ fontSize: 9, color: "#a3a3a3", textAlign: "center" }}>
             Ce document est généré automatiquement par l'application Catalogue Graphik Decathlon.
           </Text>
        </View>
      </Page>
    </Document>
  )
}
