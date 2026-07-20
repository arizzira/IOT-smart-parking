import { useState, useEffect } from 'react';
import { Trash2, Edit, Save, X, Timer, FileDown, History } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTimeOut, setEditTimeOut] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchLogs = async () => {
    const res = await fetch('http://localhost:5000/api/parking/logs');
    setLogs(await res.json());
  };

  useEffect(() => {
    fetchLogs();
    const intervalData = setInterval(() => {
      if (!editingId) fetchLogs();
    }, 3000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearInterval(intervalData);
      clearInterval(intervalTime);
    };
  }, [editingId]);

  const handleDelete = async (id) => {
    if(!confirm('Hapus riwayat tap ini?')) return;
    await fetch(`http://localhost:5000/api/parking/logs/${id}`, { method: 'DELETE' });
    fetchLogs();
  };

  const handleEditClick = (log) => {
    setEditingId(log.id);
    if (log.time_out) {
      const d = new Date(log.time_out);
      const pad = (n) => n.toString().padStart(2, '0');
      setEditTimeOut(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    } else {
      setEditTimeOut('');
    }
  };

  const handleUpdate = async (id) => {
    if (!editTimeOut) return alert("Pilih waktu keluar yang valid!");
    
    await fetch(`http://localhost:5000/api/parking/logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time_out: editTimeOut })
    });
    
    setEditingId(null);
    fetchLogs();
  };

  const formatWaktuAdaptif = (totalDetik) => {
    if (totalDetik === null || totalDetik === undefined) return '-';
    const d = Math.floor(totalDetik / 86400);
    const h = Math.floor((totalDetik % 86400) / 3600);
    const m = Math.floor((totalDetik % 3600) / 60);
    const s = totalDetik % 60;

    let hasil = [];
    if (d > 0) campaigners.push(`${d} hari`);
    if (d > 0) hasil.push(`${d} hari`);
    if (h > 0) hasil.push(`${h}j`);
    if (m > 0) hasil.push(`${m}m`);
    if (s > 0 || hasil.length === 0) hasil.push(`${s}s`);

    return hasil.join(' ');
  };

  const formatDurasi = (log) => {
    if (log.time_out === null) {
      const diff = Math.floor((currentTime - new Date(log.time_in)) / 1000);
      return (
        <span className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 w-fit text-xs">
          <Timer size={13} className="animate-pulse" /> {formatWaktuAdaptif(diff)}
        </span>
      );
    }
    return <span className="text-slate-800 font-semibold font-mono">{formatWaktuAdaptif(log.duration_seconds)}</span>;
  };

  return (
    <div className="space-y-5 max-w-6xl w-full mx-auto animate-[fadeInUp_0.5s_ease-out] relative">
      {/* BACKGROUND DEKORATIF GRADASI */}
      <div className="absolute -top-8 -left-8 -right-8 h-48 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none rounded-3xl" />
      
      {/* UPPER CONTROLLER HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm gap-4 transition-all duration-300">
        <h2 className="font-bold text-slate-800 flex items-center gap-2.5 text-base">
          <History className="text-blue-600" size={20} /> Manajemen Riwayat Kendaraan
        </h2>
        
        <button 
          onClick={() => window.open('http://localhost:5000/api/parking/logs/export', '_blank')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-sm shadow-blue-500/20 hover:-translate-y-0.5"
        >
          <FileDown size={17} /> Export PDF & Kirim Telegram
        </button>
      </div>

      {/* TABLE GRID AREA */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Identitas (Snapshot)</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Durasi Tepat</th>
                <th className="p-4 pr-6 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map(log => (
                <tr key={log.id} className={`transition-all duration-200 ${editingId === log.id ? 'bg-blue-50/40 font-medium' : 'hover:bg-slate-50/50'}`}>
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-800 text-sm">
                      {log.name_snapshot || log.name || 'Penyusup / Tidak Dikenal'}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                      UID: {log.uid_snapshot || log.uid}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 font-medium text-xs">{new Date(log.time_in).toLocaleString('id-ID')}</td>
                  
                  <td className="p-4">
                    {editingId === log.id ? (
                      <input 
                        type="datetime-local" 
                        value={editTimeOut} 
                        onChange={(e) => setEditTimeOut(e.target.value)}
                        className="bg-white border border-blue-400 rounded-xl px-2.5 py-1 text-slate-800 outline-none text-xs shadow-sm focus:ring-2 focus:ring-blue-100"
                      />
                    ) : (
                      <span className="text-slate-500 text-xs">
                        {log.time_out ? new Date(log.time_out).toLocaleString('id-ID') : '-'}
                  </span>
                    )}
                  </td>
                  
                  <td className="p-4">{formatDurasi(log)}</td>
                  
                  <td className="p-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      {editingId === log.id ? (
                        <>
                          <button onClick={() => handleUpdate(log.id)} className="p-1.5 text-blue-600 hover:bg-blue-100/50 rounded-lg transition-colors" title="Simpan">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Batal">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(log)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Edit Check-Out">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(log.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200" title="Hapus Log">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Belum ada riwayat aktivitas tap.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}