import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import RegisterForm from '../RegisterForm';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

// Mocks
const mockAddUser = jest.fn();
const mockSetCurrentUser = jest.fn();

jest.mock('@/hooks/useAppStore', () => ({
  useAppStore: (selector: any) =>
    selector({
      users: [
        {
          id: 'u_1',
          firstname: 'Ada',
          lastname: 'Lovelace',
          email: 'ada@example.com',
          password: 'secret',
        },
      ],
      addUser: mockAddUser,
      setCurrentUser: mockSetCurrentUser,
    }),
}));

jest.spyOn(Toast, 'show').mockImplementation(() => {});

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche les erreurs requis à l'étape 1", async () => {
    render(<RegisterForm />);

    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });

    expect(screen.getByText('Votre prénom est requis')).toBeTruthy();
    expect(screen.getByText('Votre nom est requis')).toBeTruthy();
    expect(screen.getByText('L’email est requis')).toBeTruthy();
  });

  it('affiche une erreur pour email invalide', async () => {
    render(<RegisterForm />);

    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('ex: contact@monresto.com'), 'invalid');

    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });

    expect(screen.getByText('Email invalide')).toBeTruthy();
    expect(screen.queryByText('Inscription')).toBeNull();
  });

  it('passe à la deuxième étape quand infos valides', async () => {
    render(<RegisterForm />);

    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Doe');
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'john@example.com',
    );

    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });
    await waitFor(() => expect(screen.getByText('Inscription')).toBeTruthy());
  });

  it('affiche une erreur si mot de passe trop court', async () => {
    render(<RegisterForm />);

    // Etape 1
    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Doe');
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'john@example.com',
    );
    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });
    await waitFor(() => expect(screen.getByText('Inscription')).toBeTruthy());

    // Etape 2
    await act(async () => {
      fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'short');
    });
    await waitFor(() => expect(screen.getByText('6 caractères minimum')).toBeTruthy());
  });

  it('affiche une erreur si confirmation non correspondante', async () => {
    render(<RegisterForm />);

    // Etape 1
    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Doe');
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'john@example.com',
    );
    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });
    await waitFor(() => expect(screen.getByText('Inscription')).toBeTruthy());

    // Etape 2
    await act(async () => {
      fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'secret123');
      fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'nope');
    });
    await waitFor(() =>
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeTruthy(),
    );
  });

  it('refuse une inscription avec un email déjà utilisé', async () => {
    render(<RegisterForm />);

    // Etape 1 - email existant
    fireEvent.changeText(screen.getByPlaceholderText('Votre prénom'), 'Ada');
    fireEvent.changeText(screen.getByPlaceholderText('Votre nom'), 'Lovelace');
    fireEvent.changeText(
      screen.getByPlaceholderText('ex: contact@monresto.com'),
      'ada@example.com',
    );
    await act(async () => {
      fireEvent.press(screen.getByText('Continuer'));
    });
    await waitFor(() => expect(screen.getByText('Inscription')).toBeTruthy());

    // Etape 2
    await act(async () => {
      fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'secret');
      fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'secret');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Inscription'));
    });

    await waitFor(() => expect(Toast.show).toHaveBeenCalled());
    expect(mockAddUser).not.toHaveBeenCalled();
    expect(mockSetCurrentUser).not.toHaveBeenCalled();
  });

  it('inscrit et redirige quand toutes les infos sont valides', async () => {
    render(<RegisterForm />);

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
    await waitFor(() => expect(screen.getByText('Inscription')).toBeTruthy());

    // Etape 2
    await act(async () => {
      fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[0], 'secret123');
      fireEvent.changeText(screen.getAllByPlaceholderText('••••••••')[1], 'secret123');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Inscription'));
    });

    await waitFor(() => expect(mockAddUser).toHaveBeenCalled());
    await waitFor(() => expect(mockSetCurrentUser).toHaveBeenCalledWith(expect.any(String)));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/tabs'));
    expect(Toast.show).toHaveBeenCalled();
  });
});
