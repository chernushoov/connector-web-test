-- ============================================
-- CONNECTOR 2.0 - Initial Database Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- ============================================
-- PROFILES (базовые данные пользователей)
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    language VARCHAR(5) DEFAULT 'ru' CHECK (language IN ('ru', 'he', 'en', 'ar')),
    is_verified BOOLEAN DEFAULT false,
    verification_status VARCHAR(20) DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    current_mode VARCHAR(20) DEFAULT 'free-world'
        CHECK (current_mode IN ('free-world', 'worker', 'employer')),
    referral_code VARCHAR(10) UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKER PROFILES (профили работников)
-- ============================================

CREATE TABLE public.worker_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    age INTEGER,
    city VARCHAR(100),
    specialization VARCHAR(100),
    experience INTEGER DEFAULT 0,
    about TEXT,
    has_car BOOLEAN DEFAULT false,
    has_tools BOOLEAN DEFAULT false,
    team_size INTEGER DEFAULT 0,
    min_rate INTEGER DEFAULT 35,
    max_rate INTEGER DEFAULT 100,
    availability VARCHAR(20) DEFAULT 'flexible'
        CHECK (availability IN ('now', 'today', 'tomorrow', 'flexible')),
    availability_status VARCHAR(20) DEFAULT 'offline'
        CHECK (availability_status IN ('available', 'busy', 'offline')),
    available_until TIMESTAMPTZ,
    -- Stats
    completed_shifts INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_hours INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    reliability_score INTEGER DEFAULT 100,
    response_time INTEGER DEFAULT 60,
    on_time_rate DECIMAL(3,2) DEFAULT 1.00,
    -- Pro status
    is_pro BOOLEAN DEFAULT false,
    pro_expires_at TIMESTAMPTZ,
    -- Location
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    location_address TEXT,
    -- Stripe
    stripe_account_id VARCHAR(100),
    -- Search
    skills TEXT[],
    languages TEXT[] DEFAULT ARRAY['ru'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYER PROFILES (профили работодателей)
-- ============================================

CREATE TABLE public.employer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    city VARCHAR(100),
    industry VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    plan_expires_at TIMESTAMPTZ,
    -- Stats
    shifts_posted INTEGER DEFAULT 0,
    shifts_completed INTEGER DEFAULT 0,
    total_paid INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    -- Stripe
    stripe_customer_id VARCHAR(100),
    stripe_account_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKER DOCUMENTS (документы)
-- ============================================

CREATE TABLE public.worker_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('passport', 'work_permit', 'driver_license', 'other')),
    image_url TEXT NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    rejection_reason TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PORTFOLIO ITEMS (портфолио)
-- ============================================

CREATE TABLE public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN USERS (администраторы)
-- ============================================

CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin', 'moderator', 'support')),
    permissions TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- ============================================
-- SHIFTS (смены/вакансии)
-- ============================================

CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Basic info
    title VARCHAR(200) NOT NULL,
    description TEXT,
    -- Location
    city VARCHAR(100) NOT NULL,
    address TEXT,
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    -- Time
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    urgency VARCHAR(20) DEFAULT 'scheduled'
        CHECK (urgency IN ('instant', 'today', 'scheduled')),
    -- Money
    base_rate INTEGER NOT NULL,
    surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
    total_estimate INTEGER,
    payment_guarantee BOOLEAN DEFAULT false,
    -- Capacity
    slots INTEGER DEFAULT 1,
    filled INTEGER DEFAULT 0,
    -- Requirements
    needs_car BOOLEAN DEFAULT false,
    needs_tools BOOLEAN DEFAULT false,
    needs_team INTEGER DEFAULT 0,
    min_experience INTEGER DEFAULT 0,
    min_rating DECIMAL(2,1) DEFAULT 0,
    required_skills TEXT[],
    specialization VARCHAR(100),
    -- Status
    status VARCHAR(20) DEFAULT 'open'
        CHECK (status IN ('pending', 'open', 'matched', 'in_progress', 'completed', 'cancelled', 'rejected')),
    is_instant BOOLEAN DEFAULT false,
    accepts_teams BOOLEAN DEFAULT false,
    has_escrow BOOLEAN DEFAULT true,
    -- Moderation
    moderated_at TIMESTAMPTZ,
    moderated_by UUID REFERENCES public.admin_users(id),
    rejection_reason TEXT,
    -- Stats
    view_count INTEGER DEFAULT 0,
    applicant_count INTEGER DEFAULT 0,
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ============================================
-- TASK FLOWS (жизненный цикл заявки)
-- ============================================

CREATE TABLE public.task_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Status
    status VARCHAR(30) DEFAULT 'applied' CHECK (status IN (
        'applied', 'reviewing', 'approved', 'rejected',
        'upcoming', 'in_progress', 'completed',
        'awaiting_review', 'reviewed',
        'payment_pending', 'paid', 'cancelled', 'disputed'
    )),
    -- Timeline
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    -- Payment
    agreed_rate INTEGER NOT NULL,
    hours_worked DECIMAL(4,2),
    total_amount INTEGER,
    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'processing', 'escrowed', 'released', 'disputed', 'failed')),
    -- Messaging
    application_message TEXT,
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shift_id, worker_id)
);

-- ============================================
-- REVIEWS (отзывы)
-- ============================================

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_flow_id UUID REFERENCES public.task_flows(id),
    shift_id UUID REFERENCES public.shifts(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('worker', 'employer')),
    -- Moderation
    is_hidden BOOLEAN DEFAULT false,
    hidden_reason TEXT,
    hidden_by UUID REFERENCES public.admin_users(id),
    report_count INTEGER DEFAULT 0,
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ESCROW TRANSACTIONS (эскроу платежи)
-- ============================================

CREATE TABLE public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_flow_id UUID NOT NULL REFERENCES public.task_flows(id),
    shift_id UUID NOT NULL REFERENCES public.shifts(id),
    worker_id UUID NOT NULL REFERENCES public.profiles(id),
    employer_id UUID NOT NULL REFERENCES public.profiles(id),
    -- Amounts
    amount INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    worker_payout INTEGER NOT NULL,
    -- Status
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'escrowed', 'released', 'refunded', 'disputed')),
    -- Stripe
    stripe_payment_intent_id VARCHAR(100),
    stripe_transfer_id VARCHAR(100),
    -- Timeline
    created_at TIMESTAMPTZ DEFAULT NOW(),
    escrowed_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT
);

-- ============================================
-- SUBSCRIPTIONS (подписки)
-- ============================================

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('pro', 'business')),
    is_active BOOLEAN DEFAULT true,
    stripe_subscription_id VARCHAR(100),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DISPUTES (споры)
-- ============================================

CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_flow_id UUID NOT NULL REFERENCES public.task_flows(id),
    shift_id UUID NOT NULL REFERENCES public.shifts(id),
    initiator_id UUID NOT NULL REFERENCES public.profiles(id),
    respondent_id UUID NOT NULL REFERENCES public.profiles(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('payment', 'quality', 'no_show', 'harassment', 'other')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'escalated')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    description TEXT NOT NULL,
    evidence TEXT[],
    -- Resolution
    resolution_outcome VARCHAR(30) CHECK (resolution_outcome IN ('initiator_favor', 'respondent_favor', 'split', 'dismissed')),
    resolution_description TEXT,
    refund_amount INTEGER,
    resolved_by UUID REFERENCES public.admin_users(id),
    resolved_at TIMESTAMPTZ,
    -- Assignment
    assigned_to UUID REFERENCES public.admin_users(id),
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_role VARCHAR(20) NOT NULL CHECK (author_role IN ('worker', 'employer', 'admin')),
    content TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS (уведомления)
-- ============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'match', 'application', 'approval', 'rejection',
        'shift_start', 'shift_completed', 'payment', 'review',
        'urgent', 'promo', 'system'
    )),
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT (чат)
-- ============================================

CREATE TABLE public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES public.shifts(id),
    task_flow_id UUID REFERENCES public.task_flows(id),
    worker_id UUID NOT NULL REFERENCES public.profiles(id),
    employer_id UUID NOT NULL REFERENCES public.profiles(id),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REFERRALS (рефералы)
-- ============================================

CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id),
    referred_id UUID NOT NULL REFERENCES public.profiles(id),
    bonus_earned INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG (лог действий)
-- ============================================

CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.admin_users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Worker profiles
CREATE INDEX idx_worker_profiles_city ON public.worker_profiles(city);
CREATE INDEX idx_worker_profiles_skills ON public.worker_profiles USING GIN(skills);
CREATE INDEX idx_worker_profiles_availability ON public.worker_profiles(availability_status);

-- Shifts
CREATE INDEX idx_shifts_status ON public.shifts(status);
CREATE INDEX idx_shifts_city ON public.shifts(city);
CREATE INDEX idx_shifts_date ON public.shifts(date);
CREATE INDEX idx_shifts_employer ON public.shifts(employer_id);
CREATE INDEX idx_shifts_urgency ON public.shifts(urgency);
CREATE INDEX idx_shifts_skills ON public.shifts USING GIN(required_skills);

-- Task flows
CREATE INDEX idx_task_flows_shift ON public.task_flows(shift_id);
CREATE INDEX idx_task_flows_worker ON public.task_flows(worker_id);
CREATE INDEX idx_task_flows_status ON public.task_flows(status);

-- Notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Chat
CREATE INDEX idx_chat_rooms_worker ON public.chat_rooms(worker_id);
CREATE INDEX idx_chat_rooms_employer ON public.chat_rooms(employer_id);
CREATE INDEX idx_chat_messages_room ON public.chat_messages(room_id);

-- Reviews
CREATE INDEX idx_reviews_target ON public.reviews(target_id);
CREATE INDEX idx_reviews_author ON public.reviews(author_id);

-- Disputes
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_initiator ON public.disputes(initiator_id);
