import React, { forwardRef, useId } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const reactId = useId();
    const generatedId = id || reactId;

    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={generatedId} className="input-label">
            {label}
          </label>
        )}
        
        <div className="input-container">
          {rightIcon && (
            <div className="input-icon-right">
              {rightIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={generatedId}
            className={`input-base ${error ? 'input-error' : ''} ${leftIcon ? 'input-with-left-icon' : ''} ${rightIcon ? 'input-with-right-icon' : ''} ${className}`}
            {...props}
          />

          {leftIcon && (
            <div className="input-icon-left">
              {leftIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="input-error-message animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
