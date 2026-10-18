import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SocialScraper Pro - Instagram & TikTok Scraper com Banco SQLike',
  description: 'Scraper eficiente e anti-bloqueio para Instagram e TikTok com extração de metadados, armazenamento em banco SQLike e painel interativo.',
  openGraph: {
    title: 'SocialScraper Pro - Instagram & TikTok Scraper',
    description: 'Scraper eficiente e anti-bloqueio para Instagram e TikTok com extração de metadados, armazenamento em banco SQLike e painel interativo.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialScraper Pro - Instagram & TikTok Scraper',
    description: 'Scraper eficiente e anti-bloqueio para Instagram e TikTok com extração de metadados e banco SQLike.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
