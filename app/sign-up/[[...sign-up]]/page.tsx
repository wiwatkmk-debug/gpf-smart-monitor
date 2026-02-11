import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start justify-items-center lg:justify-items-stretch">

                {/* Left Side: Helper Info (Placed FIRST in DOM = Top on Mobile) */}
                <div className="w-full max-w-[400px] lg:max-w-none flex flex-col justify-center mx-auto">
                    {/* Increased px-10 to match Clerk's internal padding */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden" style={{ padding: '30px 10px' }}>

                        {/* Centered Header */}
                        <div className="flex flex-col items-center text-center gap-2 mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    คำแนะนำความปลอดภัย
                                </h2>
                                <p className="text-xs text-gray-500">Secure Password Tips</p>
                            </div>
                        </div>

                        {/* Content Container - Indentation adjusted to 40px based on user feedback (Sweet spot) */}
                        <div className="w-full space-y-4" style={{ paddingLeft: '40px' }}>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="text-green-500 shrink-0">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    </div>
                                    <span>ความยาวอย่างน้อย <strong>8 ตัวอักษร</strong></span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="text-green-500 shrink-0">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    </div>
                                    <span>ต้องมี <strong>ตัวพิมพ์ใหญ่ (A-Z)</strong> และ <strong>ตัวเลข</strong></span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="text-green-500 shrink-0">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    </div>
                                    <span>ควรมี <strong>อักขระพิเศษ</strong> (เช่น @, #, !)</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <div className="text-red-500 shrink-0">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </div>
                                    <span className="text-red-600 font-medium">ห้ามใช้รหัสที่คาดเดาง่าย</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="hidden lg:block text-center text-gray-400 text-xs mt-4">
                        © 2024 GPF Smart Monitor. Secure & Private.
                    </div>
                </div>

                {/* Right Side: SignUp Form */}
                <div className="w-full max-w-[400px] flex justify-center lg:justify-end mx-auto">
                    <SignUp
                        appearance={{
                            elements: {
                                card: "shadow-md rounded-2xl border border-gray-100 w-full",
                                rootBox: "w-full",
                            },
                            variables: {
                                spacingUnit: '0.9rem',
                                borderRadius: '1rem',
                                fontSize: '0.95rem'
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
