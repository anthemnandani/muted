type UserPublicMetadata = {
  role?: 'ADMIN' | 'USER';
};

declare global {
  interface CustomJwtSessionClaims {
    publicMetadata: UserPublicMetadata;
  }

  interface UserPublicMetadata extends UserPublicMetadata {}
}

export {};
