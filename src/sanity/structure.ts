import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.listItem()
        .title('Тарифы для курьеров')
        .schemaType('tariff')
        .child(S.documentTypeList('tariff').title('Список тарифов')),
      
      // Остальные пункты закомментируем, пока не создадим для них файлы схем
      /*
      S.listItem()
        .title('Hero секция')
        .schemaType('hero')
        .child(S.documentTypeList('hero').title('Hero секция')),
      S.listItem()
        .title('Отзывы')
        .schemaType('review')
        .child(S.documentTypeList('review').title('Отзывы')),
      S.listItem()
        .title('FAQ')
        .schemaType('faq')
        .child(S.documentTypeList('faq').title('FAQ')),
      S.divider(),
      S.listItem()
        .title('Велосипеды')
        .schemaType('bike')
        .child(S.documentTypeList('bike').title('Список велосипедов')),
      */
    ])
