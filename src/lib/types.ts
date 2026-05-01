export type SignInMode = 'endfield' | 'arknights' | 'both';

export type GameId = 'endfield' | 'arknights';

export interface PopupState {
  checkTime: string;
  signInMode: SignInMode;
  lastCheckInDateByGame: Partial<Record<GameId, string>>;
}

export interface StatusViewModel {
  lastCheckInText: string;
  statusText: string;
  statusTone: 'success' | 'warning' | 'neutral';
}