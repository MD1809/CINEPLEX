import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  IdCard,
  QrCode,
} from 'lucide-react';
import { adminUserApi, StaffCreateRequest } from '../../api/adminUserApi';
import { toast } from 'sonner';

interface StaffCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffCreateModal: React.FC<StaffCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = 'Cine@';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên nhân viên!');
      return;
    }

    if (!email.trim()) {
      toast.error('Vui lòng nhập địa chỉ email!');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Mật khẩu khởi tạo phải có tối thiểu 6 ký tự!');
      return;
    }

    const payload: StaffCreateRequest = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim() || undefined,
      password,
      role,
    };

    try {
      setSubmitting(true);
      await adminUserApi.createStaff(payload);
      toast.success(`Cấp tài khoản nhân viên ${fullName} (${email}) thành công!`);
      onSuccess();
      onClose();
      // Reset form
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setRole('STAFF');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cấp tài khoản!');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return 'NV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e131f] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#141a29]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Cấp Tài Khoản Nhân Viên / Quản Trị
              </h2>
              <p className="text-xs text-slate-400">
                Tạo tài khoản làm việc tại quầy vé POS hoặc phân quyền quản trị hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Inputs Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Họ và Tên Nhân Viên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A, Trần Thị B..."
                    className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Đăng Nhập <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: staff.hanoi@cineplex.vn"
                    className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Số Điện Thoại Liên Hệ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Initial Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Mật Khẩu Khởi Tạo <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Vai Trò & Quyền Hạn <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('STAFF')}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      role === 'STAFF'
                        ? 'bg-blue-500/15 text-white border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-[#141a29] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-blue-400">NHÂN VIÊN RẠP</span>
                    </div>
                    <span className="text-[11px] text-slate-400 leading-snug">
                      Được truy cập Quầy Bán Vé POS và Camera quét QR soát vé
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      role === 'ADMIN'
                        ? 'bg-amber-500/15 text-white border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-[#141a29] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">QUẢN TRỊ VIÊN</span>
                    </div>
                    <span className="text-[11px] text-slate-400 leading-snug">
                      Toàn quyền cấu hình phim, phòng chiếu, voucher và doanh thu
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Employee Badge Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-amber-400" />
                  Xem Trước Thẻ Nhân Viên (Employee Badge)
                </label>

                {/* Badge Card */}
                <div className="relative bg-gradient-to-b from-[#182030] via-[#101524] to-[#0a0d16] rounded-3xl border-2 border-slate-700/80 p-6 shadow-2xl overflow-hidden flex flex-col items-center text-center group">
                  {/* Badge Lanyard Hole */}
                  <div className="w-10 h-2 rounded-full bg-black/60 border border-slate-700 mb-4" />

                  {/* Cinema Brand Logo */}
                  <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-mono mb-3">
                    CINEPLEX CINEMAS
                  </div>

                  {/* Avatar Circle with Initials */}
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
                      <div className="w-full h-full rounded-full bg-[#0e131f] flex items-center justify-center text-2xl font-black text-amber-400 font-mono">
                        {getInitials(fullName)}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0e131f]" />
                  </div>

                  {/* Employee Name */}
                  <h3 className="text-base font-bold text-white tracking-wide truncate max-w-[200px]">
                    {fullName || 'Họ Và Tên'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-[220px] mt-0.5">
                    {email || 'email@cineplex.vn'}
                  </p>

                  {/* Role Pill */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                        role === 'ADMIN'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'NHÂN VIÊN RẠP CHIẾU'}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="w-full my-4 border-b border-dashed border-slate-800" />

                  {/* QR Graphic and Phone */}
                  <div className="flex items-center justify-between w-full px-2 text-left">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">
                        ĐIỆN THOẠI
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {phoneNumber || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/5 border border-slate-800">
                      <QrCode className="w-7 h-7 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Hint */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                💡 Sau khi cấp tài khoản, nhân viên có thể sử dụng Email và Mật khẩu khởi tạo để
                đăng nhập vào hệ thống quầy bán vé hoặc trang quản trị.
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#141a29] text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Đang tạo tài khoản...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Xác Nhận Cấp Tài Khoản</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
