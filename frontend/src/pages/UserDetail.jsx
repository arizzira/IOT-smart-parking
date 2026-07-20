import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Save, Edit, Timer } from 'lucide-react';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ user: {}, logs: [], totalWaktuDetik: 0 });
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchDetail = async () => {
    const res = await fetch(`http://localhost:5000/api/parking/users/${id}`);
    const result = await res.json();
    setData(result);
    if(!editMode) setFormName(result.user.name);
  };

  useEffect(() => { 
    fetchDetail();
    const intervalData = setInterval(fetchDetail, 3000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(intervalData); clearInterval(intervalTime); };
  }, [id, editMode]);

  const handleUpdateUser = async () => {
    await fetch(`http://localhost:5000/api/parking/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName, uid: data.user.uid })
    });
    setEditMode(false);
    fetchDetail();
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

  const formatTotalDurasi = (sec) => {
    return formatWaktuAdaptif(sec);
  };

  const getLiveDuration = (timeIn) => {
    const diff = Math.floor((currentTime - new Date(timeIn)) / 1000);
    return formatWaktuAdaptif(diff);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-[fadeInUp_0.5s_ease-out] relative">
      {/* GRADASI BIRU HALUS BACKGROUND ATAS */}
      <div className="absolute -top-8 -left-8 -right-8 h-48 bg-gradient-to-b from-blue-50/60 to-transparent -z-10 pointer-events-none rounded-3xl" />

      {/* TOMBOL KEMBALI */}
      <button 
        onClick={() => navigate('/users')} 
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-all duration-300 ease-in-out hover:-translate-x-1"
      >
        <ArrowLeft size={18} /> Kembali ke Manajemen User
      </button>

      {/* HEADER DETAIL USER CARD */}
      <div className="bg-white p-6 border border-slate-100 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-all duration-300">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Identitas Pemegang Kartu</p>
          {editMode ? (
            <div className="flex gap-2 pt-1">
              <input 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)} 
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-sm transition-all" 
              />
              <button 
                onClick={handleUpdateUser} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1 transition-all shadow-sm shadow-blue-500/20"
              >
                <Save size={16}/> Simpan
              </button>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {data.user.name} 
              <button 
                onClick={() => setEditMode(true)} 
                className="text-slate-400 hover:text-blue-600 transition-colors duration-200"
              >
                <Edit size={16}/>
              </button>
            </h2>
          )}
          <p className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md w-fit mt-1">UID: {data.user.uid}</p>
        </div>
        
        {/* TOTAL WAKTU PARKIR WIDGET */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center mt-4 sm:mt-0 min-w-[200px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          <p className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-center gap-1">
            <Clock size={14} className="text-slate-400" /> Total Waktu Parkir
          </p>
          <p className="text-xl font-black text-slate-800 tracking-tight">{formatTotalDurasi(data.totalWaktuDetik)}</p>
        </div>
      </div>

      {/* RIWAYAT LOG KHUSUS USER */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <h3 className="p-5 bg-slate-50/50 font-bold text-slate-800 border-b border-slate-100 text-base">Riwayat Perjalanan Kendaraan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 font-medium border-b border-slate-100 bg-slate-50/30 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Waktu Masuk</th>
                <th className="p-4">Waktu Keluar</th>
                <th className="p-4 pr-6">Durasi Terukur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors duration-200">
                  <td className="p-4 pl-6 font-medium text-slate-600">{new Date(log.time_in).toLocaleString('id-ID')}</td>
                  <td className="p-4 text-slate-500">{log.time_out ? new Date(log.time_out).toLocaleString('id-ID') : '-'}</td>
                  <td className="p-4 pr-6 font-mono">
                    {log.time_out ? (
                      <span className="text-slate-800 font-semibold">{formatWaktuAdaptif(log.duration_seconds)}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 w-fit text-xs">
                        <Timer size={13} className="animate-pulse" /> {getLiveDuration(log.time_in)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {data.logs.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400 font-medium">Belum ada catatan riwayat tap parkir.</td>
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