// Fuentes de Refyt servidas desde la app, con los nombres de familia que usa refyt.css.
import soraLatin from "@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url";
import soraLatinExt from "@fontsource-variable/sora/files/sora-latin-ext-wght-normal.woff2?url";
import manropeLatin from "@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url";
import manropeLatinExt from "@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2?url";
import figtreeLatin from "@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2?url";
import figtreeLatinExt from "@fontsource-variable/figtree/files/figtree-latin-ext-wght-normal.woff2?url";
import frauncesLatin from "@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2?url";
import frauncesLatinExt from "@fontsource-variable/fraunces/files/fraunces-latin-ext-opsz-normal.woff2?url";

// Same subsets as Google Fonts serves them.
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

const FONTS = [
  ["Sora", "100 800", soraLatin, soraLatinExt],
  ["Manrope", "200 800", manropeLatin, manropeLatinExt],
  ["Figtree", "300 900", figtreeLatin, figtreeLatinExt],
  ["Fraunces", "100 900", frauncesLatin, frauncesLatinExt]
];

for (const [family, weight, latin, latinExt] of FONTS) {
  for (const [url, unicodeRange] of [
    [latin, LATIN],
    [latinExt, LATIN_EXT]
  ]) {
    document.fonts.add(new FontFace(family, `url(${url}) format("woff2")`, { weight, unicodeRange, display: "swap" }));
  }
}
