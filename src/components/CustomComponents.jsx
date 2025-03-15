import React from 'react';

// Card Components
export const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// Button Component
export const Button = React.forwardRef(({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'default',
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// Input Component
export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
));

Input.displayName = 'Input';

// Progress Component
export const Progress = ({ value = 0, className = '', ...props }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-100 ${className}`} {...props}>
    <div
      className="h-full bg-blue-600 transition-all"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

// Alert Components
export const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-900',
    warning: 'bg-yellow-100 text-yellow-900',
    error: 'bg-red-100 text-red-900',
    success: 'bg-green-100 text-green-900',
  };

  return (
    <div className={`relative rounded-lg border p-4 ${variants[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
    {children}
  </div>
);