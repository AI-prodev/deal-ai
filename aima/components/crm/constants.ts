import {
  Email,
  IReportList,
  ISendEmailFormValues,
} from "@/interfaces/IBroadcast";
import {
  GroupPersonSVG,
  MailSVG,
  SendSVG,
  StackedMailSVG,
  QueryStatsSVG,
} from "@/components/icons/SVGData";
import type { IContactFormValues, IContact } from "@/interfaces/IContact";
import type { ILists } from "@/interfaces/Ilists";

export enum SendEmailStatus {
  draft = "draft",
  scheduled = "scheduled",
  sendNow = "sendNow",
  report = "report",
}

export enum SendEmailMode {
  "EDIT" = "EDIT",
  "CREATE" = "CREATE",
}

export enum SendEmailTabsType {
  "CREATE" = "CREATE",
  "SCHEDULE" = "SCHEDULE",
}

export enum CRMType {
  "CONTACTS" = "CONTACTS",
  "LISTS" = "LISTS",
  "BROADCAST" = "BROADCAST",
}

export enum CRMBroadcastType {
  "CREATE" = "CREATE",
  "DRAFTS" = "DRAFTS",
  "SCHEDULED" = "SCHEDULED",
  "REPORTS" = "REPORTS",
}

export const CRM_TABS = [
  {
    title: "Contacts",
    url: "/crm/contacts",
    type: CRMType.CONTACTS,
    icon: GroupPersonSVG,
    isUnreleased: false,
  },
  {
    title: "Lists",
    url: "/crm/lists",
    type: CRMType.LISTS,
    icon: StackedMailSVG,
    isUnreleased: false,
  },
  {
    title: "Broadcast",
    url: "/crm/broadcast/create",
    type: CRMType.BROADCAST,
    icon: SendSVG,
    isNew: true,
    isUnreleased: false,
  },
];

export enum SendEmailErrorType {
  "SEND_GRID_API_KEY" = "SEND_GRID_API_KEY",
  "BUSINESS_DETAILS" = "BUSINESS_DETAILS",
}

export const SEND_EMAIL_ERRORS = {
  [SendEmailErrorType.SEND_GRID_API_KEY]: {
    message:
      "You need to add a SendGrid API Key to your account to send emails.",
    url: "/integrations/sendgrid",
  },
  [SendEmailErrorType.BUSINESS_DETAILS]: {
    message:
      "You need to add a business details to your account to send emails.",
    url: "/users/user-account-settings",
  },
};

export const CRM_BROADCAST_TABS = [
  {
    title: "Create",
    url: "/crm/broadcast/create",
    type: CRMBroadcastType.CREATE,
    icon: MailSVG,
  },
  {
    title: "Drafts",
    url: "/crm/broadcast/drafts",
    type: CRMBroadcastType.DRAFTS,
    icon: StackedMailSVG,
  },
  // {
  //   title: 'Scheduled',
  //   url: '/crm/broadcast/scheduled',
  //   type: CRMBroadcastType.SCHEDULED,
  //   icon: ScheduleSVG,
  // },
  {
    title: "Reports",
    url: "/crm/broadcast/reports",
    type: CRMBroadcastType.REPORTS,
    icon: QueryStatsSVG,
  },
];

export const SEND_EMAIL_INITIAL_VALUES: ISendEmailFormValues = {
  lists: [],
  sendgridAccount: "",
  sender: "",
  subject: "",
  html: "",
  title: "",
  sumListsContacts: 0,
};

export const CONTACT_INITIAL_VALUES: IContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  addressFullName: "",
  addressStreet: "",
  addressApartment: "",
  addressCity: "",
  addressState: "",
  addressCountry: "",
  addressZipCode: "",
  shippingAddressFullName: "",
  shippingAddressStreet: "",
  shippingAddressApartment: "",
  shippingAddressCity: "",
  shippingAddressState: "",
  shippingAddressCountry: "",
  shippingAddressZipCode: "",
  confirm: false,
  ip: "",
};

export const CHART_OPTIONS = {
  chart: {
    type: "pie",
    backgroundColor: "#1a2941",
    margin: [0, 0, 0, 0],
    spacingTop: 0,
    spacingBottom: 0,
    spacingLeft: 0,
    spacingRight: 0,
    height: "144px",
  },
  title: {
    text: "",
  },
  tooltip: {
    enabled: false,
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      allowPointSelect: false,
      cursor: "pointer",
      size: "100%",
      dataLabels: {
        enabled: false,
      },
      showInLegend: false,
    },
  },
};

export const REPORT_COLUMNS = [
  {
    accessor: "name",
    title: "Name",
    sortable: true,
    render: (email: IReportList) => email.to.name,
  },
  {
    accessor: "email",
    title: "Email",
    sortable: true,
    render: (email: IReportList) => email.to.email,
  },
  {
    accessor: "status",
    title: "Status",
    sortable: true,
    render: (email: IReportList) => email.status,
  },
  // {
  //   accessor: "opens",
  //   title: "Opens",
  //   sortable: true,
  //   render: (email: IReportList) => email.opensCount,
  // },
  // {
  //   accessor: "clicks",
  //   title: "Clicks",
  //   sortable: true,
  //   render: (email: IReportList) => email.clickCount,
  // }
];

export const REPORTS_COLUMNS = [
  {
    accessor: "title",
    title: "Title",
    sortable: true,
    render: (email: Email) => email.title,
  },
  {
    accessor: "subject",
    title: "Subject",
    sortable: true,
    render: (email: Email) => email.subject,
  },
  {
    accessor: "sent",
    title: "Sent",
    sortable: true,
    render: (email: Email) =>
      email.sentAt ? new Date(email.sentAt).toLocaleString() : "N/A",
  },
  // {
  //   accessor: "opens",
  //   title: "Opens",
  //   sortable: true,
  //   render: (email: Email) => email?.opensCount || 0,
  // },
  // {
  //   accessor: "bounced",
  //   title: "Bounced",
  //   sortable: true,
  //   render: (email: Email) => email?.bounceCount || 0,
  // }
];

export const CONTACTS_COLUMNS = [
  {
    accessor: "firstName",
    title: "Name",
    sortable: true,
    render: (contact: IContact) => contact.firstName,
  },
  {
    accessor: "ip",
    title: "IP",
    sortable: true,
    render: (contact: IContact) => contact.ip,
  },
  {
    accessor: "email",
    title: "Email",
    sortable: true,
    render: (contact: IContact) => contact.email,
  },
  {
    accessor: "createdAt",
    title: "Created",
    sortable: true,
    render: (contact: IContact) =>
      contact.createdAt ? new Date(contact.createdAt).toLocaleString() : "N/A",
  },
];

export const CONTACTS_LISTS_COLUMNS = [
  {
    accessor: "title",
    title: "Title",
    sortable: true,
    render: (list: ILists) => list.title,
  },
  {
    accessor: "numContacts",
    title: "Num Contacts",
    sortable: true,
    render: (list: ILists) => list.numContacts,
  },
  {
    accessor: "createdAt",
    title: "Created",
    sortable: true,
    render: (list: ILists) =>
      list.createdAt ? new Date(list.createdAt).toLocaleString() : "N/A",
  },
];

export const LISTS_COLUMNS = [
  {
    accessor: "title",
    title: "Title",
    sortable: true,
    render: (list: ILists) => list.title,
  },
  {
    accessor: "numContacts",
    title: "Num Contacts",
    sortable: true,
    render: (list: ILists) => list.numContacts,
  },
  {
    accessor: "createdAt",
    title: "Created",
    sortable: true,
    render: (list: ILists) =>
      list.createdAt ? new Date(list.createdAt).toLocaleString() : "N/A",
  },
];

export const LIST_CONTACTS_COLUMNS = [
  {
    accessor: "firstName",
    title: "Name",
    sortable: true,
    render: (contact: IContact) => contact.firstName,
  },
  {
    accessor: "ip",
    title: "IP",
    sortable: true,
    render: (contact: IContact) => contact.ip,
  },
  {
    accessor: "email",
    title: "Email",
    sortable: true,
    render: (contact: IContact) => contact.email,
  },
  {
    accessor: "createdAt",
    title: "Created",
    sortable: true,
    render: (contact: IContact) =>
      contact.createdAt ? new Date(contact.createdAt).toLocaleString() : "N/A",
  },
];

export const RECORDS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export const SUBSCRIBER_COPY = {
  message: {
    unsubscribed:
      "You are unsubscribed. If you would like to re-enable communications resubscribe by clicking the button bellow.",
    subscribed:
      "If you would like to prevent email communications unsubscribe by clicking the button bellow.",
  },
  unsubscribeOrResubscribe: {
    subscribed: "Unsubscribe",
    unsubscribed: "Resubscribe",
  },
  unsubscribedOrResubscribed: {
    subscribed: "Subscribed",
    unsubscribed: "Unsubscribed",
  },
};
