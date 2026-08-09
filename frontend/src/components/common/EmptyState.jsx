import { motion } from 'framer-motion';
import { HiOutlineInbox } from 'react-icons/hi2';
import Button from './Button';

export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        {icon || <HiOutlineInbox className="w-10 h-10 text-neutral-300" />}
      </div>
      <h3 className="text-lg font-semibold text-neutral-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
