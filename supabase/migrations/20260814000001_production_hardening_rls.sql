-- ============================================================================
-- Gaon2City — Phase 10 Production Hardening & RLS Policies Migration
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Core Tables Definitions & Schema Verification

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    village TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    postal_code TEXT,
    seller_type TEXT DEFAULT 'individual' CHECK (seller_type IN ('farmer', 'artisan', 'trader', 'individual', 'admin')),
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'used', 'refurbished')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'deleted')),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    location GEOGRAPHY(POINT, 4326),
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('pickup', 'delivery')),
    pickup_location TEXT,
    delivery_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_order_id TEXT,
    provider_payment_id TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    image_path TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. Indexes for Production Performance
-- ============================================================================

-- PostGIS Spatial Index for Hyperlocal Nearby Queries
CREATE INDEX IF NOT EXISTS idx_products_location ON public.products USING GIST (location);

-- B-Tree Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ============================================================================
-- 4. Automatic updated_at Trigger Function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_profiles_updated_at') THEN
        CREATE TRIGGER set_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_products_updated_at') THEN
        CREATE TRIGGER set_products_updated_at
        BEFORE UPDATE ON public.products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_orders_updated_at') THEN
        CREATE TRIGGER set_orders_updated_at
        BEFORE UPDATE ON public.orders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 5.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5.2 Categories Policies
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- 5.3 Products Policies
CREATE POLICY "Active products are viewable by everyone" 
ON public.products FOR SELECT USING (status != 'deleted');

CREATE POLICY "Authenticated users can create products" 
ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products" 
ON public.products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own products" 
ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- 5.4 Product Images Policies
CREATE POLICY "Product images are viewable by everyone" 
ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Sellers can manage images of their products" 
ON public.product_images FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.products
        WHERE products.id = product_images.product_id
        AND products.seller_id = auth.uid()
    )
);

-- 5.5 Orders Policies
CREATE POLICY "Users can view their own orders as buyer or seller" 
ON public.orders FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);

CREATE POLICY "Buyers can insert orders" 
ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers and sellers can update their relevant orders" 
ON public.orders FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- 5.6 Order Items Policies
CREATE POLICY "Users can view items for their own orders" 
ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
);

CREATE POLICY "Buyers can insert order items" 
ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.buyer_id = auth.uid()
    )
);

-- 5.7 Conversations Policies
CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);

CREATE POLICY "Users can create conversations they participate in" 
ON public.conversations FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- 5.8 Messages Policies
CREATE POLICY "Participants can view conversation messages" 
ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations
        WHERE conversations.id = messages.conversation_id
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
);

CREATE POLICY "Participants can insert messages" 
ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations
        WHERE conversations.id = messages.conversation_id
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
);

-- 5.9 Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated buyers can create reviews" 
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own reviews" 
ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- 5.10 Favorites Policies
CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- 5.11 Reports Policies
CREATE POLICY "Reporters can view their own reports" 
ON public.reports FOR SELECT USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.seller_type = 'admin')
);

CREATE POLICY "Authenticated users can submit reports" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
