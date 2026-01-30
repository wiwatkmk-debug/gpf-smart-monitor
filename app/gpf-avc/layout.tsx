export default function GpfAvcLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
            <div className="mx-auto max-w-7xl">
                {children}
            </div>
        </div>
    );
}
