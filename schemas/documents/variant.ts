import { VscTypeHierarchySub } from "react-icons/vsc";
import { defineField, defineType } from "sanity";
import supportedLanguages from "../locale/supportedLanguages";

const baseLanguage = supportedLanguages.find((l) => l.isDefault) || supportedLanguages[0];

export default defineType({
  name: "variant",
  title: "Variante",
  description: "",
  type: "document",
  icon: VscTypeHierarchySub,
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "localeString",
      validation: (rule) => rule.required().error("El nombre es obligatorio")
    }),
    defineField({
      name: "price",
      title: "Precio",
      type: "string",
      description: "Ingrese el precio en el formato XX.XX (por ejemplo, 20.00 MXN)",
      validation: (rule) => rule.custom(price => {
        if (!price) {
          return 'El precio es obligatorio';
        }
        if (!/^\d+(\.\d{1,2})?$/.test(price)) {
          return 'El precio debe estar en el formato XX.XX';
        }
        return true;
      }).warning()
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      validation: (rule) => rule.required().error("La imagen es obligatoria")
    }),
    defineField({
      name: "size",
      title: "Tamaño",
      type: "reference",
      to: {
        type: "size"
      },
      validation: (rule) => rule.required().error("El tamaño es obligatorio")
    })
  ],

  preview: {
    select: {
      title: `name.${baseLanguage.id}`,
      media: "image"
    }
  }
});
