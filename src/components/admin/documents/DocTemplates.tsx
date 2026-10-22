'use client';

// Печатные бланки: договор, акт приёма-передачи (Приложение №1),
// акт оказанных услуг (возврат), доп. соглашение о продлении.
// Пустые графы — <input className="doc-field">, при печати выглядят текстом.
// Два варианта формулировок: байк ("электровелосипед") и АКБ ("аккумуляторная батарея").

export type DocKind = 'CONTRACT' | 'HANDOVER_ACT' | 'RETURN_ACT' | 'EXTENSION';
export type DocItemType = 'bike' | 'battery';

export interface DocProps {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  itemType: DocItemType;
}

// Словарь формулировок под предмет аренды
function T(itemType: DocItemType) {
  return itemType === 'bike'
    ? {
        item: 'электровелосипед',
        itemGen: 'электровелосипеда',
        itemPrep: 'электровелосипеде',
        itemPassed: 'переданный электровелосипед',
        docTitle: 'ДОГОВОР АРЕНДЫ ЭЛЕКТРОВЕЛОСИПЕДА',
        actTitle: 'АКТ ПРИЕМА-ПЕРЕДАЧИ ЭЛЕКТРОВЕЛОСИПЕДА',
        contractRef: 'Договору аренды электровелосипеда',
        purpose: 'для курьерской деятельности',
      }
    : {
        item: 'аккумуляторная батарея',
        itemGen: 'аккумуляторной батареи',
        itemPrep: 'аккумуляторной батарее',
        itemPassed: 'переданная аккумуляторная батарея',
        docTitle: 'ДОГОВОР АРЕНДЫ АККУМУЛЯТОРНОЙ БАТАРЕИ',
        actTitle: 'АКТ ПРИЕМА-ПЕРЕДАЧИ АККУМУЛЯТОРНОЙ БАТАРЕИ',
        contractRef: 'Договору аренды аккумуляторной батареи',
        purpose: 'для использования в курьерской деятельности',
      };
}

function F({
  name,
  values,
  onChange,
  w,
  placeholder,
}: {
  name: string;
  values: Record<string, string>;
  onChange: (n: string, v: string) => void;
  w?: number | string;
  placeholder?: string;
}) {
  return (
    <input
      className="doc-field"
      style={w ? { width: typeof w === 'number' ? `${w}ch` : w } : undefined}
      data-field={name}
      value={values[name] ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(name, e.target.value)}
    />
  );
}

function Area({
  name,
  values,
  onChange,
  rows = 3,
  placeholder,
}: {
  name: string;
  values: Record<string, string>;
  onChange: (n: string, v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className="doc-field area"
      rows={rows}
      data-field={name}
      value={values[name] ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(name, e.target.value)}
    />
  );
}

function Check({
  name,
  option,
  label,
  values,
  onChange,
}: {
  name: string;
  option: string;
  label: string;
  values: Record<string, string>;
  onChange: (n: string, v: string) => void;
}) {
  return (
    <label style={{ display: 'block' }}>
      <input
        type="checkbox"
        data-field={name}
        data-option={option}
        checked={values[name] === option}
        onChange={() => onChange(name, values[name] === option ? '' : option)}
        style={{ marginRight: 6 }}
      />
      {label}
    </label>
  );
}

const LANDLORD = 'ИП Чапрыгина Юлия Алексеевна';
const LANDLORD_REQUISITES = 'ИНН 563101446790, ОГРНИП 326565800083231';

// ============================ ДОГОВОР ============================
export function ContractDoc({ values, onChange, itemType }: DocProps) {
  const t = T(itemType);
  return (
    <div className="doc-page">
      <p className="doc-title">
        {t.docTitle} № <F name="docNumber" w={6} values={values} onChange={onChange} />
      </p>
      <div className="doc-city">
        <span>г. Оренбург</span>
        <span>
          «<F name="docDay" w={2} values={values} onChange={onChange} />»{' '}
          <F name="docMonth" w={10} values={values} onChange={onChange} /> 2026 г.
        </span>
      </div>
      <p>
        Арендодатель: {LANDLORD}, {LANDLORD_REQUISITES}, с одной стороны, и
      </p>
      <p>
        Арендатор: <F name="tenantName" w="60%" values={values} onChange={onChange} />
      </p>
      <p>
        Паспорт: серия <F name="passportSeries" w={6} values={values} onChange={onChange} /> №{' '}
        <F name="passportNumber" w={10} values={values} onChange={onChange} />, выдан{' '}
        <F name="passportIssued" w="40%" values={values} onChange={onChange} />
      </p>
      <p>
        Дата рождения: <F name="birthDate" w={14} values={values} onChange={onChange} />
      </p>
      <p>
        Адрес регистрации: <F name="address" w="70%" values={values} onChange={onChange} />
      </p>
      <p>
        Телефон: <F name="phone" w={20} values={values} onChange={onChange} />
      </p>
      <p>совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем.</p>

      <p className="doc-h">1. Предмет договора</p>
      <p>
        1.1. Арендодатель передает Арендатору во временное владение и пользование{' '}
        {itemType === 'bike' ? 'электровелосипед' : 'аккумуляторную батарею'} (далее — Имущество){' '}
        {t.purpose}. Право собственности не переходит.
      </p>
      <p>
        1.2. Характеристики, комплектация, состояние и стоимость Имущества указываются в Акте
        приема-передачи (Приложение №1), который является неотъемлемой частью договора.
      </p>

      <p className="doc-h">2. Срок и оплата</p>
      <p>
        2.1. Срок аренды: с «<F name="startDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="startMonth" w={10} values={values} onChange={onChange} /> 2026 г. по «
        <F name="endDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="endMonth" w={10} values={values} onChange={onChange} /> 2026 г.
      </p>
      <p>
        2.2. Арендная плата: <F name="price" w={10} values={values} onChange={onChange} /> руб. за{' '}
        <F name="pricePeriod" w={12} values={values} onChange={onChange} placeholder="день / неделю" />
      </p>
      <p>2.3. При продлении аренды применяется текущий тариф, если иное не согласовано Сторонами.</p>
      <p>
        2.4. При просрочке возврата Имущества Арендатор оплачивает аренду за все дни просрочки +
        штраф в размере 1200 (одна тысяча двести) руб. за каждый день просрочки (ст. 622 ГК РФ).
      </p>

      <p className="doc-h">3. Передача и возврат</p>
      <p>
        3.1. Передача и возврат осуществляются по Акту приема-передачи с фиксацией состояния
        (включая фото/видео) сторонами.
      </p>
      <p>
        3.2 Выявленные при передаче недостатки указываются в Акте. Недостатки, не указанные в Акте и
        не зафиксированные иным способом до начала использования Имущества, считаются
        отсутствовавшими на момент передачи, если Арендатор не докажет обратное.
      </p>
      <p>
        3.3. Арендатор обязан вернуть Имущество в том же состоянии, с учетом нормального износа, в
        месте и время, согласованные Сторонами, в последний день аренды.
      </p>
      <p>
        3.4. Арендодатель вправе провести дополнительную диагностику в течение 10 календарных дней
        после возврата. При обнаружении скрытых повреждений (не указанных в Акте) Арендатор
        возмещает расходы на ремонт.
      </p>

      <p className="doc-h">4. Права и обязанности Арендатора</p>
      <p>4.1. Арендатор обязуется:</p>
      <p>4.1.1 Соблюдать правила эксплуатации Имущества.</p>
      <p>4.1.2. Обеспечивать сохранность Имущества, не передавать Имущество третьим лицам.</p>
      <p>
        4.1.3. Немедленно (в течение 3 ч) сообщать Арендодателю о ДТП, краже, неисправности. При ДТП
        действовать в соответствии с законодательством РФ, при необходимости вызвать сотрудников
        полиции и предоставить Арендодателю подтверждающие документы.
      </p>
      <p>
        4.1.4. Использовать только родное зарядное устройство; не вскрывать электронику; не
        допускать попадания воды и иных жидкостей в аккумулятор, контроллер, дисплей и иные
        электронные компоненты.
      </p>
      {itemType === 'bike' ? (
        <>
          <p>
            4.1.5. Эксплуатировать Имущество ТОЛЬКО в г. Оренбург и в радиусе 10 км (если иное не
            согласовано письменно).
          </p>
          <p>
            4.1.6. Предоставлять Имущество для планового осмотра каждые 14 дней по требованию
            Арендодателя.
          </p>
          <p>4.1.7. Своевременно оплачивать аренду.</p>
          <p>4.1.8. Арендатору запрещается:</p>
          <p>
            a) Эксплуатировать Имущество со скоростью, превышающей 25 км/ч, установленную заводским
            ограничителем и действующим законодательством РФ (включая требования ПДД РФ и ГОСТ Р
            71894-2024).
          </p>
          <p>
            б) Предпринимать любые действия, направленные на отключение, изменение заводских
            настроек, штатных систем ограничения скорости и иного технического оборудования,
            установленного на Имуществе.
          </p>
          <p>
            в) Использовать Имущество, если его штатные системы ограничения скорости вышли из строя
            или были отключены, с обязательством незамедлительно уведомить Арендодателя о такой
            неисправности.
          </p>
          <p>4.1.9. Арендатор подтверждает, что:</p>
          <p>
            a) Он уведомлен о том, что в соответствии с ПДД РФ, электровелосипед классифицируется
            как велосипед только при выполнении условий: максимальная скорость при работе
            электродвигателя — не более 25 км/ч и номинальная мощность — до 250 Вт.
          </p>
          <p>
            б) Он осведомлен о том, что нарушение данных требований может повлечь его
            административную ответственность (в том числе штраф и задержание транспортного
            средства) и возлагает на него все связанные с этим риски и расходы.
          </p>
        </>
      ) : (
        <>
          <p>4.1.5. Своевременно оплачивать аренду.</p>
          <p>4.1.6. Арендатору запрещается:</p>
          <p>
            a) Вскрывать корпус батареи, изменять конструкцию, подключать к нештатным устройствам и
            зарядным устройствам.
          </p>
          <p>
            б) Подвергать Имущество нагреву, заморозке, ударам и попаданию влаги; хранить и
            заряжать в соответствии с инструкцией производителя.
          </p>
          <p>
            в) Эксплуатировать Имущество при внешних повреждениях корпуса, запахе, нагреве или
            вздутии — с обязательством незамедлительно уведомить Арендодателя.
          </p>
        </>
      )}

      <p>4.2. Арендатор имеет право:</p>
      <p>4.2.1. Получить имущество надлежащего качества.</p>
      <p>
        4.2.2. Право на замену Имущества в случае поломки не по его вине, либо соразмерно уменьшить
        арендную плату за время простоя.
      </p>

      <p className="doc-h">5. Повреждение, утрата и ответственность</p>
      <p>5.1. Арендатор несет ответственность за утрату или повреждение Имущества в период аренды.</p>
      <p>5.2. При повреждении — возмещает подтвержденные расходы на ремонт и восстановление.</p>
      <p>
        5.3. При невозможности восстановления — возмещает стоимость утраченного имущества согласно
        разделу 2 Акта приема-передачи.
      </p>
      <p>
        5.4 Стоимость каждого элемента Имущества и комплектующих
        {itemType === 'bike' ? ', включая электровелосипед, аккумулятор, зарядное устройство, замок и иное переданное имущество,' : ''}{' '}
        указывается отдельно в Акте приема-передачи.
      </p>
      <p>
        5.5. При краже Арендатор обязан заявить в полицию в течение 3 часов с момента обнаружения
        факта кражи.
      </p>

      {itemType === 'bike' && (
        <>
          <p className="doc-h">6. ДТП и ответственность перед третьими лицами</p>
          <p>6.1. Арендатор самостоятельно несет ответственность за нарушение ПДД и штрафы.</p>
          <p>
            6.2. Если по вине Арендатора причинен вред третьим лицам, он возмещает Арендодателю все
            документально подтвержденные расходы (в части, не покрытой страховкой).
          </p>
          <p>
            6.3. В случае причинения Арендатором вреда третьим лицам вследствие виновных действий
            Арендатора он возмещает все затраты, понесенные этими лицами.
          </p>
          <p>
            6.4. Арендатор обязан незамедлительно сообщить Арендодателю о ДТП, в котором участвовал
            арендованный электровелосипед.
          </p>
          <p className="doc-h">7. Мониторинг и блокировка</p>
          <p>
            7.1. Электровелосипед оснащен GPS/ГЛОНАСС. Арендатор согласен на отслеживание
            местоположения для сохранности имущества.
          </p>
          <p>
            7.2. При просрочке оплаты более 2 дней, выезде за зону или признаках хищения
            Арендодатель вправе дистанционно ограничить использование электровелосипеда
            (заблокировать), предварительно уведомив Арендатора.
          </p>
        </>
      )}

      <p className="doc-h">8. Права и обязанности Арендодателя</p>
      <p>Арендодатель имеет право:</p>
      <p>8.1. Арендодатель вправе в одностороннем порядке расторгнуть договор (уведомив Арендатора) в случаях:</p>
      <p>8.1.1. просрочка оплаты более 2 календарных дней;</p>
      <p>8.1.2. передача Имущества третьим лицам;</p>
      <p>8.1.3. грубое нарушение правил эксплуатации (угроза сохранности);</p>
      {itemType === 'bike' && <p>8.1.4. выезд за установленную зону эксплуатации без согласования.</p>}
      <p>8.2. Требовать возмещения ущерба, причиненного Имуществу.</p>
      <p>8.3. Проверять соблюдение Арендатором условий Договора.</p>
      <p>8.4. Временно изъять Имущество для проведения ремонта или технического обслуживания.</p>
      <p>
        8.5. В одностороннем порядке отказаться от исполнения договора в случаях и порядке,
        предусмотренных Договором и законодательством РФ. Отказ осуществляется путем уведомления
        Арендатора. Договор прекращается в порядке, предусмотренном законодательством РФ и
        настоящим Договором. Возможность договорного одностороннего отказа должна применяться
        добросовестно и разумно в соответствии со ст. 450.1 ГК РФ.
      </p>
      <p>8.7. Арендодатель обязан:</p>
      <p>
        8.7.1. Передать Имущество в состоянии, пригодном для использования по назначению
        {itemType === 'bike' ? ', с исправными и находящимися в рабочем состоянии заводскими ограничителями скорости (25 км/ч)' : ''}
        , соответствующем условиям Договора и Акту приема-передачи.
      </p>
      <p>
        8.7.2. Обеспечить Арендатору консультационную поддержку по вопросам эксплуатации,
        техническим неисправностям.
      </p>
      <p>
        8.7.3. В случае выявления технической неисправности Имущества, возникшей не по вине
        Арендатора (производственный брак), Арендодатель обязан:
      </p>
      <p>
        8.7.3.1. В течение 5 (пяти) рабочих часов с момента уведомления Арендатора предоставить ему
        для замены другое аналогичное исправное Имущество (при наличии);
      </p>
      <p>
        8.7.3.2. Если замена невозможна, Арендодатель обязан соразмерно уменьшить арендную плату за
        время фактического простоя Имущества или возвратить уплаченную за этот период арендную
        плату (в соответствии со ст. 612 ГК РФ).
      </p>

      <p className="doc-h">9. Электронная переписка</p>
      <p>
        Стороны признают юридически значимыми уведомления, требования, сообщения и документы,
        направленные по указанному в Договоре номеру телефона, электронной почте или согласованному
        мессенджеру.
      </p>
      <p className="doc-h">10. Заключительные положения</p>
      <p>
        10.1. Все изменения и дополнения к Договору оформляются письменно, в том числе посредством
        электронной переписки.
      </p>
      <p>
        10.2. Споры разрешаются путем переговоров, а при недостижении соглашения — в соответствии с
        установленным законодательством Российской Федерации в Оренбургском районном суде.
      </p>
      <p>10.3. Неотъемлемой частью Договора является Акт приема-передачи {t.itemGen}.</p>
      <p className="doc-h">11. Персональные данные</p>
      <p>
        Подписывая договор, Арендатор дает согласие на обработку своих персональных данных (ФИО,
        паспорт, телефон) в целях исполнения договора и взыскания задолженности, с правом передачи
        третьим лицам (юристам, коллекторам) в объеме, необходимом для защиты интересов
        Арендодателя.
      </p>
      <p className="doc-h">12. Реквизиты и подписи</p>
      <div className="doc-sign">
        <div>
          <p>АРЕНДОДАТЕЛЬ:</p>
          <p>{LANDLORD}</p>
          <p>ИНН: 563101446790</p>
          <p>Подпись: ______________</p>
        </div>
        <div>
          <p>АРЕНДАТОР:</p>
          <p>
            ФИО: <F name="tenantName2" w="90%" values={values} onChange={onChange} />
          </p>
          <p>Подпись: _________________</p>
        </div>
      </div>
    </div>
  );
}

// ====================== АКТ ПРИЁМА-ПЕРЕДАЧИ (Приложение №1) ======================
const CONDITION_ROWS_BIKE = [
  'Рама',
  'Переднее колесо',
  'Заднее колесо',
  'Шины',
  'Тормозная система',
  'Цепь / привод',
  'Электродвигатель',
  'Аккумулятор',
  'Дисплей / органы управления',
  'Освещение',
  'Иные замечания',
];
const CONDITION_ROWS_BATTERY = ['Корпус', 'Клеммы / разъёмы', 'Кабель', 'Индикатор заряда', 'Иные замечания'];

export function HandoverActDoc({ values, onChange, itemType }: DocProps) {
  const t = T(itemType);
  const rows = itemType === 'bike' ? CONDITION_ROWS_BIKE : CONDITION_ROWS_BATTERY;
  return (
    <div className="doc-page">
      <p className="doc-subtitle">Приложение № 1</p>
      <p className="doc-title">{t.actTitle}</p>
      <p className="doc-subtitle">
        к {t.contractRef} № <F name="contractNumber" w={6} values={values} onChange={onChange} /> от «
        <F name="contractDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="contractMonth" w={10} values={values} onChange={onChange} /> 2026 г.
      </p>
      <div className="doc-city">
        <span>г. Оренбург</span>
        <span>
          «<F name="docDay" w={2} values={values} onChange={onChange} />»{' '}
          <F name="docMonth" w={10} values={values} onChange={onChange} /> 2026 г.
        </span>
      </div>
      <p>Арендодатель: {LANDLORD}</p>
      <p>
        Арендатор: <F name="tenantName" w="60%" values={values} onChange={onChange} />
      </p>
      <p>Стороны составили настоящий Акт о нижеследующем.</p>

      <p className="doc-h">1. Идентификация {t.itemGen}</p>
      <table>
        <tbody>
          {itemType === 'bike' ? (
            <>
              <tr>
                <td>Марка, модель</td>
                <td><F name="model" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>Инвентарный номер</td>
                <td><F name="invNumber" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>VIN / серийный номер рамы</td>
                <td><F name="vin" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>Номер аккумулятора</td>
                <td><F name="batteryNumber" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>Пробег на момент передачи</td>
                <td><F name="mileage" w={10} values={values} onChange={onChange} /> км</td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <td>Наименование</td>
                <td><F name="model" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>Серийный / инвентарный номер</td>
                <td><F name="invNumber" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>Напряжение / ёмкость</td>
                <td><F name="batterySpec" w="95%" values={values} onChange={onChange} /></td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      <p className="doc-h">2. Комплектность и стоимость имущества</p>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Наименование имущества</th>
            <th>Кол-во</th>
            <th>Состояние при передаче</th>
            <th>Стоимость единицы, ₽</th>
          </tr>
        </thead>
        <tbody>
          {itemType === 'bike' ? (
            <>
              {[
                ['Электровелосипед (рама, колеса, электродвигатель, электрооборудование)', 'price1', '60 000,00'],
                ['Аккумуляторная батарея', 'price2', '40 000,00'],
                ['Зарядное устройство', 'price3', '2 000,00'],
                ['Ключ от аккумулятора / замка', 'price4', '2 000,00'],
                ['Велосипедный замок', 'price5', '500,00'],
                ['Крепление для багажа', 'price6', '500,00'],
              ].map(([label, field, def], i) => (
                <tr key={field}>
                  <td>{i + 1}</td>
                  <td>{label}</td>
                  <td>1</td>
                  <td><F name={`cond${i + 1}`} w="95%" values={values} onChange={onChange} placeholder="Исправное" /></td>
                  <td><F name={field} w={10} values={values} onChange={onChange} placeholder={def} /></td>
                </tr>
              ))}
            </>
          ) : (
            <>
              <tr>
                <td>1</td>
                <td><F name="itemName" w="95%" values={values} onChange={onChange} placeholder="Аккумуляторная батарея" /></td>
                <td>1</td>
                <td><F name="cond1" w="95%" values={values} onChange={onChange} placeholder="Исправное" /></td>
                <td><F name="price1" w={10} values={values} onChange={onChange} placeholder="40 000,00" /></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Зарядное устройство</td>
                <td>1</td>
                <td><F name="cond2" w="95%" values={values} onChange={onChange} placeholder="Исправное" /></td>
                <td><F name="price2" w={10} values={values} onChange={onChange} placeholder="2 000,00" /></td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <p>
        ИТОГО стоимость переданного имущества: <F name="totalSum" w={10} values={values} onChange={onChange} />{' '}
        (<F name="totalWords" w="45%" values={values} onChange={onChange} />) рублей.
      </p>

      <p className="doc-h">3. Внешнее и техническое состояние</p>
      <table>
        <thead>
          <tr>
            <th>Элемент конструкции</th>
            <th>Состояние</th>
            <th>Примечание</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row}>
              <td>{row}</td>
              <td><F name={`state${i + 1}`} w="95%" values={values} onChange={onChange} placeholder="Рабочее/без повреждений" /></td>
              <td><F name={`note${i + 1}`} w="95%" values={values} onChange={onChange} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="doc-h">4. Подтверждение Арендатора</p>
      <p>Арендатор подтверждает, что:</p>
      <ul>
        <li>лично осмотрел {t.item} и переданное имущество;</li>
        <li>проверил их комплектность и работоспособность;</li>
        <li>получил имущество в состоянии, пригодном для использования по назначению;</li>
        <li>ознакомлен с правилами эксплуатации {t.itemGen};</li>
        <li>получил копию настоящего Акта;</li>
        <li>согласен с указанными в настоящем Акте характеристиками, комплектностью и стоимостью имущества.</li>
      </ul>
      <p>Выявленные при передаче недостатки и повреждения указаны в настоящем Акте.</p>
      <p>
        Подписание настоящего Акта не лишает Арендатора права ссылаться на скрытые недостатки,
        которые не могли быть обнаружены при обычном осмотре.
      </p>

      <p className="doc-h">5. Стоимость имущества при утрате</p>
      <p>Стороны согласовали указанную в разделе 2 стоимость имущества.</p>
      <p>
        Указанная стоимость используется для определения размера возмещения в случае утраты или
        полного уничтожения соответствующего имущества с учетом условий Договора и требований
        законодательства Российской Федерации.
      </p>
      <p>
        При частичном повреждении размер возмещения определяется исходя из документально
        подтвержденных расходов на ремонт или замену поврежденной детали/комплектующего.
      </p>

      <div className="doc-sign">
        <div>
          <p>АРЕНДОДАТЕЛЬ</p>
          <p>{LANDLORD}</p>
          <p>Подпись: ______________________</p>
        </div>
        <div>
          <p>АРЕНДАТОР</p>
          <p>
            ФИО: <F name="tenantName2" w="90%" values={values} onChange={onChange} />
          </p>
          <p>Подпись: ______________________</p>
        </div>
      </div>
    </div>
  );
}

// ================== АКТ ОКАЗАННЫХ УСЛУГ (возврат) ==================
export function ReturnActDoc({ values, onChange, itemType }: DocProps) {
  const t = T(itemType);
  return (
    <div className="doc-page">
      <p className="doc-title">
        АКТ ОКАЗАННЫХ УСЛУГ № <F name="docNumber" w={6} values={values} onChange={onChange} />
      </p>
      <p className="doc-subtitle">
        к Договору аренды (проката) {t.itemGen} № <F name="contractNumber" w={6} values={values} onChange={onChange} />{' '}
        от «<F name="contractDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="contractMonth" w={10} values={values} onChange={onChange} /> 2026 г.
      </p>
      <div className="doc-city">
        <span>г. Оренбург</span>
        <span>
          «<F name="docDay" w={2} values={values} onChange={onChange} />»{' '}
          <F name="docMonth" w={10} values={values} onChange={onChange} /> 2026 г.
        </span>
      </div>
      <p>Арендодатель: {LANDLORD}</p>
      <p>
        Арендатор: <F name="tenantName" w="60%" values={values} onChange={onChange} />
      </p>
      <p>
        Стороны составили настоящий Акт о том, что за период с «
        <F name="periodStartDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="periodStartMonth" w={10} values={values} onChange={onChange} /> 2026 г. по «
        <F name="periodEndDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="periodEndMonth" w={10} values={values} onChange={onChange} /> 2026 г. Арендодатель
        предоставил Арендатору во временное владение и пользование {t.item} в соответствии с
        условиями Договора.
      </p>
      <table>
        <tbody>
          <tr>
            <td>{itemType === 'bike' ? 'Электровелосипед' : 'Аккумуляторная батарея'}</td>
            <td><F name="model" w="95%" values={values} onChange={onChange} /></td>
          </tr>
          <tr>
            <td>Инвентарный №</td>
            <td><F name="invNumber" w="95%" values={values} onChange={onChange} /></td>
          </tr>
          <tr>
            <td>Период аренды</td>
            <td>
              с <F name="periodStart" w={14} values={values} onChange={onChange} /> по{' '}
              <F name="periodEnd" w={14} values={values} onChange={onChange} />
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Арендатор подтверждает, что услуга по предоставлению {t.itemGen} оказана в полном объеме,
        Имущество предоставлено в согласованный период, претензий к объему оказанных услуг и
        расчетам не имеет.
      </p>
      <p className="doc-h">Состояние {t.itemGen} при возврате</p>
      <p>На момент возврата {t.item} осмотрен{itemType === 'bike' ? '' : 'а'} Сторонами.</p>
      <p>
        {itemType === 'bike' && (
          <>Пробег при возврате: <F name="returnMileage" w={8} values={values} onChange={onChange} /> км. </>
        )}
      </p>
      <p>Общее состояние:</p>
      <Check
        name="condition"
        option="ok"
        label="Имущество возвращено в исправном состоянии, с учетом нормального износа."
        values={values}
        onChange={onChange}
      />
      <Check
        name="condition"
        option="damaged"
        label="Имущество возвращено с повреждениями / неисправностями."
        values={values}
        onChange={onChange}
      />
      <p>Описание выявленных повреждений, неисправностей или отсутствующего имущества:</p>
      <Area name="damagesDesc" values={values} onChange={onChange} rows={3} />
      <p>
        Настоящий Акт является подтверждением оказания услуг за указанный период и не изменяет
        условий Договора.
      </p>
      <div className="doc-sign">
        <div>
          <p>АРЕНДОДАТЕЛЬ</p>
          <p>{LANDLORD} /____________/</p>
        </div>
        <div>
          <p>АРЕНДАТОР</p>
          <p>
            <F name="tenantName2" w="80%" values={values} onChange={onChange} /> /____________/
          </p>
        </div>
      </div>
    </div>
  );
}

// ================== ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ ==================
export function ExtensionDoc({ values, onChange, itemType }: DocProps) {
  const t = T(itemType);
  const replaced = values['variant'] === 'replace';
  return (
    <div className="doc-page">
      <p className="doc-title">
        ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ № <F name="docNumber" w={6} values={values} onChange={onChange} />
      </p>
      <p className="doc-subtitle">
        к Договору аренды (проката) {t.itemGen} № <F name="contractNumber" w={6} values={values} onChange={onChange} />{' '}
        от «<F name="contractDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="contractMonth" w={10} values={values} onChange={onChange} /> 2026 г.
      </p>
      <div className="doc-city">
        <span>г. Оренбург</span>
        <span>
          «<F name="docDay" w={2} values={values} onChange={onChange} />»{' '}
          <F name="docMonth" w={10} values={values} onChange={onChange} /> 2026 г.
        </span>
      </div>
      <p>Арендодатель: {LANDLORD}</p>
      <p>
        Арендатор: <F name="tenantName" w="60%" values={values} onChange={onChange} />
      </p>
      <p>совместно именуемые «Стороны», заключили настоящее Дополнительное соглашение о нижеследующем:</p>

      <p className="doc-h">1. Продление срока аренды</p>
      <p>
        1.1. Стороны договорились продлить срок действия Договора с «
        <F name="oldEndDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="oldEndMonth" w={10} values={values} onChange={onChange} /> 2026 г. по «
        <F name="newEndDay" w={2} values={values} onChange={onChange} />»{' '}
        <F name="newEndMonth" w={10} values={values} onChange={onChange} /> 2026 г.
      </p>
      <p>
        1.2. Стоимость аренды за продленный период составляет{' '}
        <F name="price" w={10} values={values} onChange={onChange} /> (
        <F name="priceWords" w="45%" values={values} onChange={onChange} />) рублей.
      </p>

      <p className="doc-h">2. {itemType === 'bike' ? 'Электровелосипед' : 'Аккумуляторная батарея'}</p>
      <Check
        name="variant"
        option="same"
        label={`Вариант 1 — без замены Имущества: в продленный период Арендатор продолжает пользоваться ${t.itemPrep === 'электровелосипеде' ? 'электровелосипедом' : 'аккумуляторной батареей'}, переданн${itemType === 'bike' ? 'ым' : 'ой'} по первоначальному Акту приема-передачи.`}
        values={values}
        onChange={onChange}
      />
      <Check
        name="variant"
        option="replace"
        label="Вариант 2 — с заменой Имущества:"
        values={values}
        onChange={onChange}
      />
      {replaced && (
        <>
          <p>
            2.2. С «<F name="replaceDay" w={2} values={values} onChange={onChange} />»{' '}
            <F name="replaceMonth" w={10} values={values} onChange={onChange} /> 2026 г. ранее{' '}
            {t.itemPassed} возвращается Арендодателю, а Арендатору передается{' '}
            {itemType === 'bike' ? 'другой электровелосипед' : 'другая аккумуляторная батарея'}:
          </p>
          <table>
            <tbody>
              <tr>
                <td>Показатель</td>
                <td>{itemType === 'bike' ? 'Новый электровелосипед' : 'Новая батарея'}</td>
              </tr>
              <tr>
                <td>Марка / модель</td>
                <td><F name="newModel" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>Инвентарный №</td>
                <td><F name="newInv" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              <tr>
                <td>Серийный № аккумулятора</td>
                <td><F name="newBattSerial" w="95%" values={values} onChange={onChange} /></td>
              </tr>
              {itemType === 'bike' && (
                <tr>
                  <td>Пробег</td>
                  <td><F name="newMileage" w={8} values={values} onChange={onChange} /> км</td>
                </tr>
              )}
              <tr>
                <td>Стоимость имущества</td>
                <td><F name="newPrice" w={10} values={values} onChange={onChange} /> руб.</td>
              </tr>
              <tr>
                <td>Состояние</td>
                <td><F name="newCondition" w="95%" values={values} onChange={onChange} /></td>
              </tr>
            </tbody>
          </table>
          <p>
            2.3. Передача нового Имущества осуществляется по Акту приема-передачи. С момента его
            передачи положения Договора распространяются на указанное в настоящем пункте Имущество.
          </p>
        </>
      )}

      <p className="doc-h">3. Прочие условия</p>
      <p>
        3.1. Все остальные условия Договора, не измененные настоящим Дополнительным соглашением,
        остаются без изменений.
      </p>
      <p>3.2. Настоящее Дополнительное соглашение является неотъемлемой частью Договора.</p>
      <p>3.3. Настоящее Дополнительное соглашение вступает в силу с момента его подписания Сторонами.</p>

      <div className="doc-sign">
        <div>
          <p>АРЕНДОДАТЕЛЬ</p>
          <p>{LANDLORD}</p>
          <p>________________ / Чапрыгина Ю.А. /</p>
        </div>
        <div>
          <p>АРЕНДАТОР</p>
          <p>________________ /<F name="tenantName2" w="70%" values={values} onChange={onChange} /> /</p>
        </div>
      </div>
    </div>
  );
}

export const DOC_COMPONENTS: Record<
  DocKind,
  React.ComponentType<DocProps>
> = {
  CONTRACT: ContractDoc,
  HANDOVER_ACT: HandoverActDoc,
  RETURN_ACT: ReturnActDoc,
  EXTENSION: ExtensionDoc,
};

export const DOC_KIND_LABELS: Record<DocKind, string> = {
  CONTRACT: 'Договор аренды',
  HANDOVER_ACT: 'Акт приёма-передачи (Приложение №1)',
  RETURN_ACT: 'Акт оказанных услуг (возврат)',
  EXTENSION: 'Доп. соглашение о продлении',
};
