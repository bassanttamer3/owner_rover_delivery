export interface ListCusotmersParamsInterface {
  // page: number;
  limit: number;
  starting_after?: string;
}

export interface UpdateCustomerDataInterface {
  name?: string;
  email?: string;
  phone?: string;
}

export interface Customer {
  stripeCustomerId: string;
  name: string;
  email: string;
  phone: string;
  billing: any;
  defaultPaymentMethod: string | null;
  createdAt: string;
}