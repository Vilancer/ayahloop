import { AmiriQuran_400Regular } from "@expo-google-fonts/amiri-quran";
import { GeistMono_400Regular, GeistMono_500Medium, GeistMono_600SemiBold } from "@expo-google-fonts/geist-mono";
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from "@expo-google-fonts/instrument-sans";
import { useFonts } from "expo-font";

/** Loads every font family the primitives reference. Amiri Quran ships a single weight. */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    AmiriQuran_400Regular,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
  return loaded;
}
