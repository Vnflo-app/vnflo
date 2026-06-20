import type { Metadata } from "next";
import "../styles/index.css";
import Providers from "./providers";
import { JsonLd } from "./components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vnflo.com"),
  title: {
    default: "Visual Node Flow | Interactive Flowcharts, Org Charts & Diagrams",
    template: "%s | Visual Node Flow",
  },
  description: "Create stunning interactive flowcharts, system architectures, mind maps, organizational charts, and family trees in seconds. Start with a free trial to get your work noticed immediately.",
  keywords: [
    "diagram software",
    "flowchart maker",
    "family tree builder online",
    "organizational chart creator",
    "collaborative mind mapping",
    "network diagram tool",
    "system architecture visualizer",
    "logic flow designer",
    "process mapping tool",
    "interactive workflow designer",
    "flowchart software subscription",
    "best online org chart creator",
    "professional diagram tool free trial",
    "real-time collaborative flowchart maker"
  ],
  openGraph: {
    title: "Visual Node Flow | Interactive Flowcharts, Org Charts & Diagrams",
    description: "Collaborate in real-time to build logic flows, network architecture, and visual diagrams. Export in vector formats instantly. Try it free.",
    url: "https://www.vnflo.com",
    siteName: "Visual Node Flow",
    images: [
      {
        url: "/vnflo-og.png",
        width: 1200,
        height: 630,
        alt: "Visual Node Flow Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Node Flow | Interactive Flowcharts, Org Charts & Diagrams",
    description: "Collaborate in real-time to build logic flows, network architecture, and visual diagrams.",
    images: ["/vnflo-og.png"],
  },
  icons: {
    icon: "/vnflo.png",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Visual Node Flow",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "INR",
    "lowPrice": "0",
    "highPrice": "399",
    "offerCount": "2"
  },
  "description": "Create stunning interactive flowcharts, system architectures, mind maps, organizational charts, and family trees in seconds. Start with a free trial to get your work noticed immediately."
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Visual Node Flow",
  "url": "https://www.vnflo.com/"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('nb-site-theme') || 'dark';
                document.documentElement.classList.add('theme-' + theme);
                if (theme !== 'light') {
                  document.documentElement.classList.add('dark');
                }
                
                // Color maps to set CSS custom properties immediately to prevent hydration flash
                const canvasColors = {
                  dark: '#080808',
                  light: '#EBEDF1',
                  midnight: '#0a0015',
                  ocean: '#021a2e',
                  forest: '#021a0e',
                  sunset: '#1a0a00'
                };
                const accentColors = {
                  dark: '#D4D8DF',
                  light: '#080808',
                  midnight: '#9d4edd',
                  ocean: '#0ea5e9',
                  forest: '#22c55e',
                  sunset: '#f97316'
                };
                const borderColors = {
                  dark: 'rgba(255,255,255,0.08)',
                  light: 'rgba(0,0,0,0.08)',
                  midnight: 'rgba(157,78,221,0.15)',
                  ocean: 'rgba(14,165,233,0.15)',
                  forest: 'rgba(34,197,94,0.15)',
                  sunset: 'rgba(249,115,22,0.15)'
                };

                document.documentElement.style.setProperty('--background', canvasColors[theme] || '#080808');
                document.documentElement.style.setProperty('--primary', accentColors[theme] || '#D4D8DF');
                document.documentElement.style.setProperty('--accent', accentColors[theme] || '#D4D8DF');
                document.documentElement.style.setProperty('--border', borderColors[theme] || 'rgba(255,255,255,0.08)');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="h-full m-0 bg-background text-foreground transition-colors duration-300 ease-out"
        suppressHydrationWarning
      >
        <JsonLd data={softwareSchema} />
        <JsonLd data={websiteSchema} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

