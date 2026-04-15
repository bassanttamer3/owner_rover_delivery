export interface Order {
    _id: string;
    user: string;
    company: string;
    items: OrderItem[];
    shipping_address: string;
    total_price: number;
    discount_amount: number;
    final_price: number;
    coupon: string;
    payment_method: string;
    payment_status: string;
    order_status: string;
    payment_id: string;
    expires_at: string;     
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    product_id: string;
    title: string;
    images_URL: string[];
    price: number;
    quantity: number;
}