import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const AuthForm = () => {
  return (
    <SupabaseAuth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: '#C4A052',
              brandAccent: '#A88B45',
              brandButtonText: '#000000',
              defaultButtonBackground: '#222222',
              defaultButtonBackgroundHover: '#333333',
              inputBackground: '#FFFFFF',
              inputBorder: '#C4A052',
              inputBorderHover: '#A88B45',
              inputBorderFocus: '#C4A052',
            },
            borderWidths: {
              buttonBorderWidth: '2px',
              inputBorderWidth: '2px',
            },
            radii: {
              borderRadiusButton: '0',
              buttonBorderRadius: '0',
              inputBorderRadius: '0',
            },
            fonts: {
              bodyFontFamily: `'Roboto Condensed', sans-serif`,
              buttonFontFamily: `'Roboto Condensed', sans-serif`,
              inputFontFamily: `'Roboto Condensed', sans-serif`,
              labelFontFamily: `'Roboto Condensed', sans-serif`,
            },
          },
        },
        className: {
          button: 'font-bold uppercase tracking-tight',
          label: 'font-medium',
          input: 'font-medium',
        },
      }}
      theme="default"
      providers={[]}
    />
  );
};