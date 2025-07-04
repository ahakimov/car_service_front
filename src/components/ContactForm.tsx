"use client";

import { useState } from "react";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div
            className="w-full max-w-md mx-auto lg:mx-0 p-8 flex flex-col items-center gap-4 rounded-lg"
            style={{ backgroundColor: "var(--primary-100)" }}
        >
            <h3
                className="text-center font-unbounded text-base font-medium uppercase leading-6"
                style={{ color: "var(--primary-700)" }}
            >
                Request a call back
            </h3>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
                <FormField
                    label="Name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                />

                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                />

                <FormField
                    label="Phone"
                    name="phone"
                    type="tel"
                    placeholder="+48456765567"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center px-4 py-2.5 rounded-lg border transition-colors font-medium shadow-sm hover:opacity-90"
                    style={{
                        backgroundColor: "var(--primary-600)",
                        borderColor: "var(--primary-600)",
                        color: "var(--primary-50)",
                    }}
                >
                    Send request
                </button>
            </form>
        </div>
    );
}

interface FormFieldProps {
    label: string;
    name: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormField({
                       label,
                       name,
                       type,
                       placeholder,
                       value,
                       onChange,
                   }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={name}
                className="text-sm font-medium leading-5"
                style={{ color: "var(--gray-neutral-950)" }}
            >
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="flex px-3.5 py-2.5 items-center gap-2 rounded-lg border bg-white shadow-sm text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                    borderColor: "var(--gray-neutral-400)",
                    color: "var(--gray-neutral-950)",
                }}
                required
            />
        </div>
    );
}
