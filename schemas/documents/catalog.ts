import { SlGlobeAlt } from "react-icons/sl";
import { defineField, defineType } from "sanity";
import supportedLanguages from "../locale/supportedLanguages";

const baseLanguage = supportedLanguages.find((l) => l.isDefault) || supportedLanguages[0];

export default defineType({
  name: "catalog",
  title: "Catalogo",
  description: "Una lista de productos",
  type: "document",
  icon: SlGlobeAlt,
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "localeString",
      validation: (rule) => rule.required().error("Un nombre es requerido.")
    }),
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      validation: (rule) => rule.required().error("Selecciona uno o mas productos."),
      of: [
        {
          type: "reference",
          to: {
            type: "product"
          }
        }
      ]
    })
  ],

  preview: {
    select: {
      title: `name.${baseLanguage.id}`
    }
  }
});
