'use client';

import { TrendingUp, TrendingDown } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: number;
  change?: number;
  variant?: "primary" | "secondary" | "white";
};

export function MetricCard({
  title,
  value,
  change = 0,
  variant = "white",
}: MetricCardProps) {
  const isPositive = change >= 0;

  const getStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: 'var(--primary-700)',
          border: 'var(--primary-800)',
          text: 'var(--primary-50)',
          badgeText: 'var(--primary-100)',
        };
      case "secondary":
        return {
          bg: 'var(--primary-100)',
          border: 'var(--primary-200)',
          text: 'var(--primary-950)',
          badgeText: 'var(--neutral-700)',
        };
      default:
        return {
          bg: 'white',
          border: 'var(--primary-100)',
          text: 'var(--primary-950)',
          badgeText: 'var(--neutral-700)',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="flex-1 rounded-xl border min-w-[250px]"
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
      }}
    >
      <div className="flex flex-col gap-6 p-4">
        <p
          className="font-medium text-base"
          style={{ color: styles.text }}
        >
          {title}
        </p>

        <div className="flex items-end justify-between gap-14">
          <div className="flex flex-col gap-2">
            <p
              className="font-unbounded text-[39px] leading-[64px]"
              style={{ color: styles.text }}
            >
              {value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-2">
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded-2xl"
                  style={{ 
                    backgroundColor: isPositive ? 'var(--success-100)' : 'var(--danger-100)' 
                  }}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--success-500)' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4" style={{ color: 'var(--danger-500)' }} />
                  )}
                  <span 
                    className="font-medium text-[13px]"
                    style={{ color: isPositive ? 'var(--success-600)' : 'var(--danger-600)' }}
                  >
                    {Math.abs(change)}
                  </span>
                </div>
                <span
                  className="text-[13px]"
                  style={{ color: styles.badgeText }}
                >
                  vs last month
                </span>
              </div>
            )}
          </div>

          <div 
            className="p-2 rounded-3xl"
            style={{ backgroundColor: 'var(--primary-200)' }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: 'var(--primary-950)' }}
            >
              <path
                d="M7 7L17 17"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M17 7V17H7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
