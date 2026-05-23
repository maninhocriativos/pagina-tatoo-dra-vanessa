import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const jobs = [
  {
    input: "assets/hero-lamina pricipal/Banner-hero.png",
    outputs: [
      { file: "assets/hero-lamina pricipal/Banner-hero.webp", width: 1942, quality: 82 },
      { file: "assets/hero-lamina pricipal/Banner-hero-1200.webp", width: 1200, quality: 82 }
    ]
  },
  {
    input: "assets/hero-lamina pricipal/Banner-hero-mobile.png",
    outputs: [{ file: "assets/hero-lamina pricipal/Banner-hero-mobile.webp", width: 900, quality: 82 }]
  },
  {
    input: "assets/nova-fase/rosto-laser.png",
    outputs: [
      { file: "assets/nova-fase/rosto-laser.webp", width: 1514, quality: 82 },
      { file: "assets/nova-fase/rosto-laser-768.webp", width: 768, quality: 82 }
    ]
  },
  {
    input: "assets/omer-showcase/maquina-omer.png",
    outputs: [
      { file: "assets/omer-showcase/maquina-omer.webp", width: 1511, quality: 82 },
      { file: "assets/omer-showcase/maquina-omer-768.webp", width: 768, quality: 82 },
      { file: "assets/omer-showcase/maquina-omer-1200.webp", width: 1200, quality: 82 }
    ]
  },
  {
    input: "assets/resultado com evolução/Banner-modelo-tatoo.png",
    outputs: [
      { file: "assets/resultado com evolução/Banner-modelo-tatoo.webp", width: 1920, quality: 82 },
      { file: "assets/resultado com evolução/Banner-modelo-tatoo-768.webp", width: 768, quality: 82 },
      { file: "assets/resultado com evolução/Banner-modelo-tatoo-1200.webp", width: 1200, quality: 82 }
    ]
  },
  {
    input: "assets/agendar-avaliação/fundo.png",
    outputs: [{ file: "assets/agendar-avaliação/fundo.webp", width: 1920, quality: 85 }]
  },
  {
    input: "assets/agendar-avaliação/profissional.png",
    outputs: [
      { file: "assets/agendar-avaliação/profissional.webp", width: 1508, quality: 82 },
      { file: "assets/agendar-avaliação/profissional-768.webp", width: 768, quality: 82 }
    ]
  },
  {
    input: "assets/hero-lamina pricipal/referencia-final.png",
    outputs: [{ file: "assets/hero-lamina pricipal/referencia-final.webp", width: 1200, quality: 82 }]
  }
];

for (const job of jobs) {
  const inputPath = path.join(root, job.input);
  for (const output of job.outputs) {
    const outputPath = path.join(root, output.file);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(inputPath)
      .resize({ width: output.width, withoutEnlargement: true })
      .webp({ quality: output.quality, effort: 4 })
      .toFile(outputPath);
    console.log("OK", output.file);
  }
}
