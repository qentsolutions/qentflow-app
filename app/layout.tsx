import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { WorkspaceProvider } from '@/hooks/use-current-workspace'
import { ModalProvider } from '@/providers/modal-provider'
import { QueryProvider } from '@/providers/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QentSolutions',
  description: 'Boost your team&apos;s productivity with QentSolutions! Discover our innovative WorkOS platform designed for seamless team collaboration, project management, and streamlined workflows.Work smarter, together.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="qent-theme"
        >
          <SessionProvider session={session}>
            <WorkspaceProvider>
              <QueryProvider>
                <TooltipProvider>
                  <Toaster />
                  <ModalProvider />
                  {children}
                </TooltipProvider>
              </QueryProvider>
            </WorkspaceProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}