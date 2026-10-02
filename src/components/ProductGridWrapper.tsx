import React, { ReactElement, useEffect, useState } from "react";
import customFetch from "../axios/custom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  setShowingProducts,
  setTotalProducts,
} from "../features/shop/shopSlice";
import localData from "../data/db.json";

const ProductGridWrapper = ({
  searchQuery,
  sortCriteria,
  category,
  page,
  limit,
  children,
}: {
  searchQuery?: string;
  sortCriteria?: string;
  category?: string;
  page?: number;
  limit?: number;
  children:
    | ReactElement<{ products: Product[] }>
    | ReactElement<{ products: Product[] }>[];
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { totalProducts } = useAppSelector((state) => state.shop);
  const dispatch = useAppDispatch();

  const fetchProducts = async () => {
    try {
      const response = await customFetch("/products");
      if (Array.isArray(response.data)) {
        return response.data as Product[];
      }
    } catch (error) {
      // fallback to local data when API is unavailable
    }
    return (localData.products as Product[]) || [];
  };

  const getSearchedProducts = async (
    query: string,
    sort: string,
    page: number
  ) => {
    if (!query) {
      query = "";
    }

    const allProducts = await fetchProducts();
    let searchedProducts = allProducts.filter((product: Product) =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );

    if (category) {
      searchedProducts = searchedProducts.filter((product: Product) => {
        return product.category === category;
      });
    }

    if (totalProducts !== searchedProducts.length) {
      dispatch(setTotalProducts(searchedProducts.length));
    }

    if (sort === "price-asc") {
      searchedProducts = searchedProducts.sort(
        (a: Product, b: Product) => a.price - b.price
      );
    } else if (sort === "price-desc") {
      searchedProducts = searchedProducts.sort(
        (a: Product, b: Product) => b.price - a.price
      );
    } else if (sort === "popularity") {
      searchedProducts = searchedProducts.sort(
        (a: Product, b: Product) => b.popularity - a.popularity
      );
    }

    if (limit) {
      setProducts(searchedProducts.slice(0, limit));
      dispatch(setShowingProducts(searchedProducts.slice(0, limit).length));
    } else if (page) {
      setProducts(searchedProducts.slice(0, page * 9));
      dispatch(
        setShowingProducts(searchedProducts.slice(0, page * 9).length)
      );
    } else {
      setProducts(searchedProducts);
      dispatch(setShowingProducts(searchedProducts.length));
    }
  };

  useEffect(() => {
    getSearchedProducts(searchQuery || "", sortCriteria || "", page || 1);
  }, [searchQuery, sortCriteria, page, category, totalProducts]);

  // Clone the children and pass the products as props to the children
  // This will cause the children to re-render with the new products
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { products: products });
    }
    return null;
  });

  return <>{childrenWithProps}</>;
};
export default ProductGridWrapper;
