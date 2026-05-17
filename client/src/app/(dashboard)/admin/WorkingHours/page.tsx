"use client";

import { useMemo, useState } from "react";
import DefaultWorkingHours from "./DefaultWorkingHours";
import WorkingHoursByDate from "./WorkingHoursByDate";
import BreakHours from "./BreakHours";

type TabKey = "default" | "byDate" | "break";

export default function WorkingHoursPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("default");

  const tabs = useMemo(
    () => [
      { key: "default" as const, label: "Default Working Hours" },
      { key: "byDate" as const, label: "Working Hours By Date" },
      { key: "break" as const, label: "Break Hours" },
    ],
    []
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Working Hours</h1>
        <p className="text-gray-500 text-sm mt-1">Manage weekly hours and date-specific overrides</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-2 mb-6 inline-flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/20"
                  : "bg-gray-50 text-gray-600 hover:bg-accent hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "default" && <DefaultWorkingHours />}
      {activeTab === "byDate" && <WorkingHoursByDate />}
      {activeTab === "break" && <BreakHours />}
    </div>
  );
}
