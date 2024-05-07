import { FaStore } from "react-icons/fa6";
import { defineField, defineType } from "sanity";
import supportedLanguages from "../locale/supportedLanguages";

const baseLanguage = supportedLanguages.find((l) => l.isDefault) || supportedLanguages[0];

export default defineType({
  name: "store",
  title: "Tienda",
  description: "Una tienda del zoo",
  type: "document",
  icon: FaStore,
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "localeString",
      validation: (rule) => rule.required().error("El nombre de la tienda es requerido.")
    }),
    defineField({
      name: "available",
      title: "Disponible",
      type: "boolean",
      description: "Activa si la tienda esta disponible."
    }),
    defineField({
      name: "openingHours",
      title: "Horario de Apertura",
      type: "string",
      validation: (rule) => rule.required().error("Se requiere un horario de apertura")
    }),
    defineField({
      name: "closingHours",
      title: "Horario de Cierre",
      type: "string",
      validation: (rule) => rule.required().error("Se requiere un horario de cierre")
    }),
    defineField({
      name: "catalog",
      title: "Catalogo",
      type: "array",
      of: [
        {
          type: "reference",
          to: {
            type: "catalog"
          }
        }
      ],
      validation: (rule) => rule.required().min(1).error("Se requiere al menos un catálogo.")
    }),
  ],

  preview: {
    select: {
      title: `name.${baseLanguage.id}`,
    }
  }
});
