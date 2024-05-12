import { RiNewspaperLine } from "react-icons/ri";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "news",
  title: "Noticias",
  description: "Noticias recientes",
  type: "document",
  icon: RiNewspaperLine,
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required().error("El título es obligatorio")
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      validation: (rule) => rule.required().error("La descripción es obligatoria")
    }),
    defineField({
      name: "link",
      title: "Enlace",
      type: "url",
      validation: (rule) => rule.required().error("El enlace es obligatorio")
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      validation: (rule) => rule.required().error("La imagen es obligatoria")
    })
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "image"
    }
  }
});
