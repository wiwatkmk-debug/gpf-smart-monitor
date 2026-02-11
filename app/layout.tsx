import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
// Sidebar import removed as it is now in ClientLayout

export const metadata: Metadata = {
  title: "GPF Smart Monitor - ผู้ช่วยติดตามพอร์ต กบข. อัจฉริยะ",
  description: "ติดตามพอร์ต กบข. แบบ Real-time วิเคราะห์สถานการณ์ตลาดโลก ให้คำแนะนำ Rebalancing อัจฉริยะ และช่วยวางแผนเกษียณ",
  keywords: "กบข, GPF, พอร์ตโฟลิโอ, การลงทุน, เกษียณ, วางแผนการเงิน",
  authors: [{ name: "GPF Smart Monitor" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check User Status Block
  const { currentUser } = await import('@clerk/nextjs/server');
  const { prisma } = await import('@/lib/prisma');

  const user = await currentUser();
  let isPending = false;

  if (user) {
    // Lazy sync logic inside layout to ensure security everywhere
    let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser) {
      // Auto-create logic (duplicated from action for safety/speed)
      const count = await prisma.user.count();
      const role = count === 0 ? 'ADMIN' : 'USER';
      const status = count === 0 ? 'APPROVED' : 'PENDING'; // First user approved, others PENDING

      // Calculate Trial (Default 7 days if config missing)
      // Note: We use a hardcoded default here to avoid async config fetch delay in layout, 
      // or we could fetch it. For MVP, 7 days is fine.
      const trialDays = 7;
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || 'no-email',
          role: role,
          status: status,
          // Subscription Defaults
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'ACTIVE',
          isTrial: true,
          subscriptionEndsAt: trialEndsAt
        } as any
      });
    }

    const userData = dbUser as any;
    if (userData.status === 'PENDING') {
      isPending = true;
    }
  }

  return (
    <ClerkProvider>
      <html lang="th">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="antialiased flex bg-gray-50 min-h-screen">
          {/* If Pending, hide sidebar and show pending screen */}
          {isPending ? (
            <div className="w-full h-screen flex items-center justify-center">
              <div className="flex-1">
                <AccessPendingWithNoSidebar />
              </div>
            </div>
          ) : (
            <ClientLayout>
              {children}
            </ClientLayout>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}

// Inline Wrapper or Import
import AccessPending from "@/components/AccessPending";
import ClientLayout from "@/components/ClientLayout";

function AccessPendingWithNoSidebar() {
  return <AccessPending />;
}
