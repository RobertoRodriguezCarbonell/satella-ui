// Un Server Component: importa los componentes directamente, sin envolverlos, y lee
// las constantes de `core`, que son código puro (ADR-041).
import { buttonVariants } from '@satellatickets/core';
import { Alert, Badge, Box, Button, Card, Stack, Text } from '@satellatickets/ui';

import { Checkout } from './checkout';

export default function Page() {
  return (
    <Box background="canvas" padding={6}>
      <Stack gap={4}>
        <Text variant="title">Noche Satella</Text>
        <Badge variant="warning">Últimas entradas</Badge>
        <Alert tone="info" title="Las entradas se envían por correo" />
        <Text variant="caption" testID="variantes">
          {buttonVariants.variant.join(', ')}
        </Text>
        <Card>
          <Button iconStart="ticket">Comprar entradas</Button>
        </Card>
        <Checkout />
      </Stack>
    </Box>
  );
}
