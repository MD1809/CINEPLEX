import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  ShieldAlert,
  User,
  Phone,
  Mail,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Send,
  Crown,
  MonitorCheck,
} from 'lucide-react';
import { adminUserApi, UserAdminItem } from '../../api/adminUserApi';
import { StaffCreateModal } from '../../components/admin/StaffCreateModal';
import { UserEditModal } from '../../components/admin/UserEditModal';
import { UserDetailModal } from '../../components/admin/UserDetailModal';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuthStore();
  const [users, setUsers] = useState<UserAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'LOCKED'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAdminItem | null>(null);
  const [detailUser, setDetailUser] = useState<UserAdminItem | null>(null);
  const [sendingResetEmailId, setSendingResetEmailId] = useState<number | null>(null);

  const isCurrentAdminRoot =
    currentAdmin?.id === 1 || currentAdmin?.email === 'admin@cineplex.vn';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminUserApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách tài khoản!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (user: UserAdminItem) => {
    const isRoot = user.isRoot || user.id === 1 || user.email === 'admin@cineplex.vn';
    if (isRoot) {
      toast.error('Không thể khóa tài khoản Root của hệ thống!');
      return;
    }

    if (currentAdmin?.id === user.id) {
      toast.error('Bạn không thể tự khóa tài khoản quản trị của chính mình!');
      return;
    }

    const newStatus = !user.isActive;

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
    );

    try {
      await adminUserApi.toggleUserStatus(user.id, newStatus);
      toast.success(
        newStatus
          ? `Đã mở khóa tài khoản ${user.email}`
          : `Đã tạm khóa tài khoản ${user.email}`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản!');
      loadData();
    }
  };

  const handleSendResetPasswordEmail = async (user: UserAdminItem) => {
    try {
      setSendingResetEmailId(user.id);
      await adminUserApi.sendPasswordResetEmail(user.id);
      toast.success(`Đã gửi email hướng dẫn đặt lại mật khẩu đến ${user.email}!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gửi email đặt lại mật khẩu thất bại!');
    } finally {
      setSendingResetEmailId(null);
    }
  };

  // Fixed statistics across all users regardless of active filter
  const totalCount = users.length;
  const customerCount = users.filter((u) => u.role === 'CUSTOMER').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;
  const lockedCount = users.filter((u) => !u.isActive).length;

  // Real-time filtering by role and search keyword
  const filteredUsers = users.filter((u) => {
    if (selectedRole === 'CUSTOMER' && u.role !== 'CUSTOMER') return false;
    if (selectedRole === 'STAFF' && u.role !== 'STAFF') return false;
    if (selectedRole === 'ADMIN' && u.role !== 'ADMIN') return false;
    if (selectedRole === 'LOCKED' && u.isActive) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = u.fullName?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber?.includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    return true;
  });

  const getRoleBadge = (user: UserAdminItem) => {
    const isRoot = user.isRoot || user.id === 1 || user.email === 'admin@cineplex.vn';

    if (isRoot) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-amber-500/10">
          <Crown className="w-3 h-3 text-amber-400" />
          ADMIN
        </span>
      );
    }

    switch (user.role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3" />
            CAO CẤP
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            NHÂN VIÊN RẠP
          </span>
        );
      case 'CUSTOMER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase tracking-wider">
            <User className="w-3 h-3" />
            KHÁCH HÀNG
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    if (!name?.trim()) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarGradient = (user: UserAdminItem) => {
    const isRoot = user.isRoot || user.id === 1 || user.email === 'admin@cineplex.vn';
    if (isRoot) return 'from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black';

    switch (user.role) {
      case 'ADMIN':
        return 'from-amber-500 to-amber-700 text-amber-300';
      case 'STAFF':
        return 'from-blue-500 to-indigo-700 text-blue-300';
      case 'CUSTOMER':
      default:
        return 'from-slate-600 to-slate-800 text-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e131f] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Quản Lý Tài Khoản & Người Dùng
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Danh sách tài khoản khách hàng, phân quyền nhân viên quầy POS và quản trị hệ thống
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cấp Tài Khoản Nhân Viên</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Tổng Tài Khoản
            </p>
            <p className="text-lg font-black text-white font-mono">{totalCount} thành viên</p>
          </div>
        </div>

        {/* Customer Accounts */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Khách Hàng
            </p>
            <p className="text-lg font-black text-emerald-400 font-mono">{customerCount} người</p>
          </div>
        </div>

        {/* Staff Accounts */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Nhân Viên Rạp
            </p>
            <p className="text-lg font-black text-blue-400 font-mono">{staffCount} nhân sự</p>
          </div>
        </div>

        {/* Locked Accounts */}
        <div className="p-4 rounded-3xl bg-[#0e121a] border border-slate-800/80 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Đang Bị Khóa
            </p>
            <p className="text-lg font-black text-red-400 font-mono">{lockedCount} tài khoản</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0e131f] p-4 rounded-2xl border border-slate-800">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tất Cả ({totalCount})
          </button>
          <button
            onClick={() => setSelectedRole('CUSTOMER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRole === 'CUSTOMER'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Khách Hàng ({customerCount})
          </button>
          <button
            onClick={() => setSelectedRole('STAFF')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRole === 'STAFF'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Nhân Viên ({staffCount})
          </button>
          <button
            onClick={() => setSelectedRole('ADMIN')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRole === 'ADMIN'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Cao Cấp
          </button>
          <button
            onClick={() => setSelectedRole('LOCKED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRole === 'LOCKED'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-[#141824] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Bị Khóa ({lockedCount})
          </button>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-full bg-[#141824] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#141824] p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Xem dạng thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-400">Đang tải danh sách tài khoản...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-20 text-center bg-[#0e131f] rounded-3xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">Không tìm thấy người dùng nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không có tài khoản nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-[#0e131f] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#131722] text-slate-400 border-b border-slate-800/80 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Thành Viên</th>
                  <th className="py-3.5 px-4">Liên Hệ</th>
                  <th className="py-3.5 px-4 text-center">Vai Trò</th>
                  <th className="py-3.5 px-4 text-center">Lịch Sử Hoạt Động</th>
                  <th className="py-3.5 px-4 text-center">Ngày Tham Gia</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map((u) => {
                  const isRoot = u.isRoot || u.id === 1 || u.email === 'admin@cineplex.vn';
                  const canEditThisUser = !isRoot || isCurrentAdminRoot;

                  return (
                    <tr key={u.id} className="hover:bg-[#141824] transition-colors group">
                      {/* User Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                              u
                            )} flex items-center justify-center font-bold text-xs font-mono shadow-md shrink-0`}
                          >
                            {getInitials(u.fullName)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {currentAdmin?.id === u.id && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">
                                  (Bạn)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {u.phoneNumber ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{u.phoneNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">---</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 text-center">{getRoleBadge(u)}</td>

                      {/* Activity Metric: Customer Bookings vs Staff POS Orders */}
                      <td className="py-3.5 px-4 text-center">
                        {u.role === 'CUSTOMER' ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-white">
                              {u.totalBookingsCount || 0} vé
                            </span>
                            <div className="text-[10px] text-amber-400 font-mono">
                              {Number(u.totalSpentAmount || 0).toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        ) : u.role === 'STAFF' ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-blue-400 flex items-center justify-center gap-1">
                              <MonitorCheck className="w-3 h-3" />
                              {u.totalStaffOrdersCount || 0} đơn POS
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Bán vé & Check-in
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-400/80 font-mono text-[11px] font-bold">
                            Quản Trị
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('vi-VN')
                          : '---'}
                      </td>

                      {/* Status Toggle (Root cannot be locked) */}
                      <td className="py-3.5 px-4 text-center">
                        {isRoot ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Cố Định</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={currentAdmin?.id === u.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                              u.isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            } ${currentAdmin?.id === u.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title={
                              currentAdmin?.id === u.id
                                ? 'Không thể khóa tài khoản của chính mình'
                                : 'Bấm để khóa / mở khóa tài khoản'
                            }
                          >
                            {u.isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Hoạt Động</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Đã Khóa</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* 3 Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. View Detail & History */}
                          <button
                            onClick={() => setDetailUser(u)}
                            className="p-1.5 rounded-lg bg-[#141a29] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                            title={u.role === 'STAFF' ? 'Xem Ca Làm Việc & Đơn POS' : 'Xem Chi Tiết & Lịch Sử Mua Vé'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Edit (Role or Root Info) */}
                          {canEditThisUser ? (
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 rounded-lg bg-[#141a29] hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-800 transition-colors cursor-pointer"
                              title={isRoot ? 'Cập Nhật Thông Tin Root' : 'Thay Đổi Vai Trò'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 rounded-lg bg-slate-900/40 text-slate-600 border border-slate-800/40 cursor-not-allowed"
                              title="Chỉ tài khoản Root mới có quyền sửa tài khoản Root"
                            >
                              <Edit2 className="w-3.5 h-3.5 opacity-40" />
                            </span>
                          )}

                          {/* 3. Send Reset Password Email */}
                          <button
                            onClick={() => handleSendResetPasswordEmail(u)}
                            disabled={sendingResetEmailId === u.id}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer disabled:opacity-50"
                            title="Gửi Email Đặt Lại Mật Khẩu"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((u) => {
            const isRoot = u.isRoot || u.id === 1 || u.email === 'admin@cineplex.vn';
            const canEditThisUser = !isRoot || isCurrentAdminRoot;

            return (
              <div
                key={u.id}
                className={`bg-[#0e131f] rounded-3xl border p-5 transition-all shadow-xl flex flex-col justify-between space-y-4 group hover:border-slate-700 ${
                  isRoot
                    ? 'border-amber-500/40 shadow-amber-500/5'
                    : u.isActive
                    ? 'border-slate-800'
                    : 'border-red-950/50 opacity-75'
                }`}
              >
                {/* Header: Avatar, Name & Role */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                        u
                      )} flex items-center justify-center font-bold text-sm font-mono shadow-md shrink-0`}
                    >
                      {getInitials(u.fullName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm flex items-center gap-1.5">
                        <span>{u.fullName}</span>
                        {isRoot && <Crown className="w-3.5 h-3.5 text-amber-400 inline shrink-0" />}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  {getRoleBadge(u)}
                </div>

                {/* User Meta Data */}
                <div className="bg-[#141824] p-3 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      Điện thoại:
                    </span>
                    <span className="font-mono text-slate-200">
                      {u.phoneNumber || 'Chưa cập nhật'}
                    </span>
                  </div>
                  {u.role === 'CUSTOMER' && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        Chi tiêu tích lũy:
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {Number(u.totalSpentAmount || 0).toLocaleString('vi-VN')}đ ({u.totalBookingsCount} vé)
                      </span>
                    </div>
                  )}
                  {u.role === 'STAFF' && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <MonitorCheck className="w-3.5 h-3.5" />
                        Đơn POS đã bán:
                      </span>
                      <span className="font-mono font-bold text-blue-400">
                        {u.totalStaffOrdersCount || 0} đơn
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Ngày tham gia:
                    </span>
                    <span className="font-mono text-slate-300">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '---'}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  {isRoot ? (
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Root Admin</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      disabled={currentAdmin?.id === u.id}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        u.isActive
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-red-400 hover:text-red-300'
                      } ${currentAdmin?.id === u.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {u.isActive ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Đang mở</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Đã khóa</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDetailUser(u)}
                      className="p-1.5 rounded-xl bg-[#141a29] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-all cursor-pointer"
                      title={u.role === 'STAFF' ? 'Xem Ca Làm Việc' : 'Xem Chi Tiết'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {canEditThisUser ? (
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 rounded-xl bg-[#141a29] hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-800 transition-all cursor-pointer"
                        title={isRoot ? 'Cập Nhật Root' : 'Đổi Vai Trò'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span
                        className="p-1.5 rounded-xl bg-slate-900/40 text-slate-600 border border-slate-800/40 cursor-not-allowed"
                        title="Chỉ tài khoản Root mới có quyền sửa tài khoản Root"
                      >
                        <Edit2 className="w-3.5 h-3.5 opacity-40" />
                      </span>
                    )}

                    <button
                      onClick={() => handleSendResetPasswordEmail(u)}
                      disabled={sendingResetEmailId === u.id}
                      className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                      title="Gửi Email Đặt Lại MK"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provision Staff Modal */}
      <StaffCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Edit & Role Modal */}
      <UserEditModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSuccess={loadData}
      />

      {/* Detail & History Modal */}
      <UserDetailModal
        isOpen={!!detailUser}
        onClose={() => setDetailUser(null)}
        user={detailUser}
      />
    </div>
  );
};
