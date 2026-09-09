import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  
  const [newStudent, setNewStudent] = useState({ name: '', batchId: '', beltLevel: 'White', phone: '' });
  const [newBatch, setNewBatch] = useState({ name: '', days: '', time: '', instructor: '' });
  const [newFee, setNewFee] = useState({ studentId: '', month: 'September 2026', amount: 1500, status: 'Pending' });

  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSheet, setAttendanceSheet] = useState({});

  useEffect(() => {
    fetchBatches();
    fetchStudents();
    fetchFees();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API_URL}/batches`);
      const data = await res.json();
      setBatches(data);
      if (data.length > 0 && !selectedBatchForAttendance) {
        setSelectedBatchForAttendance(data[0]._id);
      }
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/students`);
      const data = await res.json();
      setStudents(data);
    } catch (err) { console.error(err); }
  };

  const fetchFees = async () => {
    try {
      const res = await fetch(`${API_URL}/fees`);
      const data = await res.json();
      setFees(data);
    } catch (err) { console.error(err); }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    });
    setNewStudent({ name: '', batchId: '', beltLevel: 'White', phone: '' });
    fetchStudents();
    alert('Student added successfully!');
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBatch)
    });
    setNewBatch({ name: '', days: '', time: '', instructor: '' });
    fetchBatches();
    alert('Batch created successfully!');
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFee)
    });
    setNewFee({ studentId: '', month: 'September 2026', amount: 1500, status: 'Pending' });
    fetchFees();
    alert('Fee record added!');
  };

  const toggleFeeStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    await fetch(`${API_URL}/fees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    fetchFees();
  };

  const batchStudents = students.filter(s => s.batchId?._id === selectedBatchForAttendance);

  const handleStatusChange = (studentId, status) => {
    setAttendanceSheet(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    const records = batchStudents.map(student => ({
      studentId: student._id,
      batchId: selectedBatchForAttendance,
      date: attendanceDate,
      status: attendanceSheet[student._id] || 'Present'
    }));

    const res = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records)
    });

    if (res.ok) alert('Attendance saved successfully! 🥋');
  };

  const totalCollected = fees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = fees.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Header Overlay Trigger */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 shadow-md z-20">
        <div className="text-xl font-bold flex items-center gap-2">🥋 Karate Admin</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none text-2xl px-2 py-1 rounded bg-slate-800"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar for Mobile & Desktop */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 text-2xl font-bold tracking-wider border-b border-slate-800 hidden md:flex items-center gap-2">
          🥋 Karate Admin
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          {['dashboard', 'students', 'batches', 'attendance', 'fees'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg capitalize transition-colors ${
                activeTab === tab ? 'bg-red-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm h-16 hidden md:flex items-center justify-between px-8 border-b">
          <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h1>
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Admin Profile</span>
        </header>

        <main className="p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Total Students</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{students.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Active Batches</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{batches.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Fee Collected</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-1">₹{totalCollected}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Fee Pending</p>
                <h3 className="text-3xl font-bold text-red-600 mt-1">₹{totalPending}</h3>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Student</h2>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                    <input type="text" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="Rahul Kumar" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Batch</label>
                    <select required value={newStudent.batchId} onChange={e => setNewStudent({...newStudent, batchId: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                      <option value="">Select Batch</option>
                      {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Belt Level</label>
                    <select value={newStudent.beltLevel} onChange={e => setNewStudent({...newStudent, beltLevel: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                      {['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black'].map(belt => <option key={belt} value={belt}>{belt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input type="text" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="9876543210" />
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition">Save Student</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                      <th className="p-4">Name</th>
                      <th className="p-4">Batch</th>
                      <th className="p-4">Belt</th>
                      <th className="p-4">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {students.map(s => (
                      <tr key={s._id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{s.name}</td>
                        <td className="p-4 text-slate-600">{s.batchId?.name || 'Unassigned'}</td>
                        <td className="p-4"><span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium border">{s.beltLevel}</span></td>
                        <td className="p-4 text-slate-600">{s.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Create Batch</h2>
                <form onSubmit={handleAddBatch} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Batch Name</label>
                    <input type="text" required value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="Batch A (Advanced)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Days</label>
                    <input type="text" required value={newBatch.days} onChange={e => setNewBatch({...newBatch, days: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="Mon / Wed / Fri" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                    <input type="text" required value={newBatch.time} onChange={e => setNewBatch({...newBatch, time: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="5:00 PM – 6:00 PM" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Instructor Name</label>
                    <input type="text" required value={newBatch.instructor} onChange={e => setNewBatch({...newBatch, instructor: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="Sensei Arun" />
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition">Create Batch</button>
                </form>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {batches.map(b => (
                  <div key={b._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{b.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">🕒 {b.time}</p>
                      <p className="text-sm text-slate-500">📅 {b.days}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs font-medium text-slate-600">
                      <span>Instructor: {b.instructor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Batch</label>
                  <select value={selectedBatchForAttendance} onChange={e => setSelectedBatchForAttendance(e.target.value)} className="border rounded-lg p-2.5 text-sm bg-white w-full">
                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="border rounded-lg p-2.5 text-sm w-full" />
                </div>
              </div>

              {batchStudents.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No students found in this batch.</p>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                          <th className="p-4">Student Name</th>
                          <th className="p-4">Belt Level</th>
                          <th className="p-4">Status Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {batchStudents.map(student => {
                          const currentStatus = attendanceSheet[student._id] || 'Present';
                          return (
                            <tr key={student._id}>
                              <td className="p-4 font-medium text-slate-800">{student.name}</td>
                              <td className="p-4 text-slate-600">{student.beltLevel}</td>
                              <td className="p-4 flex gap-2 flex-wrap">
                                {['Present', 'Absent', 'Late'].map(status => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(student._id, status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                      currentStatus === status 
                                        ? status === 'Present' ? 'bg-emerald-600 text-white border-emerald-600' : status === 'Absent' ? 'bg-red-600 text-white border-red-600' : 'bg-amber-500 text-white border-amber-500'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={saveAttendance} className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800 transition">
                    Save Attendance 💾
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Record Fee Payment</h2>
                <form onSubmit={handleAddFee} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student</label>
                    <select required value={newFee.studentId} onChange={e => setNewFee({...newFee, studentId: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                    <input type="text" required value={newFee.month} onChange={e => setNewFee({...newFee, month: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="September 2026" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
                    <input type="number" required value={newFee.amount} onChange={e => setNewFee({...newFee, amount: Number(e.target.value)})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="1500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select value={newFee.status} onChange={e => setNewFee({...newFee, status: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition">Add Fee Record</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                      <th className="p-4">Student</th>
                      <th className="p-4">Month</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {fees.map(f => (
                      <tr key={f._id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{f.studentId?.name || 'Unknown'}</td>
                        <td className="p-4 text-slate-600">{f.month}</td>
                        <td className="p-4 text-slate-600">₹{f.amount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            f.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleFeeStatus(f._id, f.status)}
                            className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                          >
                            Mark as {f.status === 'Paid' ? 'Pending' : 'Paid'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
