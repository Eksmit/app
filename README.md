# 3D Print Calculator

Веб-приложение для расчета стоимости 3D печати с учетом материалов, времени, дополнительных услуг и всех расходов.

## Возможности

- **Калькулятор стоимости** — расчет с учетом:
  - Типа печати (FDM, SLA, Многоцветная)
  - Расхода материала
  - Времени печати
  - Ручной работы
  - Дополнительных услуг (постобработка, покраска, моделирование)
  - Коэффициента риска (брак)
  - Электроэнергии
  - Фондов развития и скидок
  - Налогов

- **Управление материалами** — учет остатков и расхода пластика
- **Дополнительные услуги** — настройка прайса на услуги
- **Заказы** — сохранение расчетов в "ожидании" или "завершенные"
- **Настройки** — все параметры расчета редактируемы

## Особенности многоцветной печати

Для многоцветной печати (MMU) реализован отдельный расчет:
- **Фактический расход** — пластик, который ушел на модель
- **Отходы** — пластик на смену цвета (с отдельным коэффициентом)
- **Общий расход** — сумма фактического и отходов

## Демо-аккаунты

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| operator | operator123 | Оператор |

## Развертывание на GitHub Pages

### Шаг 1: Создайте репозиторий на GitHub

1. Перейдите на [GitHub](https://github.com)
2. Нажмите "New repository"
3. Назовите репозиторий (например, `3d-print-calculator`)
4. Сделайте его публичным
5. Нажмите "Create repository"

### Шаг 2: Загрузите код

#### Вариант A: Через Git командной строки

```bash
# Клонируйте репозиторий
git clone https://github.com/ВАШ_ЮЗЕРНЕЙМ/3d-print-calculator.git
cd 3d-print-calculator

# Скопируйте все файлы проекта в папку
# (скопируйте содержимое папки app из этого архива)

# Добавьте, закоммитьте и запушьте
git add .
git commit -m "Initial commit"
git push origin main
```

#### Вариант B: Через веб-интерфейс GitHub

1. На странице репозитория нажмите "uploading an existing file"
2. Загрузите все файлы из папки `app`
3. Нажмите "Commit changes"

### Шаг 3: Настройте GitHub Pages

1. В репозитории перейдите в **Settings** → **Pages**
2. В разделе "Source" выберите **GitHub Actions**

### Шаг 4: Создайте workflow для деплоя

1. В репозитории создайте папку `.github/workflows/`
2. Создайте файл `deploy.yml` со следующим содержимым:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Шаг 5: Обновите vite.config.ts

Откройте `vite.config.ts` и измените `base` на имя вашего репозитория:

```typescript
export default defineConfig({
  base: '/3d-print-calculator/', // Замените на имя вашего репозитория
  // ... остальная конфигурация
});
```

### Шаг 6: Запушьте изменения

```bash
git add .
git commit -m "Add GitHub Pages workflow"
git push origin main
```

GitHub Actions автоматически соберет и задеплоит приложение. 

### Шаг 7: Получите ссылку

После успешного деплоя (займет 1-2 минуты), ваше приложение будет доступно по адресу:

```
https://ВАШ_ЮЗЕРНЕЙМ.github.io/3d-print-calculator/
```

Ссылка отображается в Settings → Pages и в разделе Actions.

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── LoginForm.tsx   # Форма входа
│   ├── Calculator.tsx  # Калькулятор
│   ├── OrdersList.tsx  # Список заказов
│   ├── MaterialsManager.tsx  # Управление материалами
│   ├── ServicesManager.tsx   # Управление услугами
│   └── SettingsPanel.tsx     # Настройки
├── contexts/
│   └── AuthContext.tsx # Контекст аутентификации
├── hooks/
│   └── useCalculator.ts # Хук для расчетов
├── store/
│   └── index.ts        # Работа с localStorage
├── types/
│   └── index.ts        # TypeScript типы
├── App.tsx             # Главный компонент
└── main.tsx            # Точка входа
```

## Безопасность

- Данные хранятся в localStorage браузера
- Простая аутентификация через сессию
- Два предустановленных аккаунта
- **Важно:** Для production использования рекомендуется:
  - Изменить пароли по умолчанию
  - Добавить шифрование sensitive данных
  - Рассмотреть backend с базой данных

## Лицензия

MIT
