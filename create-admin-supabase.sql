-- Create Admin User in Supabase
-- Password: Admin@123456
-- Hash: $2a$10$dOZZXGgwMVuClbcaEExDJ.kk0UOj0/i0oX/kALVRcvoAVYTlQAZLq

INSERT INTO "User" (
  id,
  email,
  password,
  name,
  role,
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@crc2.com',
  '$2a$10$dOZZXGgwMVuClbcaEExDJ.kk0UOj0/i0oX/kALVRcvoAVYTlQAZLq',
  'Admin',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the admin user was created
SELECT id, email, name, role, "createdAt" 
FROM "User" 
WHERE email = 'admin@crc2.com';
