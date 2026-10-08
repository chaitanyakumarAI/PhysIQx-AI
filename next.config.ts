import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const baseConfig: NextConfig = {};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false, // Write to file, don't auto-open browser
})(baseConfig);
