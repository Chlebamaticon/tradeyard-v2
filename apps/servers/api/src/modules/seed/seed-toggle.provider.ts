export const SeedToggle = Symbol('database:seed:toggle');

export const SeedToggleProvider = {
  provide: SeedToggle,
  useValue: false,
};
