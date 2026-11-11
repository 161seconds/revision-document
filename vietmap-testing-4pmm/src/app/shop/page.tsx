"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Trash2 } from "lucide-react";

type Order = {
  id: string;
  clientName: string;
  item: string;
  quantity: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: number;
  // Thông tin bổ sung
  clientAddress?: string;
  clientCapacity?: number;
  shopName?: string;
  shippingCompany?: string;
  serviceType?: "drying" | "dryingAndStorage"; // Loại dịch vụ
  servicePrice?: number; // Giá dịch vụ
};

const STORAGE_KEY = "orders";

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export default function ShopPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  const visible = useMemo(() => {
    const sorted = [...orders].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "all") return sorted;
    return sorted.filter((o) => o.status === filter);
  }, [orders, filter]);

  function updateStatus(id: string, status: Order["status"]) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function removeOrder(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function getStatusConfig(status: Order["status"]) {
    const configs = {
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Chờ xử lý",
      },
      confirmed: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        label: "Đã xác nhận",
      },
      completed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Hoàn thành",
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        label: "Đã hủy",
      },
    } as const;
    return configs[status];
  }

  return (
    <AdminLayout title="Quản lý đơn hàng">
      <div className="bg-white px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">
            Lọc trạng thái
          </label>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | Order["status"])
            }
            className="text-black px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
            <h2 className="text-xl font-bold text-slate-900">
              Danh sách đơn hàng của tất cả khách
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {visible.length} đơn phù hợp
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              Không có đơn nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {visible.map((o) => {
                const cfg = getStatusConfig(o.status);
                return (
                  <div
                    key={o.id}
                    className="p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-4">
                        <div className="space-y-2">
                          {/* Tên khách hàng */}
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                              Tên khách hàng
                            </p>
                            <p className="font-semibold text-slate-900 text-base">
                              {o.clientName}
                            </p>
                          </div>

                          {/* Địa chỉ khách hàng */}
                          {o.clientAddress && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">
                                Địa chỉ khách hàng
                              </p>
                              <p className="text-sm text-slate-700 flex items-center gap-1">
                                <span>📍</span> {o.clientAddress}
                              </p>
                            </div>
                          )}

                          {/* Sản lượng khách hàng */}
                          {o.clientCapacity && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">
                                Sản lượng khách hàng
                              </p>
                              <p className="text-sm text-slate-700 font-medium">
                                {o.clientCapacity} Tấn
                              </p>
                            </div>
                          )}

                          {/* Tên lò sấy */}
                          {o.shopName && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">
                                Tên lò sấy
                              </p>
                              <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                                <span>🏭</span> {o.shopName}
                              </p>
                            </div>
                          )}

                          {/* Đơn vị vận chuyển */}
                          {o.shippingCompany && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">
                                Đơn vị vận chuyển
                              </p>
                              <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                <span>🚚</span> {o.shippingCompany}
                              </p>
                            </div>
                          )}

                          {/* Loại dịch vụ */}
                          {o.serviceType && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">
                                Loại dịch vụ
                              </p>
                              <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
                                <span>⚙️</span>{" "}
                                {o.serviceType === "drying"
                                  ? "Sấy lúa"
                                  : "Sấy và bảo quản lúa"}
                              </p>
                            </div>
                          )}

                          {/* Giá dịch vụ */}
                          {o.servicePrice && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">
                                Giá dịch vụ
                              </p>
                              <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
                                <span>💰</span>{" "}
                                {(o.servicePrice || 0).toLocaleString("vi-VN")}{" "}
                                VND/Tấn
                              </p>
                            </div>
                          )}

                          {/* Tổng giá tiền */}
                          {o.servicePrice && o.clientCapacity && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">
                                Tổng giá tiền
                              </p>
                              <p className="text-sm text-red-600 font-bold flex items-center gap-1">
                                <span>💵</span>{" "}
                                {(
                                  (o.servicePrice || 0) *
                                  (o.clientCapacity || 0)
                                ).toLocaleString("vi-VN")}{" "}
                                VND
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-600">Số lượng</p>
                        <p className="font-semibold text-slate-900">
                          x{o.quantity}
                        </p>
                      </div>
                      <div className="md:col-span-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            updateStatus(
                              o.id,
                              e.target.value as Order["status"]
                            )
                          }
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                      <div className="md:col-span-3 flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500">
                          {new Date(o.createdAt).toLocaleString("vi-VN")}
                        </p>
                        <button
                          onClick={() => removeOrder(o.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa đơn"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
