import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginForm from '../LoginForm';
import { router } from 'expo-router';

// Mock expo-router router
jest.mock('expo-router');

// Mock useAppStore to control users and actions
const mockSetCurrentUser = jest.fn();

jest.mock('@/hooks/useAppStore', () => ({
  useAppStore: (selector: any) => {
    const state = {
      users: [
        {
          id: 'u_1',
          firstname: 'Ada',
          lastname: 'Lovelace',
          email: 'ada@example.com',
          password: 'secret',
        },
      ],
      setCurrentUser: mockSetCurrentUser,
    };
    return selector(state);
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche des erreurs si champs requis', async () => {
    render(<LoginForm />);

    await act(async () => {
      fireEvent.press(screen.getByText('Connexion'));
    });

    // Les messages RHF s'affichent
    expect(screen.getByText('L’email est requis')).toBeTruthy();
    expect(screen.getByText('Le mot de passe est requis')).toBeTruthy();
  });

  it('affiche une erreur si email invalide', async () => {
    render(<LoginForm />);

    fireEvent.changeText(screen.getByPlaceholderText('ex: contact@monresto.com'), 'invalid');
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'secret');

    await act(async () => {
      fireEvent.press(screen.getByText('Connexion'));
    });

    expect(screen.getByText('Email invalide')).toBeTruthy();
  });

  it('affiche une erreur si email inconnu', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<LoginForm />);

    // Renseigner formulaire
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'unknown@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'secret');

    await act(async () => {
      fireEvent.press(screen.getByText('Connexion'));
    });

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  });

  it('affiche une erreur si mot de passe incorrect', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<LoginForm />);

    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'ada@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'wrong123');

    await act(async () => {
      fireEvent.press(screen.getByText('Connexion'));
    });

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Erreur', 'Mot de passe incorrect ❌'),
    );
  });

  it('affiche une erreur si mot de passe trop court', async () => {
    render(<LoginForm />);

    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'ada@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'short');

    await act(async () => {
      fireEvent.press(screen.getByText('Connexion'));
    });

    expect(screen.getByText('6 caractères minimum')).toBeTruthy();
  });

  it('connecte et redirige quand infos correctes', async () => {
    render(<LoginForm />);

    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'ada@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'secret');

    await act(async () => {
      fireEvent.press(screen.getByText('Connexion'));
    });

    await waitFor(() => expect(mockSetCurrentUser).toHaveBeenCalledWith('u_1'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/tabs'));
  });

  it('email insensible à la casse', async () => {
    render(<LoginForm />);

    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'Ada@Example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'secret');

    await act(async () => {
      fireEvent.press(screen.getByText('Connexion'));
    });

    await waitFor(() => expect(mockSetCurrentUser).toHaveBeenCalledWith('u_1'));
  });

  it('navigue vers la page inscription', async () => {
    render(<LoginForm />);

    fireEvent.press(screen.getByText('Inscription'));

    expect(router.push).toHaveBeenCalledWith('/register');
  });

  it('le champ mot de passe est sécurisé', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
