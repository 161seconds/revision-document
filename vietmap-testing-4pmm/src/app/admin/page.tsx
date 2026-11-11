"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  db,
  type Account,
  type ShopRecord,
  type ShippingCompany,
} from "@/data/fakeDb";
import { geocodeAddress } from "@/lib/geocode";
import dynamic from "next/dynamic";
const ShopsMap = dynamic(() => import("./ShopsMap"), { ssr: false });
import { Trash2, Plus } from "lucide-react";
import Image from "next/image";

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

const ORDERS_KEY = "orders";

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export default function AdminPage() {
  const [tab, setTab] = useState<
    "shops" | "farmers" | "orders" | "map" | "shipping"
  >("shops");

  // Shops
  const [shops, setShops] = useState<ShopRecord[]>([]);
  const [newShop, setNewShop] = useState({
    name: "",
    address: "",
    district: "",
    capacity: 0,
    dryingPrice: 0,
    dryingAndStoragePrice: 0,
  });

  // Shipping Companies
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>(
    []
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [newShippingCompany, setNewShippingCompany] = useState({
    name: "",
    address: "",
    imageUrl: "",
    pricePerKm: 0,
  });

  // Farmers (accounts with role farmer)
  const [accounts, setAccounts] = useState<Account[]>([]);
  const farmers = useMemo(
    () => accounts.filter((a) => a.role === "farmer"),
    [accounts]
  );
  const [newFarmer, setNewFarmer] = useState({ name: "", email: "" });

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== "undefined") {
      setShops(db.listShops());
      setAccounts(db.listAccounts());
      setOrders(loadOrders());
      setShippingCompanies(db.listShippingCompanies());
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  // Shipping Company functions
  function removeShippingCompany(id: string) {
    db.deleteShippingCompany(id);
    setShippingCompanies(db.listShippingCompanies());
  }

  return (
    <AdminLayout title="Trang quản trị">
      <div className="bg-white px-6 py-4 border-b border-slate-200">
        <div className="flex gap-2">
          {(
            [
              { k: "orders", label: "Quản lý đơn hàng" },
              { k: "shops", label: "Quản lý lò sấy" },
              { k: "map", label: "Bản đồ lò sấy" },
              { k: "farmers", label: "Quản lý khách hàng" },
              { k: "shipping", label: "Quản lý vận chuyển" },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                tab === t.k
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "shops" && (
        <div className="p-8 bg-slate-50 min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newShop.name.trim() || !newShop.address.trim()) return;
                const cap = Number(newShop.capacity) || 0;
                // geocode address → coordinates
                let lat = 0;
                let lon = 0;
                try {
                  const pt = await geocodeAddress(newShop.address.trim());
                  if (pt) {
                    lat = pt.lat;
                    lon = pt.lon;
                  }
                } catch (err) {
                  // fallback to 0,0 if geocode fails
                  console.warn("Geocode failed:", err);
                }
                const created = db.createShop({
                  name: newShop.name.trim(),
                  address: newShop.address.trim(),
                  district: newShop.district.trim(),
                  coordinates: [lat, lon],
                  rating: 0,
                  limitCapacity: cap > 0 ? cap : 0,
                  dryingPrice: Number(newShop.dryingPrice) || 0,
                  dryingAndStoragePrice:
                    Number(newShop.dryingAndStoragePrice) || 0,
                });
                setShops([created, ...shops]);
                setNewShop({
                  name: "",
                  address: "",
                  district: "",
                  capacity: 0,
                  dryingPrice: 0,
                  dryingAndStoragePrice: 0,
                });
              }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-fit"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Thêm lò sấy
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên lò
                  </label>
                  <input
                    value={newShop.name}
                    onChange={(e) =>
                      setNewShop({ ...newShop, name: e.target.value })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    value={newShop.address}
                    onChange={(e) =>
                      setNewShop({ ...newShop, address: e.target.value })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Huyện/Tỉnh
                  </label>
                  <input
                    value={newShop.district}
                    onChange={(e) =>
                      setNewShop({ ...newShop, district: e.target.value })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Công suất (Tấn/ngày)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newShop.capacity}
                    onChange={(e) =>
                      setNewShop({
                        ...newShop,
                        capacity: Number(e.target.value || 0),
                      })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Giá sấy lúa (VND/Tấn)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newShop.dryingPrice}
                    onChange={(e) =>
                      setNewShop({
                        ...newShop,
                        dryingPrice: Number(e.target.value || 0),
                      })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Giá sấy và bảo quản lúa (VND/Tấn)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newShop.dryingAndStoragePrice}
                    onChange={(e) =>
                      setNewShop({
                        ...newShop,
                        dryingAndStoragePrice: Number(e.target.value || 0),
                      })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={18} /> Thêm lò
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Danh sách lò sấy
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {shops.length} lò
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      db.updateShopsWithPricing();
                      setShops(db.listShops());
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Cập nhật giá
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-200">
                {shops.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    <div className="md:col-span-6">
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{s.address}</p>
                    </div>
                    <div className="md:col-span-4 text-sm text-slate-600">
                      <div> Công suất: {s.limitCapacity} Tấn</div>
                      <div>
                        Giá sấy: {(s.dryingPrice || 0).toLocaleString("vi-VN")}{" "}
                        VND/Tấn
                      </div>
                      <div>
                        Giá sấy + bảo quản:{" "}
                        {(s.dryingAndStoragePrice || 0).toLocaleString("vi-VN")}{" "}
                        VND/Tấn
                      </div>
                    </div>
                    <div className="md:col-span-2 text-right">
                      <button
                        onClick={() => {
                          db.deleteShop(s.id);
                          setShops((prev) => prev.filter((x) => x.id !== s.id));
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa lò"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "farmers" && (
        <div className="p-8 bg-slate-50 min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFarmer.name.trim() || !newFarmer.email.trim()) return;
                const created = db.createAccount({
                  name: newFarmer.name.trim(),
                  email: newFarmer.email.trim(),
                  role: "farmer",
                  password: "123456",
                });
                setAccounts([created, ...accounts]);
                setNewFarmer({ name: "", email: "" });
              }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-fit"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Thêm khách hàng
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên
                  </label>
                  <input
                    value={newFarmer.name}
                    onChange={(e) =>
                      setNewFarmer({ ...newFarmer, name: e.target.value })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    value={newFarmer.email}
                    onChange={(e) =>
                      setNewFarmer({ ...newFarmer, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={18} /> Thêm khách hàng
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
                <h2 className="text-xl font-bold text-slate-900">
                  Danh sách khách hàng
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {farmers.length} khách hàng
                </p>
              </div>
              <div className="divide-y divide-slate-200">
                {farmers.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    <div className="md:col-span-8">
                      <p className="font-semibold text-slate-900">{f.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{f.email}</p>
                    </div>
                    <div className="md:col-span-4 text-right">
                      <button
                        onClick={() => {
                          db.deleteAccount(f.id);
                          setAccounts((prev) =>
                            prev.filter((x) => x.id !== f.id)
                          );
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa khách hàng"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="p-8 bg-slate-50 min-h-screen">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <h2 className="text-xl font-bold text-slate-900">
                Tất cả đơn hàng
              </h2>
              <p className="text-sm text-slate-600 mt-1">{orders.length} đơn</p>
            </div>
            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                Không có đơn nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {orders
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((o) => (
                    <div
                      key={o.id}
                      className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                    >
                      <div className="md:col-span-5">
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
                                {(o.clientCapacity / 1000).toFixed(2)} Tấn
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
                      <div className="md:col-span-2">x{o.quantity}</div>
                      <div className="md:col-span-3">
                        <span className="px-3 py-1.5 rounded-lg text-sm border bg-slate-50 text-slate-700">
                          {o.status}
                        </span>
                      </div>
                      <div className="md:col-span-2 text-right text-xs text-slate-500">
                        {new Date(o.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      {tab === "map" && (
        <div className="p-8 bg-slate-50 min-h-screen">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <h2 className="text-xl font-bold text-slate-900">
                Bản đồ — Tất cả lò sấy
              </h2>
            </div>
            <div className="p-4">
              <ShopsMap />
            </div>
          </div>
        </div>
      )}

      {tab === "shipping" && (
        <div className="p-8 bg-slate-50 min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !newShippingCompany.name.trim() ||
                  !newShippingCompany.address.trim()
                )
                  return;
                const created = db.createShippingCompany({
                  name: newShippingCompany.name.trim(),
                  address: newShippingCompany.address.trim(),
                  imageUrl:
                    newShippingCompany.imageUrl.trim() ||
                    "https://via.placeholder.com/100x100?text=Logo",
                  pricePerKm: Number(newShippingCompany.pricePerKm) || 0,
                });
                setShippingCompanies([created, ...shippingCompanies]);
                setNewShippingCompany({
                  name: "",
                  address: "",
                  imageUrl: "",
                  pricePerKm: 0,
                });
              }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-fit"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Thêm đơn vị vận chuyển
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên đơn vị
                  </label>
                  <input
                    value={newShippingCompany.name}
                    onChange={(e) =>
                      setNewShippingCompany({
                        ...newShippingCompany,
                        name: e.target.value,
                      })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    value={newShippingCompany.address}
                    onChange={(e) =>
                      setNewShippingCompany({
                        ...newShippingCompany,
                        address: e.target.value,
                      })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    URL ảnh
                  </label>
                  <input
                    value={newShippingCompany.imageUrl}
                    onChange={(e) =>
                      setNewShippingCompany({
                        ...newShippingCompany,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/logo.png"
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Giá theo km (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newShippingCompany.pricePerKm}
                    onChange={(e) =>
                      setNewShippingCompany({
                        ...newShippingCompany,
                        pricePerKm: Number(e.target.value || 0),
                      })
                    }
                    className="text-black w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={18} /> Thêm đơn vị
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Danh sách đơn vị vận chuyển
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {shippingCompanies?.length || 0} đơn vị
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(!shippingCompanies ||
                      shippingCompanies?.length === 0) && (
                      <button
                        onClick={() => {
                          db.seedShippingCompanies();
                          setShippingCompanies(db.listShippingCompanies());
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Tạo dữ liệu mẫu
                      </button>
                    )}
                    <button
                      onClick={() => {
                        db.resetShippingCompanies();
                        setShippingCompanies(db.listShippingCompanies());
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Reset dữ liệu
                    </button>
                  </div>
                </div>
              </div>

              {!isLoaded ? (
                <div className="p-12 text-center text-slate-600">
                  Đang tải...
                </div>
              ) : !shippingCompanies || shippingCompanies.length === 0 ? (
                <div className="p-12 text-center text-slate-600">
                  Chưa có đơn vị vận chuyển nào.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {shippingCompanies?.map((company) => (
                    <div
                      key={company.id}
                      className="p-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={company.imageUrl}
                          alt={company.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-base">
                            {company.name}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {company.address}
                          </p>
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            {company.pricePerKm.toLocaleString("vi-VN")} VND/Tấn
                          </p>
                        </div>
                        <button
                          onClick={() => removeShippingCompany(company.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa đơn vị vận chuyển"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
