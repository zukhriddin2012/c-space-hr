import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({
  children,
  title,
  description,
  footer,
  className = '',
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {(title || description) && (
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 lg:p-6'}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 lg:px-6 lg:py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
