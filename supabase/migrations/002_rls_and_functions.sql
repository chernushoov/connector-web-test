-- ============================================
-- CONNECTOR 2.0 - RLS Policies & Functions
-- ============================================

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- WORKER PROFILES POLICIES
-- ============================================

CREATE POLICY "Worker profiles are viewable by everyone"
    ON public.worker_profiles FOR SELECT
    USING (true);

CREATE POLICY "Workers can insert own profile"
    ON public.worker_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Workers can update own profile"
    ON public.worker_profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- EMPLOYER PROFILES POLICIES
-- ============================================

CREATE POLICY "Employer profiles are viewable by everyone"
    ON public.employer_profiles FOR SELECT
    USING (true);

CREATE POLICY "Employers can insert own profile"
    ON public.employer_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Employers can update own profile"
    ON public.employer_profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- WORKER DOCUMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view own documents"
    ON public.worker_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
    ON public.worker_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON public.worker_documents FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- PORTFOLIO POLICIES
-- ============================================

CREATE POLICY "Portfolio items are viewable by everyone"
    ON public.portfolio_items FOR SELECT
    USING (true);

CREATE POLICY "Users can manage own portfolio"
    ON public.portfolio_items FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- SHIFTS POLICIES
-- ============================================

CREATE POLICY "Open shifts are viewable by everyone"
    ON public.shifts FOR SELECT
    USING (status IN ('open', 'matched', 'in_progress', 'completed') OR employer_id = auth.uid());

CREATE POLICY "Employers can create shifts"
    ON public.shifts FOR INSERT
    WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can update own shifts"
    ON public.shifts FOR UPDATE
    USING (employer_id = auth.uid());

CREATE POLICY "Employers can delete own shifts"
    ON public.shifts FOR DELETE
    USING (employer_id = auth.uid() AND status IN ('pending', 'open'));

-- ============================================
-- TASK FLOWS POLICIES
-- ============================================

CREATE POLICY "Users see relevant task flows"
    ON public.task_flows FOR SELECT
    USING (
        worker_id = auth.uid() OR
        shift_id IN (SELECT id FROM public.shifts WHERE employer_id = auth.uid())
    );

CREATE POLICY "Workers can apply to shifts"
    ON public.task_flows FOR INSERT
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Participants can update task flows"
    ON public.task_flows FOR UPDATE
    USING (
        worker_id = auth.uid() OR
        shift_id IN (SELECT id FROM public.shifts WHERE employer_id = auth.uid())
    );

-- ============================================
-- REVIEWS POLICIES
-- ============================================

CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (NOT is_hidden);

CREATE POLICY "Users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete own reviews"
    ON public.reviews FOR DELETE
    USING (author_id = auth.uid());

-- ============================================
-- ESCROW POLICIES
-- ============================================

CREATE POLICY "Participants can view escrow"
    ON public.escrow_transactions FOR SELECT
    USING (worker_id = auth.uid() OR employer_id = auth.uid());

CREATE POLICY "Employers can create escrow"
    ON public.escrow_transactions FOR INSERT
    WITH CHECK (employer_id = auth.uid());

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- DISPUTES POLICIES
-- ============================================

CREATE POLICY "Participants can view disputes"
    ON public.disputes FOR SELECT
    USING (initiator_id = auth.uid() OR respondent_id = auth.uid());

CREATE POLICY "Users can create disputes"
    ON public.disputes FOR INSERT
    WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Participants can view dispute messages"
    ON public.dispute_messages FOR SELECT
    USING (
        dispute_id IN (
            SELECT id FROM public.disputes
            WHERE initiator_id = auth.uid() OR respondent_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send dispute messages"
    ON public.dispute_messages FOR INSERT
    WITH CHECK (
        dispute_id IN (
            SELECT id FROM public.disputes
            WHERE initiator_id = auth.uid() OR respondent_id = auth.uid()
        )
    );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users see own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- CHAT POLICIES
-- ============================================

CREATE POLICY "Chat room participants only"
    ON public.chat_rooms FOR SELECT
    USING (worker_id = auth.uid() OR employer_id = auth.uid());

CREATE POLICY "Participants can create chat rooms"
    ON public.chat_rooms FOR INSERT
    WITH CHECK (worker_id = auth.uid() OR employer_id = auth.uid());

CREATE POLICY "Chat message participants only"
    ON public.chat_messages FOR SELECT
    USING (
        room_id IN (
            SELECT id FROM public.chat_rooms
            WHERE worker_id = auth.uid() OR employer_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        room_id IN (
            SELECT id FROM public.chat_rooms
            WHERE worker_id = auth.uid() OR employer_id = auth.uid()
        )
    );

-- ============================================
-- REFERRALS POLICIES
-- ============================================

CREATE POLICY "Users can view own referrals"
    ON public.referrals FOR SELECT
    USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Geo-distance search function
CREATE OR REPLACE FUNCTION find_shifts_nearby(
    p_lat DECIMAL,
    p_lng DECIMAL,
    p_radius_km INTEGER DEFAULT 50,
    p_limit INTEGER DEFAULT 20
)
RETURNS SETOF public.shifts AS $$
BEGIN
    RETURN QUERY
    SELECT s.*
    FROM public.shifts s
    WHERE s.status = 'open'
      AND s.location_lat IS NOT NULL
      AND s.location_lng IS NOT NULL
      AND earth_distance(
          ll_to_earth(s.location_lat, s.location_lng),
          ll_to_earth(p_lat, p_lng)
      ) / 1000 <= p_radius_km
    ORDER BY earth_distance(
        ll_to_earth(s.location_lat, s.location_lng),
        ll_to_earth(p_lat, p_lng)
    )
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code VARCHAR(10) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_worker_profiles_updated_at
BEFORE UPDATE ON public.worker_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_employer_profiles_updated_at
BEFORE UPDATE ON public.employer_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_shifts_updated_at
BEFORE UPDATE ON public.shifts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_task_flows_updated_at
BEFORE UPDATE ON public.task_flows
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update worker stats after shift completion
CREATE OR REPLACE FUNCTION update_worker_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        UPDATE public.worker_profiles
        SET
            completed_shifts = completed_shifts + 1,
            total_earned = total_earned + COALESCE(NEW.total_amount, 0),
            total_hours = total_hours + COALESCE(NEW.hours_worked, 0),
            updated_at = NOW()
        WHERE id = NEW.worker_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_worker_stats
AFTER UPDATE ON public.task_flows
FOR EACH ROW EXECUTE FUNCTION update_worker_stats();

-- Update employer stats after shift completion
CREATE OR REPLACE FUNCTION update_employer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        UPDATE public.employer_profiles
        SET
            shifts_completed = shifts_completed + 1,
            total_paid = total_paid + COALESCE(NEW.total_amount, 0),
            updated_at = NOW()
        WHERE id IN (SELECT employer_id FROM public.shifts WHERE id = NEW.shift_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_employer_stats
AFTER UPDATE ON public.task_flows
FOR EACH ROW EXECUTE FUNCTION update_employer_stats();

-- Update review stats
CREATE OR REPLACE FUNCTION update_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target_type = 'worker' THEN
        UPDATE public.worker_profiles
        SET
            rating = (
                SELECT COALESCE(AVG(rating), 0)::DECIMAL(2,1)
                FROM public.reviews
                WHERE target_id = NEW.target_id AND NOT is_hidden
            ),
            review_count = (
                SELECT COUNT(*)
                FROM public.reviews
                WHERE target_id = NEW.target_id AND NOT is_hidden
            )
        WHERE id = NEW.target_id;
    ELSE
        UPDATE public.employer_profiles
        SET
            rating = (
                SELECT COALESCE(AVG(rating), 0)::DECIMAL(2,1)
                FROM public.reviews
                WHERE target_id = NEW.target_id AND NOT is_hidden
            ),
            review_count = (
                SELECT COUNT(*)
                FROM public.reviews
                WHERE target_id = NEW.target_id AND NOT is_hidden
            )
        WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_stats
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_review_stats();

-- Increment employer shifts count
CREATE OR REPLACE FUNCTION increment_employer_shifts(p_employer_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.employer_profiles
    SET shifts_posted = shifts_posted + 1
    WHERE id = p_employer_id;
END;
$$ LANGUAGE plpgsql;

-- Update shift applicant count
CREATE OR REPLACE FUNCTION update_shift_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.shifts
        SET applicant_count = applicant_count + 1
        WHERE id = NEW.shift_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.shifts
        SET applicant_count = applicant_count - 1
        WHERE id = OLD.shift_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shift_applicant_count
AFTER INSERT OR DELETE ON public.task_flows
FOR EACH ROW EXECUTE FUNCTION update_shift_applicant_count();

-- Update chat room last message time
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_rooms
    SET last_message_at = NOW()
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_room_last_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();
