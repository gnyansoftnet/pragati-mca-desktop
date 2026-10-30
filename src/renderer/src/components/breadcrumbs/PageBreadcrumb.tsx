import React from 'react';

export interface PageBreadcrumbProps {
  title: React.ReactNode;
  desc?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  title,
  desc,
  className = '',
  children
}) => {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </h1>
      {desc && (
        <p className="text-xs text-slate-500 mt-1">
          {desc}
        </p>
      )}
      {children}
    </div>
  );
};

export default PageBreadcrumb;