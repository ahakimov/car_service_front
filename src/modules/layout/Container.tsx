import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'wide' | 'narrow' | 'full';
    noPadding?: boolean;
    as?: 'div' | 'section' | 'article' | 'main' | 'aside';
}

/**
 * Universal Container Component
 *
 * Prevents horizontal scroll and provides consistent width constraints
 *
 * @param variant - Container width variant
 *   - 'default': max-w-screen-xl (1280px) - Standard content width
 *   - 'wide': max-w-screen-2xl (1536px) - Wider content
 *   - 'narrow': max-w-4xl (896px) - Narrow content (articles, forms)
 *   - 'full': w-full - Full width with just padding
 *
 * @param noPadding - Remove horizontal padding
 * @param as - HTML element type (default: 'div')
 *
 * @example
 * <Container>Content</Container>
 * <Container variant="narrow">Article content</Container>
 * <Container variant="full" className="bg-gray-100">Full width section</Container>
 */
const Container: React.FC<ContainerProps> = ({
                                                 children,
                                                 className,
                                                 variant = 'default',
                                                 noPadding = false,
                                                 as: Component = 'div',
                                             }) => {
    const baseClasses = 'w-full mx-auto';

    const variantClasses = {
        default: 'max-w-screen-xl',  // 1280px
        wide: 'max-w-screen-2xl',    // 1536px
        narrow: 'max-w-4xl',          // 896px
        full: '',                      // No max-width
    };

    const paddingClasses = noPadding
        ? ''
        : 'px-4 sm:px-6 lg:px-8 xl:px-0';

    return (
        <Component
            className={cn(
                baseClasses,
                variantClasses[variant],
                paddingClasses,
                className
            )}
        >
            {children}
        </Component>
    );
};

export default Container;