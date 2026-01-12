import type { AppProps } from 'next/app'
import { AuthProvider } from '@/lib/auth'
import '../styles/global.css'

/**
 * Global app wrapper that installs the Auth provider and simple layout.
 * Each page receives its Component and props; the provider ensures
 * `useAuth` works in all components.
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

