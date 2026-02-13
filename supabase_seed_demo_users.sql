-- ============================================================
-- TrustVault — Demo Users Seed Script
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Creates 5 demo users with roles matching the Auth page
-- ============================================================

-- Helper function: create a demo user + profile + role in one go
-- Uses extensions.pgcrypto for password hashing (available by default in Supabase)
DO $$
DECLARE
  _user_id UUID;
  _users JSONB := '[
    {"email": "police@trustvault.com",   "password": "police123",   "full_name": "Officer Demo",      "role": "Police"},
    {"email": "lab@trustvault.com",       "password": "lab123",       "full_name": "Lab Analyst Demo",   "role": "Lab"},
    {"email": "hospital@trustvault.com",  "password": "hospital123",  "full_name": "Doctor Demo",        "role": "Hospital"},
    {"email": "court@trustvault.com",     "password": "court123",     "full_name": "Judge Demo",         "role": "Court"},
    {"email": "admin@trustvault.com",     "password": "admin123",     "full_name": "Admin Demo",         "role": "Admin"}
  ]';
  _u JSONB;
BEGIN
  FOR _u IN SELECT * FROM jsonb_array_elements(_users)
  LOOP
    -- Skip if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = _u->>'email') THEN
      RAISE NOTICE 'User % already exists, skipping...', _u->>'email';
      CONTINUE;
    END IF;

    -- Generate a new UUID for the user
    _user_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      _user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      _u->>'email',
      crypt(_u->>'password', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      jsonb_build_object('full_name', _u->>'full_name'),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Insert identity for email provider
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      _user_id,
      jsonb_build_object('sub', _user_id::text, 'email', _u->>'email'),
      'email',
      _user_id::text,
      NOW(),
      NOW(),
      NOW()
    );

    -- Insert profile (trigger may handle this, but let's be safe)
    INSERT INTO public.profiles (id, full_name)
    VALUES (_user_id, _u->>'full_name')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- Insert user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, (_u->>'role')::public.app_role);

    RAISE NOTICE 'Created user: % with role %', _u->>'email', _u->>'role';
  END LOOP;
END;
$$;
