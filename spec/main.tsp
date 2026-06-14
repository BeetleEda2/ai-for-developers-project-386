import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using Http;
using Rest;

/**
 * Упрощённый сервис бронирования звонков по мотивам Cal.com.
 *
 * Допущения шага Design First:
 * - один заранее заданный владелец календаря;
 * - регистрации и авторизации нет;
 * - слоты фиксированные по 30 минут в рабочие часы 09:00–18:00;
 * - окно бронирования — ближайшие 14 дней;
 * - время старта бронирования уникально глобально.
 */
@service(#{ title: "Call Booking Service" })
namespace CallBooking;

// ---------------------------------------------------------------------------
// Модели
// ---------------------------------------------------------------------------

/** Владелец календаря (единственный, предопределён). */
model Owner {
  @key id: string;
  name: string;

  /** IANA timezone, например "Europe/Moscow". */
  timezone: string;
}

/** Тип события/звонка, который создаёт владелец. */
model EventType {
  @key id: string;
  title: string;
  description?: string;

  /** Длительность в минутах. На текущем этапе всегда 30. */
  durationMinutes: int32 = 30;

  createdAt: utcDateTime;
}

/** Данные для создания типа события. */
model EventTypeCreate {
  title: string;
  description?: string;
}

/** Вычисляемый 30-минутный интервал доступности (не хранится). */
model Slot {
  start: utcDateTime;
  end: utcDateTime;
  available: boolean;
}

/** Бронирование, созданное гостем. */
model Booking {
  @key id: string;
  eventTypeId: string;
  start: utcDateTime;
  end: utcDateTime;
  guestName: string;
  guestEmail: string;
  notes?: string;
  createdAt: utcDateTime;
}

/** Данные для создания бронирования. */
model BookingCreate {
  eventTypeId: string;

  /**
   * Время старта (UTC). Правила валидации (иначе 422):
   * - выровнено по 30-минутной сетке (минуты 00 или 30, секунды 0);
   * - не в прошлом;
   * - в пределах рабочих часов владельца 09:00–18:00 его таймзоны;
   * - в пределах ближайших 14 дней от текущего момента.
   */
  start: utcDateTime;

  guestName: string;
  guestEmail: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Ошибки
// ---------------------------------------------------------------------------

/** Время уже занято другим бронированием. */
@error
model ConflictError {
  @statusCode statusCode: 409;
  code: "TIME_SLOT_TAKEN";
  message: string;
}

/** Невалидные данные: время вне окна, не выровнено по сетке, в прошлом и т.п. */
@error
model ValidationError {
  @statusCode statusCode: 422;
  code: "VALIDATION_FAILED";
  message: string;
}

/** Запрошенный ресурс не найден. */
@error
model NotFoundError {
  @statusCode statusCode: 404;
  code: "NOT_FOUND";
  message: string;
}

// ---------------------------------------------------------------------------
// Операции: Owner
// ---------------------------------------------------------------------------

@route("/owner")
namespace OwnerEndpoint {
  /** Профиль единственного владельца календаря (имя, таймзона). */
  @get op read(): Owner;
}

// ---------------------------------------------------------------------------
// Операции: Event Types
// ---------------------------------------------------------------------------

@route("/event-types")
namespace EventTypes {
  /** Список типов событий (владелец и гость). */
  @get op list(): EventType[];

  /** Один тип события. */
  @get op read(@path id: string): EventType | NotFoundError;

  /** Создать тип события (владелец). */
  @post op create(@body body: EventTypeCreate): {
    @statusCode statusCode: 201;
    @body created: EventType;
  } | ValidationError;

  /**
   * Доступные свободные слоты.
   *
   * Окно ограничено ближайшими 14 днями от текущего момента.
   * Если `from`/`to` не заданы — используется [сейчас; сейчас + 14 дней].
   * Запрос за пределами 14-дневного окна обрезается до него.
   */
  @route("/{id}/slots")
  @get
  op slots(
    @path id: string,
    @query from?: utcDateTime,
    @query to?: utcDateTime,
  ): Slot[] | NotFoundError;
}

// ---------------------------------------------------------------------------
// Операции: Bookings
// ---------------------------------------------------------------------------

@route("/bookings")
namespace Bookings {
  /** Список предстоящих встреч (владелец). */
  @get op list(): Booking[];

  /** Детали бронирования. */
  @get op read(@path id: string): Booking | NotFoundError;

  /** Создать бронирование (гость). 409 если время занято, 422 если невалидно. */
  @post op create(@body body: BookingCreate): {
    @statusCode statusCode: 201;
    @body created: Booking;
  } | ConflictError | ValidationError;
}
