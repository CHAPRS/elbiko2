import { defineType, defineField } from 'sanity'

export const heroSchema = defineType({
  name: 'hero',
  title: 'Hero секция',
  type: 'document',
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Фоновое изображение',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Подзаголовок',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'badge',
      title: 'Бейдж',
      type: 'string',
    }),
    defineField({
      name: 'stat1_label',
      title: 'Статистика 1 - подпись',
      type: 'string',
    }),
    defineField({
      name: 'stat1_value',
      title: 'Статистика 1 - значение',
      type: 'string',
    }),
    defineField({
      name: 'stat2_label',
      title: 'Статистика 2 - подпись',
      type: 'string',
    }),
    defineField({
      name: 'stat2_value',
      title: 'Статистика 2 - значение',
      type: 'string',
    }),
    defineField({
      name: 'stat3_label',
      title: 'Статистика 3 - подпись',
      type: 'string',
    }),
    defineField({
      name: 'stat3_value',
      title: 'Статистика 3 - значение',
      type: 'string',
    }),
    defineField({
      name: 'cta_text',
      title: 'Текст основной кнопки',
      type: 'string',
    }),
    defineField({
      name: 'cta_link',
      title: 'Ссылка основной кнопки',
      type: 'string',
    }),
    defineField({
      name: 'secondary_cta_text',
      title: 'Текст вторичной кнопки',
      type: 'string',
    }),
    defineField({
      name: 'secondary_cta_link',
      title: 'Ссылка вторичной кнопки',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
