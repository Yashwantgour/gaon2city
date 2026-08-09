import { Link } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlinePhone, HiOutlineEnvelope } from 'react-icons/hi2';

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-lg font-bold text-white">
                Gaon<span className="text-primary-400">2</span>City
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              A hyperlocal marketplace connecting villages and cities. Buy and sell from people near you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/marketplace', label: 'Marketplace' },
                { to: '/sell', label: 'Sell a Product' },
                { to: '/orders', label: 'My Orders' },
                { to: '/profile', label: 'My Profile' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Categories</h4>
            <ul className="space-y-2">
              {['Agriculture', 'Dairy & Milk', 'Handicrafts', 'Fruits & Vegetables', 'Home & Kitchen'].map(
                (cat) => (
                  <li key={cat}>
                    <Link
                      to={`/marketplace?category=${cat.toLowerCase()}`}
                      className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <HiOutlineMapPin className="w-4 h-4 text-primary-400 shrink-0" />
                Rajasthan, India
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <HiOutlinePhone className="w-4 h-4 text-primary-400 shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm text-neutral-400">
                <HiOutlineEnvelope className="w-4 h-4 text-primary-400 shrink-0" />
                hello@gaon2city.in
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Gaon2City. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-neutral-500">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
