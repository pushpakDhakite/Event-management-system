const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'plmqaz@1234',
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS event_management');
  await connection.query('USE event_management');
  console.log('Database created/verified');
  return connection;
}

async function createTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'organizer', 'vendor', 'user') DEFAULT 'user',
      phone VARCHAR(20),
      avatar VARCHAR(255),
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      business_name VARCHAR(255),
      description TEXT,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      zip_code VARCHAR(20),
      country VARCHAR(100),
      category_id INT,
      website VARCHAR(255),
      rating DECIMAL(2, 1) DEFAULT 0.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_category (category_id),
      INDEX idx_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      event_type VARCHAR(100),
      event_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      venue VARCHAR(255),
      category_id INT,
      guest_count INT,
      budget DECIMAL(10, 2),
      status ENUM('draft', 'planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'draft',
      organizer_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_organizer (organizer_id),
      INDEX idx_status (status),
      INDEX idx_event_date (event_date),
      INDEX idx_category (category_id),
      INDEX idx_event_type (event_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category_id INT,
      vendor_id INT NOT NULL,
      price DECIMAL(10, 2),
      duration_minutes INT,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_vendor (vendor_id),
      INDEX idx_category (category_id),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      service_id INT NOT NULL,
      vendor_id INT NOT NULL,
      user_id INT NOT NULL,
      booking_date DATE,
      start_time TIME,
      end_time TIME,
      quantity INT DEFAULT 1,
      total_price DECIMAL(10, 2),
      notes TEXT,
      status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_event (event_id),
      INDEX idx_service (service_id),
      INDEX idx_vendor (vendor_id),
      INDEX idx_user (user_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      rsvp_status ENUM('pending', 'accepted', 'declined', 'maybe') DEFAULT 'pending',
      dietary_requirements TEXT,
      plus_one TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_event (event_id),
      INDEX idx_rsvp (rsvp_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      user_id INT NOT NULL,
      invoice_number VARCHAR(50) UNIQUE,
      amount DECIMAL(10, 2) NOT NULL,
      payment_method ENUM('credit_card', 'upi', 'wallet') DEFAULT 'credit_card',
      description TEXT,
      status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_booking (booking_id),
      INDEX idx_user (user_id),
      INDEX idx_status (status),
      INDEX idx_invoice (invoice_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      user_id INT NOT NULL,
      booking_id INT,
      rating INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_vendor (vendor_id),
      INDEX idx_user (user_id),
      INDEX idx_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info', 'success', 'warning', 'error', 'booking', 'payment', 'event', 'reminder') DEFAULT 'info',
      reference_id INT,
      reference_type VARCHAR(50),
      is_read TINYINT(1) DEFAULT 0,
      read_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_is_read (is_read),
      INDEX idx_type (type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_type VARCHAR(50),
      file_size INT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event (event_id),
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      event_id INT,
      message TEXT NOT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sender (sender_id),
      INDEX idx_receiver (receiver_id),
      INDEX idx_event (event_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS event_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category_id INT,
      default_guest_count INT,
      default_budget DECIMAL(10, 2),
      included_services JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_category (category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_type ENUM('percent', 'fixed') NOT NULL,
      discount_value DECIMAL(10, 2) NOT NULL,
      max_uses INT DEFAULT 0,
      used_count INT DEFAULT 0,
      valid_from DATE,
      valid_until DATE,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_code (code),
      INDEX idx_vendor (vendor_id),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      guest_id INT,
      item_name VARCHAR(255) NOT NULL,
      item_description TEXT,
      estimated_cost DECIMAL(10, 2),
      claimed_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event (event_id),
      INDEX idx_guest (guest_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      guest_id INT NOT NULL,
      qr_code VARCHAR(255),
      check_in_time DATETIME,
      check_out_time DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event (event_id),
      INDEX idx_guest (guest_id),
      INDEX idx_qr (qr_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      stars INT DEFAULT 3,
      price_per_night DECIMAL(10, 2) NOT NULL,
      total_rooms INT,
      available_rooms INT,
      amenities JSON,
      images JSON,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_vendor (vendor_id),
      INDEX idx_city (city),
      INDEX idx_stars (stars),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      cuisine_type VARCHAR(100),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      price_range ENUM('budget', 'moderate', 'premium', 'luxury') DEFAULT 'moderate',
      capacity INT,
      rating DECIMAL(2, 1) DEFAULT 0.0,
      menu_items JSON,
      images JSON,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_vendor (vendor_id),
      INDEX idx_city (city),
      INDEX idx_cuisine (cuisine_type),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS event_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      photo_url VARCHAR(500) NOT NULL,
      caption VARCHAR(255),
      uploaded_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event (event_id),
      INDEX idx_uploader (uploaded_by)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS recurring_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      parent_event_id INT NOT NULL,
      recurrence_type ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
      recurrence_interval INT DEFAULT 1,
      end_date DATE,
      occurrences_left INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_parent (parent_event_id),
      INDEX idx_type (recurrence_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const alterStatements = [
    'ALTER TABLE events ADD COLUMN event_type VARCHAR(100)',
    'ALTER TABLE events ADD COLUMN qr_code VARCHAR(255)',
    'ALTER TABLE events ADD COLUMN template_id INT',
    'ALTER TABLE events ADD COLUMN is_recurring TINYINT(1) DEFAULT 0',
    'ALTER TABLE bookings ADD COLUMN promo_code_id INT',
    'ALTER TABLE bookings ADD COLUMN booking_type ENUM("service", "hotel", "restaurant") DEFAULT "service"',
    'ALTER TABLE bookings ADD COLUMN hotel_id INT',
    'ALTER TABLE bookings ADD COLUMN restaurant_id INT'
  ];
  for (const stmt of alterStatements) {
    try { await connection.query(stmt); } catch (e) { /* column may already exist */ }
  }

  console.log('All tables created successfully');
}

async function seedData(connection) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  await connection.query('INSERT IGNORE INTO categories (id, name) VALUES (1, "Wedding"), (2, "Corporate"), (3, "Birthday"), (4, "Conference"), (5, "Catering"), (6, "Photography"), (7, "Decoration"), (8, "Music"), (9, "Venue"), (10, "Transportation")');

  await connection.query('INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 'Admin User', 'admin@eventapp.com', hashedPassword, 'admin', '+1-555-0001']);

  await connection.query('INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [2, 'John Organizer', 'john@eventapp.com', hashedPassword, 'organizer', '+1-555-0002']);

  await connection.query('INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [3, 'Jane User', 'jane@email.com', hashedPassword, 'user', '+1-555-0003']);

  await connection.query('INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [4, 'Vendor King', 'vendor@email.com', hashedPassword, 'vendor', '+1-555-0004']);

  await connection.query('INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [5, 'Sarah Manager', 'sarah@email.com', hashedPassword, 'organizer', '+1-555-0005']);

  await connection.query('INSERT IGNORE INTO vendors (id, name, business_name, description, email, phone, city, state, category_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 'Royal Catering', 'Royal Catering Co', 'Premium catering services for all events', 'info@royalcatering.com', '+1-555-1001', 'New York', 'NY', 5, 4.5]);

  await connection.query('INSERT IGNORE INTO vendors (id, name, business_name, description, email, phone, city, state, category_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [2, 'Dream Decor', 'Dream Decorations', 'Creative decoration solutions', 'hello@dreamdecor.com', '+1-555-1002', 'Los Angeles', 'CA', 7, 4.8]);

  await connection.query('INSERT IGNORE INTO vendors (id, name, business_name, description, email, phone, city, state, category_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [3, 'SnapShot Pro', 'SnapShot Photography', 'Professional photography and videography', 'info@snapshot.com', '+1-555-1003', 'San Francisco', 'CA', 6, 4.6]);

  await connection.query('INSERT IGNORE INTO vendors (id, name, business_name, description, email, phone, city, state, category_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [4, 'Grand Venues', 'Grand Venues LLC', 'Premium event venues and banquet halls', 'bookings@grandvenues.com', '+1-555-1004', 'Chicago', 'IL', 9, 4.3]);

  await connection.query('INSERT IGNORE INTO vendors (id, name, business_name, description, email, phone, city, state, category_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [5, 'Sound Wave DJ', 'Sound Wave Entertainment', 'Professional DJ and music services', 'info@soundwave.com', '+1-555-1005', 'Miami', 'FL', 8, 4.7]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 'Premium Buffet Catering', 'Complete buffet service with multiple cuisines for up to 200 guests', 5, 1, 2500.00, 480, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [2, 'Custom Wedding Cake', 'Custom designed multi-tier wedding cake', 5, 1, 800.00, 0, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [3, 'Theme Decoration Package', 'Complete theme-based decoration setup including centerpieces and backdrop', 7, 2, 1500.00, 360, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [4, 'Floral Arrangement', 'Fresh flower decorations for tables, stage, and entrance', 7, 2, 800.00, 240, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [5, 'Full Event Photography', 'Professional photography coverage for the entire event', 6, 3, 1200.00, 480, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [6, 'Videography Package', 'Professional video recording and editing', 6, 3, 1800.00, 480, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [7, 'DJ Service', 'Professional DJ with premium sound system', 8, 5, 600.00, 300, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [8, 'Grand Ballroom Rental', 'Elegant ballroom with capacity for 500 guests', 9, 4, 5000.00, 720, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [9, 'Garden Venue', 'Beautiful outdoor garden venue for up to 300 guests', 9, 4, 3000.00, 720, 1]);

  await connection.query('INSERT IGNORE INTO services (id, name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [10, 'Luxury Car Fleet', 'Luxury car transportation for VIP guests', 10, 1, 500.00, 480, 1]);

  await connection.query('INSERT IGNORE INTO events (id, name, description, event_date, start_time, end_time, venue, category_id, guest_count, budget, status, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 'Annual Tech Conference 2026', 'Annual technology conference featuring latest trends and innovations', '2026-06-15', '09:00:00', '18:00:00', 'Tech Convention Center', 4, 200, 25000.00, 'planned', 2]);

  await connection.query('INSERT IGNORE INTO events (id, name, description, event_date, start_time, end_time, venue, category_id, guest_count, budget, status, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [2, 'Smith Wedding Celebration', 'Beautiful wedding celebration for the Smith family', '2026-07-20', '16:00:00', '23:00:00', 'Grand Ballroom', 1, 300, 50000.00, 'planned', 3]);

  await connection.query('INSERT IGNORE INTO events (id, name, description, event_date, start_time, end_time, venue, category_id, guest_count, budget, status, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [3, 'Team Building Workshop', 'Interactive team building activities and workshops', '2026-05-10', '10:00:00', '16:00:00', 'Conference Room A', 2, 50, 5000.00, 'draft', 5]);

  await connection.query('INSERT IGNORE INTO guests (id, event_id, name, email, phone, rsvp_status, plus_one) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [1, 2, 'Alice Johnson', 'alice@email.com', '+1-555-2001', 'accepted', 1]);

  await connection.query('INSERT IGNORE INTO guests (id, event_id, name, email, phone, rsvp_status, plus_one) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [2, 2, 'Bob Williams', 'bob@email.com', '+1-555-2002', 'pending', 0]);

  await connection.query('INSERT IGNORE INTO guests (id, event_id, name, email, phone, rsvp_status, plus_one) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [3, 1, 'Dr. Emily Chen', 'emily@tech.com', '+1-555-2003', 'accepted', 0]);

  await connection.query('INSERT IGNORE INTO reviews (id, vendor_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [1, 1, 3, 5, 'Excellent catering service! The food was amazing and the staff was very professional.']);

  await connection.query('INSERT IGNORE INTO reviews (id, vendor_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [2, 2, 3, 4, 'Beautiful decorations, transformed our venue completely. Highly recommended!']);

  await connection.query(`INSERT IGNORE INTO event_templates (id, name, description, category_id, default_guest_count, default_budget, included_services) VALUES
    (1, 'Classic Wedding', 'Complete wedding package with venue, catering, decoration, and photography', 1, 200, 40000.00, JSON_ARRAY('venue', 'catering', 'decoration', 'photography', 'music')),
    (2, 'Corporate Conference', 'Professional conference with AV equipment, catering, and venue', 4, 150, 20000.00, JSON_ARRAY('venue', 'catering', 'av_equipment', 'photography')),
    (3, 'Birthday Bash', 'Fun birthday party with decoration, cake, and entertainment', 3, 50, 3000.00, JSON_ARRAY('venue', 'catering', 'decoration', 'cake', 'entertainment')),
    (4, 'Gala Dinner', 'Elegant dinner event with premium catering and live music', 2, 300, 50000.00, JSON_ARRAY('venue', 'catering', 'decoration', 'live_music', 'photography')),
    (5, 'Workshop Seminar', 'Educational workshop with venue, materials, and light catering', 2, 30, 2000.00, JSON_ARRAY('venue', 'catering', 'materials', 'projector')),
    (6, 'Engagement Party', 'Intimate engagement celebration with decoration and catering', 1, 80, 8000.00, JSON_ARRAY('venue', 'catering', 'decoration', 'photography')),
    (7, 'Baby Shower', 'Cozy baby shower with themed decoration and snacks', 3, 30, 1500.00, JSON_ARRAY('venue', 'catering', 'decoration', 'games')),
    (8, 'Annual Company Party', 'Year-end celebration with entertainment, food, and venue', 2, 200, 25000.00, JSON_ARRAY('venue', 'catering', 'decoration', 'dj', 'photography')),
    (9, 'Product Launch', 'Professional product launch with venue, AV, and media coverage', 2, 100, 15000.00, JSON_ARRAY('venue', 'catering', 'av_equipment', 'photography', 'videography')),
    (10, 'Family Reunion', 'Large family gathering with outdoor venue, BBQ, and activities', 3, 100, 5000.00, JSON_ARRAY('venue', 'catering', 'decoration', 'entertainment', 'games'))
  `);

  await connection.query(`INSERT IGNORE INTO hotels (id, vendor_id, name, description, address, city, state, stars, price_per_night, total_rooms, available_rooms, amenities, is_active) VALUES
    (1, 4, 'Grand Plaza Hotel', 'Luxury 5-star hotel in the heart of the city with world-class amenities', '100 Main Street', 'New York', 'NY', 5, 350.00, 200, 50, JSON_ARRAY('Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'WiFi', 'Parking', 'Room Service'), 1),
    (2, 4, 'Boutique Inn', 'Charming boutique hotel with personalized service and cozy rooms', '45 Oak Avenue', 'Los Angeles', 'CA', 4, 180.00, 80, 30, JSON_ARRAY('WiFi', 'Breakfast', 'Parking', 'Pet Friendly'), 1),
    (3, 4, 'Seaside Resort', 'Beachfront resort with stunning ocean views and full amenities', '200 Beach Road', 'Miami', 'FL', 5, 450.00, 150, 40, JSON_ARRAY('Pool', 'Spa', 'Beach Access', 'Restaurant', 'Bar', 'WiFi', 'Gym', 'Water Sports'), 1),
    (4, 4, 'Mountain Lodge', 'Scenic mountain retreat perfect for corporate retreats and weddings', '500 Mountain View', 'Denver', 'CO', 4, 220.00, 100, 60, JSON_ARRAY('WiFi', 'Restaurant', 'Hiking Trails', 'Fireplace', 'Spa', 'Parking'), 1),
    (5, 4, 'City Center Suites', 'Modern hotel in downtown with easy access to venues and attractions', '75 Downtown Blvd', 'Chicago', 'IL', 3, 120.00, 120, 80, JSON_ARRAY('WiFi', 'Gym', 'Business Center', 'Parking', 'Breakfast'), 1)
  `);

  await connection.query(`INSERT IGNORE INTO restaurants (id, vendor_id, name, description, cuisine_type, address, city, state, price_range, capacity, rating, is_active) VALUES
    (1, 1, 'La Bella Italia', 'Authentic Italian cuisine with handmade pasta and wood-fired pizzas', 'Italian', '123 Roma Street', 'New York', 'NY', 'premium', 200, 4.7, 1),
    (2, 1, 'The Steakhouse', 'Premium cuts and fine dining experience with extensive wine list', 'American', '456 Grill Ave', 'Chicago', 'IL', 'luxury', 150, 4.8, 1),
    (3, 1, 'Spice Garden', 'Exotic Indian and Asian fusion with vegetarian and vegan options', 'Indian', '789 Spice Lane', 'San Francisco', 'CA', 'moderate', 120, 4.5, 1),
    (4, 1, 'Ocean Blue Seafood', 'Fresh seafood and sushi bar with daily catches', 'Seafood', '321 Harbor Dr', 'Miami', 'FL', 'premium', 180, 4.6, 1),
    (5, 1, 'Green Leaf Bistro', 'Farm-to-table organic cuisine with seasonal menus', 'Organic', '654 Garden Way', 'Portland', 'OR', 'moderate', 100, 4.4, 1)
  `);

  await connection.query(`INSERT IGNORE INTO promo_codes (id, vendor_id, code, discount_type, discount_value, max_uses, valid_from, valid_until, is_active) VALUES
    (1, 1, 'WELCOME10', 'percent', 10.00, 100, '2026-01-01', '2026-12-31', 1),
    (2, 1, 'SUMMER20', 'percent', 20.00, 50, '2026-06-01', '2026-08-31', 1),
    (3, 2, 'DECOR15', 'percent', 15.00, 75, '2026-01-01', '2026-12-31', 1),
    (4, 2, 'WEDDING500', 'fixed', 500.00, 20, '2026-01-01', '2026-12-31', 1),
    (5, 3, 'PHOTO25', 'percent', 25.00, 30, '2026-01-01', '2026-12-31', 1),
    (6, 4, 'VENUE1000', 'fixed', 1000.00, 10, '2026-01-01', '2026-12-31', 1),
    (7, 5, 'MUSIC100', 'fixed', 100.00, 50, '2026-01-01', '2026-12-31', 1),
    (8, 1, 'EARLYBIRD', 'percent', 15.00, 200, '2026-01-01', '2026-06-30', 1),
    (9, 3, 'VIDEOPACK', 'percent', 20.00, 25, '2026-01-01', '2026-12-31', 1),
    (10, 4, 'GRANDOPEN', 'percent', 30.00, 5, '2026-01-01', '2026-03-31', 1)
  `);

  console.log('Seed data inserted successfully');
}

async function run() {
  let connection;
  try {
    connection = await createDatabase();
    await createTables(connection);
    await seedData(connection);
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

run();