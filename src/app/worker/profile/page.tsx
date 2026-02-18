'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Edit2, Star, MapPin, Phone, Briefcase, DollarSign,
  Clock, TrendingUp, FileText, Image, Gift, Copy, Share2,
  Plus, CheckCircle2, AlertCircle, X, Loader2,
} from 'lucide-react'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { cn } from '@/lib/utils'

interface WorkerProfile {
  id: string; name: string; phone: string; avatarUrl: string | null;
  cityCode: string; specialization: string; rating: number;
  reviewsCount: number; isVerified: boolean; bio: string | null;
}
interface WorkerStats { totalEarned: number; totalHours: number; totalShifts: number; avgRating: number; }
interface WorkerDocument { id: string; type: string; status: 'pending' | 'approved' | 'rejected'; imageUrl: string; createdAt: string; }
interface PortfolioItem { id: string; imageUrl: string; caption: string; createdAt: string; }
interface ReferralInfo { code: string; totalReferrals: number; totalEarned: number; link: string; }

export default function WorkerProfilePage() {
  const { language, isRTL } = useUI()
  const [profile, setProfile] = useState<WorkerProfile | null>(null)
  const [stats, setStats] = useState<WorkerStats | null>(null)
  const [documents, setDocuments] = useState<WorkerDocument[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [referral, setReferral] = useState<ReferralInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDocForm, setShowDocForm] = useState(false)
  const [docType, setDocType] = useState('id_card')
  const [docImageUrl, setDocImageUrl] = useState('')
  const [submittingDoc, setSubmittingDoc] = useState(false)
  const [showPortfolioForm, setShowPortfolioForm] = useState(false)
  const [portfolioImageUrl, setPortfolioImageUrl] = useState('')
  const [portfolioCaption, setPortfolioCaption] = useState('')
  const [submittingPortfolio, setSubmittingPortfolio] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [profileRes, statsRes, docsRes, portfolioRes, referralRes] = await Promise.all([
          fetch('/api/worker/profile').then(r => r.json()),
          fetch('/api/worker/stats').then(r => r.json()),
          fetch('/api/worker/documents').then(r => r.json()),
          fetch('/api/worker/portfolio').then(r => r.json()),
          fetch('/api/worker/referral').then(r => r.json()),
        ])
        setProfile(profileRes.data || null)
        setStats(statsRes.data || null)
        setDocuments(docsRes.data || [])
        setPortfolio(portfolioRes.data || [])
        setReferral(referralRes.data || null)
      } catch (e) { console.error('Failed to load profile data:', e) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const handleAddDocument = async () => {
    if (!docImageUrl) return
    setSubmittingDoc(true)
    try {
      const res = await fetch('/api/worker/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: docType, imageUrl: docImageUrl }) })
      const json = await res.json()
      if (json.data) setDocuments(prev => [...prev, json.data])
      setShowDocForm(false); setDocImageUrl('')
    } catch (e) { console.error('Failed to add document:', e) }
    finally { setSubmittingDoc(false) }
  }

  const handleAddPortfolio = async () => {
    if (!portfolioImageUrl) return
    setSubmittingPortfolio(true)
    try {
      const res = await fetch('/api/worker/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: portfolioImageUrl, caption: portfolioCaption }) })
      const json = await res.json()
      if (json.data) setPortfolio(prev => [...prev, json.data])
      setShowPortfolioForm(false); setPortfolioImageUrl(''); setPortfolioCaption('')
    } catch (e) { console.error('Failed to add portfolio item:', e) }
    finally { setSubmittingPortfolio(false) }
  }

  const handleCopyReferralCode = async () => {
    if (!referral) return
    try { await navigator.clipboard.writeText(referral.code); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000) } catch {}
  }

  const handleShareReferral = async () => {
    if (!referral) return
    try { await navigator.share?.({ title: 'Connector', text: `Join Connector with my referral code: ${referral.code}`, url: referral.link }) } catch {}
  }

  if (loading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 animate-pulse"><div className="flex items-center gap-4"><div className="w-16 h-16 bg-neutral-200 rounded-full" /><div className="flex-1"><div className="h-5 bg-neutral-200 rounded w-1/2 mb-2" /><div className="h-4 bg-neutral-100 rounded w-3/4" /></div></div></div>
          <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-24" />)}</div>
        </div>
      </div>
    )
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50 pb-8">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-neutral-200 px-4 py-3">
        <h1 className="text-xl font-bold text-neutral-900">{t('profile.title', language)}</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {profile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
            <div className="flex items-start gap-4">
              <div className="relative">
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center"><User className="w-8 h-8 text-brand-primary" /></div>}
                {profile.isVerified && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><h2 className="text-lg font-bold text-neutral-900 truncate">{profile.name}</h2><button className="p-1 rounded-full hover:bg-neutral-100"><Edit2 className="w-4 h-4 text-neutral-400" /></button></div>
                <div className="flex items-center gap-1 mt-0.5 text-sm text-neutral-500"><Phone className="w-3.5 h-3.5" /><span>{profile.phone}</span></div>
                <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.cityCode}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{profile.specialization}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /><span className="font-semibold text-sm">{profile.rating.toFixed(1)}</span><span className="text-xs text-neutral-400">({profile.reviewsCount} reviews)</span></div>
              </div>
            </div>
            {profile.bio && <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{profile.bio}</p>}
          </motion.div>
        )}

        {stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3">
            <StatCard icon={<DollarSign className="w-5 h-5 text-green-600" />} label="Earned" value={`₪${stats.totalEarned.toLocaleString()}`} bg="bg-green-50" />
            <StatCard icon={<Clock className="w-5 h-5 text-blue-600" />} label="Hours" value={`${stats.totalHours}`} bg="bg-blue-50" />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-600" />} label="Shifts" value={`${stats.totalShifts}`} bg="bg-purple-50" />
            <StatCard icon={<Star className="w-5 h-5 text-amber-600" />} label="Rating" value={`${stats.avgRating.toFixed(1)}`} bg="bg-amber-50" />
          </motion.div>
        )}

        {/* Documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-brand-primary" /><h2 className="font-semibold text-neutral-900">Documents</h2></div>
            <button onClick={() => setShowDocForm(!showDocForm)} className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20">{showDocForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
          </div>
          {showDocForm && (
            <div className="mb-4 p-4 bg-neutral-50 rounded-xl space-y-3">
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-3 py-2.5 bg-white rounded-xl text-sm border border-neutral-200">
                <option value="id_card">ID Card</option><option value="passport">Passport</option><option value="work_permit">Work Permit</option><option value="certificate">Certificate</option><option value="other">Other</option>
              </select>
              <input type="text" value={docImageUrl} onChange={(e) => setDocImageUrl(e.target.value)} placeholder="Image URL" className="w-full px-3 py-2.5 bg-white rounded-xl text-sm border border-neutral-200" />
              <button onClick={handleAddDocument} disabled={!docImageUrl || submittingDoc} className="w-full py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {submittingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          )}
          {documents.length === 0 ? <p className="text-sm text-neutral-400 text-center py-4">No documents uploaded</p> : (
            <div className="space-y-2">{documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-neutral-400" /><div><p className="text-sm font-medium capitalize">{doc.type.replace(/_/g, ' ')}</p><p className="text-xs text-neutral-400">{doc.createdAt}</p></div></div>
                <DocumentStatusBadge status={doc.status} />
              </div>
            ))}</div>
          )}
        </motion.div>

        {/* Portfolio */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Image className="w-5 h-5 text-brand-primary" /><h2 className="font-semibold text-neutral-900">Portfolio</h2></div>
            <button onClick={() => setShowPortfolioForm(!showPortfolioForm)} className="p-1.5 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20">{showPortfolioForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button>
          </div>
          {showPortfolioForm && (
            <div className="mb-4 p-4 bg-neutral-50 rounded-xl space-y-3">
              <input type="text" value={portfolioImageUrl} onChange={(e) => setPortfolioImageUrl(e.target.value)} placeholder="Image URL" className="w-full px-3 py-2.5 bg-white rounded-xl text-sm border border-neutral-200" />
              <input type="text" value={portfolioCaption} onChange={(e) => setPortfolioCaption(e.target.value)} placeholder="Caption (optional)" className="w-full px-3 py-2.5 bg-white rounded-xl text-sm border border-neutral-200" />
              <button onClick={handleAddPortfolio} disabled={!portfolioImageUrl || submittingPortfolio} className="w-full py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {submittingPortfolio ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </button>
            </div>
          )}
          {portfolio.length === 0 ? <p className="text-sm text-neutral-400 text-center py-4">No portfolio items</p> : (
            <div className="grid grid-cols-2 gap-3">{portfolio.map(item => (
              <div key={item.id} className="rounded-xl overflow-hidden border border-neutral-100">
                <img src={item.imageUrl} alt={item.caption} className="w-full h-32 object-cover" />
                {item.caption && <p className="px-2.5 py-2 text-xs text-neutral-600 truncate">{item.caption}</p>}
              </div>
            ))}</div>
          )}
        </motion.div>

        {/* Referral */}
        {referral && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 rounded-2xl p-5 border border-brand-primary/20">
            <div className="flex items-center gap-2 mb-3"><Gift className="w-5 h-5 text-brand-primary" /><h2 className="font-semibold text-neutral-900">Referral Program</h2></div>
            <p className="text-sm text-neutral-600 mb-4">Share your code and earn bonuses for each friend who joins.</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-white rounded-xl px-4 py-3 text-center font-mono text-lg font-bold text-brand-primary tracking-wider border border-brand-primary/20">{referral.code}</div>
              <button onClick={handleCopyReferralCode} className="p-3 bg-white rounded-xl border border-brand-primary/20 hover:bg-brand-primary/5"><Copy className={cn('w-5 h-5', codeCopied ? 'text-green-500' : 'text-brand-primary')} /></button>
              <button onClick={handleShareReferral} className="p-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90"><Share2 className="w-5 h-5" /></button>
            </div>
            {codeCopied && <p className="text-xs text-green-600 text-center mb-3">Copied!</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-brand-primary">{referral.totalReferrals}</p><p className="text-xs text-neutral-500">Referrals</p></div>
              <div className="bg-white/70 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-600">₪{referral.totalEarned}</p><p className="text-xs text-neutral-500">Earned</p></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return <div className={cn('rounded-2xl p-4', bg)}><div className="flex items-center gap-2 mb-2">{icon}</div><div className="text-2xl font-bold text-neutral-900">{value}</div><div className="text-xs text-neutral-500 mt-0.5">{label}</div></div>
}

function DocumentStatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const config = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock className="w-3 h-3" />, label: 'Pending' },
    approved: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Approved' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle className="w-3 h-3" />, label: 'Rejected' },
  }
  const c = config[status]
  return <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1', c.bg, c.text)}>{c.icon}{c.label}</span>
}
