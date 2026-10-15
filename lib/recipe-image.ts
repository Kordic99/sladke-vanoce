import { MAX_IMAGE_CHARS } from "./plan";

export async function prepareRecipeImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)) throw new Error("Vyberte obrázek JPG, PNG, WebP, GIF nebo AVIF.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Obrázek může mít nejvýše 15 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("Obrázek se nepodařilo načíst.");
    const scale = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Prohlížeč nemůže zpracovat obrázek.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const format of ["image/webp", "image/jpeg"]) {
      for (const quality of [.86, .72, .58, .42]) {
        const data = canvas.toDataURL(format, quality);
        // Some Safari versions export PNG when a requested encoder is absent.
        if (!data.startsWith(`data:${format};`)) break;
        if (data.length <= MAX_IMAGE_CHARS) return data;
      }
    }
    throw new Error("Tento obrázek je příliš velký. Zkuste menší obrázek.");
  } catch (error) {
    if (error instanceof Error && error.name !== "EncodingError") throw error;
    throw new Error("Tento obrázek se nepodařilo načíst. Zkuste jiný soubor.");
  } finally { URL.revokeObjectURL(url); }
}
