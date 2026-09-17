"use client";

import React, { useState } from "react";
import {
  FileText,
  User,
  GraduationCap,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  HeartPulse,
  Send,
  Sparkles,
} from "lucide-react";
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
  customRequirements?: LandlordCustomRequirement[];
  initialStudent?: StudentBaseProfile;
  onSubmitSuccess?: (applicationId: string) => void;
}

export function DynamicApplicationForm({
  propertyId,
  propertyTitle,
  monthlyRent,
  landlordName,
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
  initialStudent = {
    name: "Lerato",
    surname: "Nkosi",
    email: "student@example.com",
    universityEmail: "lerato.nkosi@wits.ac.za",
    studentNumber: "2489102",
    universityName: "University of the Witwatersrand (Wits)",
    degreeProgram: "BSc Computer Science",
    fundingType: "NSFAS",
    funderName: "NSFAS Direct Allowance",
    monthlyAllowance: 4800,
  },
  onSubmitSuccess,
}: DynamicApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic responses state
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string | boolean>>({});
  const [studentMessage, setStudentMessage] = useState("");

  const handleDynamicChange = (id: string, value: string | boolean) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
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
          message: studentMessage,
          customAddendaResponses: dynamicAnswers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit housing application");
      }

      const result = await response.json();
      setSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess(result.application?.id || "app_success");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card variant="elevated" className="p-8 text-center space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/30">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-300">
          Application Successfully Dispatched!
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Your pre-verified student profile and custom landlord addenda have been securely routed to{" "}
          <strong>{landlordName}</strong> for <strong>{propertyTitle}</strong>.
        </p>
        <div className="pt-2">
          <Badge variant="success" size="lg">
            Status: Pending Landlord Tenancy Acceptance
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="border border-slate-200 dark:border-navy-700">
      <CardHeader className="border-b border-slate-100 dark:border-navy-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="navy" size="sm">
                Accredited Application
              </Badge>
              <Badge variant="info" size="sm">
                R{monthlyRent.toLocaleString()}/mo
              </Badge>
            </div>
            <CardTitle className="text-xl mt-1.5">{propertyTitle}</CardTitle>
            <CardDescription className="text-xs">
              Direct submission to housing operator: <strong>{landlordName}</strong>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Pre-Populated Verified Base Student Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              1. Verified Student KYC (Auto-Populated from Registry)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/70 border border-slate-200/70 dark:border-navy-700 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Applicant:</span>{" "}
                <strong className="text-slate-900 dark:text-white">
                  {initialStudent.name} {initialStudent.surname}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Student Number:</span>{" "}
                <strong className="text-slate-900 dark:text-white">{initialStudent.studentNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Institution:</span>{" "}
                <strong className="text-blue-600 dark:text-blue-400">{initialStudent.universityName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Bursary Funder:</span>{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {initialStudent.funderName} (R{initialStudent.monthlyAllowance}/mo)
                </strong>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamically Injected Landlord Custom Fields */}
          {customRequirements.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  2. Landlord Custom Requirement Addenda ({customRequirements.length} Injected Controls)
                </h4>
                <span className="text-[11px] text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded font-medium">
                  Dynamic Form Engine
                </span>
              </div>

              <div className="space-y-4 p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40">
                {customRequirements.map((req) => (
                  <div key={req.id} className="space-y-1.5">
                    {req.type === "medical_waiver" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                          {req.label} {req.required && <span className="text-red-500">*</span>}
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
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          {req.label} {req.required && <span className="text-red-500">*</span>}
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
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {req.label} {req.required && <span className="text-red-500">*</span>}
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

          {/* Section 3: Applicant Personal Cover Message */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Applicant Introduction to Landlord (Optional)
            </label>
            <Textarea
              rows={2}
              placeholder="Introduce yourself, desired move-in date, or preferred room type..."
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 dark:bg-navy-900 border-t border-slate-100 dark:border-navy-800 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Auto-binds to Cryptographic Confirmation upon approval
          </span>
          <Button
            type="submit"
            variant="emerald"
            size="md"
            isLoading={submitting}
            rightIcon={<Send className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Submit Accredited Application
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
