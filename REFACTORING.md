# Refactoring Checklist

Ниже перечень мест, где сейчас есть явные проблемы с качеством кода/архитектурой или технический долг. Список составлен по текущему состоянию репозитория.

## Ticket

- `src/ticket/ticket.service.ts`: разная форма входных параметров между контроллером и сервисом. Контроллер передает (q, order, sortBy, page, limit), а сервис ожидает объект QueryParams. Нужно унифицировать.
- `src/ticket/ticket.service.ts`: сортировка делается дважды: через `qb.orderBy(...)` и затем через `this.sorter.sort(...)`. Это лишнее и дает неожиданный порядок. Нужен один источник сортировки.
- `src/ticket/ticket.service.ts`: `qb.orderBy` использует `params.order`, но `order` вычисляется отдельно (`order = params.order ?? 'desc'`) и не применяется. Потенциальный баг.
- `src/ticket/ticket.service.ts`: метод `geAllUserTickets` с опечаткой в названии; нужно переименовать в `getAllUserTickets`.
- `src/ticket/ticket.service.ts`: дублирование логики поиска билета и сохранения в `completeTicket`/`rejectTicket` + ошибка в названии переменной `complitedTicket`.
- `src/ticket/ticket.service.ts`: `queryBuilder` выбирает `ticket.createdAt`, но сортирует по `ticket.${params.sortBy}` без валидации. Есть риск SQL-инъекции или неверного поля.
- `src/ticket/ticket.controller.ts`: параметры `page` и `limit` принимаются как `number`, но приходят строкой, затем приводятся `+page`. Лучше использовать `ParseIntPipe`.
- `src/ticket/ticket.controller.ts`: вызовы `ticketService` для `getAllTickets` и `createTicket` идут с несовместимыми сигнатурами относительно сервиса (см. выше).

## Sorter

- `src/sorter/sorter.service.ts`: метод `sort` принимает `algorithm: string`, но типы уже описаны как `SortAlgorithm`. Нужна строгая типизация.
- `src/sorter/sorter.service.ts`: часть методов сортировки мутирует данные (например, mergeSort использует `shift`). Нужно либо явно копировать, либо документировать поведение.
- `src/sorter/sorter.service.ts`: использование `performance.now()` в Node без явного импорта `performance` (в некоторых окружениях это не определено).

## Mock/Seed

- `src/mock/mock.service.ts`: генерация данных использует фиксированный диапазон дат и локаль `uk`, возможно вынести в конфиг/параметры.
- `src/mock/mock.controller.ts`: контроллер пустой — либо удалить, либо реализовать эндпоинты.
- `src/seed.ts`: прямой доступ к env и дублирование настроек TypeORM, возможно вынести в общий модуль/конфиг.

## Auth/Users/Guards

- `src/auth/auth.service.ts`: дублирование логики установки cookie (2 раза одинаковые опции). Можно вынести в константы/хелпер.
- `src/shared/guards/auth.guard.ts`: просто возвращает `false` без исключения; лучше бросать `UnauthorizedException`, чтобы был корректный ответ.
- `src/shared/decorators/set-role.decoratos.ts`: опечатка в названии файла `decoratos`.
- `src/shared/decorators/extract-user-id.decorator.ts`: использование cookie напрямую без валидации роли/сессии.
- `src/express.d.ts`: тип `JwtPayload` не объявлен в этом файле/проекте.

## Общая архитектура

- `src/app.module.ts`: `synchronize: true` в TypeORM конфиге — риск для продакшена, стоит вынести в env и отключать по умолчанию.
- `src/ticket/entities/ticket.entity.ts`: поле `completedAt` не используется в сервисе для `rejectTicket` (не ставится). Нужен единый подход.
- Смешение языков сообщений (укр/рус/англ) в исключениях и ответах. Стоит привести к единому языку.
