import { useState, useEffect } from 'react';
import { Trash2, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [formName, setFormName] = useState('');
  const [formUid, setFormUid] = useState('');
  const [isPolling, setIsPolling] = useState(true);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:5000/api/parking/users');
    const data = await res.json();
    setUsers(data);
  };

  const checkUnknownUid = async () => {
    if (!isPolling) return;
    try {
      const res = await fetch('http://localhost:5000/api/parking/unknown-uid');
      const data = await res.json();
      if (data.uid && data.uid !== formUid) {
        setFormUid(data.uid);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(checkUnknownUid, 1500);
    return () => clearInterval(interval);
  }, [formUid, isPolling]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/parking/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: formUid, name: formName })
    });
    setFormUid(''); setFormName('');
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus user ini? Riwayat tetap aman.')) return;
    await fetch(`http://localhost:5000/api/parking/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  return (
    <div className="space-y-6 max-w-4xl animate-[fadeIn_0.4s_ease-out]">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Manajemen User</h1>
        <p className="text-sm text-slate-400 mt-0.5">Daftarkan dan kelola pemegang kartu RFID.</p>
      </div>

      {/* ================= FORM TAMBAH USER ================= */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Plus size={16} className="text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-700">Daftarkan Kartu Baru</h3>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 font-medium mb-1.5">
              UID Kartu
              <span className="ml-1 text-slate-300">(tap kartu di gerbang untuk isi otomatis)</span>
            </label>
            <input
              required
              value={formUid}
              onChange={(e) => setFormUid(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-mono placeholder-slate-300 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200"
              placeholder="Akan terisi otomatis..."
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Nama Pemilik</label>
            <input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-200"
              placeholder="Contoh: Budi Santoso"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm shadow-blue-200 flex-shrink-0"
          >
            Simpan Data
          </button>
        </form>
      </div>

      {/* ================= TABEL USER ================= */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-700">
            Daftar Pengguna
            <span className="ml-2 text-xs font-normal text-slate-400">{users.length} terdaftar</span>
          </p>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Nama User</th>
              <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">UID RFID</th>
              <th className="px-6 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                <td className="px-6 py-4">
                  <Link
                    to={`/users/${u.id}`}
                    className="flex items-center gap-3 w-fit group/link"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover/link:text-blue-600 transition-colors duration-150 flex items-center gap-1.5">
                      {u.name}
                      <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity duration-150 text-blue-400" />
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">{u.uid}</span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Hapus user"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-sm text-slate-400">
                  Belum ada user terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}