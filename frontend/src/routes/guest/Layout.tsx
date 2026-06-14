import { Outlet, Link } from 'react-router-dom';
import { Container, Group, Anchor, Title, Box } from '@mantine/core';

export function GuestLayout() {
  return (
    <Box>
      <Box component="header" py="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Container size="lg">
          <Group justify="space-between">
            <Anchor component={Link} to="/" underline="never">
              <Title order={3}>Call Booking</Title>
            </Anchor>
          </Group>
        </Container>
      </Box>
      <Container size="lg" py="xl">
        <Outlet />
      </Container>
    </Box>
  );
}
