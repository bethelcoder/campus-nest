"use client";

import React from "react";
import LandlordOverviewDashboard from "./landlord-overview-dashboard";

export interface SetupCardItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  isCompleted?: boolean;
  isSkipped?: boolean;
}

interface LandlordSetupActionGridProps {
  user?: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
  initialProperties?: any[];
  initialApplications?: any[];
}

export default function LandlordSetupActionGrid(props: LandlordSetupActionGridProps) {
  return <LandlordOverviewDashboard {...props} />;
}
