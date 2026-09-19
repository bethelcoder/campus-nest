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

export interface ApplicationProofLetterData {
  referenceCode: string;
  statusText: string;
  submittedDate: string;
  studentName: string;
  studentNumber: string;
  university: string;
  funderName: string;
  studentEmail: string;
  idNumber: string;
  propertyTitle: string;
  propertyAddress: string;
  providerName: string;
  entityType?: string;
  safetyScore: number | null;
  landlordEmail: string;
  room?: { name: string; roomType: string };
  rentAmount: number;
  note: string;
  issuedDate: string;
}

function ApplicationProofLetterDoc({ data }: { data: ApplicationProofLetterData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Proof of Student Residence Application</Text>
          <Text style={styles.subtitle}>Reference: {data.referenceCode}</Text>
          <Text style={styles.subtitle}>Issued Date: {data.issuedDate}</Text>
          <Text style={styles.subtitle}>Application Status: {data.statusText}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Student Name</Text>
            <Text style={styles.value}>{data.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Student Number</Text>
            <Text style={styles.value}>{data.studentNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Institution</Text>
            <Text style={styles.value}>{data.university}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Funding / Bursary</Text>
            <Text style={styles.value}>{data.funderName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>University Email</Text>
            <Text style={styles.value}>{data.studentEmail}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property & Accommodation Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Residence Name</Text>
            <Text style={styles.value}>{data.propertyTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Physical Address</Text>
            <Text style={styles.value}>{data.propertyAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Accommodation Provider</Text>
            <Text style={styles.value}>{data.providerName}</Text>
          </View>
          {data.room && (
            <View style={styles.row}>
              <Text style={styles.label}>Allocated Room</Text>
              <Text style={styles.value}>
                {data.room.name} ({data.room.roomType.replace(/_/g, " ")})
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Rental Rate</Text>
            <Text style={styles.value}>R{data.rentAmount.toLocaleString()} / month</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Safety Rating</Text>
            <Text style={styles.value}>
              {data.safetyScore !== null ? `${data.safetyScore} / 10 Verified` : "Compliance in Review"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission & Terms Note</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date Submitted</Text>
            <Text style={styles.value}>{data.submittedDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Terms / Remarks</Text>
            <Text style={styles.value}>{data.note}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This certificate serves as official proof that the aforementioned student has submitted a formal accommodation
          placement request via CampusNest. This document can be submitted to university housing offices, NSFAS, and financial aid bursary administrators to verify accommodation placement and lease intent. Reference: {data.referenceCode}.
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

