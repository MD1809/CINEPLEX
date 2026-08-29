import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Users,
  Crown,
} from 'lucide-react';
import { adminUserApi, UserAdminItem, UserUpdateRequest } from '../../api/adminUserApi';
import { toast } from 'sonner';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAdminItem | null;
  onSuccess: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'STAFF' | 'ADMIN'>('CUSTOMER');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setNewPassword('');
      setShowPassword(false);
      setRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isRoot = user.isRoot || user.id === 1 || user.email === 'admin@cineplex.vn';

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = 'Admin@';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRoot) {
      if (!fullName.trim()) {
        toast.error('Vui lòng nhập họ và tên!');
        return;
      }
      if (!email.trim()) {
        toast.error('Vui lòng nhập địa chỉ email!');
        return;
      }
      if (newPassword && newPassword.length < 6) {
        toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
        return;
      }
    }

    const payload: UserUpdateRequest = isRoot
      ? {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
          role: 'ADMIN',
        }
      : {
          role,
        };

    try {
      setSubmitting(true);
      await adminUserApi.updateUser(user.id, payload);
      toast.success(
        isRoot
          ? `Đã cập nhật thông tin tài khoản Admin (${email})!`
          : `Đã cập nhật vai trò tài khoản ${user.email} thành ${role === 'ADMIN' ? 'Cao cấp' : role}!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e131f] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#141a29]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border ${
                isRoot
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}
            >
              {isRoot ? <Crown className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                {isRoot ? 'Cập Nhật Tài Khoản & Mật Khẩu Admin' : 'Thay Đổi Vai Trò Phân Quyền'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* If Root Account: Allow editing Name, Email, Phone, and Password */}
          {isRoot ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">Tài Khoản Quản Trị Hệ Thống (Admin)</strong>
                  Bạn có thể cập nhật Họ tên, Email đăng nhập, Số điện thoại và Đổi mật khẩu tài khoản Admin.
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Họ và Tên Quản Trị Viên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
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

              {/* New Password (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Mật Khẩu Mới (Để trống nếu không đổi)
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="w-full bg-[#141a29] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
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
            </div>
          ) : (
            /* If Normal User / Staff: Only allow modifying Role */
            <div className="space-y-4">
              {/* Readonly User Summary */}
              <div className="p-3.5 rounded-2xl bg-[#141a29] border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Họ và tên:</span>
                  <strong className="text-white">{user.fullName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-300">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-mono text-slate-300">
                    {user.phoneNumber || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Chọn Vai Trò Mới <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* CUSTOMER */}
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      role === 'CUSTOMER'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500 shadow-md'
                        : 'bg-[#141a29] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Khách Hàng</span>
                  </button>

                  {/* STAFF */}
                  <button
                    type="button"
                    onClick={() => setRole('STAFF')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      role === 'STAFF'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500 shadow-md'
                        : 'bg-[#141a29] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Nhân Viên</span>
                  </button>

                  {/* ADMIN (Cao Cấp) */}
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      role === 'ADMIN'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500 shadow-md'
                        : 'bg-[#141a29] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Cao Cấp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[#141a29] text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
