import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const AuthForm = () => {
  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        className: {
          container: 'space-y-6',
          label: 'font-sans font-semibold tracking-wide uppercase text-sm',
          button: 'font-sans font-bold tracking-wider uppercase',
          input: 'font-sans mt-2',
          divider: 'my-8',
          message: 'font-sans',
          anchor: 'font-sans font-medium'
        },
        variables: {
          default: {
            colors: {
              brand: '#C4A052',
              brandAccent: '#A88B45',
              brandButtonText: "#FFFFFF",
              defaultButtonBackground: "#FFFFFF",
              defaultButtonBackgroundHover: "#EEEEEE",
              defaultButtonBorder: "#d1d5db",
              defaultButtonText: "#374151",
              dividerBackground: "#E5E7EB",
              inputBackground: "#FFFFFF",
              inputBorder: "#d1d5db",
              inputBorderHover: "#A88B45",
              inputBorderFocus: "#C4A052",
              inputText: "#111827",
              inputLabelText: "#374151",
              inputPlaceholder: "#6B7280",
              messageText: "#374151",
              messageTextDanger: "#DC2626",
              anchorTextColor: "#C4A052",
              anchorTextHoverColor: "#A88B45",
            },
          },
        },
      }}
      providers={[]}
      localization={{
        variables: {
          sign_in: {
            email_label: 'Email',
            password_label: 'Password',
          },
          sign_up: {
            email_label: 'Email',
            password_label: 'Password',
          },
        },
      }}
      supabaseAuthClientOptions={{
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }}
    />
  );
};