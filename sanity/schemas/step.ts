export default {
  name: 'step',
  title: 'Шаг (Как это работает)',
  type: 'document',
  fields: [
    {
      name: 'number',
      title: 'Номер шага',
      type: 'string',
      description: 'Например: 01, 02, 03',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Изображение шага',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Изображение для визуализации шага',
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
      subtitle: 'number',
    },
  },
}
