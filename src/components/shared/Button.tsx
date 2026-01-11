import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      loading,
      fullWidth,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={[
          'pipeline-btn',
          `pipeline-btn-${variant}`,
          `pipeline-btn-${size}`,
          fullWidth && 'pipeline-btn-full-width',
          loading && 'pipeline-btn-loading',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="pipeline-btn-spinner" />}
        {icon && !loading && <span className="pipeline-btn-icon">{icon}</span>}
        {children && <span className="pipeline-btn-label">{children}</span>}
        {iconRight && <span className="pipeline-btn-icon-right">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
