'use client';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { HealthCheckResult } from '@/app/actions/advisor';

interface Props {
    result: HealthCheckResult;
}

export default function HealthScoreCard({ result }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100"
        >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1"></div>
            <div className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Score Circle */}
                    <div className="relative shrink-0">
                        <div className="w-40 h-40 rounded-full border-8 border-gray-50 flex items-center justify-center bg-white shadow-inner relative z-10">
                            <div className="text-center">
                                <div className={`text-6xl font-black ${result.color} drop-shadow-sm`}>
                                    {result.grade}
                                </div>
                                <div className="text-sm text-gray-400 font-medium mt-1">
                                    Score: {result.score}
                                </div>
                            </div>
                        </div>
                        {/* Decorative background ring */}
                        <div className={`absolute top-0 left-0 w-full h-full rounded-full border-4 ${result.color} opacity-20 animate-ping`}></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-900 font-bold uppercase tracking-wider text-sm">
                            <Activity className="w-4 h-4 text-indigo-500" />
                            AI Health Check Result
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            " {result.summary} "
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                            {result.keyFactors.map((factor, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        {factor.status === 'GOOD' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                                            factor.status === 'WARNING' ? <HelpCircle className="w-4 h-4 text-amber-500" /> :
                                                <AlertTriangle className="w-4 h-4 text-red-500" />}
                                        <span className="text-xs font-bold text-gray-700">{factor.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed text-left">
                                        {factor.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
