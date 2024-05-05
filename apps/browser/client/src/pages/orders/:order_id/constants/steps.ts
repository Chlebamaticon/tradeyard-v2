import { OrderStatus } from '@tradeyard-v2/api-dtos';

export const customerStepToStatus = {
  deposit: [OrderStatus.Created],
  execution: [OrderStatus.CustomerDeposit, OrderStatus.MerchantConfirmed],
  shipping: [OrderStatus.MerchantShipping],
  shipped: [OrderStatus.MerchantShipped],
  done: [OrderStatus.CustomerRelease, OrderStatus.MerchantRelease],
  complaint: [OrderStatus.CustomerComplaint, OrderStatus.MerchantComplaint],
  refunded: [
    OrderStatus.MerchantCancelled,
    OrderStatus.ModeratorComplaintRefunded,
  ],
};
export type CustomerStep = keyof typeof customerStepToStatus;

export const customerStepToCompleted: Record<CustomerStep, OrderStatus[]> = {
  deposit: [
    customerStepToStatus.execution,
    customerStepToStatus.shipping,
    customerStepToStatus.shipped,
    customerStepToStatus.done,
  ].flat(),
  execution: [
    customerStepToStatus.shipping,
    customerStepToStatus.shipped,
    customerStepToStatus.done,
  ].flat(),
  shipping: [customerStepToStatus.shipped, customerStepToStatus.done].flat(),
  shipped: [customerStepToStatus.done].flat(),
  done: [customerStepToStatus.done].flat(),
  complaint: [customerStepToStatus.refunded].flat(),
  refunded: [],
};

export const merchantStepToStatus = {
  deposit: [OrderStatus.Created],
  confirm: [OrderStatus.CustomerDeposit],
  preparing: [OrderStatus.MerchantConfirmed],
  shipping: [OrderStatus.MerchantShipping],
  shipped: [OrderStatus.MerchantShipped],
  done: [OrderStatus.MerchantRelease, OrderStatus.CustomerRelease],
  complaint: [OrderStatus.CustomerComplaint, OrderStatus.MerchantComplaint],
  refunded: [
    OrderStatus.MerchantCancelled,
    OrderStatus.ModeratorComplaintRefunded,
  ],
};

export type MerchantStep = keyof typeof merchantStepToStatus;

export const merchantStepToCompleted: Record<MerchantStep, OrderStatus[]> = {
  deposit: [
    merchantStepToStatus.confirm,
    merchantStepToStatus.preparing,
    merchantStepToStatus.shipping,
    merchantStepToStatus.shipped,
    merchantStepToStatus.done,
  ].flat(),
  confirm: [
    merchantStepToStatus.preparing,
    merchantStepToStatus.shipping,
    merchantStepToStatus.shipped,
    merchantStepToStatus.done,
  ].flat(),
  preparing: [
    merchantStepToStatus.shipping,
    merchantStepToStatus.shipped,
    merchantStepToStatus.done,
  ].flat(),
  shipping: [merchantStepToStatus.shipped, merchantStepToStatus.done].flat(),
  shipped: [merchantStepToStatus.done].flat(),
  done: [],
  complaint: [merchantStepToStatus.refunded].flat(),
  refunded: [],
};
