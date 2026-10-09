'use client';

// Un Client Component: lo que necesita estado, hooks o manejadores de eventos.
import { Button, FormField, Input, Link, Modal, Stack, useToast } from '@satellatickets/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Checkout() {
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <Stack gap={4}>
      <FormField label="Correo electrónico" required>
        <Input type="email" value={email} onChangeText={setEmail} />
      </FormField>
      <Stack direction="row" gap={3}>
        <Button onPress={() => toast.show({ tone: 'success', title: 'Entradas enviadas' })}>
          Pagar
        </Button>
        <Button variant="secondary" onPress={() => setOpen(true)}>
          Condiciones
        </Button>
      </Stack>
      {/* Navegación sin recargar la página: se cancela la del navegador y navega el router. */}
      <Link
        href="/ayuda"
        onPress={(event) => {
          event.preventDefault();
          router.push('/ayuda');
        }}
      >
        Ayuda
      </Link>
      <Modal open={open} onClose={() => setOpen(false)} title="Condiciones" closeLabel="Cerrar">
        Las entradas no se pueden revender por encima de su precio.
      </Modal>
    </Stack>
  );
}
