'use client';

import { useState } from 'react';
import Card from '../ui/Card';

interface ImageUploadProps {
    onImageUpload: (imageUrl: string) => void;
    currentImage?: string;
}

export default function ImageUpload({ onImageUpload, currentImage }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const [fileName, setFileName] = useState<string>('');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreviewUrl(result);
            setFileName(file.name);
            onImageUpload(result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setFileName('');
        onImageUpload('');
    };

    return (
        <Card>
            <div className="mb-4">
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    📸 อัพโหลดภาพแคปหน้าจอ
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    แคปหน้าจอจาก กบข. แล้วอัพโหลดที่นี่ เพื่อดูข้อมูลขณะกรอก
                </p>
            </div>

            {!previewUrl ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
                        }`}
                    style={{ borderColor: isDragging ? 'var(--primary)' : 'var(--border-color)' }}
                >
                    <div className="mb-2">
                        <svg
                            className="mx-auto"
                            style={{
                                width: '32px',
                                height: '32px',
                                color: 'var(--text-secondary)'
                            }}
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <p className="mb-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                        ลากไฟล์มาวางที่นี่
                    </p>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        หรือ
                    </p>
                    <label className="cursor-pointer">
                        <span className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg inline-block hover:opacity-90 transition-opacity">
                            เลือกไฟล์
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileInput}
                        />
                    </label>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        รองรับ: PNG, JPG, JPEG
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 rounded-lg border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--success)' }}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>ไฟล์ที่อัพโหลด:</p>
                                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{fileName}</p>
                            </div>
                            <span className="text-xs px-3 py-1.5 rounded font-medium" style={{ backgroundColor: 'var(--success)', color: 'white' }}>✓ สำเร็จ</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <label className="flex-1 cursor-pointer">
                            <span className="w-full px-4 py-2 glass rounded-lg inline-block text-center hover:opacity-90 transition-opacity">
                                🔄 เปลี่ยนภาพ
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileInput}
                            />
                        </label>
                        <button
                            onClick={handleRemove}
                            className="px-4 py-2 glass rounded-lg hover:opacity-90 transition-opacity text-red-500"
                        >
                            🗑️ ลบภาพ
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
}
