import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonProps } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { ChevronCompactLeft } from 'react-bootstrap-icons';

// Interfaces
export interface BaseBackButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: string;
  showIcon?: boolean;
  fallbackPath?: string;
}

export interface BreadcrumbPath {
  label: string;
  path: string;
}

export interface BackButtonWithBreadcrumbProps extends BaseBackButtonProps {
  paths: BreadcrumbPath[];
  currentPageLabel?: string;
}

// Basic Bootstrap Back Button
export const BootstrapBackButton: React.FC<BaseBackButtonProps> = ({
    variant = 'dark',
    size = 'sm',
    label = 'Back',
    showIcon = true,
    fallbackPath = '/',
    className = '',
    ...restProps
}) => {
    const navigate = useNavigate();

    const handleBack = (): void => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleBack}
            className={`d-flex align-items-center gap-2 text-light text-decoration-none ${className}`}
            style={{ outline: 'none', boxShadow: 'none' }}
            {...restProps}
        >
            {showIcon && <ChevronCompactLeft size={16} />}
            {label}
        </Button>
    );
};

// const breadcrumbPaths: BreadcrumbPath[] = [
//     { label: 'Home', path: '/' },
//     { label: 'Products', path: '/products' },
//   ];
// <BackButtonWithBreadcrumb
// paths={breadcrumbPaths}
// currentPageLabel="Product Details"
// />

// Back Button with Breadcrumb Navigation
export const BackButtonWithBreadcrumb: React.FC<BackButtonWithBreadcrumbProps> = ({
    variant = 'link',
    size = 'sm',
    paths,
    currentPageLabel = '',
    ...restProps
  }) => {
    const navigate = useNavigate();
  
    return (
      <div className="d-flex flex-column gap-2">
        <Button
          variant={variant}
          size={size}
          onClick={() => navigate(-1)}
          className="d-flex align-items-center gap-2 p-0"
          {...restProps}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {paths.map((item, index) => (
              <li key={index} className="breadcrumb-item">
                <Button
                  className="text-light"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              </li>
            ))}
            {currentPageLabel && (
              <li className="breadcrumb-item active" aria-current="page">
                {currentPageLabel}
              </li>
            )}
          </ol>
        </nav>
      </div>
    );
  };