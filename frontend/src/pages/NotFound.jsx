import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import {
  HiOutlineHome,
  HiOutlineBuildingStorefront,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi2';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* Visual 404 Badge */}
        <div className="w-20 h-20 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto shadow-xs">
          <HiOutlineQuestionMarkCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary-100/70 text-primary-800 tracking-wider">
            ERROR 404
          </span>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto">
            The page <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">{location.pathname}</code> does not exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            icon={<HiOutlineBuildingStorefront />}
            onClick={() => navigate('/marketplace')}
            className="w-full sm:w-auto"
          >
            Explore Marketplace
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<HiOutlineHome />}
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
