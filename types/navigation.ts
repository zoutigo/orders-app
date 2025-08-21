import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  '(tabs)': NavigatorScreenParams<RootTabParamList>;
  Welcome: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Orders: undefined;
  Settings: undefined;
};
