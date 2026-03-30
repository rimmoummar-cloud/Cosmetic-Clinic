-- ==========================
-- جدول التصنيفات Categories
-- ==========================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
       image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- جدول الخدمات Services
-- ==========================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2),
    duration_minutes INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE, -- إذا false ما تظهر بالويب
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- جدول العملاء Customers
-- ==========================
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- index على الهاتف والـ email للبحث السريع
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);

-- ==========================
-- جدول الحجز Bookings
-- ==========================
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL, -- لتحديد مدة الخدمة على حسب service
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- index لتحسين البحث عن الوقت والتاريخ
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, booking_time);

-- ==========================
-- جدول Working Hours لكل يوم
-- ==========================
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    day_of_week TEXT NOT NULL, -- Monday, Tuesday, ...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- جدول التواصل Contact / Messages
-- ==========================
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- جدول Emails المرسلة لتخزين كل الإيميلات
-- ==========================
CREATE TABLE sent_emails (
    id SERIAL PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,

  description TEXT,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  page_id UUID NOT NULL,

  name VARCHAR(100) NOT NULL,

  slug VARCHAR(100),

  section_order INTEGER DEFAULT 1,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_page
    FOREIGN KEY (page_id)
    REFERENCES pages(id)
    ON DELETE CASCADE
);

CREATE TABLE section_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  section_id UUID NOT NULL,

  content JSONB NOT NULL,

  version INTEGER DEFAULT 1,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_section
    FOREIGN KEY (section_id)
    REFERENCES sections(id)
    ON DELETE CASCADE
);