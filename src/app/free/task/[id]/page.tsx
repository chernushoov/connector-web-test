'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI, useConnectorStore, useFreeWorld, useAuth } from '@/store'
import { useAuthGate, useTelemetry } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input, TextArea } from '@/components/ui/Input'
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Star,
  MessageCircle,
  Send,
  Check,
  X,
  Loader2,
  Briefcase,
  DollarSign,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react'
import type { QuickTaskDB, Offer } from '@/types'

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const { isRTL } = useUI()
  const { isAuthenticated, userId } = useAuth()
  const {
    loadTaskById,
    loadOffersForTask,
    sendOffer,
    acceptOffer,
    rejectOffer,
    completeTask,
    createChatThread,
  } = useConnectorStore()
  const { currentTask } = useFreeWorld()
  const { requireAuth } = useAuthGate()
  const { trackTaskView } = useTelemetry()

  const [task, setTask] = useState<QuickTaskDB | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOffers, setIsLoadingOffers] = useState(false)

  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [isSendingOffer, setIsSendingOffer] = useState(false)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewTags, setReviewTags] = useState<string[]>([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const [isCreatingChat, setIsCreatingChat] = useState(false)

  const isCreator = task?.creatorId === userId
  const isExecutor = task?.assignedExecutorId === userId
  const canMakeOffer = !isCreator && task?.status === 'OPEN' && !offers.some(o => o.bidderId === userId)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const loadedTask = await loadTaskById(taskId)
      setTask(loadedTask)
      if (loadedTask) {
        trackTaskView(taskId)
        if (isAuthenticated) {
          setIsLoadingOffers(true)
          const loadedOffers = await loadOffersForTask(taskId)
          setOffers(loadedOffers)
          setIsLoadingOffers(false)
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [taskId, loadTaskById, loadOffersForTask, isAuthenticated, trackTaskView])

  const handleSendOffer = useCallback(async () => {
    if (!offerPrice) return
    setIsSendingOffer(true)
    const offer = await sendOffer({ taskId, message: offerMessage || undefined, proposedPrice: parseFloat(offerPrice) })
    if (offer) {
      setOffers((prev) => [offer, ...prev])
      setShowOfferModal(false)
      setOfferPrice('')
      setOfferMessage('')
    }
    setIsSendingOffer(false)
  }, [taskId, offerPrice, offerMessage, sendOffer])

  const handleAcceptOffer = useCallback(async (offerId: string) => {
    await acceptOffer(offerId)
    const loadedTask = await loadTaskById(taskId)
    setTask(loadedTask)
    const loadedOffers = await loadOffersForTask(taskId)
    setOffers(loadedOffers)
  }, [acceptOffer, loadTaskById, loadOffersForTask, taskId])

  const handleRejectOffer = useCallback(async (offerId: string) => {
    await rejectOffer(offerId)
    setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'REJECTED' } : o)))
  }, [rejectOffer])

  const handleCompleteTask = useCallback(async () => {
    await completeTask(taskId)
    const loadedTask = await loadTaskById(taskId)
    setTask(loadedTask)
    setShowReviewModal(true)
  }, [completeTask, loadTaskById, taskId])

  const handleWriteToCreator = useCallback(async () => {
    if (!task?.creatorId) return
    setIsCreatingChat(true)
    const thread = await createChatThread(taskId, task.creatorId)
    setIsCreatingChat(false)
    if (thread) router.push(`/free/chat/${thread.id}`)
  }, [task?.creatorId, taskId, createChatThread, router])

  const handleSubmitReview = useCallback(async () => {
    if (!task?.assignedExecutorId) return
    setIsSubmittingReview(true)
    try {
      const res = await fetch('/api/free/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
        body: JSON.stringify({ taskId, toUserId: task.assignedExecutorId, rating: reviewRating, tags: reviewTags, text: reviewText || undefined }),
      })
      if (res.ok) { setShowReviewModal(false); setReviewRating(5); setReviewText(''); setReviewTags([]) }
    } catch (error) { console.error('Failed to submit review:', error) }
    finally { setIsSubmittingReview(false) }
  }, [task, taskId, userId, reviewRating, reviewTags, reviewText])

  const formatBudget = (t: QuickTaskDB) => {
    if (t.budgetType === 'NEGOTIABLE') return 'Negotiable'
    if (t.budgetType === 'RANGE' && t.budgetMin && t.budgetMax) return `₪${t.budgetMin} - ${t.budgetMax}`
    if (t.budgetMin) return `₪${t.budgetMin}`
    return 'Not specified'
  }

  const formatSchedule = (t: QuickTaskDB) => {
    switch (t.schedule) {
      case 'NOW': return 'Now'
      case 'TODAY': return 'Today'
      case 'TOMORROW': return 'Tomorrow'
      case 'SCHEDULED': return t.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }) : 'Scheduled'
      default: return ''
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Open</span>
      case 'ASSIGNED': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">In Progress</span>
      case 'COMPLETED': return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Completed</span>
      case 'CANCELLED': return <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">Cancelled</span>
      default: return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <Briefcase className="w-16 h-16 text-neutral-300 mb-4" />
        <h1 className="text-xl font-semibold text-neutral-800 mb-2">Task not found</h1>
        <p className="text-neutral-500 mb-4">It may have been deleted or cancelled</p>
        <Button onClick={() => router.push('/free')}>Back to tasks</Button>
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen bg-neutral-50')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-1"><ArrowLeft className="w-6 h-6" /></button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg truncate">{task.title}</h1>
            <div className="flex items-center gap-2">{getStatusBadge(task.status)}</div>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            {task.description && <p className="text-neutral-700">{task.description}</p>}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
              <div><p className="text-sm text-neutral-500">Address</p><p className="font-medium">{task.addressText}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
              <div><p className="text-sm text-neutral-500">When</p><p className="font-medium">{formatSchedule(task)}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-neutral-400 mt-0.5" />
              <div><p className="text-sm text-neutral-500">Budget</p><p className="font-semibold text-lg text-brand-primary">{formatBudget(task)}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full capitalize">{task.category}</span>
            </div>
            {task.photos && task.photos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-neutral-500 flex items-center gap-2"><ImageIcon className="w-4 h-4" />Photos</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {task.photos.map((photo, idx) => (
                    <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {task.creator && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center"><User className="w-6 h-6 text-brand-primary" /></div>
              <div className="flex-1">
                <p className="font-medium">{task.creator.name || 'User'}</p>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />{task.creator.rating?.toFixed(1) || '0.0'}
                  <span className="mx-1">·</span>{task.creator.reviewCount || 0} reviews
                </div>
              </div>
            </div>
          </Card>
        )}

        {isCreator && task.status === 'OPEN' && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Send className="w-5 h-5" />Offers ({offers.filter(o => o.status === 'PENDING').length})</h3>
            {isLoadingOffers ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>
            ) : offers.filter(o => o.status === 'PENDING').length === 0 ? (
              <p className="text-neutral-500 text-center py-4">No offers yet</p>
            ) : (
              <div className="space-y-3">
                {offers.filter(o => o.status === 'PENDING').map((offer) => (
                  <div key={offer.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-brand-primary" /></div>
                      <div className="flex-1">
                        <p className="font-medium">{offer.bidder?.name || 'User'}</p>
                        {offer.bidder && <div className="flex items-center gap-1 text-xs text-neutral-500"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{offer.bidder.rating?.toFixed(1)}</div>}
                      </div>
                      <span className="font-semibold text-brand-primary">₪{offer.proposedPrice}</span>
                    </div>
                    {offer.message && <p className="text-sm text-neutral-600 mb-3">{offer.message}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleAcceptOffer(offer.id)}><Check className="w-4 h-4 mr-1" />Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectOffer(offer.id)}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        {canMakeOffer && (
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={() => { requireAuth(() => setShowOfferModal(true), { action: 'send_offer' }) }}>
              <Send className="w-4 h-4 mr-2" />Make an Offer
            </Button>
            <Button variant="outline" onClick={() => { requireAuth(() => handleWriteToCreator(), { action: 'write_to_creator' }) }} disabled={isCreatingChat}>
              {isCreatingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            </Button>
          </div>
        )}
        {isCreator && task.status === 'ASSIGNED' && <Button variant="primary" className="w-full" onClick={handleCompleteTask}><Check className="w-4 h-4 mr-2" />Complete Task</Button>}
        {isExecutor && task.status === 'ASSIGNED' && <Button variant="outline" className="w-full" onClick={() => router.push(`/free/chat/${taskId}`)}><MessageCircle className="w-4 h-4 mr-2" />Open Chat</Button>}
        {task.status === 'COMPLETED' && (isCreator || isExecutor) && (
          <div className="text-center text-success font-medium flex items-center justify-center gap-2"><Check className="w-5 h-5" />Task Completed</div>
        )}
      </div>

      <Modal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} title="Send an Offer">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-neutral-700 mb-1">Your Price (₪) *</label><Input type="number" placeholder="Enter amount" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-neutral-700 mb-1">Message (optional)</label><TextArea placeholder="Describe why you're a good fit..." value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} rows={3} /></div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowOfferModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleSendOffer} disabled={!offerPrice || isSendingOffer}>
              {isSendingOffer ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Send</>}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Leave a Review">
        <div className="space-y-4">
          <div className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center"><Check className="w-8 h-8 text-success" /></div>
            <h3 className="font-semibold text-lg text-neutral-800">Task Completed!</h3>
            <p className="text-neutral-500 text-sm mt-1">Rate the executor&apos;s work</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2 text-center">Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1 transition-transform hover:scale-110">
                  <Star className={cn('w-8 h-8 transition-colors', star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300')} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">What did you like?</label>
            <div className="flex flex-wrap gap-2">
              {['Punctuality', 'Quality', 'Communication', 'Professionalism'].map((tag) => (
                <button key={tag} type="button" onClick={() => setReviewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={cn('px-3 py-1.5 rounded-full text-sm border transition-colors', reviewTags.includes(tag) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-primary')}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-neutral-700 mb-1">Comment (optional)</label><TextArea placeholder="Tell more about the executor's work..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} /></div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowReviewModal(false)}>Later</Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmitReview} disabled={isSubmittingReview}>
              {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Star className="w-4 h-4 mr-2" />Submit Review</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
