import React, { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const formatMonthKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const buildMonthDays = (monthKey) => {
  const [yearValue, monthValue] = monthKey.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!year || !month) {
    return [];
  }

  const dayCount = new Date(year, month, 0).getDate();

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(year, month - 1, index + 1, 12, 0, 0);
    const iso = `${year}-${`${month}`.padStart(2, "0")}-${`${index + 1}`.padStart(2, "0")}`;

    return {
      iso,
      dayNumber: index + 1,
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
      fullLabel: date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  });
};

const getEntryWithDefaults = (entry) => ({
  memorable_moment: entry?.memorable_moment || "",
  remember_this: entry?.remember_this || "",
  tracker_values: entry?.tracker_values || {},
});

const Launchpad = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const token = localStorage.getItem("token");
  const [selectedMonth, setSelectedMonth] = useState(formatMonthKey());
  const [trackers, setTrackers] = useState([]);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState("");
  const [error, setError] = useState("");
  const [trackerError, setTrackerError] = useState("");
  const [addingTracker, setAddingTracker] = useState(false);
  const [newTracker, setNewTracker] = useState({
    label: "",
    tracker_type: "checkbox",
    unit: "",
    max: 5,
  });

  const monthDays = buildMonthDays(selectedMonth);
  const isDark = theme === "dark";

  useEffect(() => {
    const loadLaunchpad = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/launchpad?month=${selectedMonth}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load Launchpad");
        }

        const nextEntries = {};
        (data.entries || []).forEach((entry) => {
          nextEntries[entry.entry_date] = getEntryWithDefaults(entry);
        });

        setTrackers(data.trackers || []);
        setEntriesByDate(nextEntries);
      } catch (fetchError) {
        setError(
          `${fetchError.message}. VITE_BACKEND_URL points to ${import.meta.env.VITE_BACKEND_URL} to it.`,
        );
      } finally {
        setLoading(false);
      }
    };

    loadLaunchpad();
  }, [selectedMonth, user, token]);

  const updateEntryField = (entryDate, field, value) => {
    setEntriesByDate((previousEntries) => {
      const current = getEntryWithDefaults(previousEntries[entryDate]);

      return {
        ...previousEntries,
        [entryDate]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const updateTrackerValue = (entryDate, trackerId, value) => {
    setEntriesByDate((previousEntries) => {
      const current = getEntryWithDefaults(previousEntries[entryDate]);

      return {
        ...previousEntries,
        [entryDate]: {
          ...current,
          tracker_values: {
            ...current.tracker_values,
            [trackerId]: value,
          },
        },
      };
    });
  };

  const saveDay = async (entryDate) => {
    if (!token) {
      return;
    }

    const entry = getEntryWithDefaults(entriesByDate[entryDate]);
    setSavingDate(entryDate);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/launchpad/day`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entry_date: entryDate,
            memorable_moment: entry.memorable_moment,
            remember_this: entry.remember_this,
            tracker_values: entry.tracker_values,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save day");
      }

      setEntriesByDate((previousEntries) => ({
        ...previousEntries,
        [entryDate]: getEntryWithDefaults(data.entry),
      }));
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingDate("");
    }
  };

  const handleAddTracker = async (event) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setAddingTracker(true);
    setTrackerError("");

    try {
      const payload = {
        label: newTracker.label,
        tracker_type: newTracker.tracker_type,
        unit: newTracker.tracker_type === "checkbox" ? "" : newTracker.unit,
        display_order: trackers.length,
        config:
          newTracker.tracker_type === "rating"
            ? { max: Math.max(2, Number(newTracker.max) || 5) }
            : {},
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/launchpad/trackers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tracker");
      }

      setTrackers((previousTrackers) => [...previousTrackers, data.tracker]);
      setNewTracker({
        label: "",
        tracker_type: "checkbox",
        unit: "",
        max: 5,
      });
    } catch (submitError) {
      setTrackerError(submitError.message);
    } finally {
      setAddingTracker(false);
    }
  };

  const handleArchiveTracker = async (trackerId) => {
    if (!token) {
      return;
    }

    setTrackerError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/launchpad/tracker/${trackerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove tracker");
      }

      setTrackers((previousTrackers) =>
        previousTrackers.filter((tracker) => tracker.id !== trackerId),
      );
    } catch (archiveError) {
      setTrackerError(archiveError.message);
    }
  };

  const populatedDays = monthDays.filter((day) => {
    const entry = getEntryWithDefaults(entriesByDate[day.iso]);

    if (entry.memorable_moment.trim() || entry.remember_this.trim()) {
      return true;
    }

    return Object.values(entry.tracker_values).some(
      (value) =>
        value === true || value === 0 || (value && `${value}`.trim() !== ""),
    );
  }).length;

  const checkboxTrackers = trackers.filter(
    (tracker) => tracker.tracker_type === "checkbox",
  );

  const checkboxCompletions = monthDays.reduce((total, day) => {
    const entry = getEntryWithDefaults(entriesByDate[day.iso]);
    return (
      total +
      checkboxTrackers.filter(
        (tracker) => entry.tracker_values?.[tracker.id] === true,
      ).length
    );
  }, 0);

  const renderTrackerCell = (dayIso, tracker) => {
    const entry = getEntryWithDefaults(entriesByDate[dayIso]);
    const value = entry.tracker_values?.[tracker.id];

    if (tracker.tracker_type === "checkbox") {
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(event) =>
              updateTrackerValue(dayIso, tracker.id, event.target.checked)
            }
            className={`h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 ${
              isDark ? "border-slate-600 bg-slate-950" : "border-slate-300"
            }`}
          />
        </div>
      );
    }

    if (tracker.tracker_type === "number") {
      return (
        <div className="flex min-w-[130px] items-center gap-2">
          <input
            type="number"
            value={value ?? ""}
            onChange={(event) =>
              updateTrackerValue(
                dayIso,
                tracker.id,
                event.target.value === "" ? "" : Number(event.target.value),
              )
            }
            className={`w-full rounded-lg border px-2 py-1.5 text-sm focus:border-sky-400 focus:outline-none ${
              isDark
                ? "border-slate-700 bg-slate-950 text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
            placeholder="0"
          />
          {tracker.unit ? (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              {tracker.unit}
            </span>
          ) : null}
        </div>
      );
    }

    const maxRating = Math.max(2, Number(tracker.config?.max) || 5);

    return (
      <select
        value={value ?? ""}
        onChange={(event) =>
          updateTrackerValue(
            dayIso,
            tracker.id,
            event.target.value === "" ? "" : Number(event.target.value),
          )
        }
        className={`min-w-[100px] rounded-lg border px-2 py-1.5 text-sm focus:border-sky-400 focus:outline-none ${
          isDark
            ? "border-slate-700 bg-slate-950 text-slate-100"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        <option value="">-</option>
        {Array.from({ length: maxRating }, (_, index) => (
          <option key={`${tracker.id}-${index + 1}`} value={index + 1}>
            {index + 1}/{maxRating}
          </option>
        ))}
      </select>
    );
  };

  if (!user) {
    return (
      <div
        className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-[#f6f7fb]"}`}
      >
        <TopNav />
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div
            className={`rounded-[28px] border p-8 ${
              isDark
                ? "border-slate-800 bg-slate-900 shadow-[0_28px_90px_rgba(2,6,23,0.6)]"
                : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.28em] ${isDark ? "text-sky-300" : "text-slate-400"}`}
            >
              Monthly Daily System
            </p>
            <h1
              className={`mt-3 text-5xl font-bold ${isDark ? "text-slate-100" : "text-slate-950"}`}
            >
              Launchpad
            </h1>
            <p
              className={`mt-4 max-w-2xl text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              Sign in to access your monthly memory and tracking workspace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-16 ${isDark ? "bg-slate-950" : "bg-[#f6f7fb]"}`}
    >
      <TopNav />
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section
          className={`overflow-hidden rounded-[28px] border ${
            isDark
              ? "border-slate-800 bg-slate-900 shadow-[0_30px_110px_rgba(2,6,23,0.65)]"
              : "border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]"
          }`}
        >
          <div
            className={`border-b px-6 py-6 text-white ${
              isDark
                ? "border-slate-800 bg-[linear-gradient(135deg,#020617_0%,#082f49_48%,#172554_100%)]"
                : "border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#0b3b62_100%)]"
            }`}
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
                  Monthly Daily System
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                  Launchpad
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                  A Notion-style command surface with a spreadsheet rhythm: one
                  row per day, memory capture, and fully customizable daily
                  trackers.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                    Days Logged
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {populatedDays}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                    Trackers
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {trackers.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                    Checkbox Wins
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {checkboxCompletions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`border-b px-6 py-5 ${
              isDark
                ? "border-slate-800 bg-slate-900/80"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label
                  className={`flex min-w-[220px] flex-col gap-2 text-sm font-medium ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Month
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className={`rounded-2xl border px-4 py-3 focus:border-sky-400 focus:outline-none ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-100"
                        : "border-slate-200 bg-white text-slate-900"
                    }`}
                  />
                </label>
              </div>

              <form
                onSubmit={handleAddTracker}
                className={`grid gap-3 rounded-3xl border p-4 lg:grid-cols-[minmax(200px,1fr)_160px_130px_110px_auto] ${
                  isDark
                    ? "border-slate-800 bg-slate-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="text"
                  value={newTracker.label}
                  onChange={(event) =>
                    setNewTracker((previous) => ({
                      ...previous,
                      label: event.target.value,
                    }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-sm focus:border-sky-400 focus:outline-none ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                      : "border-slate-200 text-slate-900"
                  }`}
                  placeholder="New tracker label"
                  required
                />

                <select
                  value={newTracker.tracker_type}
                  onChange={(event) =>
                    setNewTracker((previous) => ({
                      ...previous,
                      tracker_type: event.target.value,
                    }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-sm focus:border-sky-400 focus:outline-none ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-slate-100"
                      : "border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="checkbox">Checkbox</option>
                  <option value="number">Number</option>
                  <option value="rating">Rating</option>
                </select>

                <input
                  type="text"
                  value={
                    newTracker.tracker_type === "checkbox"
                      ? ""
                      : newTracker.unit
                  }
                  onChange={(event) =>
                    setNewTracker((previous) => ({
                      ...previous,
                      unit: event.target.value,
                    }))
                  }
                  disabled={newTracker.tracker_type === "checkbox"}
                  className={`rounded-2xl border px-4 py-3 text-sm focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-slate-100 disabled:bg-slate-900 disabled:text-slate-600"
                      : "border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                  }`}
                  placeholder="Unit"
                />

                <input
                  type="number"
                  min="2"
                  max="10"
                  value={
                    newTracker.tracker_type === "rating" ? newTracker.max : ""
                  }
                  onChange={(event) =>
                    setNewTracker((previous) => ({
                      ...previous,
                      max: event.target.value,
                    }))
                  }
                  disabled={newTracker.tracker_type !== "rating"}
                  className={`rounded-2xl border px-4 py-3 text-sm focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-slate-100 disabled:bg-slate-900 disabled:text-slate-600"
                      : "border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                  }`}
                  placeholder="Max"
                />

                <button
                  type="submit"
                  disabled={addingTracker}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingTracker ? "Adding..." : "Add Tracker"}
                </button>
              </form>
            </div>

            {trackerError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {trackerError}
              </div>
            ) : null}

            {trackers.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {trackers.map((tracker) => (
                  <button
                    key={tracker.id}
                    type="button"
                    onClick={() => handleArchiveTracker(tracker.id)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-300 hover:border-red-400/40 hover:text-red-300"
                        : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    {tracker.label} · remove
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            {loading ? (
              <div
                className={`px-6 py-10 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Loading Launchpad...
              </div>
            ) : (
              <table className="min-w-[1200px] border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th
                      className={`sticky left-0 z-30 border-b border-r px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] ${
                        isDark
                          ? "border-slate-800 bg-slate-950 text-slate-400"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      Day
                    </th>
                    <th
                      className={`sticky left-[118px] z-30 border-b border-r px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] ${
                        isDark
                          ? "border-slate-800 bg-slate-950 text-slate-400"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      Memorable Moment
                    </th>
                    <th
                      className={`sticky left-[438px] z-30 border-b border-r px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] ${
                        isDark
                          ? "border-slate-800 bg-slate-950 text-slate-400"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      Remember This
                    </th>
                    {trackers.map((tracker) => (
                      <th
                        key={tracker.id}
                        className={`border-b border-r px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] ${
                          isDark
                            ? "border-slate-800 bg-slate-900 text-slate-400"
                            : "border-slate-200 bg-[#eef6ff] text-slate-500"
                        }`}
                      >
                        <div className="min-w-[120px]">
                          <div
                            className={
                              isDark ? "text-slate-200" : "text-slate-700"
                            }
                          >
                            {tracker.label}
                          </div>
                          <div
                            className={`mt-1 text-[10px] tracking-[0.22em] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {tracker.tracker_type}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th
                      className={`sticky right-0 z-20 border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] ${
                        isDark
                          ? "border-slate-800 bg-slate-950 text-slate-400"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      Save
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {monthDays.map((day, rowIndex) => {
                    const rowShade = isDark
                      ? rowIndex % 2 === 0
                        ? "bg-slate-900"
                        : "bg-slate-950/80"
                      : rowIndex % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50/70";
                    const entry = getEntryWithDefaults(entriesByDate[day.iso]);

                    return (
                      <tr key={day.iso}>
                        <td
                          className={`sticky left-0 z-10 border-b border-r px-4 py-3 ${
                            isDark ? "border-slate-800" : "border-slate-200"
                          } ${rowShade}`}
                        >
                          <div className="min-w-[118px]">
                            <div
                              className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                            >
                              {day.dayNumber}
                            </div>
                            <div
                              className={`text-xs uppercase tracking-[0.2em] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                            >
                              {day.weekday}
                            </div>
                          </div>
                        </td>

                        <td
                          className={`sticky left-[118px] z-10 border-b border-r px-3 py-2 ${
                            isDark ? "border-slate-800" : "border-slate-200"
                          } ${rowShade}`}
                        >
                          <textarea
                            value={entry.memorable_moment}
                            onChange={(event) =>
                              updateEntryField(
                                day.iso,
                                "memorable_moment",
                                event.target.value,
                              )
                            }
                            rows={2}
                            className={`min-w-[320px] resize-none rounded-lg border px-3 py-2 text-sm focus:border-sky-400 focus:outline-none ${
                              isDark
                                ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                                : "border-slate-200 bg-white text-slate-900"
                            }`}
                            placeholder="Most memorable thing that happened today"
                          />
                        </td>

                        <td
                          className={`sticky left-[438px] z-10 border-b border-r px-3 py-2 ${
                            isDark ? "border-slate-800" : "border-slate-200"
                          } ${rowShade}`}
                        >
                          <textarea
                            value={entry.remember_this}
                            onChange={(event) =>
                              updateEntryField(
                                day.iso,
                                "remember_this",
                                event.target.value,
                              )
                            }
                            rows={2}
                            className={`min-w-[320px] resize-none rounded-lg border px-3 py-2 text-sm focus:border-sky-400 focus:outline-none ${
                              isDark
                                ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                                : "border-slate-200 bg-white text-slate-900"
                            }`}
                            placeholder="A quote, lesson, reminder, or detail"
                          />
                        </td>

                        {trackers.map((tracker) => (
                          <td
                            key={`${day.iso}-${tracker.id}`}
                            className={`border-b border-r px-3 py-2 ${
                              isDark ? "border-slate-800" : "border-slate-200"
                            } ${rowShade}`}
                          >
                            {renderTrackerCell(day.iso, tracker)}
                          </td>
                        ))}

                        <td
                          className={`sticky right-0 z-10 border-b px-3 py-2 ${
                            isDark ? "border-slate-800" : "border-slate-200"
                          } ${rowShade}`}
                        >
                          <button
                            type="button"
                            onClick={() => saveDay(day.iso)}
                            disabled={savingDate === day.iso}
                            className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingDate === day.iso ? "..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Launchpad;
