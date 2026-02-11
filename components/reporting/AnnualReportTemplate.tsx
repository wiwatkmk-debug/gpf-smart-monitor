import React from 'react';
import { INVESTMENT_PLANS } from '@/lib/mock-gpf-data';

interface AnnualReportProps {
    user: any;
    holdings: any[];
    balance: number;
    currentPlanId: string;
}

export const AnnualReportTemplate = React.forwardRef<HTMLDivElement, AnnualReportProps>(({ user, holdings, balance, currentPlanId }, ref) => {
    const plan = INVESTMENT_PLANS.find(p => p.id === currentPlanId) || INVESTMENT_PLANS[0];

    return (
        <div ref={ref} className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-gray-900 absolute left-[-9999px] top-0 shadow-lg" id="annual-report-template">
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">รายงานสรุปพอร์ตการลงทุนประจำปี</h1>
                    <p className="text-slate-500 mt-1">GPF Smart Monitor Annual Report</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-700">กบข. (GPF)</h2>
                    <p className="text-sm text-slate-500">วันที่ออกรายงาน: {new Date().toLocaleDateString('th-TH')}</p>
                </div>
            </div>

            {/* User Info */}
            <div className="bg-slate-50 p-6 rounded-xl mb-8 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">ข้อมูลสมาชิก</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">ชื่อสมาชิก</p>
                        <p className="font-semibold text-lg">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">รหัสสมาชิก</p>
                        <p className="font-semibold text-lg font-mono">{user.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">แผนการลงทุนปัจจุบัน</p>
                        <p className="font-semibold text-indigo-600">{plan.name}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">ความเสี่ยงของแผน</p>
                        <p className="font-semibold">{plan.riskLevel}</p>
                    </div>
                </div>
            </div>

            {/* Portfolio Summary */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">สรุปสถานะพอร์ตลงทุน</h3>
                <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-6">
                    <div>
                        <p className="text-indigo-800 font-medium">มูลค่าทรัพย์สินสุทธิ (Net Asset Value)</p>
                        <h2 className="text-4xl font-bold text-indigo-700 mt-2">฿{balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h2>
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 text-left rounded-l-lg">สินทรัพย์ / กองทุน</th>
                            <th className="p-3 text-right">จำนวนหน่วย</th>
                            <th className="p-3 text-right">ราคาต่อหน่วย (NAV)</th>
                            <th className="p-3 text-right rounded-r-lg">มูลค่าคงเหลือ (บาท)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {holdings.length > 0 ? holdings.map((h, i) => (
                            <tr key={i}>
                                <td className="p-3 font-medium">{h.name}</td>
                                <td className="p-3 text-right text-slate-600">{h.units.toLocaleString()}</td>
                                <td className="p-3 text-right text-slate-600">{h.navPerUnit.toFixed(4)}</td>
                                <td className="p-3 text-right font-bold text-slate-800">{h.value.toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                    ใช้อัตราส่วนมาตรฐานตามแผน {plan.name}
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-200 font-bold">
                        <tr>
                            <td colSpan={3} className="p-3 text-right text-slate-800">รวมทั้งหมด</td>
                            <td className="p-3 text-right text-indigo-700">฿{balance.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Performance & Projections */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">ประมาณการเกษียณอายุ (Retirement Projection)</h3>
                <div className="grid grid-cols-2 gap-6 bg-white border border-slate-200 p-6 rounded-xl">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">เป้าหมายเงินเกษียณ (ณ อายุ 60 ปี)</p>
                        <p className="text-2xl font-bold text-slate-800">฿10,000,000.00</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 mb-1">ผลตอบแทนเฉลี่ยย้อนหลังของแผน</p>
                        <p className="text-2xl font-bold text-green-600">{plan.historicalReturn}% ต่อปี</p>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">*ตัวเลขคาดการณ์คำนวณจากผลตอบแทนในอดีต มิใช่การการันตีผลตอบแทนในอนาคต</p>
            </div>

            {/* Disclaimer */}
            <div className="mt-auto pt-8 border-t border-slate-200 text-xs text-slate-400 text-justify leading-relaxed">
                <p>
                    เอกสารนี้ถูกจัดทำขึ้นโดยอัตโนมัติจากระบบ GPF Smart Monitor System เพื่อเป็นข้อมูลสรุปสถานะการลงทุนเบื้องต้นเท่านั้น ข้อมูลตัวเลขอาจะไม่เป็นปัจจุบัน (Real-time) โปรดตรวจสอบยอดเงินที่แน่นอนอีกครั้งผ่านแอปพลิเคชันหลักของ กบข. (GPF Mobile App) หรือสอบถามผ่าน Call Center 1179
                </p>
                <p className="mt-2 text-center font-bold text-slate-300 tracking-widest">--- END OF REPORT ---</p>
            </div>
        </div>
    );
});

AnnualReportTemplate.displayName = 'AnnualReportTemplate';
