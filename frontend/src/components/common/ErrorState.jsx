import { motion } from 'framer-motion';
import { HiExclamationTriangle } from 'react-icons/hi2';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  onRetry,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <HiExclamationTriangle className="w-10 h-10 text-danger-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-700 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button variant="primary" size="md" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
