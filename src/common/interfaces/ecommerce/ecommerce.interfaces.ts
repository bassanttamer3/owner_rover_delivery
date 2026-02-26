export interface IOrder {
  _id: string;
  items: Array<{
    product_id: string;
    title: string;
    price: number;
    quantity: number;
    images_URL: string[];
  }>;
  total_price: number;
  final_price: number;
  order_status: string;
  payment_status: string;
  createdAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discount: number;
  discount_type: string;
  expiration_date: string;
  max_usage: number;
  used_count: number;
  is_deleted: boolean;
  createdAt: string;
}