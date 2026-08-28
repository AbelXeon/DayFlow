import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.abelxeon.dayflow",
  appName: "Dayflow",
  webDir: "public",
  server: {

    url: "https://your-project-name.vercel.app",
    cleartext: false,
  },
};

export default config;