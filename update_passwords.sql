-- Update admin password for admin123
UPDATE users SET password = '$2b$10$I56TmJV4RCE.9XeHaTOH..e3ZJvXTAHG6JArf6ngcNhCmj3cUj9wm' WHERE email = 'admin@gobeyondfit.com';

-- Update coach password for coach123
UPDATE users SET password = '$2b$10$r70o8BhoPi.PORk5Pv/9iuRXYjJwcHaxGZXeYAy913FDZ6S7PJPCW' WHERE email = 'coach@gobeyondfit.com';

-- Verify
SELECT email, password FROM users;
