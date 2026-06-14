import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
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
  Accordion,
  SimpleGrid,
  Paper,
  Divider,
  Box,
} from '@mantine/core';
import { useEventType, useSlots, useOwner, useCreateBooking } from '../../api/hooks';
import { groupSlotsByDay, formatDateTime } from '../../lib/datetime';
import { getErrorMessage, isConflictError, isValidationError } from '../../lib/errors';

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

  const grouped = slots ? groupSlotsByDay(slots) : [];

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

      <SimpleGrid cols={{ base: 1, md: selectedSlot ? 2 : 1 }}>
        <Box>
          <Title order={4} mb="md">
            Select a time slot
          </Title>
          {slotsLoading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : grouped.length === 0 ? (
            <Text c="dimmed">No available slots in the next 14 days</Text>
          ) : (
            <Accordion>
              {grouped.map((group) => (
                <Accordion.Item key={group.date} value={group.date}>
                  <Accordion.Control>
                    <Text fw={500}>{group.label}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <SimpleGrid cols={{ base: 2, sm: 3 }}>
                      {group.slots.map((slot) => (
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
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Box>

        {selectedSlot && (
          <Box>
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
          </Box>
        )}
      </SimpleGrid>
    </Stack>
  );
}
