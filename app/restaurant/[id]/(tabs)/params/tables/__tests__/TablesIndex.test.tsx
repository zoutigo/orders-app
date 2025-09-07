jest.mock('expo-font', () => ({
  useFonts: () => [true],
  isLoaded: () => true,
  loadAsync: async () => {},
}));

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react-native';
import TablesIndex from '../index';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Mock store
const mockDelete = jest.fn();
const mockSet = jest.fn();

const tablesSeed = [
  { id: 't-1', name: 'Table 1', status: 'LIBRE', seats: 2, isUsable: true, restaurantId: 'r1' },
  { id: 't-2', name: 'Table 2', status: 'OCCUPEE', seats: 4, isUsable: true, restaurantId: 'r1' },
  {
    id: 't-3',
    name: 'Table 3',
    status: 'INDISPONIBLE',
    seats: 6,
    isUsable: false,
    restaurantId: 'r1',
  },
];

jest.mock('@/hooks/useAppStore', () => ({
  useAppStore: (selector: any) =>
    selector({
      tables: tablesSeed,
      deleteTable: mockDelete,
      currentRestaurantId: 'r1',
    }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

describe('TablesIndex screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le hero compact avec le compteur et bouton +', () => {
    render(<TablesIndex />);
    const hero = screen.getByTestId('tables-hero');
    expect(hero).toBeTruthy();

    // Le titre et le sous-titre existent
    expect(screen.getByText('Tables')).toBeTruthy();
    expect(screen.getByText(/table\(s\) configurée\(s\)/)).toBeTruthy();

    // Bouton add visible et cliquable
    const add = screen.getByTestId('add-table');
    fireEvent.press(add);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/restaurant/[id]/(tabs)/params/tables/create',
      params: { id: 'r1' },
    });
  });

  it('rend une ligne par table avec les actions', () => {
    render(<TablesIndex />);
    for (const t of tablesSeed) {
      expect(screen.getByTestId(`table-row-${t.id}`)).toBeTruthy();
      // Chip places
      expect(screen.getByText(new RegExp(`${t.seats} places`))).toBeTruthy();

      // Actions
      expect(screen.getByTestId(`table-view-${t.id}`)).toBeTruthy();
      expect(screen.getByTestId(`table-edit-${t.id}`)).toBeTruthy();
      expect(screen.getByTestId(`table-delete-${t.id}`)).toBeTruthy();
    }
  });

  it("navigue vers la vue détail au clic sur la ligne et sur l'icône œil", () => {
    render(<TablesIndex />);
    // Clic sur la ligne
    fireEvent.press(screen.getByTestId('table-row-t-1'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]',
      params: { id: 'r1', tableId: 't-1' },
    });

    // Clic sur l'icône œil
    fireEvent.press(screen.getByTestId('table-view-t-2'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]',
      params: { id: 'r1', tableId: 't-2' },
    });
  });

  it("navigue vers l'édition au clic sur l'icône crayon", () => {
    render(<TablesIndex />);
    fireEvent.press(screen.getByTestId('table-edit-t-1'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/restaurant/[id]/(tabs)/params/tables/[tableId]/edit',
      params: { id: 'r1', tableId: 't-1' },
    });
  });

  it('ouvre une alerte de confirmation et supprime après confirmation', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<TablesIndex />);

    fireEvent.press(screen.getByTestId('table-delete-t-3'));
    expect(alertSpy).toHaveBeenCalled();

    // Simule le clic sur "Supprimer"
    const [, , buttons] = alertSpy.mock.calls[0];
    const confirm = buttons?.find((b: any) => b.style === 'destructive');
    confirm?.onPress?.();
    expect(mockDelete).toHaveBeenCalledWith('t-3');
  });

  it("colore l'avatar selon le statut (vert/orange/rouge)", () => {
    const { getByTestId } = render(<TablesIndex />);
    const row1 = getByTestId('table-row-t-1');
    const row2 = getByTestId('table-row-t-2');
    const row3 = getByTestId('table-row-t-3');

    // Avatar est le premier View enfant du container d'infos
    const getGridIconColor = (row: any) => {
      const icons = within(row).UNSAFE_getAllByType(Ionicons);
      const grid = icons.find((i: any) => i.props.name === 'grid-outline');
      return grid?.props.color;
    };

    expect(getGridIconColor(row1)).toBe(Colors.light.success);
    expect(getGridIconColor(row2)).toBe(Colors.light.accent);
    expect(getGridIconColor(row3)).toBe(Colors.light.danger);
  });
});
