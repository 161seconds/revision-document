"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AdminLayout from "../components/AdminLayout";
import { db, type ShippingCompany } from "@/data/fakeDb";
import {
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

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

const MapClient = dynamic(() => import("../map/MapClient"), { ssr: false });

function getStatusConfig(status: Order["status"]) {
  const configs = {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
      label: "Chờ xử lý",
    },
    confirmed: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: CheckCircle,
      label: "Đã xác nhận",
    },
    completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCheck,
      label: "Hoàn thành",
    },
    cancelled: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: AlertCircle,
      label: "Đã hủy",
    },
  };
  return configs[status];
}

export default function ClientPage() {
  const [tab, setTab] = useState<"orders" | "booking">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [clientName, setClientName] = useState("");
  const [hasShippingCompany, setHasShippingCompany] = useState(false);
  const [selectedShippingCompany, setSelectedShippingCompany] =
    useState<string>("");
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>(
    []
  );
  const [serviceType, setServiceType] = useState<"drying" | "dryingAndStorage">(
    "drying"
  );

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== "undefined") {
      setOrders(loadOrders());
      setShippingCompanies(db.listShippingCompanies());
    }
  }, []);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  const sortedOrders = useMemo(() => {
    const mine = clientName.trim()
      ? orders.filter(
          (o) => o.clientName.toLowerCase() === clientName.trim().toLowerCase()
        )
      : orders;
    return [...mine].sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, clientName]);

  // function addOrder(e: React.FormEvent) {
  //   e.preventDefault();
  //   if (!clientName.trim() || !item.trim() || quantity <= 0) return;
  //   const newOrder: Order = {
  //     id: crypto.randomUUID(),
  //     clientName: clientName.trim(),
  //     item: item.trim(),
  //     quantity,
  //     status: "pending",
  //     createdAt: Date.now(),
  //   };
  //   setOrders((prev) => [newOrder, ...prev]);
  //   setClientName("");
  //   setItem("");
  //   setQuantity(1);
  // }

  function updateStatus(id: string, status: Order["status"]) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function removeOrder(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <AdminLayout title="RiceLink">
      <div className="bg-white px-6 py-4 border-b border-slate-200">
        <div className="flex gap-2">
          <button
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              tab === "orders"
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setTab("orders")}
          >
            Đơn hàng
          </button>
          <button
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              tab === "booking"
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setTab("booking")}
          >
            Đặt lịch
          </button>
        </div>
      </div>

      {tab === "orders" && (
        <div className="p-8 bg-slate-50 min-h-screen">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <h2 className="text-xl font-bold text-slate-900">
                Danh sách đơn hàng
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {sortedOrders.length} đơn hàng
              </p>
            </div>

            {sortedOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-slate-400 mb-2">
                  <Clock size={40} className="mx-auto opacity-50" />
                </div>
                <p className="text-slate-600 font-medium">
                  Chưa có đơn hàng nào
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Tạo đơn hàng mới để bắt đầu
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {sortedOrders.map((o) => {
                  const statusConfig = getStatusConfig(o.status);
                  // const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={o.id}
                      className="p-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Order Details */}
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
                                  {(o.servicePrice || 0).toLocaleString(
                                    "vi-VN"
                                  )}{" "}
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

                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <p className="text-sm text-slate-600">Số lượng</p>
                          <p className="font-semibold text-slate-900">
                            x{o.quantity}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="md:col-span-3">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateStatus(
                                o.id,
                                e.target.value as Order["status"]
                              )
                            }
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </div>

                        {/* Date and delete */}
                        <div className="md:col-span-3 flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-500">
                            {new Date(o.createdAt).toLocaleString("vi-VN")}
                          </p>
                          <button
                            onClick={() => removeOrder(o.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Xóa đơn hàng"
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
      )}

      {tab === "booking" && (
        <div className="flex-1 bg-white border-t">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-fit"
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên khách hàng
                  </label>
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Loại dịch vụ
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) =>
                      setServiceType(
                        e.target.value as "drying" | "dryingAndStorage"
                      )
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="drying">Sấy lúa</option>
                    <option value="dryingAndStorage">
                      Sấy và bảo quản lúa
                    </option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <input
                      type="checkbox"
                      checked={hasShippingCompany}
                      onChange={(e) => {
                        setHasShippingCompany(e.target.checked);
                        if (e.target.checked) {
                          setSelectedShippingCompany("");
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                    Đã có đơn vị vận chuyển
                  </label>
                </div>
                {!hasShippingCompany && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Chọn đơn vị vận chuyển
                    </label>
                    <select
                      value={selectedShippingCompany}
                      onChange={(e) =>
                        setSelectedShippingCompany(e.target.value)
                      }
                      className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">-- Chọn đơn vị vận chuyển --</option>
                      {shippingCompanies?.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name} -{" "}
                          {company.pricePerKm.toLocaleString("vi-VN")} VND/Tấn
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Chọn lò trong danh sách gợi ý bên phải để hoàn tất đặt đơn.
              </p>
            </form>

            <div className="lg:col-span-2">
              <MapClient
                onSelectShop={(shopName, address, capacity, shopData) => {
                  if (!clientName.trim()) {
                    alert("Vui lòng nhập tên khách hàng trước.");
                    return;
                  }
                  if (!hasShippingCompany && !selectedShippingCompany) {
                    alert(
                      "Vui lòng chọn đơn vị vận chuyển hoặc đánh dấu đã có đơn vị vận chuyển."
                    );
                    return;
                  }
                  const shippingCompanyName = hasShippingCompany
                    ? "Đã có đơn vị vận chuyển"
                    : shippingCompanies?.find(
                        (s) => s.id === selectedShippingCompany
                      )?.name || "N/A";

                  const serviceTypeText =
                    serviceType === "drying"
                      ? "Sấy lúa"
                      : "Sấy và bảo quản lúa";
                  const servicePrice =
                    serviceType === "drying"
                      ? shopData?.dryingPrice || 0
                      : shopData?.dryingAndStoragePrice || 0;

                  const newOrder: Order = {
                    id: crypto.randomUUID(),
                    clientName: clientName.trim(),
                    item: `${serviceTypeText} ${capacity} Tấn · ${shopName}`,
                    quantity: 1,
                    status: "pending",
                    createdAt: Date.now(),
                    clientAddress: address,
                    clientCapacity: capacity,
                    shopName: shopName,
                    shippingCompany: shippingCompanyName,
                    serviceType: serviceType,
                    servicePrice: servicePrice,
                  };
                  setOrders((prev) => [newOrder, ...prev]);
                  setClientName("");
                  setHasShippingCompany(false);
                  setSelectedShippingCompany("");
                  setServiceType("drying");
                  setTab("orders");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
