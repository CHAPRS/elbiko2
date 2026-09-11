import { defineField, defineType } from 'sanity'

export const stepSchema = defineType({
  name: 'step',
  title: 'Шаг (Как это работает)',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: 'Номер шага',
      type: 'string',
      description: 'Например: 01, 02, 03',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Изображение шага',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Изображение для визуализации шага',
    }),
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Описание',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок отображения',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'number',
    },
  },
})
