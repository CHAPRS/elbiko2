export default {
  name: 'hero',
  title: 'Hero секция',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Подзаголовок',
      type: 'text',
      rows: 2,
    },
    {
      name: 'badge',
      title: 'Бейдж',
      type: 'string',
    },
    {
      name: 'stat1_label',
      title: 'Статистика 1 - подпись',
      type: 'string',
    },
    {
      name: 'stat1_value',
      title: 'Статистика 1 - значение',
      type: 'string',
    },
    {
      name: 'stat2_label',
      title: 'Статистика 2 - подпись',
      type: 'string',
    },
    {
      name: 'stat2_value',
      title: 'Статистика 2 - значение',
      type: 'string',
    },
    {
      name: 'stat3_label',
      title: 'Статистика 3 - подпись',
      type: 'string',
    },
    {
      name: 'stat3_value',
      title: 'Статистика 3 - значение',
      type: 'string',
    },
    {
      name: 'cta_text',
      title: 'Текст основной кнопки',
      type: 'string',
    },
    {
      name: 'cta_link',
      title: 'Ссылка основной кнопки',
      type: 'string',
    },
    {
      name: 'secondary_cta_text',
      title: 'Текст вторичной кнопки',
      type: 'string',
    },
    {
      name: 'secondary_cta_link',
      title: 'Ссылка вторичной кнопки',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}