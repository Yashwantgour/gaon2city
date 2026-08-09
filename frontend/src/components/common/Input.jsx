import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full rounded-xl border border-neutral-200 bg-white
            px-4 py-2.5 text-sm text-neutral-800
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            transition-all duration-200
            disabled:bg-neutral-50 disabled:text-neutral-400
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger-500">{error}</p>
      )}
    </div>
  );
});

export default Input;
