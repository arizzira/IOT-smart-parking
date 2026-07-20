import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Activity, Timer } from 'lucide-react';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sisaSlot, setSisaSlot] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = async () => {
    try {
      const resLogs = await fetch('http://localhost:5000/api/parking/logs');
      const dataLogs = await resLogs.json();
      setLogs(dataLogs);

      const lagiParkir = dataLogs.filter(log => log.time_out === null).length;
      setSisaSlot(lagiParkir >= 1 ? 0 : 1);

      const resUsers = await fetch('http://localhost:5000/api/parking/users');
      const dataUsers = await resUsers.json();
      setTotalUsers(dataUsers.length);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalData = setInterval(fetchData, 2000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(intervalData);
      clearInterval(intervalTime);
    };
  }, []);

  const formatWaktu = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); l
  };

  const formatWaktuAdaptif = (totalDetik) => {
    if (totalDetik === null || totalDetik === undefined) return '-';
    const d = Math.floor(totalDetik / 86400);
    const h = Math.floor((totalDetik % 86400) / 3600);
    const m = Math.floor((totalDetik % 3600) / 60);
    const s = totalDetik % 60;
    let hasil = [];
    if (d > 0) hasil.push(`${d} hari`);
    if (h > 0) hasil.push(`${h}j`);
    if (m > 0) hasil.push(`${m}m`);
    if (s > 0 || hasil.length === 0) hasil.push(`${s}s`);
    return hasil.join(' ');
  };

  const getLiveDuration = (timeIn) => {
    const diff = Math.floor((currentTime - new Date(timeIn)) / 1000);
    return formatWaktuAdaptif(diff);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-[fadeIn_0.4s_ease-out]">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Pantau kondisi parkir secara real-time.</p>
      </div>

      {/* ================= WIDGETS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Slot */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Kapasitas Tersedia</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-800">{sisaSlot}</span>
              <span className="text-sm text-slate-400">/ 1 Slot</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${sisaSlot > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-400'}`}>
            <LayoutDashboard size={22} />
          </div>
        </div>

        {/* Users */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">User Terdaftar</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-800">{totalUsers}</span>
              <span className="text-sm text-slate-400">Orang</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
            <Users size={22} />
          </div>
        </div>

        {/* Gate status */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Kondisi Gerbang</p>
            <div className="mt-1 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-700 tracking-wide">AKTIF & NORMAL</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 text-violet-400">
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* ================= LIVE ACTIVITY FEED ================= */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <div className="p-1.5 bg-amber-50 rounded-lg">
            <Activity size={16} className="text-amber-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-700">Pantauan Aktivitas Langsung</h3>
        </div>

        {/* Activity list */}
        <div className="divide-y divide-slate-50">
          {logs.slice(0, 5).map((log, index) => (
            <div
              key={log.id || index}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors duration-150"
            >
              {/* Left: identity */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {(log.name_snapshot || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{log.name_snapshot || 'Penyusup / Terhapus'}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">UID: {log.uid_snapshot}</p>
                </div>
              </div>

              {/* Right: status + time */}
              <div className="text-right">
                {log.time_out ? (
                  <span className="inline-block text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg">
                    Check-Out
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                    <Timer size={12} className="animate-pulse" /> {getLiveDuration(log.time_in)}
                  </span>
                )}
                <p className="text-xs text-slate-400 mt-1.5">
                  Pukul {formatWaktu(log.time_out ? log.time_out : log.time_in)}
                </p>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Belum ada aktivitas kendaraan hari ini.
            </div>
          )}
        </div>
      </div>

      <style>{`git add .
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}