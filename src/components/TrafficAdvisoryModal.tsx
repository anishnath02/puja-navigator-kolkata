import React from 'react';
import { ShieldAlert, Train, Ship, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TrafficAdvisoryViewProps {
  theme?: 'light' | 'dark';
}

export const TrafficAdvisoryView: React.FC<TrafficAdvisoryViewProps> = ({ theme = 'light' }) => {
  const isLight = theme === 'light';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className={`border-b pb-4 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
        <div
          className={`flex items-center gap-2 font-semibold text-xs tracking-wider uppercase ${
            isLight ? 'text-rose-800' : 'text-amber-500'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Kolkata Police & Metro Advisory</span>
        </div>
        <h2
          className={`text-2xl md:text-3xl font-serif font-bold mt-1 ${
            isLight ? 'text-neutral-900' : 'text-neutral-100'
          }`}
        >
          Durga Puja Navigation & Transit Guide
        </h2>
        <p className={`text-sm mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Important guidance regarding road barricades, all-night metro transit, and pedestrian walking zones across Kolkata.
        </p>
      </div>

      {/* Main Alert Card */}
      <div
        className={`p-4 rounded-xl border space-y-2 ${
          isLight ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-amber-950/20 border-amber-600/30 text-neutral-300'
        }`}
      >
        <div className={`flex items-center gap-2 font-semibold text-sm ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Festival Routing Notice</span>
        </div>
        <p className="text-xs leading-relaxed">
          Standard driving navigation apps follow ordinary road routing. However, from Tritiya to Dashami, Kolkata Police enacts extensive one-way diversions, temporary no-entry zones, and pedestrian-only cordons within 200m–500m of major pandals. Always expect to disembark at arterial roads and cover the final stretch on foot.
        </p>
      </div>

      {/* Key Transport Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metro */}
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Train className="w-4 h-4" />
          </div>
          <h3 className={`font-serif font-bold text-base ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
            All-Night Metro Trains
          </h3>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
            Kolkata Metro runs overnight services across Saptami, Ashtami, and Navami:
          </p>
          <ul className={`text-xs space-y-1.5 list-disc pl-4 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            <li>
              <strong className={isLight ? 'text-neutral-900' : 'text-neutral-200'}>
                Blue Line (Dakshineswar - Kavi Subhash):
              </strong>{' '}
              Covers Shyambazar (Bagbazar), Central (College Sq), Kalighat & Rabindra Sarobar (South).
            </li>
            <li>
              <strong className={isLight ? 'text-neutral-900' : 'text-neutral-200'}>
                Green Line (Howrah - Salt Lake):
              </strong>{' '}
              Direct access to Sealdah and Salt Lake Sector 2/3 pandals.
            </li>
          </ul>
        </div>

        {/* Ferries */}
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Ship className="w-4 h-4" />
          </div>
          <h3 className={`font-serif font-bold text-base ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
            Ganges Ferry Bypass
          </h3>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
            Beat Howrah Bridge and road traffic entirely:
          </p>
          <ul className={`text-xs space-y-1.5 list-disc pl-4 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            <li>
              <strong className={isLight ? 'text-neutral-900' : 'text-neutral-200'}>
                Howrah Station → Bagbazar Ghat:
              </strong>{' '}
              Drops you right outside Bagbazar Sarbojanin!
            </li>
            <li>
              <strong className={isLight ? 'text-neutral-900' : 'text-neutral-200'}>
                Howrah → Ahiritola Ghat:
              </strong>{' '}
              Direct 5-minute walk to Kumartuli Park and Ahiritola pandals.
            </li>
            <li>Cost: Only ₹6–₹10 per passenger.</li>
          </ul>
        </div>

        {/* Timing Strategy */}
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className={`font-serif font-bold text-base ${isLight ? 'text-neutral-900' : 'text-neutral-100'}`}>
            Optimal Hopping Hours
          </h3>
          <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
            Time your visits to avoid hours-long barricade lines:
          </p>
          <ul className={`text-xs space-y-1.5 list-disc pl-4 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            <li>
              <strong className="text-emerald-700 dark:text-emerald-400">Golden Window (4 AM - 8 AM):</strong> Beautiful morning light, zero queues, peaceful darshan.
            </li>
            <li>
              <strong className="text-emerald-700 dark:text-emerald-400">Afternoon Lull (1 PM - 4 PM):</strong> Short lines before the evening rush begins.
            </li>
            <li>
              <strong className="text-rose-700 dark:text-rose-400">Peak Rush (8 PM - 2 AM):</strong> Jaw-dropping lighting, but expect 1-3 hour queues at Sreebhumi & Santosh Mitra Sq.
            </li>
          </ul>
        </div>
      </div>

      {/* Practical Hopping Checklist */}
      <div
        className={`p-5 rounded-xl border space-y-3 ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <h3
          className={`font-serif font-bold text-base flex items-center gap-2 ${
            isLight ? 'text-neutral-900' : 'text-neutral-100'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Smart Pandal-Hopper Checklist</span>
        </h3>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${
            isLight ? 'text-neutral-700' : 'text-neutral-300'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">✓</span>
            <span>Wear comfortable walking shoes with grip; expect 10,000–20,000 steps per night.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">✓</span>
            <span>Carry a portable power bank; network congestion is high around major pandals.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">✓</span>
            <span>Use Kolkata Metro Smart Cards to bypass ticket counter lines.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">✓</span>
            <span>Group your hopping circuit by zone (North, South, or VIP Road) rather than zigzagging.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
