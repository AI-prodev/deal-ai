// Loads Intercom with the snippet
// This must be run before boot, it initializes window.Intercom

export const boot = (options = {}) => {
  window &&
    (window as any).Intercom &&
    (window as any).Intercom("boot", {
      api_base: "https://api-iam.intercom.io",
      app_id: "mcsz68c6",
      name: undefined,
      email: undefined,
      created_at: undefined,
      user_id: undefined,
      ...options,
    });
};

export const update = () => {
  (window as any) &&
    (window as any).Intercom &&
    (window as any).Intercom("update");
};
