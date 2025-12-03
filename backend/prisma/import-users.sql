-- Import initial users for GoBeyondFit
-- Password for admin@gobeyondfit.com: 'admin123'
-- Password for coach@gobeyondfit.com: 'coach123'

INSERT INTO users (id, email, pseudo, "firstName", "lastName", role, password, "createdAt", "updatedAt") 
VALUES 
  (gen_random_uuid(), 'admin@gobeyondfit.com', 'admin', 'Admin', 'GoBeyondFit', 'admin', '$2b$10$Pzl.1/Vvp3A.4S3kCWXtDeYHuKnRnZvRtH.GFVj4MpOSmLChL6gDm', NOW(), NOW()),
  (gen_random_uuid(), 'coach@gobeyondfit.com', 'coach', 'Coach', 'GoBeyondFit', 'coach', '$2b$10$6T3KngXHhNLVLqfr6W8YGOtT6cMYvVrGkGE8P8YLQd6g2dF5P2p6e', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

SELECT 'Users imported successfully' as result;
SELECT COUNT(*) as total_users FROM users;
