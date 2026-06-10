import PreferenceGroup from "../shared/PreferenceGroup";
import {
  comfortLevels,
  interestOptions,
  paceOptions,
  stayPreferences,
  transportModes,
  type WorkspacePreferences,
} from "../utils/workspaceTypes";

export default function PreferencesTab({
  preferences,
  updatePreference,
  toggleInterest,
}: {
  preferences: WorkspacePreferences;
  updatePreference: <K extends keyof WorkspacePreferences>(
    key: K,
    value: WorkspacePreferences[K]
  ) => void;
  toggleInterest: (interest: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
            Trip preferences
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Tune this route before itinerary build
          </h2>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
          Draft auto-saved
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PreferenceGroup
          title="Transport mode"
          options={transportModes}
          selected={preferences.transportMode}
          onSelect={(value) => updatePreference("transportMode", value)}
        />
        <PreferenceGroup
          title="Stay preference"
          options={stayPreferences}
          selected={preferences.stayPreference}
          onSelect={(value) => updatePreference("stayPreference", value)}
        />
        <PreferenceGroup
          title="Pace"
          options={paceOptions}
          selected={preferences.pace}
          onSelect={(value) => updatePreference("pace", value)}
        />
        <PreferenceGroup
          title="Comfort level"
          options={comfortLevels}
          selected={preferences.comfortLevel}
          onSelect={(value) => updatePreference("comfortLevel", value)}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          Interests
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {interestOptions.map((interest) => {
            const selected = preferences.interests.includes(interest);

            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                  selected
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
