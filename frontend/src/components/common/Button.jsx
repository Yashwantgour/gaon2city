import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-500/20',
  secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  ghost: 'text-neutral-600 hover:bg-neutral-100',
  accent: 'bg-accent-500 text-white hover:bg-accent-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-3.5 text-base',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="text-lg">{icon}</span>
      ) : null}
      {children}
      {iconRight && <span className="text-lg">{iconRight}</span>}
    </motion.button>
  );
}
