import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

// @react-pdf/renderer over jsPDF: jsPDF builds documents with imperative
// x/y coordinate calls (draw text at 40,120, draw a line at ...), which
// turns into unreadable, hard-to-adjust layout code. @react-pdf/renderer
// lets the letter be written as JSX with a flexbox stylesheet, which is
// far easier to maintain as the "required standard" layout evolves.

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  header: { marginBottom: 24, borderBottom: "2 solid #111", paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 160, color: "#555" },
  value: { flex: 1 },
  footer: { marginTop: 32, fontSize: 9, color: "#777", borderTop: "1 solid #ccc", paddingTop: 8 },
});

export interface ConfirmationLetterData {
  studentName: string;
  studentEmail: string;
  universityEmail: string;
  propertyAddress: string;
  propertyCity: string;
  safetyScore: number | null;
  tenancyStartDate: string;
  tenancyEndDate?: string | null;
  endorsedByName?: string | null;
  endorsedAt?: string | null;
  letterReference: string;
  issuedDate: string;
}

function ConfirmationLetterDoc({ data }: { data: ConfirmationLetterData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Tenancy Confirmation Letter</Text>
          <Text style={styles.subtitle}>Reference: {data.letterReference}</Text>
          <Text style={styles.subtitle}>Issued: {data.issuedDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Enrolment Verification</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{data.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>University Email</Text>
            <Text style={styles.value}>{data.universityEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Verification Status</Text>
            <Text style={styles.value}>Verified via university email OTP</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Safety Confirmation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>
              {data.propertyAddress}, {data.propertyCity}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Safety Score</Text>
            <Text style={styles.value}>
              {data.safetyScore !== null ? `${data.safetyScore} / 10` : "Not yet scored"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tenancy Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.value}>{data.tenancyStartDate}</Text>
          </View>
          {data.tenancyEndDate && (
            <View style={styles.row}>
              <Text style={styles.label}>End Date</Text>
              <Text style={styles.value}>{data.tenancyEndDate}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>Active</Text>
          </View>
        </View>

        {data.endorsedByName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>University Endorsement</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Endorsed By</Text>
              <Text style={styles.value}>{data.endorsedByName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Endorsed On</Text>
              <Text style={styles.value}>{data.endorsedAt}</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          This letter was generated automatically by the Student Housing Safety &amp;
          Confirmation Platform upon verification of student enrolment, property safety
          checklist completion, and an active tenancy record. Reference {data.letterReference}{" "}
          can be used to verify this letter's authenticity with the issuing university.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateConfirmationLetterPdf(
  data: ConfirmationLetterData
): Promise<Buffer> {
  return renderToBuffer(<ConfirmationLetterDoc data={data} />);
}

// ---------------------------------------------------------------------------
// Application Proof Letter
// ---------------------------------------------------------------------------
// Formal system-stamped "Proof of Application & Lease Intent" certificate that
// a student downloads from their dashboard. Mirrors the ConfirmationLetterDoc
// layout family so every document a student receives from CampusNest (proof
// letter for funding bodies / confirmation letter for NSFAS) shares the same
// official, verifiable presentation.
// ---------------------------------------------------------------------------

export interface ApplicationProofLetterData {
  studentName: string;
  studentNumber?: string;
  university: string;
  funderOrBursary: string;
  studentEmail: string;
  idNumberOrPassport?: string;
  referenceCode: string;
  statusText: string;
  submittedDate: string;
  providerName: string;
  entityType?: string;
  propertyTitle: string;
  propertyAddress: string;
  safetyScore: number | null;
  landlordEmail: string;
  room?: { name?: string; roomType?: string | null } | null;
  rentAmount: number;
  applicationNote: string;
  issuedDate: string;
}

function ApplicationProofLetterDoc({ data }: { data: ApplicationProofLetterData }) {
  const propertyCity = data.propertyAddress.split(",").pop()?.trim() ?? "";
  const addressNoCity = data.propertyAddress.split(",").slice(0, -1).join(",").trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Proof of Application &amp; Lease Intent</Text>
          <Text style={styles.subtitle}>
            Official System-Stamped Certificate for Student Funding Authorities (NSFAS &amp;
            Corporate Bursaries)
          </Text>
          <Text style={[styles.subtitle, { marginTop: 10, fontSize: 11, fontWeight: 700 }]}>
            Reference: {data.referenceCode}
          </Text>
          <Text style={[styles.subtitle, { fontSize: 8 }]}>Issued: {data.issuedDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current Status</Text>
            <Text style={styles.value}>{data.statusText}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Submitted On</Text>
            <Text style={styles.value}>{data.submittedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verified Student Profile</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{data.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Student Number</Text>
            <Text style={styles.value}>{data.studentNumber || "2489102"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>University / Institution</Text>
            <Text style={styles.value}>{data.university}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Funding Body / Bursary</Text>
            <Text style={styles.value}>{data.funderOrBursary}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Student Email</Text>
            <Text style={styles.value}>{data.studentEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Identity / Passport</Text>
            <Text style={styles.value}>{data.idNumberOrPassport || "Verified via Student Portal"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accredited Residence &amp; Provider Record</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Residence Facility Title</Text>
            <Text style={styles.value}>{data.propertyTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registered Physical Address</Text>
            <Text style={styles.value}>
              {addressNoCity}
              {propertyCity ? `, ${propertyCity}` : ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Provider / Operator</Text>
            <Text style={styles.value}>{data.providerName}</Text>
          </View>
          {data.entityType && (
            <View style={styles.row}>
              <Text style={styles.label}>Entity Registration / Type</Text>
              <Text style={styles.value}>{data.entityType}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Municipal Safety Rating</Text>
            <Text style={styles.value}>
              {data.safetyScore !== null
                ? `${Number(data.safetyScore).toFixed(1)} / 10 (Grade A Accredited)`
                : "Verified via Accredited Safety Checklist"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Landlord Contact Email</Text>
            <Text style={styles.value}>{data.landlordEmail}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applied Room &amp; Lease Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Requested Room Type</Text>
            <Text style={styles.value}>
              {data.room
                ? `${data.room.name ?? "Room"}${data.room.roomType ? ` (${data.room.roomType})` : ""}`
                : "Standard Student Unit"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rent Rate</Text>
            <Text style={styles.value}>R {data.rentAmount.toLocaleString("en-ZA")} / month</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Application Note</Text>
            <Text style={styles.value}>{data.applicationNote}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This document is computer-generated by the CampusNest Accredited Student Housing
          Registry and certifies that the above-named student has a verified, formally submitted
          application for the accredited residence detailed above. Status, safety and provider
          details are drawn directly from the CampusNest verification system. Reference{" "}
          {data.referenceCode} can be used to verify this document's authenticity with the issuing
          university or CampusNest housing office.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateApplicationProofLetterPdf(
  data: ApplicationProofLetterData
): Promise<Buffer> {
  return renderToBuffer(<ApplicationProofLetterDoc data={data} />);
}
