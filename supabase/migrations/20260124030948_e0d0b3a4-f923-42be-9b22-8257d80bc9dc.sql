-- Update the handle_new_user function to respect signup_role and auto-assign admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email TEXT;
  signup_role TEXT;
  assigned_role public.app_role;
BEGIN
  -- Get email and signup role from user metadata
  user_email := NEW.email;
  signup_role := NEW.raw_user_meta_data->>'signup_role';
  
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  -- Determine role: admin for specific email, otherwise use signup_role or default to artist
  IF user_email = 'credo.mandlhazi@gmail.com' THEN
    assigned_role := 'admin';
  ELSIF signup_role = 'listener' THEN
    assigned_role := 'listener';
  ELSE
    assigned_role := 'artist';
  END IF;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;