-- First, check if the user already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Users" WHERE email = 'duc@admin.com') THEN
        -- Insert new project manager user
        -- Note: The password 'Duc123456@' needs to be hashed in a real application
        INSERT INTO "Users" (
            name,
            email,
            password,
            role,
            can_upload_minutes,
            created_at,
            updated_at
        ) VALUES (
            'Duc Admin',
            'duc@admin.com',
            '$2a$10$YourHashedPasswordHere',  -- This should be properly hashed
            'PROJECT_MANAGER',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Project Manager user created successfully';
    ELSE
        RAISE NOTICE 'User with email duc@admin.com already exists';
    END IF;
END $$;

-- Verify the user was created
SELECT id, name, email, role, can_upload_minutes 
FROM "Users" 
WHERE email = 'duc@admin.com'; 