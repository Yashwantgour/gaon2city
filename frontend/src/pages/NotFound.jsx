import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import { HiOutlineCodeBracket, HiOutlineCog6Tooth, HiOutlineRocketLaunch } from 'react-icons/hi2';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-lg mx-auto relative"
      >
        {/* Floating background gears */}
        <div className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-10 -left-8 opacity-[0.06]"
          >
            <HiOutlineCog6Tooth className="w-32 h-32 text-primary-600" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-6 -right-6 opacity-[0.06]"
          >
            <HiOutlineCog6Tooth className="w-24 h-24 text-primary-600" />
          </motion.div>
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 mb-6 shadow-lg shadow-primary-100/50"
        >
          <HiOutlineCodeBracket className="w-11 h-11 text-primary-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold text-neutral-800 mb-2"
        >
          Under Development
        </motion.h1>

        {/* Subtitle with route */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-neutral-500 mb-2 text-base"
        >
          We&apos;re crafting something amazing for this page.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-xs font-mono text-neutral-500 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
          {location.pathname}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mx-auto max-w-xs mb-8"
        >
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500"
              initial={{ width: '0%' }}
              animate={{ width: '45%' }}
              transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5 font-medium">Development in progress…</p>
        </motion.div>

        {/* Features coming */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-neutral-100 p-5 mb-8 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineRocketLaunch className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">Coming Soon</span>
          </div>
          <ul className="space-y-2">
            {[
              'This feature is being actively built',
              'Stay tuned for exciting updates',
              'Check back soon for the full experience',
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-2.5 text-sm text-neutral-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-3"
        >
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
