import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../../features/ui/uiSlice';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXMark } from 'react-icons/hi2';

const icons = {
  success: <HiCheckCircle className="w-5 h-5 text-green-500" />,
  error: <HiExclamationCircle className="w-5 h-5 text-red-500" />,
  info: <HiInformationCircle className="w-5 h-5 text-blue-500" />,
};

const bgColors = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
};

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] ${bgColors[toast.type] || bgColors.info}`}
          >
            {icons[toast.type] || icons.info}
            <p className="text-sm font-medium text-neutral-700 flex-1">{toast.message}</p>
            <button
              onClick={() => dispatch(hideToast())}
              className="p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
