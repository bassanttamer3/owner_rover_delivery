export interface ListProductsInterface {
    page?: number;
    limit?: number;
    title?: string; 
}

export interface IProduct {
    _id: string;
    title: string;
    price: number;
    description: string;
    stock: number;
    discount?: number;
    images_URL: string[];
    is_active: boolean;
    createdAt: string;
}

export interface CreateProductInterface {
    title: string;
    price: number;
    description: string;
    stock: number;
    discount?: number;
    images_URL: string[];
}

export interface UpdateProductInterface {
    title?: string;
    price?: number;
    description?: string;
    stock?: number;
    discount?: number;
    is_active?: boolean;
}