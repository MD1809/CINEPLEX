import React, { useState, useEffect } from 'react';
import { adminRoomApi, RoomFormData } from '../../api/adminRoomApi';
import { Room, SeatType, RoomStatus } from '../../types/room';
import { RoomFormModal } from '../../components/admin/RoomFormModal';
import { SeatMatrixBuilder } from '../../components/admin/SeatMatrixBuilder';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Grid,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, seatTypesRes] = await Promise.all([
        adminRoomApi.getAllRooms(),
        adminRoomApi.getAllSeatTypes(),
      ]);
      setRooms(roomsRes);
      setSeatTypes(seatTypesRes);

      if (roomsRes.length > 0) {
        // Keep current selected room or select first
        setSelectedRoom((prev) => {
          if (!prev) return roomsRes[0];
          const found = roomsRes.find((r) => r.id === prev.id);
          return found || roomsRes[0];
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách phòng chiếu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleSubmitRoom = async (formData: RoomFormData) => {
    setSubmitting(true);
    try {
      if (editingRoom) {
        const updated = await adminRoomApi.updateRoom(editingRoom.id, formData);
        toast.success(`Cập nhật phòng "${formData.name}" thành công!`);
        setSelectedRoom(updated);
      } else {
        const created = await adminRoomApi.createRoom(formData);
        toast.success(`Khởi tạo phòng "${formData.name}" thành công!`);
        setSelectedRoom(created);
      }
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (room: Room, newStatus: RoomStatus) => {
    try {
      await adminRoomApi.updateRoomStatus(room.id, newStatus);
      toast.success(`Đã đổi trạng thái "${room.name}" sang ${getStatusLabel(newStatus)}`);
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: newStatus } : r))
      );
      if (selectedRoom?.id === room.id) {
        setSelectedRoom({ ...selectedRoom, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái phòng!');
    }
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return;
    try {
      await adminRoomApi.deleteRoom(deletingRoom.id);
      toast.success(`Đã xóa phòng "${deletingRoom.name}" thành công!`);
      setDeletingRoom(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể xóa phòng chiếu này (đã có suất chiếu hoặc vé)!');
    }
  };

  const getScreenTypeBadge = (type: string) => {
    switch (type) {
      case 'IMAX':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black">
            IMAX Laser
          </span>
        );
      case 'FOUR_DX':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-black">
            4DX Cinematic
          </span>
        );
      case 'THREE_D':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black">
            3D Digital
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
            Standard 2D
          </span>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt Động';
      case 'MAINTENANCE':
        return 'Bảo Trì';
      default:
        return 'Tạm Dừng';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0b0e14] rounded-3xl border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wide">
              <span>Quản Lý Phòng Chiếu & Sơ Đồ Ma Trận Ghế</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold font-mono">
              {rooms.length} phòng
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Cấu hình công nghệ màn chiếu, kích thước hàng x cột và phân loại vị trí ghế (VIP, Standard, Sweetbox)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#131722] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Thêm Phòng Mới
          </button>
        </div>
      </div>

      {/* Room Selector Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => {
          const isSelected = selectedRoom?.id === room.id;

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-[#161c28] to-[#0f131d] border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-[#0e121a] hover:bg-[#121622] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Active Indicator Top Glow */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
              )}

              {/* Room Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-black text-slate-500 uppercase">
                    ID #{room.id}
                  </span>
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getScreenTypeBadge(room.screenType)}
                    <select
                      value={room.status}
                      onChange={(e) =>
                        handleQuickStatusChange(room, e.target.value as RoomStatus)
                      }
                      className="px-2 py-0.5 rounded-md bg-[#141824] border border-slate-700 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="ACTIVE">🟢 Hoạt Động</option>
                      <option value="MAINTENANCE">🟡 Bảo Trì</option>
                      <option value="INACTIVE">🔴 Tạm Dừng</option>
                    </select>
                  </div>
                </div>

                <h3
                  className={`text-sm font-black transition-colors ${
                    isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-300'
                  }`}
                >
                  {room.name}
                </h3>
              </div>

              {/* Room Dimensions & Actions */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>
                    {room.totalRows} hàng × {room.totalColumns} cột ({room.totalSeats || room.totalRows * room.totalColumns} ghế)
                  </span>
                </div>

                {/* Edit & Delete Actions */}
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleOpenEditModal(room)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                    title="Sửa phòng"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeletingRoom(room)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                    title="Xóa phòng"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Seat Matrix Builder Canvas */}
      {selectedRoom ? (
        <SeatMatrixBuilder
          room={selectedRoom}
          seatTypes={seatTypes}
          onSeatsUpdated={loadData}
        />
      ) : (
        <div className="p-12 text-center bg-[#0e121a] rounded-3xl border border-slate-800 text-slate-400">
          Chọn một phòng chiếu ở trên để chỉnh sửa ma trận ghế.
        </div>
      )}

      {/* Room Form Modal (Create / Edit) */}
      <RoomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitRoom}
        initialData={editingRoom}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Xác Nhận Xóa Phòng</h3>
                <p className="text-xs text-slate-400 font-medium">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa phòng chiếu{' '}
              <strong className="text-amber-400">"{deletingRoom.name}"</strong> cùng toàn bộ sơ đồ ghế liên quan?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingRoom(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
              >
                Xóa Phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
