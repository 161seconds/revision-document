import seedShops from "./shop";

export type Role = "farmer" | "shop" | "admin";

export interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  // simple auth fields for demo — DO NOT use in production
  password?: string;
  createdAt: number;
}

export interface ShopRecord {
  id: string;
  name: string;
  address: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  rating: number;
  limitCapacity: number;
  dryingPrice: number; // Giá sấy lúa (VND)
  dryingAndStoragePrice: number; // Giá sấy và bảo quản lúa (VND)
  createdAt: number;
}

export interface ShippingCompany {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  pricePerKm: number; // VND per km
  createdAt: number;
}

interface DbSchema {
  accounts: Account[];
  shops: ShopRecord[];
  shippingCompanies: ShippingCompany[];
}

const STORAGE_KEY = "demo_db_v1";

function readDb(): DbSchema {
  if (typeof window === "undefined")
    return { accounts: [], shops: [], shippingCompanies: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accounts: [], shops: [], shippingCompanies: [] };
    return JSON.parse(raw) as DbSchema;
  } catch {
    return { accounts: [], shops: [], shippingCompanies: [] };
  }
}

function writeDb(db: DbSchema) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function emitShopsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("demo:shops-updated"));
  }
}

function ensureSeeded() {
  const db = readDb();
  let needsUpdate = false;

  if (db.shops.length === 0) {
    const shops: ShopRecord[] = seedShops.map((s) => ({
      id: crypto.randomUUID(),
      name: s["Tên lò sấy"],
      address: s["Địa điểm"],
      district: s["TP/Huyện"],
      coordinates: [s["Tọa độ"][0], s["Tọa độ"][1]],
      rating: s.Rating,
      limitCapacity: s.LimitCapacity,
      dryingPrice: s["Giá sấy lúa"],
      dryingAndStoragePrice: s["Giá sấy và bảo quản lúa"],
      createdAt: Date.now(),
    }));
    const accounts: Account[] = [
      {
        id: crypto.randomUUID(),
        name: "Admin",
        email: "admin@example.com",
        role: "admin",
        password: "admin",
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Farmer Demo",
        email: "farmer@example.com",
        role: "farmer",
        password: "farmer",
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Shop Owner",
        email: "shop@example.com",
        role: "shop",
        password: "shop",
        createdAt: Date.now(),
      },
    ];
    db.accounts = accounts;
    db.shops = shops;
    needsUpdate = true;
  } else {
    // Update existing shops with pricing data if missing
    const updatedShops = db.shops.map((shop) => {
      if (
        shop.dryingPrice === undefined ||
        shop.dryingAndStoragePrice === undefined
      ) {
        // Find matching shop in seed data
        const seedShop = seedShops.find((s) => s["Tên lò sấy"] === shop.name);
        if (seedShop) {
          return {
            ...shop,
            dryingPrice: seedShop["Giá sấy lúa"],
            dryingAndStoragePrice: seedShop["Giá sấy và bảo quản lúa"],
          };
        }
      }
      return shop;
    });

    // Check if any shops were updated
    if (JSON.stringify(updatedShops) !== JSON.stringify(db.shops)) {
      db.shops = updatedShops;
      needsUpdate = true;
    }
  }

  // Always ensure shipping companies exist
  if (!db.shippingCompanies || db.shippingCompanies.length === 0) {
    const shippingCompanies: ShippingCompany[] = [
      {
        id: crypto.randomUUID(),
        name: "Công Ty Cổ Phần Vận Tải BMC Đồng Tháp",
        address: "Số 145, Trương Hán Siêu, Phường Mỹ Trà, Đồng Tháp.",
        imageUrl: "/dongthap.png",
        pricePerKm: 120000,
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Hợp Tác Xã Vận Tải Thủy Bộ Thành Phố Cao Lãnh",
        address: "03 Điện Biên Phủ, Mỹ Trà, Cao Lãnh, Đồng Tháp",
        imageUrl: "/hoptacxa.png",
        pricePerKm: 150000,
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Vận tải Hoàng Minh",
        address: "Khu 1, Xã Tân Phước 1, Tỉnh Đồng Tháp",
        imageUrl: "/hoangminh.png",
        pricePerKm: 180000,
        createdAt: Date.now(),
      },
    ];
    db.shippingCompanies = shippingCompanies;
    needsUpdate = true;
  }

  if (needsUpdate) {
    writeDb(db);
  }
}

// Initialize seed on module load in the browser
if (typeof window !== "undefined") {
  ensureSeeded();
}

// CRUD helpers
export const db = {
  // Accounts
  listAccounts(): Account[] {
    return readDb().accounts;
  },
  getAccount(id: string): Account | undefined {
    return readDb().accounts.find((a) => a.id === id);
  },
  createAccount(input: Omit<Account, "id" | "createdAt">): Account {
    const dbState = readDb();
    const acc: Account = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    dbState.accounts.unshift(acc);
    writeDb(dbState);
    return acc;
  },
  updateAccount(
    id: string,
    changes: Partial<Omit<Account, "id" | "createdAt">>
  ): Account | undefined {
    const dbState = readDb();
    const idx = dbState.accounts.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    dbState.accounts[idx] = { ...dbState.accounts[idx], ...changes };
    writeDb(dbState);
    return dbState.accounts[idx];
  },
  deleteAccount(id: string): boolean {
    const dbState = readDb();
    const lenBefore = dbState.accounts.length;
    dbState.accounts = dbState.accounts.filter((a) => a.id !== id);
    writeDb(dbState);
    return dbState.accounts.length < lenBefore;
  },
  listShops(): ShopRecord[] {
    return readDb().shops;
  },
  getShop(id: string): ShopRecord | undefined {
    return readDb().shops.find((s) => s.id === id);
  },
  createShop(input: Omit<ShopRecord, "id" | "createdAt">): ShopRecord {
    const dbState = readDb();
    const shop: ShopRecord = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    dbState.shops.unshift(shop);
    writeDb(dbState);
    emitShopsUpdated();
    return shop;
  },
  updateShop(
    id: string,
    changes: Partial<Omit<ShopRecord, "id" | "createdAt">>
  ): ShopRecord | undefined {
    const dbState = readDb();
    const idx = dbState.shops.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    dbState.shops[idx] = { ...dbState.shops[idx], ...changes };
    writeDb(dbState);
    emitShopsUpdated();
    return dbState.shops[idx];
  },
  deleteShop(id: string): boolean {
    const dbState = readDb();
    const lenBefore = dbState.shops.length;
    dbState.shops = dbState.shops.filter((s) => s.id !== id);
    writeDb(dbState);
    emitShopsUpdated();
    return dbState.shops.length < lenBefore;
  },

  // Shipping Companies
  listShippingCompanies(): ShippingCompany[] {
    return readDb().shippingCompanies;
  },
  getShippingCompany(id: string): ShippingCompany | undefined {
    return readDb().shippingCompanies.find((s) => s.id === id);
  },
  createShippingCompany(
    input: Omit<ShippingCompany, "id" | "createdAt">
  ): ShippingCompany {
    const dbState = readDb();
    const company: ShippingCompany = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    dbState.shippingCompanies.unshift(company);
    writeDb(dbState);
    return company;
  },
  updateShippingCompany(
    id: string,
    changes: Partial<Omit<ShippingCompany, "id" | "createdAt">>
  ): ShippingCompany | undefined {
    const dbState = readDb();
    const idx = dbState.shippingCompanies.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    dbState.shippingCompanies[idx] = {
      ...dbState.shippingCompanies[idx],
      ...changes,
    };
    writeDb(dbState);
    return dbState.shippingCompanies[idx];
  },
  deleteShippingCompany(id: string): boolean {
    const dbState = readDb();
    if (!dbState.shippingCompanies) return false;
    const lenBefore = dbState.shippingCompanies.length;
    dbState.shippingCompanies = dbState.shippingCompanies.filter(
      (s) => s.id !== id
    );
    writeDb(dbState);
    return dbState.shippingCompanies.length < lenBefore;
  },

  // Force seed shipping companies (for debugging)
  seedShippingCompanies(): void {
    const dbState = readDb();
    if (!dbState.shippingCompanies || dbState.shippingCompanies.length === 0) {
      const shippingCompanies: ShippingCompany[] = [
        {
          id: crypto.randomUUID(),
          name: "Công Ty Cổ Phần Vận Tải BMC Đồng Tháp",
          address: "Số 145, Trương Hán Siêu, Phường Mỹ Trà, Đồng Tháp.",
          imageUrl: "/dongthap.png",
          pricePerKm: 5000,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: "Hợp Tác Xã Vận Tải Thủy Bộ Thành Phố Cao Lãnh",
          address: "03 Điện Biên Phủ, Mỹ Trà, Cao Lãnh, Đồng Tháp",
          imageUrl: "/hoptacxa.png",
          pricePerKm: 4500,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: "Vận tải Hoàng Minh",
          address: "Khu 1, Xã Tân Phước 1, Tỉnh Đồng Tháp",
          imageUrl: "/hoangminh.png",
          pricePerKm: 4800,
          createdAt: Date.now(),
        },
      ];
      dbState.shippingCompanies = shippingCompanies;
      writeDb(dbState);
    }
  },

  // Force reset shipping companies with new data
  resetShippingCompanies(): void {
    const dbState = readDb();
    const shippingCompanies: ShippingCompany[] = [
      {
        id: crypto.randomUUID(),
        name: "Công Ty Cổ Phần Vận Tải BMC Đồng Tháp",
        address: "Số 145, Trương Hán Siêu, Phường Mỹ Trà, Đồng Tháp.",
        imageUrl: "/dongthap.png",
        pricePerKm: 120000,
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Hợp Tác Xã Vận Tải Thủy Bộ Thành Phố Cao Lãnh",
        address: "03 Điện Biên Phủ, Mỹ Trà, Cao Lãnh, Đồng Tháp",
        imageUrl: "/hoptacxa.png",
        pricePerKm: 150000,
        createdAt: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        name: "Vận tải Hoàng Minh",
        address: "Khu 1, Xã Tân Phước 1, Tỉnh Đồng Tháp",
        imageUrl: "/hoangminh.png",
        pricePerKm: 180000,
        createdAt: Date.now(),
      },
    ];
    dbState.shippingCompanies = shippingCompanies;
    writeDb(dbState);
  },

  // Force update all shops with pricing data
  updateShopsWithPricing(): void {
    const dbState = readDb();
    const updatedShops = dbState.shops.map((shop) => {
      // Find matching shop in seed data
      const seedShop = seedShops.find((s) => s["Tên lò sấy"] === shop.name);
      if (seedShop) {
        return {
          ...shop,
          dryingPrice: seedShop["Giá sấy lúa"],
          dryingAndStoragePrice: seedShop["Giá sấy và bảo quản lúa"],
        };
      }
      return shop;
    });

    dbState.shops = updatedShops;
    writeDb(dbState);
    emitShopsUpdated();
  },
};
