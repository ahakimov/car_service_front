'use client';

import React, { useState, useEffect } from 'react';
import { Phone, AtSign, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import CustomDatePicker from '@/components/CustomDatePicker';
import Container from "@/modules/layout/Container";
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useAuth } from '@/app/api';
import { useRouter } from 'next/navigation';
import type { Mechanic, Service, Car, Reservation, ReservationDto, VisitorRequestDto, VisitorRequest } from '@/app/api/types';

const ContactFormWithCustomDatePicker: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const isLoggedIn = Boolean(user?.userId);
    const [date, setDate] = useState<Date>();
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMode, setSuccessMode] = useState<'client' | 'visitor'>('visitor');
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        email: '',
        carId: '',
        serviceId: '',
        mechanicId: '',
        time: '',
        description: '',
    });

    // Generate 30-minute time slots from 9:00 to 17:00
    const generateTimeSlots = () => {
        const slots: { value: string; label: string }[] = [];
        for (let hour = 9; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (hour === 17 && minute > 0) break; // Stop at 17:00
                const hourStr = String(hour).padStart(2, '0');
                const minStr = String(minute).padStart(2, '0');
                const value = `${hourStr}:${minStr}`;
                const displayHour = hour > 12 ? hour - 12 : hour;
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const label = `${displayHour}:${minStr} ${ampm}`;
                slots.push({ value, label });
            }
        }
        return slots;
    };

    // Filter time slots - if today is selected, only show future times
    const getAvailableTimeSlots = () => {
        const allSlots = generateTimeSlots();
        if (!date) return allSlots;

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (!isToday) return allSlots;

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        return allSlots.filter(slot => {
            const [hour, minute] = slot.value.split(':').map(Number);
            if (hour > currentHour) return true;
            if (hour === currentHour && minute > currentMinute) return true;
            return false;
        });
    };

    // Fetch available services, mechanics, and cars
    useEffect(() => {
        const fetchData = async () => {
            try {
                const servicesRes = await httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST);
                if (servicesRes.data) setServices(servicesRes.data);

                if (isLoggedIn) {
                    const [mechanicsRes, carsRes] = await Promise.all([
                        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
                        httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST),
                    ]);

                    if (mechanicsRes.data) setMechanics(mechanicsRes.data);
                    if (carsRes.data) setCars(carsRes.data);
                } else {
                    setMechanics([]);
                    setCars([]);
                }
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        };

        fetchData();
    }, [isLoggedIn]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.fullName.trim() || !formData.contactNumber.trim()) {
            setErrorMessage('Please fill in your full name and contact number.');
            setShowErrorDialog(true);
            return;
        }

        if (!formData.serviceId || !date || !formData.time) {
            setErrorMessage('Please fill in all required fields (Service, Date, and Time).');
            setShowErrorDialog(true);
            return;
        }

        if (isLoggedIn && (!formData.carId || !formData.mechanicId)) {
            setErrorMessage('Please fill in all required fields (Car Model and Specialist).');
            setShowErrorDialog(true);
            return;
        }

        setLoading(true);
        try {
            // Combine date and time into visitDateTime
            const [hours, minutes] = formData.time.split(':');
            const visitDateTime = new Date(date);
            visitDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const selectedService = services.find((service) => String(service.id) === formData.serviceId);

            const visitorRequestData: VisitorRequestDto = {
                fullName: formData.fullName.trim(),
                contactNumber: formData.contactNumber.trim(),
                email: formData.email.trim() || undefined,
                serviceId: formData.serviceId ? parseInt(formData.serviceId) : undefined,
                serviceName: selectedService?.serviceName,
                // Format as LocalDateTime compatible string (no timezone, no milliseconds)
                visitDate: visitDateTime.toISOString().slice(0, 19),
                time: formData.time,
                description: formData.description || undefined,
            };


            const response = await httpClient.post<VisitorRequest, VisitorRequestDto>(
                API_CONFIG.ENDPOINTS.VISITOR_REQUESTS.CREATE,
                visitorRequestData
            );

            if (response.error) {
                setErrorMessage(response.error || 'Failed to send request. Please try again.');
                setShowErrorDialog(true);
            } else {
                // Reset form
                setFormData({
                    fullName: '',
                    contactNumber: '',
                    email: '',
                    carId: '',
                    serviceId: '',
                    mechanicId: '',
                    time: '',
                    description: '',
                });
                setDate(undefined);

                setSuccessMode('visitor');
                setShowSuccessDialog(true);
            }
        } catch (error) {
            console.error('Error submitting visitor request:', error);
            setErrorMessage('An error occurred while sending your request. Please try again.');
            setShowErrorDialog(true);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <section
            className="w-full py-16 lg:py-20"
            style={{ backgroundColor: 'var(--primary-50)' }}
        >
            <Container>
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
                    {/* Left Side - Contact Info */}
                    <div className="flex flex-col gap-8 w-full lg:w-1/3">
                        {/* Header */}
                        <div className="flex flex-col gap-1 w-full">
                            <p
                                className="font-unbounded font-normal text-base leading-6 uppercase"
                                style={{ color: 'var(--accent-800)' }}
                            >
                                honest service
                            </p>
                            <div className="flex flex-col gap-3 w-full">
                                <h2
                                    className="font-unbounded font-semibold text-[32px] leading-[64.4px] uppercase"
                                    style={{ color: 'var(--primary-800)' }}
                                >
                                    Connect with us
                                </h2>
                                <p
                                    className="text-base leading-6 max-w-[378px]"
                                    style={{ color: 'var(--primary-600)' }}
                                >
                                    Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                                    massa mi.
                                </p>
                            </div>
                        </div>

                        {/* Contact Info Cards */}
                        <div className="flex flex-col gap-6 w-full">
                            {/* Phone */}
                            <div className="flex gap-4 items-center">
                                <div
                                    className="w-20 h-20 flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: 'var(--primary-200)' }}
                                >
                                    <Phone className="w-10 h-10" style={{ color: 'var(--primary-800)' }} />
                                </div>
                                <div className="flex flex-col gap-2 py-[10px]">
                                    <h3
                                        className="font-unbounded font-semibold text-xl leading-8 uppercase"
                                        style={{ color: 'var(--primary-800)' }}
                                    >
                                        phone
                                    </h3>
                                    <p
                                        className="text-base leading-6"
                                        style={{ color: 'var(--primary-900)' }}
                                    >
                                        +48 975 678 978
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-4 items-center">
                                <div
                                    className="w-20 h-20 flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: 'var(--primary-200)' }}
                                >
                                    <AtSign className="w-10 h-10" style={{ color: 'var(--primary-800)' }} />
                                </div>
                                <div className="flex flex-col gap-2 py-[10px]">
                                    <h3
                                        className="font-unbounded font-semibold text-xl leading-8 uppercase"
                                        style={{ color: 'var(--primary-800)' }}
                                    >
                                        email
                                    </h3>
                                    <p
                                        className="text-base leading-6"
                                        style={{ color: 'var(--primary-900)' }}
                                    >
                                        service@carservice.pl
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div
                        className="w-full lg:w-8/12 rounded-lg p-8 flex flex-col gap-4"
                        style={{ backgroundColor: 'var(--primary-100)' }}
                    >
                        <h3
                            className="font-unbounded font-medium text-xl leading-6 text-center uppercase"
                            style={{ color: 'var(--primary-800)' }}
                        >
                            need service?
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 items-end w-full mb-4">
                                {/* Full Name */}
                                <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                    <Label
                                        htmlFor="fullName"
                                        className="text-sm font-medium leading-5"
                                        style={{ color: 'var(--neutral-950)' }}
                                    >
                                        Full Name
                                    </Label>
                                    <Input
                                        id="fullName"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className="h-11 rounded-lg border bg-white shadow-sm"
                                        style={{
                                            borderColor: 'var(--neutral-400)',
                                            color: 'var(--neutral-600)',
                                        }}
                                    />
                                </div>

                                {/* Contact Number */}
                                <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                    <Label
                                        htmlFor="contactNumber"
                                        className="text-sm font-medium leading-5"
                                        style={{ color: 'var(--neutral-950)' }}
                                    >
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="contactNumber"
                                        placeholder="+48456765567"
                                        value={formData.contactNumber}
                                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                        className="h-11 rounded-lg border bg-white shadow-sm"
                                        style={{
                                            borderColor: 'var(--neutral-400)',
                                            color: 'var(--neutral-600)',
                                        }}
                                    />
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium leading-5"
                                        style={{ color: 'var(--neutral-950)' }}
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="h-11 rounded-lg border bg-white shadow-sm"
                                        style={{
                                            borderColor: 'var(--neutral-400)',
                                            color: 'var(--neutral-600)',
                                        }}
                                    />
                                </div>

                                {/* Car Model */}
                                {isLoggedIn && (
                                    <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                        <Label
                                            htmlFor="carId"
                                            className="text-sm font-medium leading-5"
                                            style={{ color: 'var(--neutral-950)' }}
                                        >
                                            Car Model
                                        </Label>
                                        <Select
                                            value={formData.carId}
                                            onValueChange={(value) => handleInputChange('carId', value)}
                                            required
                                        >
                                            <SelectTrigger
                                                className="h-11 rounded-lg border bg-white shadow-sm"
                                                style={{
                                                    borderColor: 'var(--neutral-400)',
                                                    color: formData.carId ? 'var(--neutral-900)' : 'var(--neutral-600)',
                                                }}
                                            >
                                                <SelectValue placeholder="Select car model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cars.map((car) => (
                                                    <SelectItem key={car.id} value={String(car.id)}>
                                                        {car.make} {car.model} {car.year ? `(${car.year})` : ''} - {car.licensePlate}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Select Service */}
                                <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                    <Label
                                        htmlFor="serviceId"
                                        className="text-sm font-medium leading-5"
                                        style={{ color: 'var(--neutral-950)' }}
                                    >
                                        Select Service
                                    </Label>
                                    <Select
                                        value={formData.serviceId}
                                        onValueChange={(value) => handleInputChange('serviceId', value)}
                                        required
                                    >
                                        <SelectTrigger
                                            className="h-11 rounded-lg border bg-white shadow-sm"
                                            style={{
                                                borderColor: 'var(--neutral-400)',
                                                color: formData.serviceId ? 'var(--neutral-900)' : 'var(--neutral-600)',
                                            }}
                                        >
                                            <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map((service) => (
                                                <SelectItem key={service.id} value={String(service.id)}>
                                                    {service.serviceName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Select Specialist */}
                                {isLoggedIn && (
                                    <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                        <Label
                                            htmlFor="mechanicId"
                                            className="text-sm font-medium leading-5"
                                            style={{ color: 'var(--neutral-950)' }}
                                        >
                                            Select Specialist
                                        </Label>
                                        <Select
                                            value={formData.mechanicId}
                                            onValueChange={(value) => handleInputChange('mechanicId', value)}
                                            required
                                        >
                                            <SelectTrigger
                                                className="h-11 rounded-lg border bg-white shadow-sm"
                                                style={{
                                                    borderColor: 'var(--neutral-400)',
                                                    color: formData.mechanicId ? 'var(--neutral-900)' : 'var(--neutral-600)',
                                                }}
                                            >
                                                <SelectValue placeholder="Select specialist" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mechanics.map((mechanic) => (
                                                    <SelectItem key={mechanic.id} value={String(mechanic.id)}>
                                                        {mechanic.name} {mechanic.specialty ? `- ${mechanic.specialty}` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Date and Time Row */}
                                <div className="flex gap-2 w-full sm:w-[320px]">
                                    {/* Custom Date Picker */}
                                    <div className="flex-1">
                                        <CustomDatePicker
                                            value={date}
                                            onChange={(newDate) => {
                                                setDate(newDate);
                                                // Clear time selection when date changes
                                                if (formData.time) {
                                                    handleInputChange('time', '');
                                                }
                                            }}
                                            placeholder="Select date"
                                            minDate={new Date()}
                                        />
                                    </div>

                                    {/* Time Picker */}
                                    <div className="flex-1">
                                        <Select
                                            value={formData.time}
                                            onValueChange={(value) => handleInputChange('time', value)}
                                            required
                                        >
                                            <SelectTrigger
                                                className="h-11 rounded-lg border bg-white shadow-sm"
                                                style={{
                                                    borderColor: 'var(--neutral-400)',
                                                    color: formData.time ? 'var(--neutral-900)' : 'var(--neutral-600)',
                                                }}
                                            >
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableTimeSlots().map((slot) => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Textarea */}
                            <div className="flex flex-col gap-[6px] w-full mb-4">
                                <Label
                                    htmlFor="description"
                                    className="text-sm font-medium leading-5"
                                    style={{ color: '#344054' }}
                                >
                                    Describe your problem
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter a description..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="min-h-[77px] rounded-lg border bg-white shadow-sm resize-none"
                                    style={{
                                        borderColor: '#d0d5dd',
                                        color: '#667085',
                                    }}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-lg font-medium text-base leading-6 shadow-sm disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--primary-700)',
                                    borderColor: 'var(--primary-700)',
                                }}
                            >
                                {loading ? 'Sending...' : 'Send request'}
                            </Button>
                        </form>
                    </div>
                </div>
            </Container>
            {/* Success Dialog - Landing page form ALWAYS shows visitor request message */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center gap-4 pb-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--success-100)' }}
                        >
                            <Check
                                className="w-8 h-8"
                                style={{ color: 'var(--success-600)' }}
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-xl font-medium">
                                Service Request Submitted!
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Your request has been sent to manager. Manager will get in touch with you soon.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <Button
                        onClick={() => {
                            setShowSuccessDialog(false);
                            // Landing page form - just close, no navigation
                        }}
                        className="w-full h-11 rounded-lg font-medium"
                        style={{
                            backgroundColor: 'var(--primary-700)',
                            borderColor: 'var(--primary-700)',
                        }}
                    >
                        OK
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Error Dialog */}
            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center gap-4 pb-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--error-100)' }}
                        >
                            <AlertCircle
                                className="w-8 h-8"
                                style={{ color: 'var(--error-600)' }}
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-xl font-medium">
                                Error
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                {errorMessage}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <Button
                        onClick={() => setShowErrorDialog(false)}
                        className="w-full h-11 rounded-lg font-medium"
                        style={{
                            backgroundColor: 'var(--primary-700)',
                            borderColor: 'var(--primary-700)',
                        }}
                    >
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default ContactFormWithCustomDatePicker;