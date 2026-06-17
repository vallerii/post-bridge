import { PlatformList } from '@/components/platforms/PlatformList'
import { getConnectedPlatforms } from '@/lib/platforms/get-platforms'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PlatformsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const platforms = await getConnectedPlatforms()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Платформи</h1>
        <p className="mt-1 text-sm text-zinc-400">Підключіть соцмережі та маркетплейси</p>
      </div>
      <PlatformList connected={platforms} />
    </div>
  )
}