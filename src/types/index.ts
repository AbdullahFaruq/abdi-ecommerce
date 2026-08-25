/** Plain, serialisable shapes handed to client components. */
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
};

export type Slide = {
  id: string;
  image: string;
};

export type ApiError = { error: string; details?: Record<string, string[]> };
