"use client";

import { FormEvent, useState } from "react";

type ProfileValues = Record<string, string>;

const fields = [
  ["name", "First name"],
  ["surname", "Surname"],
  ["phone", "Phone number"],
  ["idNumber", "ID or passport number"],
  ["dateOfBirth", "Date of birth"],
  ["gender", "Gender"],
  ["nationality", "Nationality"],
  ["preferredLanguage", "Preferred language"],
  ["universityName", "University"],
  ["studentNumber", "Student number"],
  ["degreeProgram", "Degree programme"],
  ["yearOfStudy", "Year of study"],
  ["city", "City"],
  ["province", "Province"],
  ["emergencyContactName", "Emergency contact name"],
  ["emergencyContactPhone", "Emergency contact phone"],
  ["emergencyContactRelationship", "Emergency contact relationship"],
  ["emergencyContact2Name", "Second contact name"],
  ["emergencyContact2Phone", "Second contact phone"],
  ["emergencyContact2Relationship", "Second contact relationship"],
  ["fundingType", "Funding scheme"],
  ["funderName", "Funder name"],
  ["funderReference", "Funder reference"],
  ["funderContactEmail", "Funder contact email"],
  ["monthlyAllowance", "Monthly allowance"],
  ["monthlyBudget", "Monthly accommodation budget"],
  ["householdIncomeBracket", "Household income bracket"],
  ["guarantorName", "Guarantor name"],
  ["guarantorPhone", "Guarantor phone"],
  ["guarantorRelationship", "Guarantor relationship"],
] as const;

export default function ProfileForm({ initialValues }: { initialValues: ProfileValues }) {
  const [values, setValues] = useState(initialValues);
  const [address, setAddress] = useState(initialValues.currentAddress || "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus("idle");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    const response = await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, currentAddress: address }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(typeof data.error === "string" ? data.error : "Could not update your profile.");
      return;
    }
    setStatus("saved");
    setMessage("Profile updated successfully.");
  }

  return (
    <form onSubmit={save} className="space-y-7">
      <section>
        <h2 className="text-lg font-bold text-[#0F172A]">Personal information</h2>
        <p className="mt-1 text-sm text-[#64748B]">Keep your identity and contact details current.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.slice(0, 8).map(([key, label]) => (
            <label key={key} className="space-y-1.5 text-xs font-bold text-[#334155]">
              {label}
              <input type={key === "dateOfBirth" ? "date" : "text"} value={values[key] || ""} onChange={(event) => update(key, event.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]" />
            </label>
          ))}
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] pt-7">
        <h2 className="text-lg font-bold text-[#0F172A]">University and address</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.slice(8, 14).map(([key, label]) => (
            <label key={key} className="space-y-1.5 text-xs font-bold text-[#334155]">
              {label}
              <input value={values[key] || ""} onChange={(event) => update(key, event.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]" />
            </label>
          ))}
          <label className="space-y-1.5 text-xs font-bold text-[#334155] sm:col-span-2">
            Current address
            <textarea rows={3} value={address} onChange={(event) => setAddress(event.target.value)} className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]" />
          </label>
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] pt-7">
        <h2 className="text-lg font-bold text-[#0F172A]">Emergency contact</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {fields.slice(14, 20).map(([key, label]) => (
            <label key={key} className="space-y-1.5 text-xs font-bold text-[#334155]">
              {label}
              <input value={values[key] || ""} onChange={(event) => update(key, event.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]" />
            </label>
          ))}
        </div>
      </section>

      <section className="border-t border-[#F1F5F9] pt-7">
        <h2 className="text-lg font-bold text-[#0F172A]">Funding and bursary</h2>
        <p className="mt-1 text-sm text-[#64748B]">Keep your funding information current for applications and funder letters.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.slice(20, 27).map(([key, label]) => (
            <label key={key} className="space-y-1.5 text-xs font-bold text-[#334155]">
              {label}
              <input type={key === "monthlyAllowance" || key === "monthlyBudget" ? "number" : key === "funderContactEmail" ? "email" : "text"} step={key === "monthlyAllowance" || key === "monthlyBudget" ? "0.01" : undefined} value={values[key] || ""} onChange={(event) => update(key, event.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]" />
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {fields.slice(27).map(([key, label]) => (
            <label key={key} className="space-y-1.5 text-xs font-bold text-[#334155]">
              {label}
              <input value={values[key] || ""} onChange={(event) => update(key, event.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]" />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-col justify-between gap-3 border-t border-[#F1F5F9] pt-5 sm:flex-row sm:items-center">
        <p className={`text-xs ${status === "error" ? "text-rose-600" : status === "saved" ? "text-emerald-600" : "text-[#64748B]"}`}>{message || "Changes are saved to your student profile."}</p>
        <button type="submit" disabled={status === "saving"} className="rounded-xl bg-[#0F172A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1E293B] disabled:cursor-wait disabled:bg-[#CBD5E1]">{status === "saving" ? "Saving..." : "Save changes"}</button>
      </div>
    </form>
  );
}
