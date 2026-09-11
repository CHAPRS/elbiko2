import { defineType, defineField } from 'sanity'

export const reviewSchema = defineType({
  name: 'review',
  title: 'Отзывы курьеров',
  type: 'document',
  fields: [
    defineField({
      name: 'courierName',
      title: 'Имя курьера',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'deliveryService',
      title: 'Служба доставки',
      type: 'string',
      description: 'Например: Яндекс.Еда, Самокат, Додо',
    }),
    defineField({
      name: 'avatar',
      title: 'Фото курьера',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'rating',
      title: 'Рейтинг (1-5)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'text',
      title: 'Текст отзыва',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
