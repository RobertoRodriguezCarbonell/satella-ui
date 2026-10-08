import {
  Badge,
  Box,
  Button,
  Icon,
  Spinner,
  Stack,
  Text,
  UIProvider,
  useTheme,
} from '@satellatickets/ui';
import type { ButtonProps, ButtonWebProps } from '@satellatickets/ui';

// Los tipos del contrato y los propios de web se pueden usar desde una app.
const variant: ButtonProps['variant'] = 'primary';
const submit: ButtonWebProps['type'] = 'submit';

function Accent() {
  const theme = useTheme();
  return <Text variant="caption">{theme.color.action.primary}</Text>;
}

export function App() {
  return (
    <UIProvider theme="dark">
      <Box background="canvas" padding={6}>
        <Stack gap={4} align="start">
          <Text variant="title">Noche Satella</Text>
          <Badge variant="warning">Últimas entradas</Badge>
          <Stack direction="row" gap={3} align="center">
            <Button variant={variant} iconStart="ticket" onPress={() => undefined}>
              Comprar entradas
            </Button>
            <Button variant="secondary" type={submit} loading>
              Pagar
            </Button>
            <Icon name="calendar" label="Fecha" />
            <Spinner label="Cargando eventos" />
          </Stack>
          <Accent />
        </Stack>
      </Box>
    </UIProvider>
  );
}
