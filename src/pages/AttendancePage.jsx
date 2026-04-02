import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { attendanceService } from '../services/newFeatures';
import { guestService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';

const AttendancePage = () => {
  const { eventId } = useParams();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, checked_in: 0, checked_out: 0, not_arrived: 0 });
  const [loading, setLoading] = useState(true);
  const [qrInput, setQrInput] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setTab] = useState('scan');

  useEffect(() => { if (eventId) fetchData(); }, [eventId]);

  const fetchData = async () => {
    try {
      const res = await attendanceService.getByEvent(eventId);
      setRecords(res.data.data || []);
      setStats(res.data.stats || {});
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleScan = async () => {
    if (!qrInput.trim()) return;
    try {
      const record = records.find(r => r.qr_code === qrInput.trim());
      if (record?.check_in_time && !record.check_out_time) {
        await attendanceService.checkOut(qrInput.trim());
        setMessage('Check-out successful!');
      } else {
        await attendanceService.checkIn(qrInput.trim());
        setMessage('Check-in successful!');
      }
      setQrInput('');
      fetchData();
    } catch (err) { setMessage(err.response?.data?.message || 'Scan failed'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const generateAll = async () => {
    try {
      await attendanceService.generateAll(eventId);
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance Tracking</h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Guests', value: stats.total, color: 'bg-gray-100 text-gray-800' },
              { label: 'Checked In', value: stats.checked_in, color: 'bg-green-100 text-green-800' },
              { label: 'Checked Out', value: stats.checked_out, color: 'bg-blue-100 text-blue-800' },
              { label: 'Not Arrived', value: stats.not_arrived, color: 'bg-red-100 text-red-800' }
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${s.color}`}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="flex space-x-2 mb-6">
            {['scan', 'list'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${activeTab === t ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t === 'scan' ? '📱 Scan QR' : '📋 Guest List'}</button>
            ))}
          </div>

          {message && <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('successful') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message}</div>}

          {activeTab === 'scan' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Scan QR Code</h3>
              <div className="flex space-x-3">
                <input type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleScan()} placeholder="Enter or scan QR code..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                <button onClick={handleScan} className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Scan</button>
              </div>
              <button onClick={generateAll} className="mt-4 px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">Generate QR Codes for All Guests</button>
            </div>
          )}

          {activeTab === 'list' && (
            loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div> :
            records.length === 0 ? <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No attendance records</p></div> :
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.guest_name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">{r.qr_code || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${r.check_out_time ? 'bg-blue-100 text-blue-800' : r.check_in_time ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.check_out_time ? 'Left' : r.check_in_time ? 'Present' : 'Absent'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendancePage;