import { Link } from 'react-router-dom';
import {
  Title,
  Text,
  Card,
  Button,
  TextInput,
  Textarea,
  Group,
  Stack,
  Badge,
  Alert,
  Skeleton,
  Paper,
  ThemeIcon,
  SimpleGrid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCalendar, IconPlus } from '@tabler/icons-react';
import { useEventTypes, useCreateEventType, useOwner } from '../../api/hooks';
import { formatDate } from '../../lib/datetime';
import { getErrorMessage, isValidationError } from '../../lib/errors';

export function AdminEventTypesPage() {
  const { data: eventTypes, isLoading, error } = useEventTypes();
  const { data: owner } = useOwner();
  const createMutation = useCreateEventType();

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? 'Title is required' : null,
    },
  });

  const handleSubmit = async (values: { title: string; description: string }) => {
    try {
      await createMutation.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
      });
      notifications.show({
        title: 'Success',
        message: 'Event type created',
        color: 'green',
      });
      form.reset();
    } catch (err) {
      if (isValidationError(err)) {
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

  return (
    <Stack gap="xl">
      <Group>
        <Button
          component={Link}
          to="/admin"
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Dashboard
        </Button>
      </Group>

      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconPlus size={20} />
            <Title order={3}>Create Event Type</Title>
          </Group>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="E.g. 30-minute consultation"
                required
                {...form.getInputProps('title')}
              />
              <Textarea
                label="Description"
                placeholder="Optional description"
                minRows={2}
                {...form.getInputProps('description')}
              />
              <Group>
                <Button type="submit" loading={createMutation.isPending}>
                  Create
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>

      <Stack gap="md">
        <Group gap="xs">
          <IconCalendar size={20} />
          <Title order={3}>Event Types</Title>
          {!isLoading && eventTypes && (
            <Badge variant="light" color="gray" size="md">
              {eventTypes.length}
            </Badge>
          )}
        </Group>

        {isLoading ? (
          <Stack gap="md">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} radius="md" />
            ))}
          </Stack>
        ) : error ? (
          <Alert variant="light" color="red" title="Error loading event types">
            {getErrorMessage(error)}
          </Alert>
        ) : eventTypes && eventTypes.length > 0 ? (
          <SimpleGrid cols={1} spacing="md">
            {eventTypes.map((et) => (
              <Card key={et.id} withBorder padding="md" radius="md">
                <Stack gap="xs">
                  <Title order={4}>{et.title}</Title>
                  {et.description && (
                    <Text c="dimmed" size="sm" lineClamp={2}>
                      {et.description}
                    </Text>
                  )}
                  <Group gap="xs">
                    <Badge variant="light" color="blue" size="sm">
                      {et.durationMinutes} min
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Created {formatDate(et.createdAt, owner?.timezone)}
                    </Text>
                  </Group>
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
                No event types yet
              </Text>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
}
