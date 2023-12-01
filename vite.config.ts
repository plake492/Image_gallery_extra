import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import imagePresets, { widthPreset } from "vite-plugin-image-presets"

import pluginPurgeCss from "@mojojoejo/vite-plugin-purgecss"

export default ({ mode }) => {
  const isProduction = mode === "production"

  return defineConfig({
    base: "/Image_gallery_extra",
    plugins: [
      tsconfigPaths(),
      imagePresets({
        ...(isProduction
          ? {
              thumbnail: widthPreset({
                widths: [128, 256],
                formats: {
                  avif: {},
                  webp: {},
                  jpg: {},
                },
                sizes:
                  "(max-width: 600px) 128px, (max-width: 768px) 256px, 512px",
              }),
              large: widthPreset({
                widths: [512, 1024],
                formats: {
                  avif: { quality: 70 },
                  webp: { quality: 70 },
                  jpg: { quality: 60 },
                },
                sizes: "(max-width: 768px) 512px, 1024px",
              }),
            }
          : {
              thumbnail: widthPreset({
                widths: [128],
                formats: {
                  jpg: {},
                },
              }),
              large: widthPreset({
                widths: [512],
                formats: {
                  jpg: {},
                },
              }),
            }),
      }),
      pluginPurgeCss(),
    ],
  })
}
