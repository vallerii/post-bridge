import type { PromData } from '@/components/posts/PromFields'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/'/g, '&apos;')
}

interface PostForYml {
  id: string
  title: string | null
  description: string | null
  price: number | null
  currency: string | null
  media_urls?: string[]
  prom_data: PromData | null
}

const CONDITION_LABELS = {
  new: 'Новий',
  used: 'Вживаний',
}

export function generatePromYml(post: PostForYml): string {
  const p = post.prom_data
  // ID офера — Prom оновлює/розпізнає товар саме за цим id при повторному імпорті.
  // Раніше, якщо юзер не заповнив SKU, використовувався `post-${Date.now()}` — тобто
  // ЩОРАЗУ при повторному скачуванні/імпорті того самого поста генерувався НОВИЙ,
  // інший id, і Prom створював ще один окремий товар замість оновлення вже існуючого
  // (ще одне ймовірне джерело "дублювання" на Prom). Тепер id стабільний і прив'язаний
  // до id самого поста — однаковий при кожному повторному скачуванні файлу.
  const offerId = p?.sku?.trim() || `PB-${post.id.slice(0, 8).toUpperCase()}`
  const name = escapeXml(post.title ?? 'Товар')
  const description = escapeXml(post.description ?? '')
  const price = post.price ?? 0
  const currency = post.currency ?? 'UAH'

  // Availability
  const availabilityMap = {
    in_stock: 'true',
    order: 'false',
    not_available: 'false',
  }
  const available = availabilityMap[p?.availability ?? 'in_stock']

  // Зображення — перше медіа
  const images = (post.media_urls ?? [])
    .filter(url => !url.match(/\.(mp4|mov|avi|webm)$/i))
    .map(url => `      <picture>${escapeXml(url)}</picture>`)
    .join('\n')

  // Група на сайті — НАВМИСНО більше не відправляємо в Prom через YML.
  // Спробували двічі: спочатку з group_name = повний шлях (баг — Prom не розпізнавав
  // назву і плодив дублікати груп), потім з власною назвою + parentId атрибутом (за
  // офіційною документацією Prom) — але реальний тест юзера показав, що навіть з
  // правильними id+parentId+назвою Prom ВСЕ ОДНО створює новий дублікат групи при
  // кожному повторному ручному імпорті файлу. Схоже, ручний "завантажити файл" імпорт
  // в кабінеті Prom не запам'ятовує зв'язок id↔група між окремими сесіями імпорту (на
  // відміну від сталого підключеного фіда), тому надійного способу через YML немає.
  // Щоб не плодити нові дублікати на живому акаунті — просто не чіпаємо групи через
  // YML. Поле пошуку групи в формі лишається як підказка для юзера (яку групу мати на
  // увазі), а саме призначення товару в групу треба робити вручну в кабінеті Prom.
  const categoryId = '1'

  // Категорія маркетплейсу (не плутати з "групою на сайті" вище). Якщо юзер вставив
  // посилання на категорію зі свого кабінету Prom — передаємо його напряму.
  // Якщо ні — нічого не пишемо: Prom офіційно автоматично визначає категорію
  // за назвою/описом/ціною товару (див. підтримка.prom.ua "Автоматичне визначення
  // категорії товару на Prom"), тому спеціальний API-пошук тут не потрібен.
  //
  // ⚠️ На реальному тесті категорія за посиланням не підтягнулась (Prom обрав свою,
  // хибну, автоматично) — можлива причина: юзер копіює URL зі своєї версії сайту з
  // мовним префіксом "/ua/" (напр. prom.ua/ua/Nazva-Kategorii), а Prom матчить категорію
  // за канонічним посиланням БЕЗ цього префіксу. Прибираємо "/ua/" про всяк випадок —
  // якщо це не єдина причина, тег все одно шкоди не завдає.
  const normalizedCategoryUrl = p?.category_url?.trim()
    .replace(/^(https?:\/\/(?:www\.)?prom\.ua)\/ua\//i, '$1/')
  const portalCategoryUrl = normalizedCategoryUrl
    ? `\n      <portal_category_url>${escapeXml(normalizedCategoryUrl)}</portal_category_url>`
    : ''

  // Необов'язкові поля
  const vendorCode = p?.sku ? `\n      <vendorCode>${escapeXml(p.sku)}</vendorCode>` : ''
  const oldPrice = p?.old_price ? `\n      <oldprice>${p.old_price}</oldprice>` : ''
  const vendor = p?.vendor ? `\n      <vendor>${escapeXml(p.vendor)}</vendor>` : ''
  const unit = p?.unit ? `\n      <unit>${escapeXml(p.unit)}</unit>` : ''
  const quantity = p?.quantity ? `\n      <quantity_in_stock>${p.quantity}</quantity_in_stock>` : ''
  const keywordsJoined = p?.keywords?.length ? escapeXml(p.keywords.join(', ')) : ''
  const keywords = keywordsJoined
    ? `\n      <keywords>${keywordsJoined}</keywords>\n      <keywords_ua>${keywordsJoined}</keywords_ua>`
    : ''

  // Характеристики (<param>) — Колір/Матеріал/Стан (спільні поля з Horoshop) +
  // власні характеристики, налаштовані юзером в /platforms для Prom.
  const paramTags: string[] = []
  if (p?.color) paramTags.push(`      <param name="Колір">${escapeXml(p.color)}</param>`)
  if (p?.material) paramTags.push(`      <param name="Матеріал">${escapeXml(p.material)}</param>`)
  if (p?.condition) paramTags.push(`      <param name="Стан">${CONDITION_LABELS[p.condition]}</param>`)
  if (p?.custom_fields) {
    for (const [fieldName, value] of Object.entries(p.custom_fields)) {
      if (!value) continue
      paramTags.push(`      <param name="${escapeXml(fieldName)}">${escapeXml(value)}</param>`)
    }
  }
  const params = paramTags.length ? '\n' + paramTags.join('\n') : ''

  // ПОВЕРНУВ дублювання в name_ua/description_ua (після реального тесту юзера).
  // Раніше я прибрав ці теги, розраховуючи що Prom при ручному імпорті файлу з ОДНІЄЮ
  // мовною версією покаже чекбокси "якою мовою заповнено товар" і сам безкоштовно
  // перекладе — так написано в довідці Prom, але на практиці для цього способу імпорту
  // (файл в кабінет) це НЕ спрацювало: жодних чекбоксів не з'явилось, текст просто
  // ліг у російське поле, а українське лишилось порожнім на сайті. Тобто мій попередній
  // висновок з документації виявився невірним для цього флоу імпорту.
  // Тому повертаємось до дублювання: той самий (український) текст в обидва поля.
  // Мінус — в кабінеті Prom "російська" версія показує помітку "містить слова
  // українською" з посиланням "Перекласти українською" — це ручна кнопка, її можна
  // натиснути на кожному товарі, якщо потрібен саме російський текст, автоматично
  // це не відбувається. Але головне — українська версія (яку бачать відвідувачі
  // сайту за замовчуванням) тепер заповнена коректно.
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${new Date().toISOString()}">
  <shop>
    <offers>
      <offer id="${offerId}" available="${available}">
        <name>${name}</name>
        <name_ua>${name}</name_ua>
        <description>${description}</description>
        <description_ua>${description}</description_ua>
        <price>${price}</price>
        <currencyId>${currency}</currencyId>
        <categoryId>${categoryId}</categoryId>${portalCategoryUrl}${vendorCode}${oldPrice}${vendor}${unit}${quantity}${keywords}${params}
${images ? images + '\n' : ''}      </offer>
    </offers>
  </shop>
</yml_catalog>`
}