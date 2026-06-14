import { useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Card,
  Badge,
  Stack,
  Skeleton,
  Alert,
  SimpleGrid,
} from '@mantine/core';
import { useEventTypes, useOwner } from '../../api/hooks';

export function GuestEventTypesPage() {
  const navigate = useNavigate();
  const { data: eventTypes, isLoading, error } = useEventTypes();
  const { data: owner } = useOwner();

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height={40} width={300} />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        Failed to load event types
      </Alert>
    );
  }

  if (!eventTypes || eventTypes.length === 0) {
    return <Text>No event types yet</Text>;
  }

  return (
    <Stack>
      <Title order={2}>Book a call with {owner?.name ?? 'the owner'}</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {eventTypes.map((et) => (
          <Card
            key={et.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/event-types/${et.id}`)}
          >
            <Stack gap="xs">
              <Title order={3}>{et.title}</Title>
              {et.description && (
                <Text c="dimmed" size="sm">
                  {et.description}
                </Text>
              )}
              <Badge variant="light">{et.durationMinutes} min</Badge>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
