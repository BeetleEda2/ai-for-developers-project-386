import { Outlet, Link, useLocation } from 'react-router-dom';
import { Container, Group, Anchor, Title, Box } from '@mantine/core';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/event-types', label: 'Event Types' },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <Box>
      <Box component="header" py="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Container size="lg">
          <Group justify="space-between">
            <Anchor component={Link} to="/admin" underline="never">
              <Title order={3}>Admin Panel</Title>
            </Anchor>
            <Group gap="sm">
              {NAV_ITEMS.map((item) => (
                <Anchor
                  key={item.to}
                  component={Link}
                  to={item.to}
                  underline="never"
                  fw={location.pathname === item.to ? 600 : 400}
                  c={location.pathname === item.to ? 'blue' : 'dimmed'}
                >
                  {item.label}
                </Anchor>
              ))}
            </Group>
          </Group>
        </Container>
      </Box>
      <Container size="lg" py="xl">
        <Outlet />
      </Container>
    </Box>
  );
}
