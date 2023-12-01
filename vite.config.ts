import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import imagePresets, { widthPreset } from "vite-plugin-image-presets"

export default defineConfig({
  base: "Image_gallery_extra",
  plugins: [
    tsconfigPaths(),
    imagePresets({
      thumbnail: widthPreset({
        widths: [128, 256],
        formats: {
          avif: {},
          webp: {},
          jpg: {},
        },
        sizes: "(max-width: 600px) 128px, (max-width: 768px) 256px, 512px",
      }),
      large: widthPreset({
        widths: [512, 1024],
        formats: {
          avif: {},
          webp: {},
          jpg: {},
        },
        sizes: "(max-width: 768px) 512px, 1024px",
      }),
    }),
  ],
})
