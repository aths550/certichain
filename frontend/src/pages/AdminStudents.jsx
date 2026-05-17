import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Users, Search, ChevronRight, Activity, Clock, ShieldAlert, GraduationCap, X, Trash2, Ban, CheckCircle } from "lucide-react";

const AdminStudents = () => {
  const { students, syncStudents, deleteStudent, toggleSuspendStudent } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (syncStudents) {
      syncStudents();
      const interval = setInterval(syncStudents, 5000);
      return () => clearInterval(interval);
    }
  }, [syncStudents]);

  const filteredStudents = students.filter(s => 
    (s.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (s.rollNumber || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.institution || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#051120] min-h-screen text-slate-200">
      <Sidebar />
      <main className="ml-[75px] transition-all duration-300 p-10 space-y-10 min-h-screen overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
              <GraduationCap className="text-accent" size={32} />
              Student Registry
            </h1>
            <p className="text-slate-400">Monitor all registered students and their portal activities.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
             <span className="text-xl font-bold text-white">{students.length}</span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Students</span>
          </div>
        </div>

        <div className="glass-morphism p-8 space-y-8">
           <div className="relative max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
                type="text"
                placeholder="Search by name, roll number, or institution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:bg-accent/5 transition-all"
             />
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                   <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/10">
                      <th className="px-6 py-4 rounded-tl-lg">Student Profile</th>
                      <th className="px-6 py-4">Institution</th>
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Registered On</th>
                      <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredStudents.length === 0 ? (
                      <tr>
                         <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                            No students found
                         </td>
                      </tr>
                   ) : filteredStudents.map((student, i) => (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedStudent(student)}>
                         <td className="px-6 py-4">
                            <p className="font-bold text-white">{student.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">{student.rollNumber || "No Roll No"}</p>
                         </td>
                         <td className="px-6 py-4 text-slate-300">{student.institution}</td>
                         <td className="px-6 py-4">
                            <span className="bg-accent/10 border border-accent/20 px-2 py-1 rounded text-accent text-[10px] font-mono">@{student.username}</span>
                         </td>
                         <td className="px-6 py-4 text-slate-500 text-xs">
                            {new Date(student.createdAt).toLocaleDateString()}
                            {student.suspended && <span className="ml-2 bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Suspended</span>}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); toggleSuspendStudent(student.username, student.suspended); }}
                                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                                  title={student.suspended ? "Unsuspend Student" : "Suspend Student"}
                               >
                                  {student.suspended ? <CheckCircle size={16} /> : <Ban size={16} />}
                               </button>
                               <button 
                                  onClick={(e) => { e.stopPropagation(); deleteStudent(student.username); }}
                                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                  title="Delete Student"
                               >
                                  <Trash2 size={16} />
                               </button>
                               <button className="text-slate-400 hover:text-accent transition-colors flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-widest pl-2">
                                  Activity <ChevronRight size={14} />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>

        {/* Activity Modal */}
        {selectedStudent && (
           <ActivityModal 
              student={selectedStudent} 
              onClose={() => setSelectedStudent(null)} 
           />
        )}
      </main>
    </div>
  );
};

const ActivityModal = ({ student, onClose }) => {
   const [activities, setActivities] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchActivities = async () => {
         try {
            const res = await axios.get(`/api/students/activities?username=${student.username}`);
            setActivities(res.data);
         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
      };
      fetchActivities();
   }, [student.username]);

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
         <div className="bg-[#0A111A] border border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-fade-slide relative">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white z-10">
               <X size={20} />
            </button>
            
            <div className="p-8 border-b border-white/10 bg-slate-900/50">
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center font-bold text-xl">
                     {student.name.charAt(0)}
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-white tracking-tight">{student.name}</h2>
                     <p className="text-xs text-slate-400 font-mono mt-1">Roll No: {student.rollNumber} • {student.institution}</p>
                  </div>
               </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-slate-950/50">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                     <Activity size={16} /> Activity Log
                  </h3>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 font-mono text-slate-400">{activities.length} records</span>
               </div>

               <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {loading ? (
                     <p className="text-center text-slate-500 py-10 mt-10">Loading timeline...</p>
                  ) : activities.length === 0 ? (
                     <p className="text-center text-slate-500 italic py-10 mt-10">No activities recorded yet.</p>
                  ) : activities.map((act, i) => (
                     <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0A111A] bg-slate-800 text-slate-500 group-hover:text-accent group-hover:bg-accent/20 transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                           <Clock size={14} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                           <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white text-sm">{act.action}</span>
                              <span className="text-[10px] font-mono text-slate-500">{new Date(act.timestamp).toLocaleTimeString()}</span>
                           </div>
                           <p className="text-xs text-slate-400">{act.details}</p>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mt-2">{new Date(act.timestamp).toLocaleDateString()}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default AdminStudents;
