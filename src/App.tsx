import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

// ==========================================
// 1. Firebase Configuration (สภาเด็กและเยาวชน จ.ลำพูน)
// ==========================================
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import liff from '@line/liff';
import { 
  LayoutDashboard, Users, Calendar, CheckCircle, 
  Settings, LogOut, ChevronLeft, ChevronRight, Bell, UserPlus, 
  Search, Edit2, Trash2, X, Image as ImageIcon, Contact, Save, MapPin, Clock, FileText, Plus, Smartphone
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBBPZLN9Q_YBWiDXzA1SE2xluu6dBxhewc",
  authDomain: "lampun.firebaseapp.com",
  projectId: "lampun",
  storageBucket: "lampun.firebasestorage.app",
  messagingSenderId: "296901888521",
  appId: "1:296901888521:web:9b0f3aff13e1409f6c06d8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

const LIFF_ID = "2009629879-g33kYPK0"; // LIFF ID ของคุณ

// ==========================================
// 2. Components ย่อย (UI)
// ==========================================

const AppIcon = ({ icon: Icon, label, color, path, badge }: any) => (
  <Link to={path} className={`relative w-full aspect-[5/4] ${color} rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden flex flex-col items-center justify-center`}>
    <Icon size={160} className="absolute -right-8 -bottom-8 text-white/10 group-hover:rotate-12 transition-transform duration-500 pointer-events-none" />
    <div className="bg-white/20 p-4 rounded-3xl mb-3 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-inner">
      <Icon size={40} className="text-white drop-shadow-md" />
    </div>
    <span className="text-white font-bold text-sm md:text-lg tracking-wide px-2 relative z-10 text-center">{label}</span>
    {badge > 0 && (
      <div className="absolute top-4 right-4 bg-white text-red-600 text-xs font-extrabold px-2 py-1 rounded-full shadow-lg z-20 animate-pulse border-2 border-red-100">
        {badge}
      </div>
    )}
  </Link>
);

const PageTemplate = ({ title, children }: any) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 flex items-center gap-2 font-medium transition-colors">
            <ChevronLeft size={20} /> <span className="hidden md:inline">กลับหน้าหลัก</span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        </div>
        <button className="p-2 hover:bg-red-50 text-red-500 rounded-xl flex items-center gap-2 font-bold transition-colors text-sm">
          <LogOut size={18} /> <span className="hidden md:inline">ออกจากระบบ</span>
        </button>
      </div>
      <main className="p-4 md:p-6 w-full flex-1 flex flex-col overflow-hidden max-w-full">
        {children}
      </main>
    </div>
  );
};

// ==========================================
// 🌟 หน้าสำหรับ LINE LIFF: สมัครสมาชิก (แยกขาดจาก Router ปกติ)
// ==========================================
const LineRegisterView = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({
    imageUrl: '', memberId: '', position: 'สมาชิก', affiliation: 'คณะทำงานสภาเด็กและเยาวชนจังหวัดลำพูน',
    firstName: '', lastName: '', nickname: '', age: '', height: '', weight: '',
    district: 'เมืองลำพูน', address: '', phone: '', emergencyPhone: ''
  });

  const districts = ['เมืองลำพูน', 'ป่าซาง', 'แม่ทา', 'บ้านโฮ่ง', 'ลี้', 'ทุ่งหัวช้าง', 'บ้านธิ', 'เวียงหนองล่อง'];

  useEffect(() => {
    // 🚀 ระบบ LIFF Init ถูกรันมาตั้งแต่ไฟล์ระดับนอกสุดแล้ว เราแค่ดึงค่ามาใช้
    if (liff.isLoggedIn()) {
      liff.getProfile().then(p => {
        setProfile(p);
        setFormData(prev => ({ ...prev, imageUrl: p.pictureUrl || '' }));
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    } else {
      // ถ้าเปิดจากบราวเซอร์นอกไลน์ ให้บังคับ Login
      liff.login({ redirectUri: window.location.href });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'members'), {
        ...formData,
        lineUserId: profile?.userId || '', 
        createdAt: serverTimestamp()
      });
      setIsRegistered(true);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6"><div className="text-4xl animate-bounce mb-4 text-[#06C755]">💬</div><p className="font-bold text-slate-600">กำลังดึงข้อมูล LINE...</p></div>;

  if (isRegistered) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center animate-in zoom-in duration-300">
        <CheckCircle className="text-[#06C755] mx-auto mb-4" size={72}/>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">สมัครสมาชิกสำเร็จ!</h2>
        <p className="text-slate-600 mb-6">ข้อมูลของคุณถูกบันทึกเข้าสู่ระบบสภาเด็กและเยาวชนลำพูนเรียบร้อยแล้ว</p>
        <button onClick={() => liff.closeWindow()} className="w-full bg-[#06C755] text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-600 transition">ปิดหน้าต่างนี้</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 md:py-10">
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl w-full max-w-lg border border-slate-200">
        <div className="text-center mb-6">
          <img src="https://i.postimg.cc/3RwSgrwg/c021db22-1797-4ccf-a2fd-cc7edfcb0cb7.jpg" alt="Logo" className="h-20 w-auto mx-auto mb-3 rounded-full shadow-sm" />
          <h1 className="text-xl font-extrabold text-slate-800">ลงทะเบียนสมาชิกใหม่</h1>
          <p className="text-slate-500 text-sm">สภาเด็กและเยาวชนลำพูน</p>
        </div>

        {profile && (
          <div className="bg-[#f0fcf4] border border-[#a2ecc2] p-3 rounded-xl mb-6 flex items-center gap-4 shadow-sm">
            <img src={profile.pictureUrl} alt="Avatar" className="w-12 h-12 rounded-full shadow-sm" />
            <div>
              <p className="text-[10px] text-green-700 font-bold uppercase tracking-wide">เชื่อมต่อบัญชี LINE แล้ว</p>
              <p className="text-sm font-bold text-slate-800">{profile.displayName}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลสภาฯ */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">📌 ข้อมูลสภาเด็กและเยาวชน</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">รูปถ่ายโปรไฟล์ (ดึงจาก LINE อัตโนมัติ)</label>
              <input type="text" value={formData.imageUrl} readOnly className="w-full px-3 py-2 border rounded-xl bg-slate-100 text-slate-400 text-xs focus:outline-none cursor-not-allowed" placeholder="ไม่มีรูปภาพโปรไฟล์" />
            </div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1">เลขประจำตัวสมาชิก</label><input type="text" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" placeholder="เว้นว่างไว้หากยังไม่มี" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1">ตำแหน่ง *</label><input required type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" placeholder="เช่น ประธาน, สมาชิกทั่วไป" /></div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">สังกัด *</label>
              <select value={formData.affiliation} onChange={e => setFormData({...formData, affiliation: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm font-bold text-[#06C755] bg-white">
                <option value="คณะผู้บริหารสภาเด็กและเยาวชนจังหวัดลำพูน">สังกัด คณะผู้บริหารสภาเด็กและเยาวชนจังหวัดลำพูน</option>
                <option value="คณะทำงานสภาเด็กและเยาวชนจังหวัดลำพูน">สังกัด คณะทำงานสภาเด็กและเยาวชนจังหวัดลำพูน</option>
              </select>
            </div>
          </div>

          {/* ข้อมูลส่วนตัว */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">👤 ข้อมูลส่วนบุคคล</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-slate-700 mb-1">ชื่อจริง *</label><input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" /></div>
              <div><label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล *</label><input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label><input type="text" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" /></div>
              <div><label className="block text-xs font-bold text-slate-700 mb-1">อายุ (ปี)</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-slate-700 mb-1">ส่วนสูง (ซม.)</label><input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" /></div>
              <div><label className="block text-xs font-bold text-slate-700 mb-1">น้ำหนัก (กก.)</label><input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" /></div>
            </div>
          </div>

          {/* การติดต่อ */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">📍 ข้อมูลการติดต่อ</h3>
            <div><label className="block text-xs font-bold text-slate-700 mb-1">อำเภอที่พักอาศัย *</label><select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm font-bold text-slate-700 bg-white">{districts.map(d => <option key={d} value={d}>อ.{d}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1">ที่อยู่แบบเต็ม</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm" placeholder="บ้านเลขที่ หมู่ หมู่บ้าน ตำบล" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label><input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#06C755] text-sm font-mono" placeholder="08X-XXX-XXXX" /></div>
            <div><label className="block text-xs font-bold text-red-600 mb-1">เบอร์โทรฉุกเฉิน *</label><input required type="tel" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} className="w-full px-3 py-2.5 border border-red-200 bg-red-50 rounded-xl focus:ring-2 focus:ring-red-400 text-sm font-mono" placeholder="เบอร์ผู้ปกครอง/ญาติ" /></div>
          </div>
          
          <button type="submit" disabled={isSaving} className="w-full bg-[#06C755] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-600 transition flex items-center justify-center gap-2 mt-8 text-lg">
            {isSaving ? 'กำลังบันทึกข้อมูลลงระบบ...' : <><Smartphone size={22}/> บันทึกและสมัครสมาชิก</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. หน้าต่างๆ ของระบบ (Pages - ฝั่ง Admin)
// ==========================================

const HomeView = () => (
  <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <div className="mb-10 text-center relative z-10 flex flex-col items-center">
      <img src="https://i.postimg.cc/3RwSgrwg/c021db22-1797-4ccf-a2fd-cc7edfcb0cb7.jpg" alt="โลโก้ สภาเด็กและเยาวชนลำพูน" className="h-28 md:h-36 w-auto mb-6 mx-auto drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-1000 rounded-full" />
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">สภาเด็กและเยาวชนลำพูน</h1>
      <p className="text-slate-500 font-medium bg-white/50 px-4 py-1 rounded-full inline-block shadow-sm">ระบบบริหารจัดการข้อมูลสมาชิกและการประชุม</p>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl w-full relative z-10">
      <AppIcon icon={LayoutDashboard} label="ภาพรวม" path="/dashboard" color="bg-gradient-to-br from-blue-500 to-blue-600" />
      <AppIcon icon={Users} label="ระบบสมาชิก" path="/members" color="bg-gradient-to-br from-indigo-500 to-indigo-600" />
      <AppIcon icon={CheckCircle} label="เช็คชื่อเข้าประชุม" path="/attendance" color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
      <AppIcon icon={Calendar} label="ปฏิทินกิจกรรม" path="/calendar" color="bg-gradient-to-br from-orange-500 to-orange-600" />
      {/* 🚀 ซ่อนปุ่ม LIFF ออกจากหน้าหลัก เพราะแอดมินไม่จำเป็นต้องเข้าจากตรงนี้ */}
      <AppIcon icon={Settings} label="ตั้งค่าระบบ" path="/settings" color="bg-gradient-to-br from-slate-700 to-slate-800" />
    </div>
  </div>
);

const DashboardView = () => {
  const [memberCount, setMemberCount] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsThisMonth, setEventsThisMonth] = useState(0);

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => { setMemberCount(snapshot.size); });
    const qEvents = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      const fetchedEvents: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setEvents(fetchedEvents);
      const today = new Date();
      const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const count = fetchedEvents.filter((e: any) => e && e.date && String(e.date).startsWith(currentMonthStr)).length;
      setEventsThisMonth(count);
    });
    return () => { unsubMembers(); unsubEvents(); };
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e: any) => e && e.date && String(e.date) >= todayStr).slice(0, 5);

  return (
    <PageTemplate title="📊 สรุปภาพรวมระบบ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between"><div><h4 className="text-slate-500 font-bold text-sm uppercase">สมาชิกทั้งหมด</h4><p className="text-4xl font-black text-blue-600 mt-2">{memberCount} <span className="text-lg text-slate-400">คน</span></p></div><Users size={48} className="text-blue-100" /></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between"><div><h4 className="text-slate-500 font-bold text-sm uppercase">กิจกรรมเดือนนี้</h4><p className="text-4xl font-black text-orange-500 mt-2">{eventsThisMonth} <span className="text-lg text-slate-400">ครั้ง</span></p></div><Calendar size={48} className="text-orange-100" /></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between"><div><h4 className="text-slate-500 font-bold text-sm uppercase">สถานะเชื่อมต่อ</h4><p className="text-2xl font-black text-emerald-500 mt-2">Online</p></div><CheckCircle size={48} className="text-emerald-100" /></div>
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-50/50 rounded-t-3xl"><h3 className="text-lg font-bold text-orange-800 flex items-center gap-2"><Calendar size={20} className="text-orange-600" /> กิจกรรมเร็วๆ นี้</h3><Link to="/calendar" className="text-sm font-bold text-orange-600 hover:text-orange-700">ดูปฏิทิน</Link></div>
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar h-80">
            {upcomingEvents.length === 0 ? ( <div className="text-center text-slate-400 py-10"><Calendar size={40} className="mx-auto mb-3 opacity-20" /><p>ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p></div> ) : (
              <div className="space-y-4">
                {upcomingEvents.map(ev => {
                  const evtDate = new Date(ev.date);
                  return (
                    <div key={ev.id} className="flex gap-4 items-start p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                      <div className="bg-orange-100 text-orange-700 rounded-xl px-3 py-2 text-center min-w-[60px] shrink-0"><p className="text-xs font-bold uppercase">{evtDate.toLocaleString('th-TH', { month: 'short' })}</p><p className="text-xl font-black">{evtDate.getDate()}</p></div>
                      <div className="flex-1"><h4 className="font-bold text-slate-800">{ev.title}</h4><div className="flex items-center gap-4 mt-1 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock size={14} /> {ev.startTime} - {ev.endTime}</span>{ev.location && <span className="flex items-center gap-1 truncate max-w-[120px]"><MapPin size={14} /> {ev.location}</span>}</div></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col justify-center items-center h-full">
          <img src="https://i.postimg.cc/3RwSgrwg/c021db22-1797-4ccf-a2fd-cc7edfcb0cb7.jpg" className="h-24 w-auto rounded-full mb-4 opacity-50 grayscale" alt="Logo" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">ยินดีต้อนรับสู่ระบบสภาเด็กและเยาวชนลำพูน</h3>
          <p className="text-slate-500">ระบบเชื่อมต่อฐานข้อมูล Firebase สำเร็จแล้ว มีสมาชิกในระบบทั้งหมด <span className="font-bold text-blue-600">{memberCount}</span> คน</p>
        </div>
      </div>
    </PageTemplate>
  );
};

const MembersView = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialForm = {
    imageUrl: '', memberId: '', position: 'สมาชิก', affiliation: 'คณะผู้บริหารสภาเด็กและเยาวชนจังหวัดลำพูน',
    firstName: '', lastName: '', nickname: '', age: '', height: '', weight: '',
    district: 'เมืองลำพูน', address: '', phone: '', emergencyPhone: '', lineUserId: ''
  };
  const [formData, setFormData] = useState<any>(initialForm);
  const districts = ['เมืองลำพูน', 'ป่าซาง', 'แม่ทา', 'บ้านโฮ่ง', 'ลี้', 'ทุ่งหัวช้าง', 'บ้านธิ', 'เวียงหนองล่อง'];

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => { setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))); });
    return () => unsubscribe();
  }, []);

  const handleCloseForm = () => { setFormData(initialForm); setIsFormVisible(false); setIsEditing(false); setEditingMemberId(null); };
  const handleStartEdit = (m: any) => { setIsFormVisible(true); setIsEditing(true); setEditingMemberId(m.id); setFormData(m); };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing && editingMemberId) { await updateDoc(doc(db, 'members', editingMemberId), formData); alert('แก้ไขข้อมูลสมาชิกสำเร็จ!'); } 
      else { await addDoc(collection(db, 'members'), { ...formData, createdAt: serverTimestamp() }); alert('บันทึกข้อมูลสมาชิกสำเร็จ!'); }
      handleCloseForm();
    } catch (error) { alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล'); }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, name: string) => { if(window.confirm(`คุณต้องการลบข้อมูลของ ${name} ใช่หรือไม่?`)) { await deleteDoc(doc(db, 'members', id)); } };

  const filteredMembers = members.filter(m => { const term = searchTerm.toLowerCase(); return ((m.firstName || '').toLowerCase().includes(term) || (m.lastName || '').toLowerCase().includes(term) || (m.nickname || '').toLowerCase().includes(term) || (m.district || '').toLowerCase().includes(term)); });

  return (
    <PageTemplate title="👥 จัดการข้อมูลสมาชิก">
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-5">
          <div className="relative w-full md:w-96"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-slate-400" /></div><input type="text" placeholder="ค้นหาชื่อ, นามสกุล, อำเภอ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" /></div>
          <button onClick={isFormVisible ? handleCloseForm : () => setIsFormVisible(true)} className={`${isFormVisible ? 'bg-slate-500 hover:bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm w-full md:w-auto justify-center`}>{isFormVisible ? <><X size={18}/> ยกเลิก</> : <><UserPlus size={18} /> เพิ่มสมาชิกใหม่</>}</button>
        </div>

        {isFormVisible && (
          <div className="mb-8 p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2"><Contact className="text-indigo-600" size={24}/><h3 className="text-lg font-bold text-indigo-900">{isEditing ? 'แก้ไขข้อมูลสมาชิก' : 'กรอกข้อมูลสมาชิกใหม่'}</h3></div>
              {formData.lineUserId && <span className="bg-[#06C755] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Smartphone size={14}/> สมัครผ่าน LINE</span>}
            </div>

            <form onSubmit={handleSaveMember} className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-600 text-sm mb-3">📌 ข้อมูลสภาเด็กและเยาวชน</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="md:col-span-2 xl:col-span-4"><label className="block text-xs font-bold text-slate-700 mb-1">ลิงก์ URL รูปถ่าย</label><input type="text" placeholder="https://... หรือปล่อยว่างไว้" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">เลขประจำตัวสมาชิก</label><input type="text" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">ตำแหน่ง *</label><input required type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div className="md:col-span-2 xl:col-span-4"><label className="block text-xs font-bold text-slate-700 mb-1">สังกัด *</label><select value={formData.affiliation} onChange={e => setFormData({...formData, affiliation: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-bold text-indigo-800 bg-white"><option value="คณะผู้บริหารสภาเด็กและเยาวชนจังหวัดลำพูน">สังกัด คณะผู้บริหารสภาเด็กและเยาวชนจังหวัดลำพูน</option><option value="คณะทำงานสภาเด็กและเยาวชนจังหวัดลำพูน">สังกัด คณะทำงานสภาเด็กและเยาวชนจังหวัดลำพูน</option></select></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-600 text-sm mb-3">👤 ข้อมูลส่วนบุคคล</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">ชื่อจริง *</label><input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">นามสกุล *</label><input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label><input type="text" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">อายุ (ปี)</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">ส่วนสูง (ซม.)</label><input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">น้ำหนัก (กก.)</label><input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" /></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-600 text-sm mb-3">📍 ข้อมูลการติดต่อ</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">อำเภอที่อยู่ *</label><select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-bold text-slate-700 bg-white">{districts.map(d => <option key={d} value={d}>อ.{d}</option>)}</select></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-700 mb-1">ที่อยู่แบบเต็ม</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" placeholder="บ้านเลขที่ หมู่ หมู่บ้าน ตำบล" /></div>
                  <div><label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label><input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 text-sm" placeholder="08X-XXX-XXXX" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-red-600 mb-1">เบอร์ติดต่อฉุกเฉิน *</label><input required type="tel" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} className="w-full border border-red-200 bg-red-50 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-red-400 text-sm" placeholder="เบอร์ผู้ปกครอง/ญาติ" /></div>
                  <div className="md:col-span-3"><label className="block text-xs font-bold text-slate-400 mb-1">LINE User ID (ระบบดึงอัตโนมัติ)</label><input type="text" value={formData.lineUserId || ''} disabled className="w-full border p-2.5 rounded-xl bg-slate-50 text-slate-400 font-mono text-sm" placeholder="ไม่มีข้อมูล" /></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-indigo-100"><button type="button" onClick={handleCloseForm} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition">ยกเลิก</button><button type="submit" disabled={isLoading} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center gap-2"><Save size={18}/>{isLoading ? 'กำลังประมวลผล...' : (isEditing ? 'แก้ไขข้อมูล' : 'บันทึกข้อมูล')}</button></div>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10"><tr><th className="p-4 w-16 text-center">รูป</th><th className="p-4">ชื่อ - นามสกุล (ชื่อเล่น)</th><th className="p-4">ตำแหน่ง</th><th className="p-4">สังกัด และ อำเภอ</th><th className="p-4">เบอร์โทร</th><th className="p-4 text-center">จัดการ</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? ( <tr><td colSpan={6} className="p-20 text-center text-slate-400"><Users size={60} className="mx-auto mb-5 opacity-20" /><p className="text-xl font-bold">ยังไม่มีข้อมูลสมาชิก</p></td></tr> ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-center"><div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 mx-auto border-4 border-white shadow-md flex items-center justify-center">{m.imageUrl ? ( <img src={m.imageUrl} alt={m.firstName} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://via.placeholder.com/150'} /> ) : ( <ImageIcon size={24} className="text-slate-400" /> )}</div></td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-base">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">ชื่อเล่น: <span className="text-indigo-600 font-bold">{m.nickname || '-'}</span> {m.lineUserId && <span className="ml-2 bg-[#06C755] text-white text-[10px] px-1.5 py-0.5 rounded">LINE</span>}</p>
                    </td>
                    <td className="p-4"><p className="font-bold text-indigo-700 text-sm">{m.position}</p></td>
                    <td className="p-4"><p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{m.affiliation}</p><p className="text-xs text-orange-700 font-bold mt-1.5 bg-orange-100 inline-block px-2.5 py-1 rounded-full">อ.{m.district}</p></td>
                    <td className="p-4"><p className="font-mono text-slate-700 font-bold text-base">{m.phone}</p></td>
                    <td className="p-4 text-center"><div className="flex gap-2 justify-center"><button onClick={() => handleStartEdit(m)} className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Edit2 size={18} /></button><button onClick={() => handleDelete(m.id, m.firstName)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTemplate>
  );
};

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialForm = { title: '', date: '', startTime: '09:00', endTime: '12:00', location: '', description: '' };
  const [formData, setFormData] = useState<any>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => { setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))); });
    return () => unsub();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const emptyCells: any[] = Array.from({ length: firstDayOfMonth }, () => null);
  const dayCells: any[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells: any[] = [...emptyCells, ...dayCells];

  const handleDayClick = (day: any) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormData({ ...initialForm, date: dateStr }); setEditingId(null); setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try {
      if (editingId) { await updateDoc(doc(db, 'events', editingId), formData); } 
      else { await addDoc(collection(db, 'events'), { ...formData, createdAt: serverTimestamp() }); }
      setIsModalOpen(false);
    } catch (error) { alert('เกิดข้อผิดพลาด'); }
    setIsLoading(false);
  };

  return (
    <PageTemplate title="📅 ปฏิทินกิจกรรม">
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col h-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">วันนี้</button>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1"><button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white rounded-lg text-slate-600 transition"><ChevronLeft size={20}/></button><button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white rounded-lg text-slate-600 transition"><ChevronRight size={20}/></button></div>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 min-w-[200px] text-center md:text-left">{monthNames[month]} {year + 543}</h3>
          </div>
          <button onClick={() => { setFormData({...initialForm, date: new Date().toISOString().split('T')[0]}); setEditingId(null); setIsModalOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm"><Plus size={18} /> เพิ่มกิจกรรม</button>
        </div>

        <div className="flex-1 flex flex-col bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-slate-200">{dayNames.map(d => (<div key={d} className="bg-slate-50 py-3 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>))}</div>
          <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1 min-h-[500px]">
            {calendarCells.map((day, idx) => {
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              const dayEvents = events.filter(e => e.date === dateStr);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              return (
                <div key={idx} onClick={() => handleDayClick(day)} className={`bg-white min-h-[100px] p-1.5 transition ${day ? 'hover:bg-orange-50/30 cursor-pointer' : 'opacity-50 cursor-default'}`}>
                  {day && (
                    <><div className={`text-right text-sm font-bold mb-1 ${isToday ? 'text-white' : 'text-slate-600'}`}><span className={`${isToday ? 'bg-orange-500 rounded-full w-7 h-7 flex items-center justify-center ml-auto shadow-md' : 'inline-block w-7 text-center'}`}>{day}</span></div>
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">{dayEvents.map(evt => (<div key={evt.id} onClick={(e) => { e.stopPropagation(); setFormData(evt); setEditingId(evt.id); setIsModalOpen(true); }} className="bg-orange-100 hover:bg-orange-200 text-orange-800 text-[10px] font-bold px-1.5 py-1 rounded truncate border border-orange-200 transition" title={evt.title}>{evt.startTime} {evt.title}</div>))}</div></>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"><div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"><div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-orange-50"><div className="flex items-center gap-3"><Calendar className="text-orange-600" size={24}/><h3 className="font-bold text-lg text-orange-900">{editingId ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</h3></div><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-orange-200 rounded-full text-slate-500"><X size={20} /></button></div><form onSubmit={handleSaveEvent} className="p-6 space-y-4"><div><input required type="text" placeholder="เพิ่มชื่อกิจกรรม *" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-b-2 border-slate-200 px-2 py-3 outline-none focus:border-orange-500 text-xl font-bold text-slate-800" /></div><div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"><Clock className="text-slate-400" size={20} /><input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="border p-2 rounded-xl text-sm font-bold text-slate-700 outline-none" /><div className="flex items-center gap-2"><input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="border p-2 rounded-xl text-sm font-bold text-slate-700 outline-none" /><span className="text-slate-400">-</span><input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="border p-2 rounded-xl text-sm font-bold text-slate-700 outline-none" /></div></div><div className="flex items-center gap-4 px-2"><MapPin className="text-slate-400" size={20} /><input type="text" placeholder="เพิ่มสถานที่" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border-b border-slate-200 py-2 outline-none focus:border-orange-500 text-sm" /></div><div className="flex items-start gap-4 px-2"><FileText className="text-slate-400 mt-2" size={20} /><textarea rows={3} placeholder="คำอธิบายรายละเอียด..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-b border-slate-200 py-2 outline-none focus:border-orange-500 text-sm resize-none" /></div><div className="flex justify-between items-center pt-6 mt-4">{editingId ? (<button type="button" onClick={async () => { if (window.confirm('ลบ?')) { await deleteDoc(doc(db, 'events', editingId)); setIsModalOpen(false); } }} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition flex items-center gap-2"><Trash2 size={18}/> ลบกิจกรรม</button>) : <div/>}<div className="flex gap-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">ยกเลิก</button><button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-md hover:bg-orange-600 transition">บันทึก</button></div></div></form></div></div>
      )}
    </PageTemplate>
  );
};

const AttendanceView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubE = onSnapshot(query(collection(db, 'events'), orderBy('date', 'desc')), (snapshot) => { setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))); });
    const unsubM = onSnapshot(query(collection(db, 'members'), orderBy('firstName', 'asc')), (snapshot) => { setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))); });
    return () => { unsubE(); unsubM(); };
  }, []);

  useEffect(() => {
    if (!selectedEventId) return setAttendanceData({});
    const unsub = onSnapshot(doc(db, 'attendance', selectedEventId), (docSnap) => { if (docSnap.exists()) setAttendanceData((docSnap.data() as any).records || {}); else setAttendanceData({}); });
    return () => unsub();
  }, [selectedEventId]);

  const handleStatusChange = (memberId: string, status: string) => setAttendanceData(prev => ({ ...prev, [memberId]: status }));

  const handleSaveAttendance = async () => {
    if (!selectedEventId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'attendance', selectedEventId), { records: attendanceData, updatedAt: serverTimestamp() }).catch(async (err) => {
        if (err.code === 'not-found') await setDoc(doc(db, 'attendance', selectedEventId), { eventId: selectedEventId, records: attendanceData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        else throw err;
      });
      alert('บันทึกสำเร็จ!');
    } catch (error) { alert('เกิดข้อผิดพลาด'); }
    setIsSaving(false);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <PageTemplate title="✅ ระบบเช็คชื่อเข้าประชุม">
      <div className="flex flex-col lg:flex-row gap-6 h-full max-h-[calc(100vh-100px)]">
        <div className="w-full lg:w-1/3 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full"><h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Calendar className="text-emerald-600" size={20}/> เลือกกิจกรรมที่ต้องการ</h3><div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">{events.map(ev => { const isSelected = selectedEventId === ev.id; return (<div key={ev.id} onClick={() => setSelectedEventId(ev.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}><p className="text-xs font-bold text-emerald-600 mb-1">{ev.date} | {ev.startTime}</p><h4 className={`font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>{ev.title}</h4></div>) })}</div></div>
        <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          {!selectedEvent ? (<div className="flex-1 flex flex-col items-center justify-center text-slate-400"><CheckCircle size={64} className="opacity-20 mb-4" /><p className="text-lg font-bold">กรุณาเลือกกิจกรรมด้านซ้ายมือ</p></div>) : (
            <><div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><div><h3 className="text-xl font-bold text-slate-800">{selectedEvent.title}</h3><p className="text-sm text-slate-500 mt-1 flex items-center gap-2"><Calendar size={14}/> {selectedEvent.date} ({selectedEvent.startTime} - {selectedEvent.endTime})</p></div><button onClick={handleSaveAttendance} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm">{isSaving ? 'กำลังบันทึก...' : <><Save size={18} /> บันทึกการเข้าร่วม</>}</button></div><div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar p-0"><table className="w-full text-left text-sm whitespace-nowrap min-w-max"><thead className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold sticky top-0 z-10 shadow-sm"><tr><th className="p-4 pl-6">ลำดับ</th><th className="p-4">ชื่อ - นามสกุล</th><th className="p-4 text-center border-l border-slate-200">มา</th><th className="p-4 text-center">ลา</th><th className="p-4 text-center">สาย</th><th className="p-4 text-center pr-6">ขาด</th></tr></thead><tbody className="divide-y divide-slate-100">{members.map((m, idx) => { const status = attendanceData[m.id] || 'none'; return (<tr key={m.id} className={`transition-colors ${status !== 'none' ? 'bg-emerald-50/20' : 'hover:bg-slate-50'}`}><td className="p-4 pl-6 font-mono text-slate-500">{idx + 1}</td><td className="p-4 font-bold text-slate-800">{m.firstName} {m.lastName} <span className="text-xs text-slate-400 font-normal">({m.nickname})</span></td><td className="p-4 text-center border-l border-slate-100"><input type="radio" checked={status === 'present'} onChange={() => handleStatusChange(m.id, 'present')} className="w-5 h-5 accent-emerald-600 cursor-pointer" /></td><td className="p-4 text-center"><input type="radio" checked={status === 'leave'} onChange={() => handleStatusChange(m.id, 'leave')} className="w-5 h-5 accent-orange-500 cursor-pointer" /></td><td className="p-4 text-center"><input type="radio" checked={status === 'late'} onChange={() => handleStatusChange(m.id, 'late')} className="w-5 h-5 accent-yellow-500 cursor-pointer" /></td><td className="p-4 text-center pr-6"><input type="radio" checked={status === 'absent'} onChange={() => handleStatusChange(m.id, 'absent')} className="w-5 h-5 accent-red-600 cursor-pointer" /></td></tr>) })}</tbody></table></div></>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};

const PlaceholderView = ({ title, desc, icon: Icon, color }: any) => (
  <PageTemplate title={title}>
    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 border-dashed p-10 text-center"><div className={`p-6 rounded-full ${color} mb-6`}><Icon size={64} className="text-white" /></div><h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2><p className="text-slate-500 max-w-md">{desc}</p></div>
  </PageTemplate>
);

// ==========================================
// 4. โครงสร้างแอป (แยกหน้า Register ออกจาก Router เด็ดขาด 100%)
// ==========================================
export default function App() {
  const [isLiffInit, setIsLiffInit] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  useEffect(() => {
    // ให้ระบบเช็คก่อนเลยว่ามีเจตนาจะเข้าหน้า register ไหม?
    const currentUrl = window.location.href;
    if (currentUrl.includes('register')) {
      setIsRegisterMode(true);
    }
    setIsLiffInit(true);
  }, []);

  if (!isLiffInit) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">กำลังเตรียมระบบ...</div>;

  // 🚀 ถ้าเป็นโหมด Register โยนไปคอมโพเนนต์ LINE ทันที โดยไม่สน Router ใดๆ ทั้งสิ้น
  if (isRegisterMode) {
    return <LineRegisterView />;
  }

  // 🚀 ถ้าไม่ใช่ (เข้าจากแอดมิน) ถึงจะอนุญาตให้ใช้ Router ของเว็บปกติ
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/members" element={<MembersView />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/attendance" element={<AttendanceView />} />
        <Route path="/settings" element={<PlaceholderView title="⚙️ ตั้งค่าระบบ" desc="จัดการสิทธิ์ผู้ใช้งาน แอดมิน และตั้งค่าอื่นๆ" icon={Settings} color="bg-slate-700" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}