import { MdLocalPlay } from "react-icons/md";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "attraction",
  title: "Atracciones",
  description: "Atracciones disponibles",
  type: "document",
  icon: MdLocalPlay,
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (rule) => rule.required().error("El nombre es obligatorio")
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      validation: (rule) => rule.required().error("La descripción es obligatoria")
    }),
    defineField({
      name: "price",
      title: "Precio",
      type: "number",
      validation: (rule) => rule.required().error("El precio es obligatorio")
    }),
    defineField({
      name: "images",
      title: "Imágenes",
      type: "array",
      of: [{ type: "image" }],
      validation: (rule) => rule.required().error("Se requiere al menos una imagen")
    })
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "description",
      media: "images.0"
    }
  }
});
