import { AuthError, AuthApiError } from "@supabase/supabase-js";

export const getErrorMessage = (error: AuthError) => {
  if (error instanceof AuthApiError) {
    switch (error.code) {
      case "invalid_credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "email_not_confirmed":
        return "Please verify your email address before signing in.";
      case "user_not_found":
        return "No user found with these credentials.";
      case "invalid_grant":
        return "Invalid login credentials.";
      default:
        return error.message;
    }
  }
  return error.message;
};