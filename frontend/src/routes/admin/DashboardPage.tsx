import {
  Title,
  Text,
  Card,
  Group,
  Stack,
  Badge,
  Alert,
  Skeleton,
  Paper,
  ThemeIcon,
  SimpleGrid,
} from '@mantine/core';
import { IconCalendar, IconClock, IconMail, IconUser, IconAlertCircle } from '@tabler/icons-react';
import { useOwner, useBookings } from '../../api/hooks';
import { formatDateTime } from '../../lib/datetime';
import { getErrorMessage } from '../../lib/errors';

export function DashboardPage() {
  const { data: owner, isLoading: ownerLoading, error: ownerError } = useOwner();
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useBookings();

  const isLoading = ownerLoading || bookingsLoading;
  const error = ownerError ?? bookingsError;

  return (
    <Stack gap="xl">
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconUser size={24} />
            <Stack gap={0}>
              {ownerLoading ? (
                <Skeleton height={28} width={200} />
              ) : (
                <Title order={2}>Welcome, {owner?.name}</Title>
              )}
              {ownerLoading ? (
                <Skeleton height={20} width={100} mt={4} />
              ) : (
                <Badge variant="light" color="blue" size="sm">
                  {owner?.timezone}
                </Badge>
              )}
            </Stack>
          </Group>
        </Group>
      </Paper>

      {error && (
        <Alert variant="light" color="red" title="Error loading data" icon={<IconAlertCircle />}>
          {getErrorMessage(error)}
        </Alert>
      )}

      {!error && bookingsLoading ? (
        <Skeleton height={48} radius="md" />
      ) : bookings ? (
        <Paper withBorder p="md" radius="md">
          <Group>
            <IconCalendar size={20} />
            <Text fw={600}>Total Upcoming Meetings</Text>
            <Badge size="lg" variant="filled" color="blue">
              {bookings.length}
            </Badge>
          </Group>
        </Paper>
      ) : null}

      <Stack gap="md">
        <Group gap="xs">
          <IconClock size={20} />
          <Title order={3}>Upcoming Meetings</Title>
          {!isLoading && bookings && (
            <Badge variant="light" color="gray" size="md">
              {bookings.length}
            </Badge>
          )}
        </Group>

        {bookingsLoading ? (
          <Stack gap="md">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={120} radius="md" />
            ))}
          </Stack>
        ) : bookings && bookings.length > 0 ? (
          <SimpleGrid cols={1} spacing="md">
            {bookings.map((booking) => (
              <Card key={booking.id} withBorder padding="md" radius="md">
                <Stack gap="xs">
                  <Title order={4}>{booking.guestName}</Title>
                  <Group gap="xs">
                    <IconMail size={14} />
                    <Text c="dimmed" size="sm">
                      {booking.guestEmail}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconClock size={14} />
                    <Text size="sm" fw={500}>
                      {formatDateTime(booking.start)}
                    </Text>
                  </Group>
                  {booking.notes && (
                    <Text size="sm" c="gray">
                      {booking.notes}
                    </Text>
                  )}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Paper withBorder p="xl" radius="md" ta="center">
            <Stack align="center" gap="xs">
              <ThemeIcon variant="light" color="gray" size="xl" radius="xl">
                <IconCalendar size={20} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                No upcoming meetings
              </Text>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
}
