import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineFlag,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import EmptyState from '../components/common/EmptyState';
import { listProducts } from '../services/productsApi';
import { listReports } from '../services/reportsApi';

const tabs = [
  { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
  { id: 'products', label: 'Products', icon: HiOutlineCube },
  { id: 'reports', label: 'Reports', icon: HiOutlineFlag },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const [pRes, rRes] = await Promise.allSettled([
          listProducts({ limit: 50 }),
          listReports({ limit: 50 }),
        ]);

        if (pRes.status === 'fulfilled') setProducts(pRes.value.products || []);
        if (rRes.status === 'fulfilled') setReports(rRes.value.reports || []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminData();
  }, [isAuthenticated]);

  if (!isAuthenticated || user?.seller_type !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          title="Admin access required"
          actionLabel="Sign In"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  const stats = [
    { label: 'Active Listings', value: products.length, icon: HiOutlineCube, color: 'text-primary-600 bg-primary-50' },
    { label: 'Reports', value: reports.length, icon: HiOutlineFlag, color: 'text-red-600 bg-red-50' },
    { label: 'Platform Status', value: 'Healthy', icon: HiOutlineShieldCheck, color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mb-6">Platform management and insights</p>

        <div className="flex gap-1 mb-6 overflow-x-auto hide-scrollbar border-b border-neutral-200 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors shrink-0 border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-neutral-100 p-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-neutral-500">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">No products listed</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-5 py-3 font-medium text-neutral-600">Product</th>
                    <th className="text-left px-5 py-3 font-medium text-neutral-600 hidden sm:table-cell">Seller</th>
                    <th className="text-left px-5 py-3 font-medium text-neutral-600">Price</th>
                    <th className="text-left px-5 py-3 font-medium text-neutral-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img src={typeof p.images[0] === 'string' ? p.images[0] : p.images[0].storage_path} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-base shrink-0 border border-neutral-100">📦</div>
                          )}
                          <span className="font-medium text-neutral-800 line-clamp-1">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-neutral-600">{p.seller?.name || 'Seller'}</td>
                      <td className="px-5 py-3 font-medium text-neutral-800">₹{p.price?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 capitalize">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            {reports.length === 0 ? (
              <p className="text-neutral-500 text-sm">No reports submitted yet.</p>
            ) : (
              <div className="space-y-3 text-left">
                {reports.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-neutral-100">
                    <p className="font-semibold text-sm text-neutral-800">{r.reason}</p>
                    <p className="text-xs text-neutral-500 mt-1">{r.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
