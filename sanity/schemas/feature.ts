export default {
  name: 'feature',
  title: 'Преимущество',
  type: 'document',
  fields: [
    {
      name: 'icon',
      title: 'Иконка (эмодзи)',
      type: 'string',
      description: 'Используйте эмодзи для иконки',
    },
    {
      name: 'image',
      title: 'Изображение преимущества',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Если изображение указано, оно заменит эмодзи',
    },
    {
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Описание',
      type: 'text',
      rows: 3,
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
      title: 'title',
      subtitle: 'description',
    },
  },
}
