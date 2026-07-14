"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminLogin,
  adminLogout,
  adminCheckSession,
  getAdminData,
  getAdminAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
  createOffer,
  updateOffer,
  deleteOffer,
  createDiscountCode,
  deleteDiscountCode,
  updateOrderStatus,
  deleteOrder,
  updateSettings,
  changeAdminPassword,
  exportProducts,
  exportOrders,
  importProducts,
} from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  Gift,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Search,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const sectionLabels: Record<string, { label: string; icon: any }> = {
  dashboard: { label: "Dashboard", icon: LayoutDashboard },
  products: { label: "Products", icon: Package },
  categories: { label: "Categories", icon: Tags },
  offers: { label: "Special Offers", icon: Gift },
  discountcodes: { label: "Discount Codes", icon: DollarSign },
  orders: { label: "Orders", icon: ShoppingCart },
  settings: { label: "Settings", icon: Settings },
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminCheckSession().then((ok) => {
      setLoggedIn(ok);
      setLoading(false);
    });
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await adminLogin(password);
    if (res.success) setLoggedIn(true);
    else setError(res.error || "Login failed");
  };

  if (loading) return <div className="grid min-h-screen place-items-center text-white/60">Loading...</div>;

  if (!loggedIn) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl glass p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">خفیہ ایڈمن پینل</h1>
            <p className="text-sm text-white/60">Guptia Admin Panel</p>
          </div>
          <div className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full"
            />
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <button type="submit" className="btn btn-primary w-full">Andar Aen</button>
          </div>
        </form>
      </div>
    );
  }

  return <AdminPanel onLogout={() => setLoggedIn(false)} />;
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState("dashboard");
  const [data, setData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [modal, setModal] = useState<{ type: string; item?: any } | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    const d = await getAdminData();
    const a = await getAdminAnalytics();
    setData(d);
    setAnalytics(a);
  };

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await adminLogout();
    onLogout();
  };

  const chartData = useMemo(() => {
    if (!data?.orders) return [];
    const map: Record<string, number> = {};
    data.orders.forEach((o: any) => {
      const key = new Date(o.createdAt).toLocaleDateString("en-PK");
      map[key] = (map[key] || 0) + o.total;
    });
    return Object.entries(map).map(([date, total]) => ({ date, total })).slice(-14);
  }, [data]);

  const lowStock = useMemo(() => (data?.products || []).filter((p: any) => p.stock <= 20), [data]);

  if (!data) return <div className="grid min-h-screen place-items-center text-white/60">Loading data...</div>;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-white/10 bg-[var(--bg-light)] p-5 lg:flex">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white">Shahmeer Admin</h2>
          <p className="text-xs text-white/50">Guptia Panel</p>
        </div>
        <nav className="flex-1 space-y-2">
          {Object.entries(sectionLabels).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${section === key ? "bg-[var(--accent)] text-[var(--bg)]" : "text-white/70 hover:bg-white/10"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[var(--danger)] hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      <main className="lg:ml-64">
        <header className="flex items-center justify-between border-b border-white/10 bg-[var(--bg-light)]/50 px-6 py-4">
          <h1 className="text-lg font-bold text-white">{sectionLabels[section]?.label}</h1>
          <button onClick={logout} className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 lg:hidden">Logout</button>
        </header>
        <div className="p-6">
          {section === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Products" value={analytics?.productCount || 0} icon={Package} />
                <StatCard label="Active Deals" value={analytics?.activeDeals || 0} icon={Gift} />
                <StatCard label="Orders" value={analytics?.orderCount || 0} icon={ShoppingCart} />
                <StatCard label="Revenue" value={formatPrice(analytics?.revenue || 0)} icon={DollarSign} />
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl glass p-5">
                  <h3 className="font-semibold text-white">Revenue Trend (PKR)</h3>
                  <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7eff57" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#7eff57" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                        <Tooltip contentStyle={{ background: "#1a1f3a", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <Area type="monotone" dataKey="total" stroke="#7eff57" fillOpacity={1} fill="url(#rev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-2xl glass p-5">
                  <h3 className="font-semibold text-white">Low Stock Alerts</h3>
                  <div className="mt-4 space-y-3">
                    {lowStock.length === 0 ? <p className="text-sm text-white/50">No low stock</p> : lowStock.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                        <span className="text-sm">{p.name}</span>
                        <span className={`text-xs font-bold ${p.stock <= 5 ? "text-[var(--danger)]" : "text-yellow-400"}`}>{p.stock} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "products" && (
            <ProductsSection
              products={data.products}
              categories={data.categories}
              search={search}
              setSearch={setSearch}
              onRefresh={load}
              onEdit={(p: any) => setModal({ type: "product", item: p })}
              onAdd={() => setModal({ type: "product" })}
            />
          )}

          {section === "categories" && (
            <CategoriesSection categories={data.categories} onRefresh={load} onAdd={() => setModal({ type: "category" })} />
          )}

          {section === "offers" && (
            <OffersSection offers={data.offers} products={data.products} onRefresh={load} onAdd={() => setModal({ type: "offer" })} onEdit={(o: any) => setModal({ type: "offer", item: o })} />
          )}

          {section === "discountcodes" && (
            <DiscountCodesSection codes={data.discountCodes} onRefresh={load} onAdd={() => setModal({ type: "code" })} />
          )}

          {section === "orders" && (
            <OrdersSection orders={data.orders} onRefresh={load} />
          )}

          {section === "settings" && (
            <SettingsSection settings={data.settings} onRefresh={load} />
          )}
        </div>
      </main>

      {modal?.type === "product" && (
        <ProductModal
          product={modal.item}
          categories={data.categories}
          onClose={() => setModal(null)}
          onRefresh={load}
        />
      )}
      {modal?.type === "category" && (
        <CategoryModal onClose={() => setModal(null)} onRefresh={load} />
      )}
      {modal?.type === "offer" && (
        <OfferModal offer={modal.item} products={data.products} onClose={() => setModal(null)} onRefresh={load} />
      )}
      {modal?.type === "code" && (
        <DiscountCodeModal onClose={() => setModal(null)} onRefresh={load} />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: any; icon: any }) {
  return (
    <div className="rounded-2xl glass p-5 transition hover:bg-white/[0.12]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-xl bg-[var(--accent)]/20 p-3 text-[var(--accent)]">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function ProductsSection({ products, categories, search, setSearch, onRefresh, onEdit, onAdd }: any) {
  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.includes(search));
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10" />
        </div>
        <button onClick={onAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Product</button>
      </div>
      <div className="overflow-x-auto rounded-2xl glass">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-white/60">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-white/60">{p.sku}</td>
                <td className="p-4 text-white/60">{categories.find((c: any) => c.id === p.categoryId)?.name}</td>
                <td className="p-4 text-[var(--accent)]">{formatPrice(p.price)}</td>
                <td className={`p-4 ${p.stock <= 20 ? "text-[var(--danger)]" : "text-white/60"}`}>{p.stock}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(p)} className="rounded-lg p-2 hover:bg-white/10"><Edit className="h-4 w-4" /></button>
                    <button onClick={async () => { if (confirm("Delete?")) { await deleteProduct(p.id); onRefresh(); } }} className="rounded-lg p-2 text-[var(--danger)] hover:bg-white/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductModal({ product, categories, onClose, onRefresh }: any) {
  const [form, setForm] = useState({
    name: product?.name || "",
    urdu: product?.urdu || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || categories[0]?.id || "",
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    discount: product?.discount || 0,
    stock: product?.stock || 0,
    unit: product?.unit || "",
    image: product?.image || "",
    description: product?.description || "",
    active: product?.active ?? true,
    featured: product?.featured ?? false,
  });

  const save = async () => {
    const payload = { ...form, categoryId: Number(form.categoryId) || null };
    if (product) await updateProduct(product.id, payload);
    else await createProduct(payload);
    onRefresh();
    onClose();
  };

  return (
    <Modal onClose={onClose} title={product ? "Edit Product" : "Add Product"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Urdu Name" value={form.urdu} onChange={(e) => setForm({ ...form, urdu: e.target.value })} />
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" placeholder="Price PKR" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input type="number" placeholder="Original Price" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} />
        <input type="number" placeholder="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        <input placeholder="Unit (e.g. 50g)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea placeholder="Description" className="sm:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
        <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
      </div>
      <button onClick={save} className="btn btn-primary mt-5 w-full">Save</button>
    </Modal>
  );
}

function CategoriesSection({ categories, onRefresh, onAdd }: any) {
  return (
    <div className="space-y-4">
      <button onClick={onAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Category</button>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl glass p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="font-medium text-white">{c.name}</p>
                <p className="text-xs text-white/50">{c.urdu}</p>
              </div>
            </div>
            <button onClick={async () => { if (confirm("Delete?")) { await deleteCategory(c.id); onRefresh(); } }} className="text-[var(--danger)] hover:bg-white/10 rounded-lg p-2"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryModal({ onClose, onRefresh }: any) {
  const [form, setForm] = useState({ name: "", urdu: "", slug: "", icon: "" });
  const save = async () => {
    await createCategory(form);
    onRefresh();
    onClose();
  };
  return (
    <Modal onClose={onClose} title="Add Category">
      <div className="space-y-3">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Urdu" value={form.urdu} onChange={(e) => setForm({ ...form, urdu: e.target.value })} />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input placeholder="Icon emoji" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
      </div>
      <button onClick={save} className="btn btn-primary mt-5 w-full">Save</button>
    </Modal>
  );
}

function OffersSection({ offers, products, onRefresh, onAdd, onEdit }: any) {
  return (
    <div className="space-y-4">
      <button onClick={onAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Create Offer</button>
      <div className="grid gap-4 md:grid-cols-2">
        {offers.map((o: any) => (
          <div key={o.id} className="rounded-2xl glass p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{o.name}</h3>
                <p className="text-xs text-white/50">{o.discount}% off • {o.productIds?.length || 0} products</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(o)} className="rounded-lg p-2 hover:bg-white/10"><Edit className="h-4 w-4" /></button>
                <button onClick={async () => { if (confirm("Delete?")) { await deleteOffer(o.id); onRefresh(); } }} className="rounded-lg p-2 text-[var(--danger)] hover:bg-white/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfferModal({ offer, products, onClose, onRefresh }: any) {
  const [form, setForm] = useState({
    name: offer?.name || "",
    urdu: offer?.urdu || "",
    discount: offer?.discount || 0,
    image: offer?.image || "",
    featured: offer?.featured ?? true,
    productIds: offer?.productIds || [],
    description: offer?.description || "",
  });

  const toggleProduct = (id: number) => {
    setForm((f: any) => ({ ...f, productIds: f.productIds.includes(id) ? f.productIds.filter((x: number) => x !== id) : [...f.productIds, id] }));
  };

  const save = async () => {
    if (offer) await updateOffer(offer.id, form);
    else await createOffer(form);
    onRefresh();
    onClose();
  };

  return (
    <Modal onClose={onClose} title={offer ? "Edit Offer" : "Create Offer"}>
      <div className="space-y-3">
        <input placeholder="Offer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Urdu" value={form.urdu} onChange={(e) => setForm({ ...form, urdu: e.target.value })} />
        <input type="number" placeholder="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
        <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        <div>
          <p className="text-sm font-medium text-white">Products</p>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl bg-black/20 p-2">
            {products.map((p: any) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
        </div>
        <button onClick={save} className="btn btn-primary w-full">Save</button>
      </div>
    </Modal>
  );
}

function OrdersSection({ orders, onRefresh }: any) {
  return (
    <div className="overflow-x-auto rounded-2xl glass">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-white/60">
          <tr><th className="p-4">#</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
        </thead>
        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-4">{o.id}</td>
              <td className="p-4">{o.customerName || "Guest"}<br /><span className="text-xs text-white/40">{o.phone}</span></td>
              <td className="p-4 text-white/60">{o.items.length} items</td>
              <td className="p-4 text-[var(--accent)]">{formatPrice(o.total)}</td>
              <td className="p-4">
                <select value={o.status} onChange={async (e) => { await updateOrderStatus(o.id, e.target.value); onRefresh(); }} className="text-xs">
                  <option value="pending">Pending</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="p-4">
                <button onClick={async () => { if (confirm("Delete?")) { await deleteOrder(o.id); onRefresh(); } }} className="rounded-lg p-2 text-[var(--danger)] hover:bg-white/10"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsSection({ settings, onRefresh }: any) {
  const [form, setForm] = useState(settings || {});
  const [pw, setPw] = useState({ current: "", new: "" });
  const [pwMsg, setPwMsg] = useState("");

  const save = async () => {
    await updateSettings(form);
    onRefresh();
  };

  const changePw = async () => {
    const res = await changeAdminPassword(pw.current, pw.new);
    setPwMsg(res.success ? "Password changed" : res.error || "Failed");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl glass p-5">
        <h3 className="font-semibold text-white">Store Information</h3>
        <div className="mt-4 space-y-3">
          {[
            { key: "shopName", label: "Shop Name" },
            { key: "urduName", label: "Urdu Name" },
            { key: "location", label: "Location" },
            { key: "address", label: "Address" },
            { key: "whatsapp", label: "WhatsApp" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-white/50">{label}</label>
              <input value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-white/50">Delivery Charge</label><input type="number" value={form.deliveryCharge || 0} onChange={(e) => setForm({ ...form, deliveryCharge: Number(e.target.value) })} /></div>
            <div><label className="text-xs text-white/50">Free Delivery Min</label><input type="number" value={form.freeDeliveryMin || 0} onChange={(e) => setForm({ ...form, freeDeliveryMin: Number(e.target.value) })} /></div>
          </div>
          <button onClick={save} className="btn btn-primary w-full">Save Settings</button>
        </div>
      </div>
      <div className="rounded-2xl glass p-5">
        <h3 className="font-semibold text-white">Change Admin Password</h3>
        <div className="mt-4 space-y-3">
          <input type="password" placeholder="Current Password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <input type="password" placeholder="New Password" value={pw.new} onChange={(e) => setPw({ ...pw, new: e.target.value })} />
          <button onClick={changePw} className="btn btn-primary w-full">Change Password</button>
          {pwMsg && <p className="text-sm text-[var(--accent)]">{pwMsg}</p>}
        </div>
        <div className="mt-6 border-t border-white/10 pt-5">
          <h3 className="font-semibold text-white">Data Management</h3>
          <div className="mt-3 flex gap-2">
            <button onClick={async () => downloadJson(await exportProducts(), "products.json")} className="btn flex-1 border border-white/10 bg-white/5 text-sm hover:bg-white/10"><Download className="h-4 w-4" /> Products</button>
            <button onClick={async () => downloadJson(await exportOrders(), "orders.json")} className="btn flex-1 border border-white/10 bg-white/5 text-sm hover:bg-white/10"><Download className="h-4 w-4" /> Orders</button>
          </div>
          <label className="btn mt-2 flex w-full cursor-pointer items-center justify-center border border-white/10 bg-white/5 text-sm hover:bg-white/10">
            <Upload className="h-4 w-4" /> Import Products JSON
            <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              const rows = JSON.parse(text);
              await importProducts(rows);
              onRefresh();
            }} />
          </label>
        </div>
      </div>
    </div>
  );
}

function DiscountCodesSection({ codes, onRefresh, onAdd }: any) {
  return (
    <div className="space-y-4">
      <button onClick={onAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Discount Code</button>
      <div className="overflow-x-auto rounded-2xl glass">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-white/60">
            <tr><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Used/Max</th><th className="p-4">Min Purchase</th><th className="p-4">Actions</th></tr>
          </thead>
          <tbody>
            {codes.map((c: any) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium uppercase">{c.code}</td>
                <td className="p-4 text-white/60">{c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}</td>
                <td className="p-4 text-white/60">{c.used || 0} / {c.maxUses ?? "∞"}</td>
                <td className="p-4 text-white/60">{formatPrice(c.minPurchase || 0)}</td>
                <td className="p-4">
                  <button onClick={async () => { if (confirm("Delete?")) { await deleteDiscountCode(c.id); onRefresh(); } }} className="rounded-lg p-2 text-[var(--danger)] hover:bg-white/10"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DiscountCodeModal({ onClose, onRefresh }: any) {
  const [form, setForm] = useState({ code: "", type: "fixed", value: 0, minPurchase: 0, maxUses: "" });
  const save = async () => {
    await createDiscountCode({
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
    });
    onRefresh();
    onClose();
  };
  return (
    <Modal onClose={onClose} title="Add Discount Code">
      <div className="space-y-3">
        <input placeholder="Code (e.g. SAVE100)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="fixed">Fixed PKR</option>
          <option value="percent">Percent %</option>
        </select>
        <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        <input type="number" placeholder="Minimum Purchase" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })} />
        <input type="number" placeholder="Max Uses (leave blank for unlimited)" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
        <button onClick={save} className="btn btn-primary w-full">Save</button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--bg-light)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
