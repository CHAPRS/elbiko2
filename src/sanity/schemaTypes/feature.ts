import { defineField, defineType } from 'sanity'

export const featureSchema = defineType({
  name: 'feature',
  title: 'Преимущество',
  type: 'document',
  fields: [
    defineField({
      name: 'icon',
      title: 'Иконка (эмодзи)',
      type: 'string',
      description: 'Используйте эмодзи для иконки',
    }),
    defineField({
      name: 'image',
      title: 'Изображение преимущества',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Если изображение указано, оно заменит эмодзи',
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
      subtitle: 'description',
    },
  },
})
