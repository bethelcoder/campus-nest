"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LuFileText,
  LuUser,
  LuGraduationCap,
  LuShieldCheck,
  LuPlus,
  LuCheck,
  LuInfo,
  LuFileSpreadsheet,
  LuHeartPulse,
  LuSend,
  LuSparkles,
  LuBed,
  LuDownload,
  LuArrowRight,
  LuCalendar,
} from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";

export interface LandlordCustomRequirement {
  id: string;
  type: "text" | "select" | "checkbox" | "medical_waiver" | "guarantor_affidavit" | "file_upload";
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export interface StudentBaseProfile {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  universityEmail?: string;
  studentNumber?: string;
  universityName?: string;
  degreeProgram?: string;
  fundingType?: string;
  funderName?: string;
  monthlyAllowance?: number;
}

export interface DynamicApplicationFormProps {
  propertyId: string;
  propertyTitle: string;
  monthlyRent: number;
  landlordName: string;
  rooms?: Array<{
    id: string;
    name: string;
    typeName: string;
    monthlyPrice: number;
    deposit: number;
  }>;
  selectedRoomId?: string | null;
  onRoomChange?: (roomId: string) => void;
  selectedIntake?: string;
  customRequirements?: LandlordCustomRequirement[];
  initialStudent?: StudentBaseProfile | null;
  onSubmitSuccess?: (applicationId: string) => void;
}

export function DynamicApplicationForm({
  propertyId,
  propertyTitle,
  monthlyRent,
  landlordName,
  rooms = [],
  selectedRoomId: initialSelectedRoomId,
  onRoomChange,
  selectedIntake = "Semester 1 (Immediate)",
  customRequirements = [
    {
      id: "medical_disclosure",
      type: "medical_waiver",
      label: "Special Medical Condition or Accessibility Needs",
      description: "Disclose any chronic health conditions or mobility accommodations required for room allocation.",
      required: false,
    },
    {
      id: "emergency_guarantor_affidavit",
      type: "guarantor_affidavit",
      label: "Guarantor / Next of Kin Declaration",
      description: "Full name and contact number of parent or legal guardian in case of campus emergencies.",
      required: true,
    },
    {
      id: "dietary_lifestyle_pref",
      type: "select",
      label: "Communal Kitchen Lifestyle Preference",
      description: "Helps match roommates with compatible kitchen usage and study quiet hours.",
      required: false,
      options: ["No Preference / Mixed", "Strictly Halaal", "Strictly Kosher", "Vegetarian / Vegan"],
    },
  ],
  initialStudent,
  onSubmitSuccess,
}: DynamicApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeRoomId, setActiveRoomId] = useState<string>(
    initialSelectedRoomId || (rooms.length > 0 ? rooms[0].id : "")
  );
  const [intakeDuration, setIntakeDuration] = useState(selectedIntake);

  // Dynamic responses state
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string | boolean>>({});
  const [studentMessage, setStudentMessage] = useState("");

  const activeRoomObj = rooms.find((r) => r.id === activeRoomId);
  const displayRent = activeRoomObj ? activeRoomObj.monthlyPrice : monthlyRent;

  const studentData: StudentBaseProfile = initialStudent || {
    name: "Student",
    surname: "Applicant",
    email: "student@example.com",
    universityEmail: "student@university.ac.za",
    studentNumber: "2489102",
    universityName: "University of the Witwatersrand (Wits)",
    degreeProgram: "BSc Computer Science",
    fundingType: "NSFAS",
    funderName: "NSFAS Direct Allowance",
    monthlyAllowance: 4800,
  };

  const handleDynamicChange = (id: string, value: string | boolean) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);
    if (onRoomChange) onRoomChange(roomId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          roomListingId: activeRoomId || undefined,
          duration: intakeDuration,
          message: studentMessage,
          customAddendaResponses: dynamicAnswers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit housing application");
      }

      const result = await response.json();
      const appId = result.application?.id || "app_success";
      setSubmittedAppId(appId);
      if (onSubmitSuccess) onSubmitSuccess(appId);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedAppId) {
    return (
      <Card variant="elevated" className="p-8 text-center space-y-5 bg-emerald-50/50 border-2 border-emerald-500/30">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <LuCheck className="w-8 h-8 font-bold" />
        </div>
        <div>
          <CardTitle className="text-2xl text-emerald-950 font-bold">
            Application Successfully Dispatched!
          </CardTitle>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-1.5 leading-relaxed">
            Your verified student credentials, academic placement details, and bursary declarations have been securely submitted to{" "}
            <strong>{landlordName}</strong> for <strong>{propertyTitle}</strong>.
          </p>
        </div>

        <div className="pt-1 flex justify-center">
          <Badge variant="success" size="lg" className="py-1 px-3.5">
            Status: Application Under Review by Landlord
          </Badge>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/student/applications"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Track on My Dashboard</span>
            <LuArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={`/api/applications/proof/${submittedAppId}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 hover:border-[#005F56] bg-white text-slate-800 hover:text-[#005F56] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
          >
            <LuDownload className="w-4 h-4 text-[#005F56]" />
            <span>Download Proof Letter (PDF)</span>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="border border-slate-200">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="navy" size="sm">
                Accredited Application
              </Badge>
              <Badge variant="info" size="sm">
                R{displayRent.toLocaleString()}/mo
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-1.5">{propertyTitle}</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Direct submission to verified landlord: <strong>{landlordName}</strong>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-5">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <LuInfo className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Accommodation Application Notice</span>
              </div>
              <p className="leading-relaxed text-amber-900">{errorMessage}</p>
              <div className="pt-1 flex items-center gap-2">
                <Link
                  href="/dashboard/student/applications"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-[11px] font-bold transition-all shadow-2xs"
                >
                  <span>Manage My Active Applications</span>
                  <LuArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Section 1: Pre-Populated Verified Base Student Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <LuGraduationCap className="w-4 h-4 text-[#005F56]" />
              1. Verified Student KYC &amp; Funding Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Applicant:</span>{" "}
                <strong className="text-slate-900">
                  {studentData.name} {studentData.surname}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Student Number:</span>{" "}
                <strong className="text-slate-900">{studentData.studentNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Institution:</span>{" "}
                <strong className="text-slate-800">{studentData.universityName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Bursary Funder:</span>{" "}
                <strong className="text-[#005F56]">
                  {studentData.funderName} (R{studentData.monthlyAllowance || 4800}/mo)
                </strong>
              </div>
            </div>
          </div>

          {/* Section 2: Room Selection & Academic Intake */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <LuBed className="w-4 h-4 text-[#005F56]" />
              2. Target Room Layout &amp; Intake Period
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.length > 0 ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Room Layout
                  </label>
                  <select
                    value={activeRoomId}
                    onChange={(e) => handleRoomSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — R{r.monthlyPrice.toLocaleString()}/mo ({r.typeName})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className={rooms.length > 0 ? "" : "sm:col-span-2"}>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Intake Academic Period
                </label>
                <select
                  value={intakeDuration}
                  onChange={(e) => setIntakeDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                >
                  <option value="Semester 1 (Immediate)">Semester 1 (Immediate Placement)</option>
                  <option value="Semester 2">Semester 2 Academic Intake</option>
                  <option value="2027 Full Year">2027 Full Academic Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamically Injected Landlord Custom Fields */}
          {customRequirements.length > 0 && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <LuFileSpreadsheet className="w-4 h-4 text-[#005F56]" />
                  3. Accommodation Addenda Requirements
                </h4>
                <span className="text-[10px] text-[#005F56] bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  Landlord Requirements
                </span>
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {customRequirements.map((req) => (
                  <div key={req.id} className="space-y-1.5">
                    {req.type === "medical_waiver" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <LuHeartPulse className="w-3.5 h-3.5 text-rose-500" />
                          {req.label} {req.required && <span className="text-rose-500">*</span>}
                        </label>
                        {req.description && <p className="text-[11px] text-slate-500">{req.description}</p>}
                        <Textarea
                          rows={2}
                          placeholder="List any accessibility requirements, allergies, or emergency medical info..."
                          value={(dynamicAnswers[req.id] as string) || ""}
                          onChange={(e) => handleDynamicChange(req.id, e.target.value)}
                        />
                      </div>
                    )}

                    {req.type === "guarantor_affidavit" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <LuUser className="w-3.5 h-3.5 text-[#005F56]" />
                          {req.label} {req.required && <span className="text-rose-500">*</span>}
                        </label>
                        {req.description && <p className="text-[11px] text-slate-500">{req.description}</p>}
                        <Input
                          placeholder="e.g. Nomsa Nkosi (Mother) - 082 999 1234"
                          required={req.required}
                          value={(dynamicAnswers[req.id] as string) || ""}
                          onChange={(e) => handleDynamicChange(req.id, e.target.value)}
                        />
                      </div>
                    )}

                    {req.type === "select" && req.options && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">
                          {req.label} {req.required && <span className="text-rose-500">*</span>}
                        </label>
                        {req.description && <p className="text-[11px] text-slate-500">{req.description}</p>}
                        <Select
                          options={req.options.map((opt) => ({ value: opt, label: opt }))}
                          value={(dynamicAnswers[req.id] as string) || req.options[0]}
                          onChange={(e) => handleDynamicChange(req.id, e.target.value)}
                        />
                      </div>
                    )}

                    {req.type === "text" && (
                      <Input
                        label={req.label}
                        required={req.required}
                        helperText={req.description}
                        value={(dynamicAnswers[req.id] as string) || ""}
                        onChange={(e) => handleDynamicChange(req.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Applicant Personal Cover Message */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              4. Note to Landlord (Optional)
            </label>
            <Textarea
              rows={2}
              placeholder="Introduce yourself, desired move-in date, or roommate preferences..."
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <LuShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Cryptographically verifiable on official lease issuance</span>
          </span>
          <Button
            type="submit"
            variant="emerald"
            size="md"
            isLoading={submitting}
            rightIcon={<LuSend className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Submit Application Directly
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

