import React, { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const SLEEP_SCORE_KEY = "__sleep_score";
const HEADER_HEIGHT = 48;
const ROW_HEIGHT = 48;
const CHART_WIDTH = 220;
const CHART_PADDING_LEFT = 14;
const CHART_PADDING_RIGHT = 40;

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
    };
  });
};

const getEntryWithDefaults = (entry) => ({
  memorable_moment: entry?.memorable_moment || "",
  tracker_values: entry?.tracker_values || {},
});

const getNormalizedSleepScore = (value) => {
  if (value === "" || value === undefined || value === null) {
    return "";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "";
  }

  return Math.max(0, Math.min(100, numericValue));
};

const getRowTone = (isDark, rowIndex) => {
  if (isDark) {
    return rowIndex % 2 === 0 ? "bg-slate-900" : "bg-slate-950/75";
  }

  return rowIndex % 2 === 0 ? "bg-[#fcfbf6]" : "bg-[#faf6ec]";
};

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
  const [showTrackerManager, setShowTrackerManager] = useState(false);
  const [trackerPendingDelete, setTrackerPendingDelete] = useState(null);
  const [newTracker, setNewTracker] = useState({
    label: "",
    tracker_type: "checkbox",
    unit: "",
    max: 5,
  });

  const isDark = theme === "dark";
  const monthDays = buildMonthDays(selectedMonth);
  const chartHeight = monthDays.length * ROW_HEIGHT;

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
          `${fetchError.message}. Make sure the backend with /api/launchpad is running and VITE_BACKEND_URL points to the correct server.`,
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

  const updateSleepScore = (entryDate, value) => {
    const normalizedValue = value === "" ? "" : getNormalizedSleepScore(value);

    updateTrackerValue(entryDate, SLEEP_SCORE_KEY, normalizedValue);
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

  const confirmArchiveTracker = async () => {
    if (!trackerPendingDelete) {
      return;
    }

    await handleArchiveTracker(trackerPendingDelete.id);
    setTrackerPendingDelete(null);
  };

  const populatedDays = monthDays.filter((day) => {
    const entry = getEntryWithDefaults(entriesByDate[day.iso]);

    if (entry.memorable_moment.trim()) {
      return true;
    }

    return Object.values(entry.tracker_values).some(
      (value) =>
        value === true || value === 0 || (value && `${value}`.trim() !== ""),
    );
  }).length;

  const checkboxWins = monthDays.reduce((total, day) => {
    const entry = getEntryWithDefaults(entriesByDate[day.iso]);
    return (
      total +
      trackers.filter(
        (tracker) =>
          tracker.tracker_type === "checkbox" &&
          entry.tracker_values?.[tracker.id] === true,
      ).length
    );
  }, 0);

  const sleepPoints = useMemo(() => {
    return monthDays
      .map((day, index) => {
        const entry = getEntryWithDefaults(entriesByDate[day.iso]);
        const sleepScore = getNormalizedSleepScore(
          entry.tracker_values?.[SLEEP_SCORE_KEY],
        );

        if (sleepScore === "") {
          return null;
        }

        const availableWidth =
          CHART_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
        const x = CHART_PADDING_LEFT + (sleepScore / 100) * availableWidth;
        const y = index * ROW_HEIGHT + ROW_HEIGHT / 2;

        return {
          dayNumber: day.dayNumber,
          sleepScore,
          x,
          y,
        };
      })
      .filter(Boolean);
  }, [entriesByDate, monthDays]);

  const polylinePoints = sleepPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

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
            className={`h-4 w-4 rounded text-slate-900 ${
              isDark ? "border-slate-600 bg-slate-950" : "border-stone-400"
            }`}
          />
        </div>
      );
    }

    if (tracker.tracker_type === "number") {
      return (
        <div className="flex min-w-[78px] items-center gap-1.5">
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
            className={`w-full rounded-md border px-2 py-1 text-xs focus:outline-none ${
              isDark
                ? "border-slate-700 bg-slate-950 text-slate-100"
                : "border-stone-300 bg-white text-stone-800"
            }`}
            placeholder="0"
          />
          {tracker.unit ? (
            <span
              className={
                isDark
                  ? "text-[10px] text-slate-500"
                  : "text-[10px] text-stone-400"
              }
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
        className={`min-w-[84px] rounded-md border px-2 py-1 text-xs focus:outline-none ${
          isDark
            ? "border-slate-700 bg-slate-950 text-slate-100"
            : "border-stone-300 bg-white text-stone-800"
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
        className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-stone-100"}`}
      >
        <TopNav />
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div
            className={`rounded-[34px] border p-10 ${
              isDark
                ? "border-slate-800 bg-slate-900 shadow-[0_28px_90px_rgba(2,6,23,0.65)]"
                : "border-stone-200 bg-[#fcfbf6] shadow-[0_24px_70px_rgba(120,113,108,0.15)]"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-[0.28em] ${isDark ? "text-sky-300" : "text-stone-500"}`}
            >
              Monthly Daily System
            </p>
            <h1
              className={`mt-4 text-5xl font-semibold tracking-tight ${
                isDark ? "text-slate-100" : "text-stone-900"
              }`}
            >
              Launchpad
            </h1>
            <p
              className={`mt-4 max-w-2xl text-lg ${isDark ? "text-slate-300" : "text-stone-600"}`}
            >
              Sign in to use the notebook-style monthly spread.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-10 ${isDark ? "bg-slate-950" : "bg-stone-100"}`}
    >
      <TopNav />
      <main className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8">
        <section
          className={`overflow-hidden rounded-[24px] border ${
            isDark
              ? "border-slate-800 bg-slate-900 shadow-[0_36px_120px_rgba(2,6,23,0.7)]"
              : "border-stone-200 bg-[#fcfbf6] shadow-[0_30px_110px_rgba(120,113,108,0.16)]"
          }`}
        >
          <div
            className={`border-b px-5 py-4 ${
              isDark
                ? "border-slate-800 bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]"
                : "border-stone-200 bg-[#f8f4ea]"
            }`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.28em] ${isDark ? "text-sky-300" : "text-stone-500"}`}
                >
                  Monthly Daily System
                </p>
                <h1
                  className={`mt-2 text-4xl font-semibold tracking-tight ${
                    isDark ? "text-slate-100" : "text-stone-900"
                  }`}
                >
                  Launchpad
                </h1>
                <p
                  className={`mt-2 text-xs ${isDark ? "text-slate-400" : "text-stone-500"}`}
                >
                  One notebook spread for the month: memory log, daily signals,
                  and a sleep trend.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <label
                  className={`flex min-w-[190px] flex-col gap-1.5 text-xs font-medium ${
                    isDark ? "text-slate-300" : "text-stone-700"
                  }`}
                >
                  Month
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className={`rounded-xl border px-3 py-2 text-sm focus:outline-none ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-100"
                        : "border-stone-300 bg-white text-stone-900"
                    }`}
                  />
                </label>

                <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  <div
                    className={`rounded-full px-2.5 py-1.5 ${
                      isDark
                        ? "bg-slate-950 text-slate-300 ring-1 ring-slate-800"
                        : "bg-white text-stone-500 ring-1 ring-stone-200"
                    }`}
                  >
                    Days Logged {populatedDays}
                  </div>
                  <div
                    className={`rounded-full px-2.5 py-1.5 ${
                      isDark
                        ? "bg-slate-950 text-slate-300 ring-1 ring-slate-800"
                        : "bg-white text-stone-500 ring-1 ring-stone-200"
                    }`}
                  >
                    Trackers {trackers.length}
                  </div>
                  <div
                    className={`rounded-full px-2.5 py-1.5 ${
                      isDark
                        ? "bg-slate-950 text-slate-300 ring-1 ring-slate-800"
                        : "bg-white text-stone-500 ring-1 ring-stone-200"
                    }`}
                  >
                    Wins {checkboxWins}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`border-b px-5 py-3 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-stone-200 bg-[#f6f0e1]"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isDark ? "text-slate-400" : "text-stone-500"
                  }`}
                >
                  Tracker Controls
                </div>
                <div
                  className={`mt-1 text-xs ${
                    isDark ? "text-slate-500" : "text-stone-400"
                  }`}
                >
                  Add and remove custom tracker columns.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTrackerManager((current) => !current)}
                className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  isDark
                    ? "border-slate-700 bg-slate-950 text-slate-300"
                    : "border-stone-200 bg-white text-stone-600"
                }`}
              >
                {showTrackerManager ? "Hide" : "Manage"}
              </button>
            </div>

            {showTrackerManager ? (
              <>
                <form
                  onSubmit={handleAddTracker}
                  className="mt-3 grid gap-2 lg:grid-cols-[minmax(180px,1fr)_130px_96px_82px_auto]"
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
                    className={`rounded-xl border px-3 py-2 text-xs focus:outline-none ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                        : "border-stone-300 bg-white text-stone-900 placeholder:text-stone-400"
                    }`}
                    placeholder="Add tracker column"
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
                    className={`rounded-xl border px-3 py-2 text-xs focus:outline-none ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-100"
                        : "border-stone-300 bg-white text-stone-900"
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
                    className={`rounded-xl border px-3 py-2 text-xs focus:outline-none disabled:cursor-not-allowed ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-100 disabled:bg-slate-900 disabled:text-slate-600"
                        : "border-stone-300 bg-white text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
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
                    className={`rounded-xl border px-3 py-2 text-xs focus:outline-none disabled:cursor-not-allowed ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-100 disabled:bg-slate-900 disabled:text-slate-600"
                        : "border-stone-300 bg-white text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                    }`}
                    placeholder="Max"
                  />

                  <button
                    type="submit"
                    disabled={addingTracker}
                    className="rounded-xl bg-stone-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingTracker ? "Adding..." : "Add Tracker"}
                  </button>
                </form>

                {trackerError ? (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {trackerError}
                  </div>
                ) : null}

                {trackers.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {trackers.map((tracker) => (
                      <button
                        key={tracker.id}
                        type="button"
                        onClick={() => setTrackerPendingDelete(tracker)}
                        className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          isDark
                            ? "border-slate-700 bg-slate-950 text-slate-300 hover:border-red-400/40 hover:text-red-300"
                            : "border-stone-200 bg-white text-stone-500 hover:border-red-200 hover:text-red-600"
                        }`}
                      >
                        {tracker.label} remove
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {error ? (
            <div className="border-b border-red-200 bg-red-50 px-8 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div
              className={`px-8 py-14 text-center ${isDark ? "text-slate-400" : "text-stone-500"}`}
            >
              Loading Launchpad...
            </div>
          ) : (
            <div className="grid gap-0 lg:grid-cols-[1.05fr_1.45fr_280px]">
              <section
                className={`border-r ${isDark ? "border-slate-800" : "border-stone-200"}`}
              >
                <div
                  className={`border-b px-4 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-stone-200 bg-[#f9f3e6]"
                  }`}
                  style={{ height: `${HEADER_HEIGHT}px` }}
                >
                  <div className="flex h-full items-center">
                    <div
                      className={`text-sm font-semibold tracking-wide ${isDark ? "text-slate-100" : "text-stone-900"}`}
                    >
                      Memorable Moments
                    </div>
                  </div>
                </div>

                {monthDays.map((day, rowIndex) => {
                  const rowTone = getRowTone(isDark, rowIndex);
                  const entry = getEntryWithDefaults(entriesByDate[day.iso]);

                  return (
                    <div
                      key={`memory-${day.iso}`}
                      className={`grid grid-cols-[34px_minmax(0,1fr)] items-center border-b px-3 ${
                        isDark ? "border-slate-800" : "border-stone-200"
                      } ${rowTone}`}
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >
                      <div className="pr-3 pt-1 text-right">
                        <div
                          className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-stone-600"}`}
                        >
                          {day.dayNumber}
                        </div>
                        <div
                          className={`text-[10px] uppercase tracking-[0.22em] ${isDark ? "text-slate-500" : "text-stone-400"}`}
                        >
                          {day.weekday}
                        </div>
                      </div>

                      <textarea
                        value={entry.memorable_moment}
                        onChange={(event) =>
                          updateEntryField(
                            day.iso,
                            "memorable_moment",
                            event.target.value,
                          )
                        }
                        className={`h-[30px] resize-none border-0 bg-transparent px-1 py-1 text-xs leading-5 focus:outline-none ${
                          isDark
                            ? "text-slate-100 placeholder:text-slate-500"
                            : "text-stone-800 placeholder:text-stone-400"
                        }`}
                        placeholder="What stood out today?"
                      />
                    </div>
                  );
                })}
              </section>

              <section
                className={`border-r ${isDark ? "border-slate-800" : "border-stone-200"}`}
              >
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    <div
                      className={`grid border-b ${
                        isDark
                          ? "border-slate-800 bg-slate-900"
                          : "border-stone-200 bg-[#f9f3e6]"
                      }`}
                      style={{
                        gridTemplateColumns: `42px 72px repeat(${trackers.length}, minmax(74px, 1fr)) 64px`,
                        height: `${HEADER_HEIGHT}px`,
                      }}
                    >
                      <div
                        className={`flex items-center justify-center border-r px-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "border-slate-800 text-slate-400" : "border-stone-200 text-stone-500"}`}
                      >
                        Day
                      </div>
                      <div
                        className={`flex items-center justify-center border-r px-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "border-slate-800 text-slate-400" : "border-stone-200 text-stone-500"}`}
                      >
                        Sleep
                      </div>

                      {trackers.map((tracker) => (
                        <div
                          key={`tracker-head-${tracker.id}`}
                          className={`flex flex-col items-center justify-center border-r px-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] ${
                            isDark
                              ? "border-slate-800 text-slate-300"
                              : "border-stone-200 text-stone-600"
                          }`}
                        >
                          <div>{tracker.label}</div>
                          <div
                            className={
                              isDark
                                ? "mt-0.5 text-[8px] text-slate-500"
                                : "mt-0.5 text-[8px] text-stone-400"
                            }
                          >
                            {tracker.tracker_type}
                          </div>
                        </div>
                      ))}

                      <div
                        className={`flex items-center justify-center px-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-stone-500"}`}
                      >
                        Save
                      </div>
                    </div>

                    {monthDays.map((day, rowIndex) => {
                      const rowTone = getRowTone(isDark, rowIndex);
                      const entry = getEntryWithDefaults(
                        entriesByDate[day.iso],
                      );
                      const sleepScoreValue = getNormalizedSleepScore(
                        entry.tracker_values?.[SLEEP_SCORE_KEY],
                      );

                      return (
                        <div
                          key={`table-${day.iso}`}
                          className={`grid items-center border-b ${
                            isDark ? "border-slate-800" : "border-stone-200"
                          } ${rowTone}`}
                          style={{
                            gridTemplateColumns: `42px 72px repeat(${trackers.length}, minmax(74px, 1fr)) 64px`,
                            height: `${ROW_HEIGHT}px`,
                          }}
                        >
                          <div
                            className={`flex h-full items-center justify-center border-r px-1.5 text-center text-xs font-semibold ${isDark ? "border-slate-800 text-slate-200" : "border-stone-200 text-stone-700"}`}
                          >
                            {day.dayNumber}
                          </div>

                          <div
                            className={`flex h-full items-center border-r px-1.5 ${isDark ? "border-slate-800" : "border-stone-200"}`}
                          >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={sleepScoreValue}
                              onChange={(event) =>
                                updateSleepScore(day.iso, event.target.value)
                              }
                              className={`h-[26px] w-full border-0 bg-transparent px-1 py-0 text-[11px] font-medium text-center leading-5 focus:outline-none ${
                                isDark
                                  ? "text-slate-100 placeholder:text-slate-500"
                                  : "text-stone-900 placeholder:text-stone-400"
                              }`}
                              placeholder="--"
                            />
                          </div>

                          {trackers.map((tracker) => (
                            <div
                              key={`tracker-cell-${day.iso}-${tracker.id}`}
                              className={`flex h-full items-center justify-center border-r px-1 ${
                                isDark ? "border-slate-800" : "border-stone-200"
                              }`}
                            >
                              {renderTrackerCell(day.iso, tracker)}
                            </div>
                          ))}

                          <div className="flex h-full items-center px-1.5">
                            <button
                              type="button"
                              onClick={() => saveDay(day.iso)}
                              disabled={savingDate === day.iso}
                              className="w-full rounded-lg bg-stone-900 px-1.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingDate === day.iso ? "..." : "Save"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section>
                <div
                  className={`border-b px-4 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-stone-200 bg-[#f9f3e6]"
                  }`}
                  style={{ height: `${HEADER_HEIGHT}px` }}
                >
                  <div className="flex h-full items-end pb-3">
                    <div>
                      <div
                        className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-stone-500"}`}
                      >
                        Sleep Score
                      </div>
                      <div
                        className={`mt-0.5 text-[9px] uppercase tracking-[0.16em] ${isDark ? "text-slate-500" : "text-stone-400"}`}
                      >
                        Monthly Trend
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative px-4 py-0 ${isDark ? "bg-slate-900" : "bg-[#fcfbf6]"}`}
                  style={{ height: `${chartHeight}px` }}
                >
                  {monthDays.map((day, index) => (
                    <div
                      key={`chart-band-${day.iso}`}
                      className={`absolute left-0 right-0 ${getRowTone(isDark, index)}`}
                      style={{
                        top: `${index * ROW_HEIGHT}px`,
                        height: `${ROW_HEIGHT}px`,
                      }}
                    />
                  ))}

                  {monthDays.map((day, index) => (
                    <div
                      key={`chart-row-${day.iso}`}
                      className={`absolute left-0 right-0 border-b ${
                        isDark ? "border-slate-800/80" : "border-stone-200/80"
                      }`}
                      style={{
                        top: `${(index + 1) * ROW_HEIGHT}px`,
                      }}
                    />
                  ))}

                  <div
                    className={`absolute top-0 bottom-0 w-px ${isDark ? "bg-slate-800" : "bg-stone-200"}`}
                    style={{ left: `${CHART_PADDING_LEFT}px` }}
                  />
                  <div
                    className={`absolute top-0 bottom-0 w-px ${isDark ? "bg-slate-800" : "bg-stone-200"}`}
                    style={{
                      left: `${CHART_PADDING_LEFT + (CHART_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT) / 2}px`,
                    }}
                  />
                  <div
                    className={`absolute top-0 bottom-0 w-px ${isDark ? "bg-slate-800" : "bg-stone-200"}`}
                    style={{ left: `${CHART_WIDTH - CHART_PADDING_RIGHT}px` }}
                  />

                  <svg
                    width={CHART_WIDTH}
                    height={chartHeight}
                    className="absolute left-4 top-0"
                  >
                    {polylinePoints ? (
                      <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke={isDark ? "#94a3b8" : "#44403c"}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : null}

                    {sleepPoints.map((point) => (
                      <g key={`sleep-point-${point.dayNumber}`}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="2.6"
                          fill={isDark ? "#f8fafc" : "#292524"}
                        />
                        <text
                          x={CHART_WIDTH - 4}
                          y={point.y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill={isDark ? "#cbd5e1" : "#57534e"}
                        >
                          {point.sleepScore}
                        </text>
                      </g>
                    ))}
                  </svg>

                  <div
                    className={`absolute left-4 top-1.5 flex w-[220px] justify-between text-[9px] font-semibold uppercase tracking-[0.16em] ${
                      isDark ? "text-slate-500" : "text-stone-400"
                    }`}
                  >
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </section>
      </main>

      {trackerPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 ${
              isDark
                ? "border-slate-800 bg-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.65)]"
                : "border-stone-200 bg-white shadow-[0_24px_80px_rgba(120,113,108,0.18)]"
            }`}
          >
            <div
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                isDark ? "text-slate-400" : "text-stone-500"
              }`}
            >
              Confirm Delete
            </div>
            <h2
              className={`mt-2 text-lg font-semibold ${
                isDark ? "text-slate-100" : "text-stone-900"
              }`}
            >
              Remove tracker?
            </h2>
            <p
              className={`mt-2 text-sm ${
                isDark ? "text-slate-400" : "text-stone-600"
              }`}
            >
              This will remove <strong>{trackerPendingDelete.label}</strong> from
              the Launchpad tracker list.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTrackerPendingDelete(null)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmArchiveTracker}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Launchpad;
