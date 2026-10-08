import {
  firstEnabledTab,
  getTabInDirection,
  useControllableState,
  type TabDirection,
} from '@satellatickets/core';
import { useId, useRef, type KeyboardEvent } from 'react';

import { cx } from '../_internal/cx';
import { Icon } from '../icon/Icon';
import styles from './Tabs.module.css';
import type { TabsWebProps } from './Tabs.types';

export type { TabsWebProps } from './Tabs.types';

// Las teclas del patrón de pestañas de ARIA. Las flechas eligen la pestaña a la vez que
// mueven el foco: cambiar de vista no tiene coste y así basta una pulsación.
const keyDirection: Partial<Record<string, TabDirection>> = {
  ArrowRight: 'next',
  ArrowLeft: 'previous',
  Home: 'first',
  End: 'last',
};

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  accessibilityLabel,
  className,
  style,
  testID,
}: TabsWebProps) {
  const baseId = useId();
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? firstEnabledTab(items) ?? '',
    onChange: onValueChange,
  });
  const tabs = useRef(new Map<string, HTMLButtonElement>());

  const selectedIndex = items.findIndex((item) => item.value === selected);
  const active = items[selectedIndex];
  const panelId = `${baseId}-panel`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const direction = keyDirection[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    const next = getTabInDirection(items, selected, direction);
    setSelected(next);
    tabs.current.get(next)?.focus();
  }

  return (
    <div className={cx(styles.root, className)} style={style} data-testid={testID}>
      <div role="tablist" aria-label={accessibilityLabel} className={styles.list}>
        {items.map((item, index) => {
          const isSelected = item.value === selected;
          return (
            <button
              key={item.value}
              ref={(node) => {
                if (node === null) tabs.current.delete(item.value);
                else tabs.current.set(item.value, node);
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={isSelected}
              aria-controls={isSelected && item.content !== undefined ? panelId : undefined}
              // Solo la elegida está en el orden de tabulación; entre ellas se va con las flechas.
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              className={cx(styles.tab, isSelected && styles.selected)}
              onClick={() => setSelected(item.value)}
              onKeyDown={handleKeyDown}
            >
              {item.icon === undefined ? null : <Icon name={item.icon} size="sm" />}
              {item.label}
            </button>
          );
        })}
      </div>
      {active?.content === undefined || active.content === null ? null : (
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${baseId}-tab-${selectedIndex}`}
          // Enfocable, para que el teclado llegue al panel aunque no tenga controles dentro.
          tabIndex={0}
          className={styles.panel}
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
