import {
  ALL_ROLES,
  MASTERMIND_ROLES,
  TEST_USER_ROLES,
  USER_ROLES,
} from "./roles";

export const isBuyerAuthorized = (userRoles: string[]) => {
  const allowedRoles = ["buyer", "admin", "onlyte", "buyerfree"];
  return allowedRoles.some((role: string) => userRoles.includes(role));
};
export const isSellerAuthorized = (userRoles: string[]) => {
  const allowedRoles = ["admin", "seller", "externalseller"];
  return allowedRoles.some((role: string) => userRoles.includes(role));
};
export const isAdminAuthorized = (userRoles: string[]) => {
  const allowedRoles = ["admin"];
  return allowedRoles.some((role: string) => userRoles.includes(role));
};

export const isConsultingAuthorized = (userRoles: string[]) => {
  const allowedRoles = ["consulting", "admin"];
  return allowedRoles.some((role: string) => userRoles.includes(role));
};
export const isBrokerAuthorized = (userRoles: string[]) => {
  const allowedRoles = ["broker"];
  return allowedRoles.some((role: string) => userRoles.includes(role));
};
export const isUserAuthorized = (userRoles: string[]) => {
  // const allowedRoles = USER_ROLES;
  const allowedRoles = ALL_ROLES;
  return allowedRoles.some((role: string) => userRoles.includes(role));
};

export const isAcademyAuthorized = (userRoles: string[]) => {
  const allowedRoles = ALL_ROLES;
  return allowedRoles.some((role: string) => userRoles.includes(role));
};

export const isLeadAuthorized = (userRoles: string[]) => {
  // const allowedRoles = ["admin", "leads", "user", "lite" , "leads-pro", "leads-max", ""];
  const allowedRoles = ALL_ROLES;
  return allowedRoles.some((role: string) => userRoles.includes(role));
};

export const isCampaignAuthorized = (userRoles: string[]) => {
  const allowedRoles = ALL_ROLES;
  return allowedRoles.some((role: string) => userRoles.includes(role));
};

export const isMastermindAuthorized = (userRoles: string[]) => {
  const allowedRoles = MASTERMIND_ROLES;
  return allowedRoles.some((role: string) => userRoles.includes(role));
};
