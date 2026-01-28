'use client';

import { Alert } from '@/types/portfolio';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { useState } from 'react';

interface AlertsPanelProps {
    alerts: Alert[];
}

export default function AlertsPanel({ alerts: initialAlerts }: AlertsPanelProps) {
    const [alerts, setAlerts] = useState(initialAlerts);

    const dismissAlert = (alertId: string) => {
        setAlerts(alerts.filter((alert) => alert.id !== alertId));
    };

    const getIcon = (type: Alert['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-success" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-warning" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-danger" />;
            default:
                return <Info className="w-5 h-5 text-info" />;
        }
    };

    const unreadCount = alerts.filter((alert) => !alert.read).length;

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    การแจ้งเตือน
                </h3>
                {unreadCount > 0 && (
                    <Badge variant="danger">{unreadCount} ใหม่</Badge>
                )}
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        ไม่มีการแจ้งเตือนในขณะนี้
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-lg border transition-all ${!alert.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                }`}
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {alert.title}
                                        </h4>
                                        <button
                                            onClick={() => dismissAlert(alert.id)}
                                            className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                        </button>
                                    </div>

                                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                        {alert.message}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: th })}
                                        </p>
                                        {alert.actionRequired && (
                                            <Badge variant="warning" className="text-xs">
                                                ต้องดำเนินการ
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
