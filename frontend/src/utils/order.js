import {
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_LONG_LABELS,
} from "../enums/constants";

export const checkOrderFirstApprovalPending = (orderDetails) => {
  return (
    orderDetails &&
    orderDetails.payments &&
    orderDetails.payments.length === 1 &&
    !orderDetails.payments[0].isApproved
  );
};

export const checkOrderLatestPaymentPending = (orderDetails) => {
  return (
    orderDetails &&
    orderDetails.payments &&
    orderDetails.payments.length > 0 &&
    !orderDetails.payments[orderDetails.payments.length - 1].isApproved
  );
};

export const checkOrderSecondPaymentPending = (orderDetails) => {
  return (
    orderDetails &&
    orderDetails.payments &&
    orderDetails.payments.length === 2 &&
    !orderDetails.payments[1].proofAdded &&
    new Date(orderDetails.payments[1].dueDate).getTime() > new Date().getTime()
  );
};

export const checkOrderSecondPaymentOverdue = (orderDetails) => {
  return (
    orderDetails &&
    orderDetails.payments &&
    orderDetails.payments.length === 2 &&
    !orderDetails.payments[1].proofAdded &&
    new Date(orderDetails.payments[1].dueDate).getTime() <= new Date().getTime()
  );
};

export const checkOrderSecondApprovalPending = (orderDetails) => {
  return (
    orderDetails &&
    orderDetails.payments &&
    orderDetails.payments.length === 2 &&
    orderDetails.payments[1].proofAdded &&
    !orderDetails.payments[1].isApproved
  );
};

export const checkOrderDispatchPending = (orderDetails) => {
  return (
    orderDetails &&
    orderDetails.payments &&
    orderDetails.payments.length === 2 &&
    orderDetails.payments[1].proofAdded &&
    orderDetails.payments[1].isApproved &&
    !orderDetails.isComplete
  );
};

export const getOrderStatus = (orderDetails) => {
  if (!orderDetails) {
    return ORDER_STATUS.LOADING;
  }
  if (checkOrderFirstApprovalPending(orderDetails)) {
    return ORDER_STATUS.FIRST_APPROVAL_PENDING;
  }
  if (checkOrderSecondPaymentPending(orderDetails)) {
    return ORDER_STATUS.SECOND_PAYMENT_PENDING;
  }
  if (checkOrderSecondPaymentOverdue(orderDetails)) {
    return ORDER_STATUS.SECOND_PAYMENT_OVERDUE;
  }
  if (checkOrderSecondApprovalPending(orderDetails)) {
    return ORDER_STATUS.SECOND_APPROVAL_PENDING;
  }
  if (checkOrderDispatchPending(orderDetails)) {
    return ORDER_STATUS.DISPATCH_PENDING;
  }
  return ORDER_STATUS.COMPLETED;
};

export const getOrderStatusLabel = (orderDetails) => {
  return ORDER_STATUS_LABELS[getOrderStatus(orderDetails)];
};

export const getOrderStatusLongLabel = (orderDetails) => {
  return ORDER_STATUS_LONG_LABELS[getOrderStatus(orderDetails)];
};

export const getOrderStatusColor = (orderDetails) => {
  return ORDER_STATUS_COLORS[getOrderStatus(orderDetails)];
};
