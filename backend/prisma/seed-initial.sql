-- Seed database with initial data for GoBeyondFit

-- Create admin user with password 'admin123'
INSERT INTO users (id, email, pseudo, "firstName", "lastName", role, password, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'admin@gobeyondfit.com', 
  'admin', 
  'Admin', 
  'GoBeyondFit',
  'ADMIN',
  '$2b$10$Pzl.1/Vvp3A.4S3kCWXtDeYHuKnRnZvRtH.GFVj4MpOSmLChL6gDm',
  NOW(), 
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create coach user with password 'coach123'  
INSERT INTO users (id, email, pseudo, "firstName", "lastName", role, password, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'coach@gobeyondfit.com',
  'coach',
  'Coach',
  'GoBeyondFit', 
  'COACH',
  '$2b$10$6T3KngXHhNLVLqfr6W8YGOtT6cMYvVrGkGE8P8YLQd6g2dF5P2p6e',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT COUNT(*) as total_users FROM users;
