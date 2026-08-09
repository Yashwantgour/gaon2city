import { motion } from 'framer-motion';
import { useState } from 'react';
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
import { mockProducts } from '../services/mockData';

const tabs = [
  { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
  { id: 'users', label: 'Users', icon: HiOutlineUsers },
  { id: 'products', label: 'Products', icon: HiOutlineCube },
  { id: 'categories', label: 'Categories', icon: HiOutlineTag },
  { id: 'reports', label: 'Reports', icon: HiOutlineFlag },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) {
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
    { label: 'Total Users', value: '248', change: '+12%', icon: HiOutlineUsers, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Listings', value: '1,042', change: '+8%', icon: HiOutlineCube, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Orders', value: '386', change: '+23%', icon: HiOutlineShieldCheck, color: 'text-green-600 bg-green-50' },
    { label: 'Reports', value: '5', change: '-2', icon: HiOutlineFlag, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mb-6">Platform management and insights</p>

        {/* Tabs */}
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

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                    <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 p-5">
              <h3 className="font-semibold text-neutral-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  'New user registration: Sunita Devi',
                  'New product listed: Fresh Organic Wheat',
                  'Order #ord-1 confirmed',
                  'Report submitted for product #3',
                  'New user registration: Mohan Lal',
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-neutral-600 py-2 border-b border-neutral-50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary-400 shrink-0" />
                    {activity}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-5 py-3 font-medium text-neutral-600">User</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-600 hidden sm:table-cell">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-600 hidden md:table-cell">Location</th>
                  <th className="text-left px-5 py-3 font-medium text-neutral-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.slice(0, 5).map((p) => (
                  <tr key={p.seller.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.seller.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium text-neutral-800">{p.seller.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-neutral-600 capitalize">{p.seller.seller_type}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-neutral-500">{p.seller.village}, {p.seller.city}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
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
                {mockProducts.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
                        <span className="font-medium text-neutral-800 line-clamp-1">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-neutral-600">{p.seller.name}</td>
                    <td className="px-5 py-3 font-medium text-neutral-800">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 capitalize">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Categories & Reports */}
        {(activeTab === 'categories' || activeTab === 'reports') && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <p className="text-neutral-500">
              {activeTab === 'categories' ? 'Category management' : 'Report management'} — coming soon
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
