export const ALL_ROLES = [
  "admin",
  "buyer",
  "seller",
  "onlyte",
  "broker",
  "consulting",
  "externalseller",
  "buyerfree",
  "academy",
  "user",
  "3dayfreetrial",
  "lite",
  "leads",
  "leads-pro",
  "leads-max",
  "",
  "mastermind",
  "facebook",
];

export const BUYER_ROLES = ["buyer", "admin", "seller", "onlyte", "buyerfree"];

export const SELLER_ROLES = ["admin", "seller", "externalseller"];

export const ADMIN_ROLES = ["admin"];

export const CONSULTING_ROLES = ["consulting"];

export const BROKER_ROLES = ["broker", "admin"];

export const USER_ROLES = ["user", "admin", "3dayfreetrial", "lite"];

export const TEST_USER_ROLES = ["admin", "facebook"];

export const ACADEMY_ROLES = ["academy", "admin", "user"];

export const LEAD_ROLES = ALL_ROLES;

export const MASTERMIND_ROLES = ["mastermind", "admin"];

interface IUserRoleOption {
  value: string;
  label: string;
}

export const userRoleOptions: IUserRoleOption[] = [
  { value: "admin", label: "Admin" },
  // { value: "buyer", label: "Buyer" },
  // { value: "seller", label: "Seller" },
  // { value: "onlyte", label: "Onlyte" },
  // { value: "broker", label: "Broker" },
  // { value: "externalseller", label: "External Seller" },
  // { value: "consulting", label: "Consulting" },
  // { value: "buyerfree", label: "Buyer Free" },
  { value: "user", label: "User" },
  { value: "exempt", label: "Exempt" },
  { value: "3dayfreetrial", label: "3 Day Free Trial" },
  { value: "lite", label: "Lite" },
  { value: "academy", label: "Academy" },
  { value: "leads", label: "Leads" },
  { value: "leads-pro", label: "Leads Pro" },
  { value: "leads-max", label: "Leads Max" },
  { value: "", label: "Role Less" },
  { value: "mastermind", label: "Mastermind" },
  // { value: "userfree", label: "User Free" },
];
