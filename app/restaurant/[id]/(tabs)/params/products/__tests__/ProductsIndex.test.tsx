import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react-native';
import ProductsIndex from '../index';
import { router } from 'expo-router';
import { Alert } from 'react-native';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
  isLoaded: () => true,
  loadAsync: async () => {},
}));

const mockDelete = jest.fn();

const categories = [
  { id: 'cat-entree', code: 'ENTREE', name: 'Entrées' },
  { id: 'cat-plat', code: 'PLAT', name: 'Plats' },
];

const productsSeed = [
  {
    id: 'p1',
    name: 'Samoussas',
    categoryId: 'cat-entree',
    restaurantId: 'r1',
    price: 800,
    description: '',
    isAvailable: true,
    unit: 'pièce',
  },
  {
    id: 'p2',
    name: 'Poulet DG',
    categoryId: 'cat-plat',
    restaurantId: 'r1',
    price: 3500,
    description: '',
    isAvailable: true,
    unit: 'assiette',
  },
];

jest.mock('@/hooks/useAppStore', () => ({
  useAppStore: (selector: any) =>
    selector({
      products: productsSeed,
      categories,
      deleteProduct: mockDelete,
      currentRestaurantId: 'r1',
    }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

describe('ProductsIndex screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('affiche le hero et le compteur, et ajoute via le bouton +', () => {
    render(<ProductsIndex />);
    expect(screen.getByText('Produits')).toBeTruthy();
    expect(screen.getByText(/produit\(s\) configuré\(s\)/)).toBeTruthy();

    const add = screen.getByTestId('add-product');
    fireEvent.press(add);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/restaurant/[id]/(tabs)/params/products/create',
      params: { id: 'r1' },
    });
  });

  it('affiche les filtres de catégories et filtre la liste', () => {
    render(<ProductsIndex />);
    // Par défaut, 2 lignes
    expect(screen.getByTestId('product-row-p1')).toBeTruthy();
    expect(screen.getByTestId('product-row-p2')).toBeTruthy();

    // Clique sur cat "Entrées" → ne garde que p1
    const chips = screen.getAllByText('Entrées');
    fireEvent.press(chips[0]);
    expect(screen.getByTestId('product-row-p1')).toBeTruthy();
    expect(screen.queryByTestId('product-row-p2')).toBeNull();

    // Retour à Toutes
    fireEvent.press(screen.getByText('Toutes'));
    expect(screen.getByTestId('product-row-p2')).toBeTruthy();
  });

  it('affiche la catégorie à droite du nom et le prix en chip', () => {
    render(<ProductsIndex />);
    // Pour p1
    const row = screen.getByTestId('product-row-p1');
    expect(within(row).getByText('Samoussas')).toBeTruthy();
    expect(within(row).getByText('Entrées')).toBeTruthy();
    expect(within(row).getByText(/800 FCFA/)).toBeTruthy();
  });

  it('navigue via œil/crayon et supprime via la modale', () => {
    render(<ProductsIndex />);

    fireEvent.press(screen.getByTestId('product-view-p1'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/restaurant/[id]/(tabs)/params/products/[productId]',
      params: { id: 'r1', productId: 'p1' },
    });

    fireEvent.press(screen.getByTestId('product-edit-p1'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/restaurant/[id]/(tabs)/params/products/[productId]/edit',
      params: { id: 'r1', productId: 'p1' },
    });

    // Delete opens ConfirmModal, confirm then calls delete
    fireEvent.press(screen.getByTestId('product-delete-p1'));
    fireEvent.press(screen.getByText('Supprimer'));
    expect(mockDelete).toHaveBeenCalledWith('p1');
  });
});
