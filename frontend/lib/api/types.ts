export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserRead {
  id: number;
  email: string;
  full_name: string;
}
