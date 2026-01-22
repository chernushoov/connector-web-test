'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { MapMarker as MapMarkerType, MapRegion, Coordinates, QuickProfile, QuickTask } from '@/types'

// Dynamic import for Leaflet (client-side only)
import dynamic from 'next/dynamic'

// ============================================
// MAP COMPONENT (Client-side only)
// ============================================

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

// ============================================
// MAP PROPS
// ============================================

export interface FreeWorldMapProps {
  markers: MapMarkerType[]
  center: Coordinates
  zoom?: number
  onMarkerClick?: (marker: MapMarkerType) => void
  onRegionChange?: (region: MapRegion) => void
  selectedMarkerId?: string | null
  showUserLocation?: boolean
  userLocation?: Coordinates | null
  className?: string
}

// ============================================
// CUSTOM MARKER ICONS (CSS-based)
// ============================================

function createMarkerIcon(type: MapMarkerType['type'], options?: {
  isUrgent?: boolean
  isPro?: boolean
  isAvailable?: boolean
}): L.DivIcon | undefined {
  if (typeof window === 'undefined') return undefined

  const L = require('leaflet')

  let bgColor = 'bg-brand-primary'
  let icon = ''
  let extraClasses = ''

  switch (type) {
    case 'worker':
      bgColor = options?.isAvailable ? 'bg-success' : 'bg-brand-primary'
      icon = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
      </svg>`
      if (options?.isAvailable) {
        extraClasses = 'animate-pulse'
      }
      break
    case 'task':
      bgColor = options?.isUrgent ? 'bg-danger' : 'bg-brand-accent'
      icon = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
      </svg>`
      if (options?.isUrgent) {
        extraClasses = 'animate-bounce'
      }
      break
    case 'employer':
      bgColor = 'bg-neutral-900'
      icon = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
      </svg>`
      break
  }

  if (options?.isPro) {
    extraClasses += ' ring-2 ring-brand-accent ring-offset-2'
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full ${bgColor} text-white shadow-lg border-2 border-white ${extraClasses}">
        ${icon}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

// ============================================
// USER LOCATION MARKER
// ============================================

function createUserLocationIcon(): L.DivIcon | undefined {
  if (typeof window === 'undefined') return undefined

  const L = require('leaflet')

  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="relative">
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
        <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-50"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

// ============================================
// FREE WORLD MAP COMPONENT
// ============================================

export function FreeWorldMap({
  markers,
  center,
  zoom = 13,
  onMarkerClick,
  onRegionChange,
  selectedMarkerId,
  showUserLocation = true,
  userLocation,
  className,
}: FreeWorldMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    import('leaflet')
      .then((L) => {
        setLeaflet(L)
        // Fix default marker icon issue by using DivIcons only
        delete (L.Icon.Default.prototype as any)._getIconUrl
      })
      .catch((error) => {
        console.error('Failed to load Leaflet:', error)
        setLoadError('Failed to load map. Please refresh the page.')
      })
  }, [])

  if (loadError) {
    return (
      <div className={cn('w-full h-full bg-neutral-100 flex items-center justify-center', className)}>
        <div className="flex flex-col items-center gap-3 text-center p-4">
          <svg className="w-12 h-12 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-neutral-600">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isClient || !leaflet) {
    return (
      <div className={cn('w-full h-full bg-neutral-100 flex items-center justify-center', className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full h-full relative', className)}>
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Map tiles - using a clean, modern style */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Markers */}
        {markers.map((marker) => {
          const isWorker = marker.type === 'worker'
          const isTask = marker.type === 'task'
          const profile = marker.data as QuickProfile
          const task = marker.data as QuickTask

          const icon = createMarkerIcon(marker.type, {
            isUrgent: marker.isUrgent,
            isPro: marker.isPro,
            isAvailable: marker.isAvailable,
          })

          return (
            <Marker
              key={marker.id}
              position={[marker.coordinates.latitude, marker.coordinates.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  {isWorker && (
                    <WorkerPopup profile={profile} />
                  )}
                  {isTask && (
                    <TaskPopup task={task} />
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* User location */}
        {showUserLocation && userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserLocationIcon()}
          />
        )}
      </MapContainer>

      {/* Map controls overlay */}
      <MapControls />
    </div>
  )
}

// ============================================
// WORKER POPUP
// ============================================

function WorkerPopup({ profile }: { profile: QuickProfile }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
        {profile.name?.charAt(0) || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 truncate">{profile.name}</p>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          {profile.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {profile.rating.toFixed(1)}
            </span>
          )}
          {profile.hourlyRate && (
            <span>₪{profile.hourlyRate}/h</span>
          )}
        </div>
        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {profile.skills.slice(0, 2).map((skill) => (
              <span key={skill} className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// TASK POPUP
// ============================================

function TaskPopup({ task }: { task: QuickTask }) {
  return (
    <div>
      <p className="font-semibold text-neutral-900">{task.title}</p>
      <div className="flex items-center gap-2 text-sm mt-1">
        <span className="text-success font-semibold">₪{task.amount}</span>
        {task.when === 'now' && (
          <span className="bg-danger text-white text-xs px-1.5 py-0.5 rounded animate-pulse">
            NOW
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  )
}

// ============================================
// MAP CONTROLS
// ============================================

function MapControls() {
  // Note: Zoom controls require native Leaflet zoom control or map ref
  // For now, users can use pinch-to-zoom or scroll wheel
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Zoom controls - visual only, use pinch/scroll to zoom */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          className="p-3 hover:bg-neutral-100 transition-colors active:bg-neutral-200"
          aria-label="Zoom in (use scroll or pinch)"
          title="Use scroll wheel or pinch to zoom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <div className="h-px bg-neutral-100" />
        <button
          className="p-3 hover:bg-neutral-100 transition-colors active:bg-neutral-200"
          aria-label="Zoom out (use scroll or pinch)"
          title="Use scroll wheel or pinch to zoom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Location button */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              () => {
                // Map will center through browser's native behavior
                alert('Location detected. Drag the map to see your area.')
              },
              () => {
                alert('Could not get your location. Please enable location services.')
              }
            )
          }
        }}
        className="bg-white p-3 rounded-xl shadow-lg hover:bg-neutral-100 transition-colors active:bg-neutral-200"
        aria-label="Center on my location"
      >
        <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  )
}

// ============================================
// MAP LEGEND
// ============================================

export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg', className)}>
      <p className="text-xs font-semibold text-neutral-500 mb-2">Legend</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-neutral-600">Available now</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-primary" />
          <span className="text-xs text-neutral-600">Workers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-accent" />
          <span className="text-xs text-neutral-600">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
          <span className="text-xs text-neutral-600">Urgent</span>
        </div>
      </div>
    </div>
  )
}
