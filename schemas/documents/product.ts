import { TfiShoppingCartFull } from "react-icons/tfi";
import { defineField, defineType } from "sanity";
import supportedLanguages from "../locale/supportedLanguages";

const baseLanguage = supportedLanguages.find((l) => l.isDefault) || supportedLanguages[0];

export default defineType({
  name: "product",
  title: "Producto",
  description: "Una lista de productos asociados con algunas variantes",
  type: "document",
  icon: TfiShoppingCartFull,
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "localeString",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "localeText"
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "localeSlug",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "reference",
      title: "Referencia",
      type: "string",
      validation: (rule) => rule.required()
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
      name: "currency",
      title: "Moneda",
      type: "string",
      description: "Código de moneda, por ejemplo, MXN, USD, etc."
    }),
    defineField({
      name: "stock",
      title: "Inventario",
      type: "number",
      validation: (rule) => rule.min(0).integer()
    }),
    defineField({
      name: "image",
      title: "Imagen Del Producto",
      type: "image",
      validation: (rule) => rule.required().error("La imagen es obligatoria")
    }),
    defineField({
      name: "variants",
      title: "Variantes",
      type: "array",
      of: [
        {
          type: "reference",
          to: {
            type: "variant"
          }
        }
      ],
      validation: (rule) => rule.required()
    })
  ],

  preview: {
    select: {
      title: `name.${baseLanguage.id}`,
      subtitle: `slug.${baseLanguage.id}.current`,
      media: "image"
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title,
        subtitle: `/${subtitle}`,
        media: media
      };
    }
  }
});
