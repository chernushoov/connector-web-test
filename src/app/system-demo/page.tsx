'use client'

import { useState } from 'react'
import { WorkerCard } from '@/components/system/WorkerCard'
import { EmployerCard } from '@/components/system/EmployerCard'
import { MOCK_WORKERS, MOCK_EMPLOYERS } from '@/components/system/mocks'
import type { CardContext } from '@/types/system-card'

export default function SystemDemoPage() {
  const [context, setContext] = useState<CardContext>('profile')

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      {/* Context toggle */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center gap-4">
        <h1 className="text-white/60 font-mono text-sm tracking-wider uppercase flex-1">
          System Cards — Connector 2036
        </h1>
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1">
          <button
            onClick={() => setContext('profile')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              context === 'profile'
                ? 'bg-white/10 text-white/80'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setContext('map')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              context === 'map'
                ? 'bg-white/10 text-white/80'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Map
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Worker Cards */}
        <section>
          <h2 className="text-white/25 font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
            Worker Cards
          </h2>
          <div className={`grid gap-4 ${
            context === 'map'
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {MOCK_WORKERS.map((worker) => (
              <WorkerCard
                key={worker.id}
                {...worker}
                context={context}
                onAction={(event) => console.log('[System Event]', event)}
              />
            ))}
          </div>
        </section>

        {/* Employer Cards */}
        <section>
          <h2 className="text-white/25 font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
            Employer Cards
          </h2>
          <div className={`grid gap-4 ${
            context === 'map'
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {MOCK_EMPLOYERS.map((employer) => (
              <EmployerCard
                key={employer.id}
                {...employer}
                context={context}
                onAction={(event) => console.log('[System Event]', event)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
