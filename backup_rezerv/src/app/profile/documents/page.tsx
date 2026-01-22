'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Header, Navigation, EmptyState } from '@/components/shared'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  Upload,
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
  Camera,
  Shield,
  Car,
  CreditCard,
  Plus
} from 'lucide-react'
import type { WorkerDocument, DocumentType, VerificationStatus } from '@/types'

// Mock documents
const mockDocuments: WorkerDocument[] = [
  {
    id: '1',
    type: 'passport',
    imageUrl: undefined,
    uploadDate: new Date(Date.now() - 86400000 * 30),
    verificationStatus: 'verified',
    verifiedAt: new Date(Date.now() - 86400000 * 28),
  },
  {
    id: '2',
    type: 'work_permit',
    imageUrl: undefined,
    uploadDate: new Date(Date.now() - 86400000 * 15),
    verificationStatus: 'pending',
  },
]

const documentTypes: { type: DocumentType; icon: React.ReactNode; label: string; description: string }[] = [
  {
    type: 'passport',
    icon: <CreditCard className="w-6 h-6" />,
    label: 'ID / Passport',
    description: 'Valid government-issued ID',
  },
  {
    type: 'work_permit',
    icon: <FileText className="w-6 h-6" />,
    label: 'Work Permit',
    description: 'If applicable for your status',
  },
  {
    type: 'driver_license',
    icon: <Car className="w-6 h-6" />,
    label: "Driver's License",
    description: 'Required for driving jobs',
  },
  {
    type: 'other',
    icon: <Shield className="w-6 h-6" />,
    label: 'Certifications',
    description: 'Professional certificates',
  },
]

const statusConfig: Record<VerificationStatus, {
  label: string
  color: string
  bgColor: string
  icon: React.ReactNode
}> = {
  verified: {
    label: 'Verified',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: <Check className="w-4 h-4" />,
  },
  pending: {
    label: 'Pending',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: <Clock className="w-4 h-4" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-danger',
    bgColor: 'bg-danger/10',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  unverified: {
    label: 'Not uploaded',
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100',
    icon: <Upload className="w-4 h-4" />,
  },
}

export default function DocumentsPage() {
  const { language, isRTL } = useUI()
  const [documents, setDocuments] = useState<WorkerDocument[]>(mockDocuments)

  const getDocumentByType = (type: DocumentType) =>
    documents.find(d => d.type === type)

  const handleUpload = (type: DocumentType) => {
    // Open file picker - mock implementation
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.pdf'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Mock upload
        const newDoc: WorkerDocument = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          uploadDate: new Date(),
          verificationStatus: 'pending',
        }
        setDocuments(prev => [...prev.filter(d => d.type !== type), newDoc])
      }
    }
    input.click()
  }

  return (
    <div
      className="min-h-screen bg-neutral-50 pb-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Header
        title={t('profile.documents', language as any)}
        showBack
      />

      <main className="px-4 py-4 space-y-6">
        {/* Info card */}
        <Card variant="accent" className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-brand-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-neutral-900">
              {t('worker.verified', language as any)}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Verified profiles get more job offers and higher trust from employers.
            </p>
          </div>
        </Card>

        {/* Document types */}
        <section className="space-y-3">
          {documentTypes.map((docType) => {
            const existingDoc = getDocumentByType(docType.type)
            const status = existingDoc?.verificationStatus || 'unverified'
            const statusInfo = statusConfig[status]

            return (
              <motion.div
                key={docType.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  interactive={!existingDoc}
                  onClick={() => !existingDoc && handleUpload(docType.type)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      existingDoc
                        ? statusInfo.bgColor
                        : 'bg-neutral-100'
                    )}>
                      <span className={existingDoc ? statusInfo.color : 'text-neutral-400'}>
                        {docType.icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-900">
                          {docType.label}
                        </h3>
                        {existingDoc && (
                          <Badge
                            variant={status === 'verified' ? 'success' : status === 'pending' ? 'warning' : 'danger'}
                            size="sm"
                          >
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {docType.description}
                      </p>
                      {existingDoc && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Uploaded {new Date(existingDoc.uploadDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {existingDoc ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpload(docType.type)
                        }}
                      >
                        Replace
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-brand-primary">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm font-medium">Upload</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </section>

        {/* Verification status summary */}
        <Card>
          <h3 className="font-semibold text-neutral-900 mb-3">
            Verification Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Documents verified</span>
              <span className="font-medium">
                {documents.filter(d => d.verificationStatus === 'verified').length} / {documentTypes.length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Pending review</span>
              <span className="font-medium text-warning">
                {documents.filter(d => d.verificationStatus === 'pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-600">Verification level</span>
              <Badge
                variant={
                  documents.filter(d => d.verificationStatus === 'verified').length >= 2
                    ? 'success'
                    : 'warning'
                }
              >
                {documents.filter(d => d.verificationStatus === 'verified').length >= 2
                  ? 'Fully verified'
                  : 'Partial'
                }
              </Badge>
            </div>
          </div>
        </Card>
      </main>

      <Navigation />
    </div>
  )
}
