import Link from 'next/link';
import { Clock, ShieldAlert } from 'lucide-react';

export default function AccessPending() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
                <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-10 h-10 text-amber-600" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">รอการอนุมัติสิทธิ์</h1>
                    <p className="text-gray-600">
                        บัญชีของคุณอยู่ระหว่างการตรวจสอบโดยผู้ดูแลระบบ<br />
                        กรุณารอการอนุมัติเพื่อเข้าใช้งาน
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-left">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-900">ทำไมต้องรอ?</p>
                            <p className="text-blue-700 mt-1">
                                ระบบนี้เป็นระบบปิดสำหรับสมาชิกที่ได้รับเชิญเท่านั้น เพื่อความปลอดภัยของข้อมูลการลงทุน
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-4">หากรอนานเกินไป โปรดติดต่อ Admin</p>
                    <Link
                        href="/"
                        className="text-gray-400 hover:text-gray-600 text-sm underline"
                    >
                        ลองโหลดหน้านี้ใหม่
                    </Link>
                </div>
            </div>
        </div>
    );
}
