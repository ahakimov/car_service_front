'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import {API_CONFIG, useApi, useAuth} from '@/app/api';

export default function LoginPage() {
    const router = useRouter();
    const { login, loading: authLoading } = useAuth();
    const { data, loading, post, setToken, removeToken, hasToken } =
        useApi<{
            userId: number;
            username: string;
        }>();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[field as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
        }
        // Clear general error
        if (error) setError('');
    };

    const validateForm = () => {
        const errors = {
            email: '',
            password: '',
        };

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFieldErrors(errors);
        return !errors.email && !errors.password;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (!validateForm()) {
            return;
        }
        const credentials = {
            email: formData.email,
            password: formData.password,
        };
        try {
            // Use the auth service to login
            const result = await login(credentials.email, credentials.password);
            if (result.error) {
                // Handle authentication error with better messages
                let errorMsg = result.error;
                
                // Provide user-friendly error messages
                if (result.error.includes('Failed to connect') || result.error.includes('fetch')) {
                    errorMsg = 'Cannot connect to server. Please check your internet connection and ensure the backend server is running.';
                } else if (result.status === 401 || result.status === 403) {
                    errorMsg = 'Invalid email or password. Please try again.';
                } else if (result.status === 0) {
                    errorMsg = 'Network error. Please check if the backend server is accessible.';
                }
                
                setError(errorMsg);
                console.error('Login error details:', result);
                return;
            }

            // Login successful
            if (result.data) {
                const token = btoa(`${credentials.email}:${credentials.password}`);
                setToken(token);
                
                // Redirect based on user role
                const role = result.data.role;
                if (role === 'ADMIN') {
                    router.push('/dashboard');
                } else if (role === 'USER') {
                    router.push('/client');
                } else if (role === 'MECHANIC') {
                    router.push('/mechanic');
                } else {
                    // Default fallback
                    router.push('/client');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[384px]">
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center gap-1 mb-8">
                        {/* Logo */}
                        <div className="relative w-[127px] h-[96px] mb-1">
                            <Image
                                src="/logo_dark.png"
                                alt="CarService Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Title */}
                        <h1
                            className="font-unbounded text-xl font-normal uppercase leading-8 text-center"
                            style={{ color: 'var(--primary-700)' }}
                        >
                            Welcome back
                        </h1>
                        <p
                            className="text-[13px] leading-6 text-center"
                            style={{ color: 'var(--neutral-900)' }}
                        >
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Global Error Message */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Email Input */}
                        <div className="flex flex-col gap-[6px]">
                            <Label
                                htmlFor="email"
                                className="text-sm font-medium leading-5"
                                style={{ color: 'var(--neutral-950)' }}
                            >
                                Email
                            </Label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
                                    style={{ color: fieldErrors.email ? 'var(--danger-600)' : 'var(--neutral-600)' }}
                                />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="johndoe@company.pl"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="h-11 pl-10 rounded-lg border bg-white shadow-sm"
                                    style={{
                                        borderColor: fieldErrors.email ? 'var(--danger-600)' : 'var(--neutral-400)',
                                        color: 'var(--neutral-600)',
                                    }}
                                    autoComplete="email"
                                    aria-invalid={!!fieldErrors.email}
                                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                                    disabled={authLoading}
                                />
                            </div>
                            {fieldErrors.email && (
                                <p
                                    id="email-error"
                                    className="text-sm leading-5"
                                    style={{ color: 'var(--danger-600)' }}
                                >
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-[6px]">
                            <Label
                                htmlFor="password"
                                className="text-sm font-medium leading-5"
                                style={{ color: 'var(--neutral-950)' }}
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="h-11 rounded-lg border bg-white shadow-sm pr-10"
                                    style={{
                                        borderColor: fieldErrors.password ? 'var(--danger-600)' : 'var(--neutral-400)',
                                        color: 'var(--neutral-600)',
                                    }}
                                    autoComplete="current-password"
                                    aria-invalid={!!fieldErrors.password}
                                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                                    disabled={authLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    tabIndex={-1}
                                    disabled={authLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" style={{ color: 'var(--neutral-500)' }} />
                                    ) : (
                                        <Eye className="h-5 w-5" style={{ color: 'var(--neutral-500)' }} />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p
                                    id="password-error"
                                    className="text-sm leading-5"
                                    style={{ color: 'var(--danger-600)' }}
                                >
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                                    className="h-4 w-4 rounded"
                                    style={{
                                        borderColor: 'var(--primary-300)',
                                    }}
                                    disabled={authLoading}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-5 cursor-pointer select-none"
                                    style={{ color: 'var(--neutral-800)' }}
                                >
                                    Remember for 30 days
                                </Label>
                            </div>

                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium leading-5 hover:underline"
                                style={{ color: 'var(--primary-700)' }}
                            >
                                Forgot password
                            </Link>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            disabled={authLoading}
                            className="w-full h-11 rounded-lg font-medium text-base leading-6 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: 'var(--primary-600)',
                                borderColor: 'var(--primary-600)',
                                color: 'var(--primary-50)',
                            }}
                        >
                            {authLoading ? 'Logging in...' : 'Log in'}
                        </Button>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p
                                className="text-[13px] leading-6"
                                style={{ color: 'var(--neutral-900)' }}
                            >
                                Don't have an account?{' '}
                                <Link
                                    href="/contact"
                                    className="font-medium underline hover:no-underline transition-all"
                                    style={{ color: 'var(--primary-700)' }}
                                >
                                    Contact us
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Background Image (Desktop Only) */}
            <div className="hidden lg:block relative lg:w-1/2 flex-shrink-0">
                <Image
                    src="/login_image.png"
                    alt="Car repair workshop"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}