-- Create admin user with password 'admin123' (bcrypt hash)
INSERT INTO users (id, email, pseudo, "firstName", "lastName", role, password, "createdAt", "updatedAt") 
VALUES (gen_random_uuid(), 'admin@gobeyondfit.com', 'admin', 'Admin', 'User', 'admin', '$2b$10$Pzl.1/Vvp3A.4S3kCWXtDeYHuKnRnZvRtH.GFVj4MpOSmLChL6gDm', NOW(), NOW());
