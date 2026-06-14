import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Calendar } from '@mantine/dates';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  Title,
  Text,
  Badge,
  Button,
  TextInput,
  Textarea,
  Stack,
  Skeleton,
  Alert,
  Loader,
  Center,
  SimpleGrid,
  Paper,
  Divider,
  Box,
  ScrollArea,
} from '@mantine/core';
import { useEventType, useSlots, useOwner, useCreateBooking } from '../../api/hooks';
import { groupSlotsByDay, formatDateTime } from '../../lib/datetime';
import { getErrorMessage, isConflictError, isValidationError } from '../../lib/errors';

dayjs.extend(utc);

interface SelectedSlot {
  start: string;
  end: string;
  label: string;
}

export function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const createBooking = useCreateBooking();

  const { data: eventType, isLoading: eventTypeLoading, error: eventTypeError } = useEventType(id);
  const { data: owner } = useOwner();
  const {
    data: slots,
    isLoading: slotsLoading,
    refetch: refetchSlots,
  } = useSlots(id);

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    eventTypeTitle: string;
    dateTime: string;
    guestName: string;
  } | null>(null);

  const form = useForm({
    initialValues: {
      guestName: '',
      guestEmail: '',
      notes: '',
    },
    validate: {
      guestName: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      guestEmail: (value) => {
        if (!value.trim()) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email address';
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!selectedSlot || !id) return;
    try {
      const booking = await createBooking.mutateAsync({
        eventTypeId: id,
        start: selectedSlot.start,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        notes: values.notes || undefined,
      });
      setBookingSuccess({
        eventTypeTitle: eventType?.title ?? '',
        dateTime: formatDateTime(booking.start),
        guestName: booking.guestName,
      });
    } catch (err) {
      if (isConflictError(err)) {
        notifications.show({
          title: 'Slot unavailable',
          message:
            'This time slot is no longer available. Please select another.',
          color: 'red',
        });
        refetchSlots();
      } else if (isValidationError(err)) {
        notifications.show({
          title: 'Validation error',
          message: getErrorMessage(err),
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: getErrorMessage(err),
          color: 'red',
        });
      }
    }
  };

  const grouped = slots ? groupSlotsByDay(slots) : [];

  const availableDates = useMemo(() => {
    if (!grouped) return [];
    return grouped.map((g) => dayjs.utc(g.date).toDate());
  }, [grouped]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate || !grouped) return [];
    const dateKey = dayjs(selectedDate).format('YYYY-MM-DD');
    return grouped.find((g) => g.date === dateKey)?.slots ?? [];
  }, [selectedDate, grouped]);

  const minDate = dayjs.utc().startOf('day').toDate();
  const maxDate = dayjs.utc().add(13, 'day').endOf('day').toDate();

  if (eventTypeLoading) {
    return (
      <Stack>
        <Skeleton height={40} width={300} />
        <Skeleton height={20} width={200} />
        <Skeleton height={200} />
      </Stack>
    );
  }

  if (eventTypeError || !eventType) {
    return (
      <Alert color="red" title="Error">
        Failed to load event type
      </Alert>
    );
  }

  if (bookingSuccess) {
    return (
      <Stack align="center" mt="xl">
        <Title order={2}>Booking confirmed!</Title>
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Box>
              <Text fw={500}>Event</Text>
              <Text>{bookingSuccess.eventTypeTitle}</Text>
            </Box>
            <Box>
              <Text fw={500}>Date & Time</Text>
              <Text>{bookingSuccess.dateTime}</Text>
            </Box>
            <Box>
              <Text fw={500}>Guest</Text>
              <Text>{bookingSuccess.guestName}</Text>
            </Box>
          </Stack>
        </Paper>
        <Button component={Link} to="/" variant="light">
          Book another call
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Box>
        <Title order={2}>
          Book {eventType.title} with {owner?.name ?? 'the owner'}
        </Title>
        {eventType.description && (
          <Text c="dimmed" mt="xs">
            {eventType.description}
          </Text>
        )}
        <Badge mt="sm" variant="light">
          {eventType.durationMinutes} min
        </Badge>
      </Box>

      <Divider />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Box>
          <Title order={4} mb="md">
            Select a date
          </Title>
          {slotsLoading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : grouped.length === 0 ? (
            <Text c="dimmed">No available slots in the next 14 days</Text>
          ) : (
            <Calendar
              date={selectedDate ?? undefined}
              onDateChange={(date) => setSelectedDate(date)}
              minDate={minDate}
              maxDate={maxDate}
              getDayProps={(dateStr) => {
                const d = dayjs(dateStr);
                const isAvailable = availableDates.some((ad) =>
                  d.isSame(ad, 'day'),
                );
                const isPast = d.isBefore(dayjs(), 'day');
                return {
                  selected: d.isSame(dayjs(selectedDate), 'day'),
                  disabled: !isAvailable || isPast,
                  onClick: isAvailable && !isPast
                    ? () => setSelectedDate(dateStr)
                    : undefined,
                };
              }}
            />
          )}
        </Box>

        <Box>
          <Title order={4} mb="md">
            Select a time slot
          </Title>
          {!selectedDate ? (
            <Text c="dimmed">Pick a date on the calendar</Text>
          ) : selectedDaySlots.length === 0 ? (
            <Text c="dimmed">No slots available on this day</Text>
          ) : (
            <Stack gap="md">
              <ScrollArea.Autosize mah={350}>
                <SimpleGrid cols={{ base: 2, sm: 3 }}>
                  {selectedDaySlots.map((slot) => (
                    <Button
                      key={slot.start}
                      variant={
                        selectedSlot?.start === slot.start
                          ? 'filled'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedSlot({
                          start: slot.start,
                          end: slot.end,
                          label: slot.label,
                        })
                      }
                    >
                      {slot.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </ScrollArea.Autosize>

              {selectedSlot && (
                <Paper p="lg" withBorder>
                  <Title order={4} mb="md">
                    Your details
                  </Title>
                  <Text c="dimmed" size="sm" mb="md">
                    {selectedSlot.label}
                  </Text>
                  <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                      <TextInput
                        label="Name"
                        placeholder="Your name"
                        required
                        {...form.getInputProps('guestName')}
                      />
                      <TextInput
                        label="Email"
                        placeholder="your@email.com"
                        type="email"
                        required
                        {...form.getInputProps('guestEmail')}
                      />
                      <Textarea
                        label="Notes"
                        placeholder="Any additional information..."
                        {...form.getInputProps('notes')}
                      />
                      <Button type="submit" loading={createBooking.isPending}>
                        Book
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              )}
            </Stack>
          )}
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
