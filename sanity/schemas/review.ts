export default {
  name: 'review',
  title: 'Отзыв',
  type: 'document',
  fields: [
    {
      name: 'author',
      title: 'Автор',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'platform',
      title: 'Платформа',
      type: 'string',
    },
    {
      name: 'duration',
      title: 'Длительность использования',
      type: 'string',
    },
    {
      name: 'rating',
      title: 'Рейтинг',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
    },
    {
      name: 'text',
      title: 'Текст отзыва',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Порядок отображения',
      type: 'number',
    },
  ],
  preview: {
    select: {
      title: 'author',
      subtitle: 'rating',
    },
  },
}