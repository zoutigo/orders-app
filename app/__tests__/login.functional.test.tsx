// Patch expo-router for tests: certaines mises en page utilisent withLayoutContext
// qu'on peut neutraliser sans impacter la navigation de test.
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    withLayoutContext: (Navigator: any) => Navigator,
  } as typeof actual & { withLayoutContext: any };
});

import React from 'react';
import { renderRouter, screen, fireEvent, waitFor, act } from 'expo-router/testing-library';

// Evite l'attente des polices dans app/_layout.tsx
jest.mock('expo-font', () => ({
  useFonts: () => [true],
  isLoaded: () => true,
  loadAsync: async () => {},
}));

// Mock du store pour fournir des utilisateurs et un état hydraté
const mockSetCurrentUser = jest.fn();
jest.mock('@/hooks/useAppStore', () => ({
  useAppStore: (selector: any) =>
    selector({
      // état minimal requis par l'appli
      users: [
        {
          id: 'u_1',
          firstname: 'Ada',
          lastname: 'Lovelace',
          email: 'ada@example.com',
          password: 'secret',
        },
      ],
      currentUserId: undefined,
      setCurrentUser: mockSetCurrentUser,
      restaurants: [],
      setCurrentRestaurant: jest.fn(),
      _hydrated: true,
    }),
}));

describe('Flow: Connexion -> /tabs', () => {
  beforeEach(() => jest.clearAllMocks());

  it('redirige vers /tabs après une connexion valide', async () => {
    const app = renderRouter('./app', { initialUrl: '/login' });

    // On est bien sur /login
    expect(app.getPathnameWithParams()).toBe('/login');

    // Renseigner le formulaire
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'ada@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'secret');

    await act(async () => {
      const matches = screen.getAllByText('Connexion');
      fireEvent.press(matches[matches.length - 1]);
    });

    // Attendre la navigation vers /tabs
    await waitFor(() => expect(app.getPathnameWithParams()).toBe('/tabs'));

    // Vérifier contenu de l'écran d'accueil (Titre)
    await waitFor(() => expect(screen.getAllByText('Vos opérations').length).toBeGreaterThan(0));

    // Optionnel: setCurrentUser appelé
    expect(mockSetCurrentUser).toHaveBeenCalledWith('u_1');

    // Silence TS sur app
    void app;
  });
});
