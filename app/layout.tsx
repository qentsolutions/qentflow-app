import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import { WorkspaceProvider } from '@/hooks/use-current-workspace'
import { CardModalProvider } from '@/providers/card-modal-provider'
import { QueryProvider } from '@/providers/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/providers/theme-provider'
import { SocketProvider } from './(protected)/[workspaceId]/conversations/components/providers/socket-provider'
import { ModalProvider } from './(protected)/[workspaceId]/conversations/components/providers/modal-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QentFlow',
  description: 'Boost your team&apos;s productivity with QentFlow! Discover our innovative WorkOS platform designed for seamless team collaboration, project management, and streamlined workflows.Work smarter, together.',
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
              <SocketProvider>
                <ModalProvider />
                <QueryProvider>
                  <TooltipProvider>
                    <Toaster />
                    <CardModalProvider />
                    {children}
                  </TooltipProvider>
                </QueryProvider>
              </SocketProvider>
            </WorkspaceProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}