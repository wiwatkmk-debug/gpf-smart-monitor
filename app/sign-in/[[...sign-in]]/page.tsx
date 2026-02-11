import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            {/* Main Container */}
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start justify-items-center lg:justify-items-stretch">

                {/* Left Side: Welcome Info (Placed FIRST = Top on Mobile) */}
                <div className="w-full max-w-[400px] lg:max-w-none flex flex-col justify-center mx-auto">
                    {/* Increased px-10 to match Clerk's internal padding */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden" style={{ padding: '30px 10px' }}>

                        <div className="flex flex-col items-center text-center gap-3 mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <span className="text-2xl">👋</span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    ยินดีต้อนรับกลับครับ!
                                </h2>
                                <p className="text-xs text-gray-500">Welcome back to GPF Smart Monitor</p>
                            </div>
                        </div>

                        {/* Content Container - Indentation adjusted to 40px based on user feedback (Sweet spot) */}
                        <div className="w-full space-y-4" style={{ paddingLeft: '40px' }}>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm text-gray-600 group">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">Real-time Updates</strong>
                                        <span className="text-xs text-gray-500">ติดตามสถานะพอร์ตการลงทุนได้ทันที</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-600 group">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">AI Advisor</strong>
                                        <span className="text-xs text-gray-500">รับคำแนะนำการปรับพอร์ตจาก AI อัจฉริยะ</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-600 group">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">Secure & Private</strong>
                                        <span className="text-xs text-gray-500">เก็บรักษาข้อมูลอย่างปลอดภัยสูงสุด</span>
                                    </div>
                                </li>
                            </ul>

                        </div>
                    </div>

                    <div className="hidden lg:block text-center text-gray-400 text-xs mt-4">
                        © 2024 GPF Smart Monitor. Secure & Private.
                    </div>
                </div>

                {/* Right Side: SignIn Form */}
                <div className="w-full max-w-[400px] flex justify-center lg:justify-end mx-auto">
                    <SignIn
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
