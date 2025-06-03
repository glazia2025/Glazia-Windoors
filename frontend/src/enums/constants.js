export const MIN_SEARCH_TIME = 1000;

export const DEFAULT_ORDER_LIST_QUERY_PARAMS = {
  page: 1,
  limit: 20,
  sortKey: "createdAt",
  sortOrder: "desc",
  filters: {},
};

export const ORDER_STATUS = {
  LOADING: "loading",
  FIRST_APPROVAL_PENDING: "first_approval_pending",
  SECOND_PAYMENT_PENDING: "second_payment_pending",
  SECOND_PAYMENT_OVERDUE: "second_payment_overdue",
  SECOND_APPROVAL_PENDING: "second_approval_pending",
  DISPATCH_PENDING: "dispatch_pending",
  COMPLETED: "completed",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.LOADING]: "Loading...",
  [ORDER_STATUS.FIRST_APPROVAL_PENDING]: "Proof Submitted",
  [ORDER_STATUS.SECOND_PAYMENT_PENDING]: "Final Payment Pending",
  [ORDER_STATUS.SECOND_PAYMENT_OVERDUE]: "Final Payment Overdue",
  [ORDER_STATUS.SECOND_APPROVAL_PENDING]: "Final Approval Pending",
  [ORDER_STATUS.DISPATCH_PENDING]: "Waiting for Dispatch",
  [ORDER_STATUS.COMPLETED]: "Completed",
};

export const ORDER_STATUS_LONG_LABELS = {
  [ORDER_STATUS.LOADING]: "Loading...",
  [ORDER_STATUS.FIRST_APPROVAL_PENDING]:
    "Proof submitted. Waiting for approval.",
  [ORDER_STATUS.SECOND_PAYMENT_PENDING]:
    "Final payment pending but not due today.",
  [ORDER_STATUS.SECOND_PAYMENT_OVERDUE]: "Final payment overdue. Submit proof.",
  [ORDER_STATUS.SECOND_APPROVAL_PENDING]:
    "Final proof submitted. Waiting for approval.",
  [ORDER_STATUS.DISPATCH_PENDING]: "Payment is approved. Waiting for Dispatch.",
  [ORDER_STATUS.COMPLETED]: "Completed.",
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.LOADING]: "bg-light text-muted",
  [ORDER_STATUS.FIRST_APPROVAL_PENDING]: "bg-warning text-white",
  [ORDER_STATUS.SECOND_PAYMENT_PENDING]: "bg-success text-white",
  [ORDER_STATUS.SECOND_PAYMENT_OVERDUE]: "bg-warning text-white",
  [ORDER_STATUS.SECOND_APPROVAL_PENDING]: "bg-warning text-white",
  [ORDER_STATUS.DISPATCH_PENDING]: "bg-success text-white",
  [ORDER_STATUS.COMPLETED]: "bg-primary text-white",
};

export const PAYMENT_STATUS = {
  LOADING: "loading",
  PROOF_PENDING: "proof_pending",
  PROOF_OVERDUE: "proof_overdue",
  APPROVAL_PENDING: "approval_pending",
  APPROVED: "approved",
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.LOADING]: "Loading...",
  [PAYMENT_STATUS.PROOF_PENDING]: "Proof Pending",
  [PAYMENT_STATUS.PROOF_OVERDUE]: "Proof Overdue",
  [PAYMENT_STATUS.APPROVAL_PENDING]: "Approval Pending",
  [PAYMENT_STATUS.APPROVED]: "Payment Approved",
};

export const PAYMENT_STATUS_LONG_LABELS = {
  [PAYMENT_STATUS.LOADING]: "Loading...",
  [PAYMENT_STATUS.PROOF_PENDING]: "Payment not due today.",
  [PAYMENT_STATUS.PROOF_OVERDUE]: "Payment is due. Submit proof.",
  [PAYMENT_STATUS.APPROVAL_PENDING]: "Proof Submitted. Waiting for approval.",
  [PAYMENT_STATUS.APPROVED]: "Payment Approved.",
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.LOADING]: "bg-light text-muted",
  [PAYMENT_STATUS.PROOF_PENDING]: "bg-success text-white",
  [PAYMENT_STATUS.PROOF_OVERDUE]: "bg-warning text-white",
  [PAYMENT_STATUS.APPROVAL_PENDING]: "bg-warning text-white",
  [PAYMENT_STATUS.APPROVED]: "bg-primary text-white",
};

export const SORT_KEYS = {
  CREATED_AT_DESC: "createdAt:desc",
  CREATED_AT_ASC: "createdAt:asc",
  TOTAL_AMOUNT_DESC: "totalAmount:desc",
  TOTAL_AMOUNT_ASC: "totalAmount:asc",
};

export const SORT_KEY_LABELS = {
  [SORT_KEYS.CREATED_AT_DESC]: "Date: Latest to oldest",
  [SORT_KEYS.CREATED_AT_ASC]: "Date: Oldest to latest",
  [SORT_KEYS.TOTAL_AMOUNT_DESC]: "Amount: Highest to lowest",
  [SORT_KEYS.TOTAL_AMOUNT_ASC]: "Amount: Lowest to highest",
};

export const SORT_KEY_OPTIONS = [
  {
    label: SORT_KEY_LABELS[SORT_KEYS.CREATED_AT_DESC],
    value: SORT_KEYS.CREATED_AT_DESC,
  },
  {
    label: SORT_KEY_LABELS[SORT_KEYS.CREATED_AT_ASC],
    value: SORT_KEYS.CREATED_AT_ASC,
  },
  {
    label: SORT_KEY_LABELS[SORT_KEYS.TOTAL_AMOUNT_DESC],
    value: SORT_KEYS.TOTAL_AMOUNT_DESC,
  },
  {
    label: SORT_KEY_LABELS[SORT_KEYS.TOTAL_AMOUNT_ASC],
    value: SORT_KEYS.TOTAL_AMOUNT_ASC,
  },
];
export const ORDER_DOCUMENTS = {
  BILTY_DOC: "biltyDoc",
  E_WAY_BILL: "eWayBill",
  TAX_INVOICE: "taxInvoice",
};

export const ORDER_DOCUMENT_LABELS = {
  [ORDER_DOCUMENTS.BILTY_DOC]: "Bilty Document",
  [ORDER_DOCUMENTS.E_WAY_BILL]: "E-Way Bill",
  [ORDER_DOCUMENTS.TAX_INVOICE]: "Tax Invoice",
};

export const ORDER_DOCUMENT_OPTIONS = [
  {
    label: ORDER_DOCUMENT_LABELS[ORDER_DOCUMENTS.BILTY_DOC],
    value: ORDER_DOCUMENTS.BILTY_DOC,
  },
  {
    label: ORDER_DOCUMENT_LABELS[ORDER_DOCUMENTS.E_WAY_BILL],
    value: ORDER_DOCUMENTS.E_WAY_BILL,
  },
  {
    label: ORDER_DOCUMENT_LABELS[ORDER_DOCUMENTS.TAX_INVOICE],
    value: ORDER_DOCUMENTS.TAX_INVOICE,
  },
];
