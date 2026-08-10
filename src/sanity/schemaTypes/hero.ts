import { defineType, defineField } from 'sanity'

export const heroSchema = defineType({
  name: 'hero',
  title: 'Hero секция',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Главный заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Подзаголовок (описание)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ctaText',
      title: 'Текст на кнопке',
      type: 'string',
      description: 'Например: "Арендовать за 790₽/сут"',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Фоновое изображение',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
