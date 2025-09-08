-- Admin kullanıcısı oluştur
INSERT INTO "Users" ("FirstName", "LastName", "Email", "PasswordHash", "Role", "Gender", "PhoneNumber", "IdentityNumber", "CreatedAt")
VALUES (
    'Admin',
    'User',
    'admin@hotel.com',
    '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: 
    
    'Admin',
    'Erkek',
    '05551234567',
    '12345678901',
    NOW()
);
