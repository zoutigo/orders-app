// Functional test: Register flow navigates to /tabs
import React from 'react';
import { renderRouter, screen, fireEvent, waitFor, act, within } from 'expo-router/testing-library';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    withLayoutContext: (Navigator: any) => Navigator,
  } as typeof actual & { withLayoutContext: any };
});

jest.mock('expo-font', () => ({
  useFonts: () => [true],
  isLoaded: () => true,
  loadAsync: async () => {},
}));

const mockAddUser = jest.fn();
const mockSetCurrentUser = jest.fn();
let mockUsers: any[] = [];

jest.mock('@/hooks/useAppStore', () => ({
  useAppStore: (selector: any) =>
    selector({
      users: mockUsers,
      currentUserId: undefined,
      addUser: mockAddUser,
      setCurrentUser: mockSetCurrentUser,
      restaurants: [],
      setCurrentRestaurant: jest.fn(),
      _hydrated: true,
    }),
}));

describe('Flow: Inscription -> /tabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsers = [];
  });

  it("reste à l'étape 1 et affiche les erreurs si champs vides", async () => {
    const app = renderRouter('./app', { initialUrl: '/register' });
    expect(app.getPathnameWithParams()).toBe('/register');

    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });

    // Erreurs requis visibles
    await waitFor(() => expect(screen.getByText('Votre prénom est requis')).toBeTruthy());
    expect(screen.getByText('Votre nom est requis')).toBeTruthy();
    expect(screen.getByText('L’email est requis')).toBeTruthy();

    // Toujours étape 1 (pas de champs mot de passe)
    const pwdFields = (screen as any).queryAllByPlaceholderText
      ? (screen as any).queryAllByPlaceholderText('••••••••')
      : [];
    expect(pwdFields.length).toBe(0);

    void app;
  });

  it("reste à l'étape 1 si email invalide", async () => {
    const app = renderRouter('./app', { initialUrl: '/register' });
    expect(app.getPathnameWithParams()).toBe('/register');

    // Saisie prénom/nom, mais email invalide
    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('ex: contact@monresto.com'), 'invalid');

    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });

    // Message d'erreur et pas de passage à l'étape 2
    await waitFor(() => expect(screen.getByText('Email invalide')).toBeTruthy());
    const pwdFields = (screen as any).queryAllByPlaceholderText
      ? (screen as any).queryAllByPlaceholderText('••••••••')
      : [];
    expect(pwdFields.length).toBe(0);

    void app;
  });

  it('affiche l’étape 2 après des infos valides', async () => {
    const app = renderRouter('./app', { initialUrl: '/register' });

    expect(app.getPathnameWithParams()).toBe('/register');

    // Etape 1
    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'Grace');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Hopper');
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'grace@example.com',
    );

    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });
    // Etape 2: attendre les champs mots de passe
    await waitFor(() => expect(screen.getAllByPlaceholderText('••••••••').length).toBe(2));
    // Etape 2 présente (champs mot de passe)
    await waitFor(() => expect(screen.getAllByPlaceholderText('••••••••').length).toBe(2));
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.changeText(pwd, 'secret123');
    fireEvent.changeText(confirm, 'secret123');

    // Trouver le bouton Inscription (celui visible à l'étape 2)
    const buttons = (screen as any).getAllByRole
      ? (screen as any).getAllByRole('button')
      : (screen as any).getAllByA11yRole('button');
    const submit = buttons.find((b: any) => within(b).queryByText('Inscription'))!;

    // Vérifier qu'il n'est pas disabled
    await waitFor(() => expect(submit.props?.accessibilityState?.disabled).not.toBe(true));

    await act(async () => {
      fireEvent.press(submit);
    });

    // On attend la redirection effective
    await waitFor(() => expect(app.getPathnameWithParams()).toBe('/tabs'));
    void app;
  });

  it("reste sur /register si l'email est déjà utilisé", async () => {
    mockUsers = [
      {
        id: 'u_1',
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
        password: 'secret',
      },
    ];

    jest.spyOn(Toast, 'show').mockImplementation(() => {});

    const app = renderRouter('./app', { initialUrl: '/register' });
    expect(app.getPathnameWithParams()).toBe('/register');

    // Etape 1
    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'Ada');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Lovelace');
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'ada@example.com',
    );

    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });
    await waitFor(() => expect(screen.getAllByPlaceholderText('••••••••').length).toBe(2));

    // Etape 2
    const [pwd, confirm] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.changeText(pwd, 'secret');
    fireEvent.changeText(confirm, 'secret');

    const buttons = (screen as any).getAllByRole
      ? (screen as any).getAllByRole('button')
      : (screen as any).getAllByA11yRole('button');
    const submit = buttons.find((b: any) => within(b).queryByText('Inscription'))!;

    await act(async () => {
      fireEvent.press(submit);
    });

    // Reste sur /register et affiche un toast d'erreur
    await waitFor(() => expect(app.getPathnameWithParams()).toBe('/register'));
    expect(mockAddUser).not.toHaveBeenCalled();
    expect(mockSetCurrentUser).not.toHaveBeenCalled();

    void app;
  });
});
