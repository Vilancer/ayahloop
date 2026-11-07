/// <reference types="nativewind/types" />

// TypeScript 6 checks side-effect imports; the global stylesheet is resolved
// by Metro + NativeWind, not by tsc.
declare module "*.css";
