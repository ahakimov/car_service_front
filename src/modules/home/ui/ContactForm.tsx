'use client';

import React, { useState } from 'react';
import { Phone, AtSign, Check } from 'lucide-react';
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

const ContactFormWithCustomDatePicker: React.FC = () => {
    const [date, setDate] = useState<Date>();
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        carModel: '',
        service: '',
        specialist: '',
        time: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Show success dialog
        setShowSuccessDialog(true);

        // Reset form after submission
        setTimeout(() => {
            setFormData({
                fullName: '',
                contactNumber: '',
                carModel: '',
                service: '',
                specialist: '',
                time: '',
                description: '',
            });
            setDate(undefined);
        }, 2000);
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

                            {/* Car Model */}
                            <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                <Label
                                    htmlFor="carModel"
                                    className="text-sm font-medium leading-5"
                                    style={{ color: 'var(--neutral-950)' }}
                                >
                                    Car Model
                                </Label>
                                <Select
                                    value={formData.carModel}
                                    onValueChange={(value) => handleInputChange('carModel', value)}
                                >
                                    <SelectTrigger
                                        className="h-11 rounded-lg border bg-white shadow-sm"
                                        style={{
                                            borderColor: 'var(--neutral-400)',
                                            color: formData.carModel ? 'var(--neutral-900)' : 'var(--neutral-600)',
                                        }}
                                    >
                                        <SelectValue placeholder="Select car model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="toyota">Toyota</SelectItem>
                                        <SelectItem value="honda">Honda</SelectItem>
                                        <SelectItem value="bmw">BMW</SelectItem>
                                        <SelectItem value="mercedes">Mercedes</SelectItem>
                                        <SelectItem value="audi">Audi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Select Service */}
                            <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                <Label
                                    htmlFor="service"
                                    className="text-sm font-medium leading-5"
                                    style={{ color: 'var(--neutral-950)' }}
                                >
                                    Select Service
                                </Label>
                                <Select
                                    value={formData.service}
                                    onValueChange={(value) => handleInputChange('service', value)}
                                >
                                    <SelectTrigger
                                        className="h-11 rounded-lg border bg-white shadow-sm"
                                        style={{
                                            borderColor: 'var(--neutral-400)',
                                            color: formData.service ? 'var(--neutral-900)' : 'var(--neutral-600)',
                                        }}
                                    >
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="oil-change">Oil Change</SelectItem>
                                        <SelectItem value="brake-service">Brake Service</SelectItem>
                                        <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                                        <SelectItem value="engine-diagnostic">
                                            Engine Diagnostic
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Select Specialist */}
                            <div className="flex flex-col gap-[6px] w-full sm:w-[320px]">
                                <Label
                                    htmlFor="specialist"
                                    className="text-sm font-medium leading-5"
                                    style={{ color: 'var(--neutral-950)' }}
                                >
                                    Select Specialist
                                </Label>
                                <Select
                                    value={formData.specialist}
                                    onValueChange={(value) => handleInputChange('specialist', value)}
                                >
                                    <SelectTrigger
                                        className="h-11 rounded-lg border bg-white shadow-sm"
                                        style={{
                                            borderColor: 'var(--neutral-400)',
                                            color: formData.specialist ? 'var(--neutral-900)' : 'var(--neutral-600)',
                                        }}
                                    >
                                        <SelectValue placeholder="Select specialist" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jan">Jan Kowalski</SelectItem>
                                        <SelectItem value="marek">Marek Zieliński</SelectItem>
                                        <SelectItem value="piotr">Piotr Wiśniewski</SelectItem>
                                        <SelectItem value="krzysztof">Krzysztof Wójcik</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date and Time Row */}
                            <div className="flex gap-2 w-full sm:w-[320px]">
                                {/* Custom Date Picker */}
                                <div className="flex-1">
                                    <CustomDatePicker
                                        value={date}
                                        onChange={setDate}
                                        placeholder="Select date"
                                    />
                                </div>

                                {/* Time Picker */}
                                <div className="flex-1">
                                    <Select
                                        value={formData.time}
                                        onValueChange={(value) => handleInputChange('time', value)}
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
                                            <SelectItem value="9am">9:00 AM</SelectItem>
                                            <SelectItem value="10am">10:00 AM</SelectItem>
                                            <SelectItem value="11am">11:00 AM</SelectItem>
                                            <SelectItem value="12pm">12:00 PM</SelectItem>
                                            <SelectItem value="2pm">2:00 PM</SelectItem>
                                            <SelectItem value="3pm">3:00 PM</SelectItem>
                                            <SelectItem value="4pm">4:00 PM</SelectItem>
                                            <SelectItem value="5pm">5:00 PM</SelectItem>
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
                            className="w-full h-11 rounded-lg font-medium text-base leading-6 shadow-sm"
                            style={{
                                backgroundColor: 'var(--primary-700)',
                                borderColor: 'var(--primary-700)',
                            }}
                        >
                            Send request
                        </Button>
                    </form>
                </div>
            </div>
            </Container>
            {/* Success Dialog */}
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
                                Thank you for leaving a message!
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                We'll contact you soon regarding your request
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <Button
                        onClick={() => setShowSuccessDialog(false)}
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