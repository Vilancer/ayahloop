export const routes = {
  signIn: "/(auth)/sign-in",
  unauthorized: "/unauthorized",
  home: "/home",
  parts: "/parts",
  part: (partId: string) => `/parts/${partId}` as const,
  step: (partId: string, stepKind: string) => `/parts/${partId}/steps/${stepKind}` as const,
  loop: "/loop",
  reviews: "/reviews",
  progress: "/progress",
  curriculum: "/curriculum",
  devGallery: "/dev/gallery",
  devMushafTest: "/dev/mushaf-test",
} as const;
