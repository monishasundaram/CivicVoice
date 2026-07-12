import './globals.css';
import Nav from './nav';
import Chatbot from './chatbot';
import { LanguageProvider } from '../lib/i18n';

export const metadata = { title: 'CivicVoice', description: 'Transparent Public Grievance System' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Nav />
          <main style={{ minHeight: '80vh' }}>{children}</main>
          <Chatbot />
        </LanguageProvider>
      </body>
    </html>
  );
}