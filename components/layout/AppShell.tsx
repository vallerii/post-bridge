import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0F11] flex ">
      <Sidebar />
      <main className="ml-[220px] p-8 w-full flex flex-col gap-6">
        {children}
      </main>
    </div>
  )
}