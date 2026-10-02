import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import Button from "../components/Button";
import productsSeed from "../data/db.json";

const PRODUCTS_STORAGE_KEY = "admin-product-settings-fallback";

const AdminSettings = () => {
  const fallbackProducts = (productsSeed as { products?: Product[] }).products || [];
  const persistedProducts = useMemo(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (!storedProducts) return fallbackProducts;

      const parsedProducts = JSON.parse(storedProducts);
      return Array.isArray(parsedProducts) ? parsedProducts : fallbackProducts;
    } catch {
      return fallbackProducts;
    }
  }, [fallbackProducts]);

  const [categories, setCategories] = useState<string[]>(() =>
    Array.from(new Set(persistedProducts.map((product) => product.category)))
  );
  const [products, setProducts] = useState<Product[]>(persistedProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    minPopularity: "",
    maxPopularity: "",
  });

  const persistProducts = (nextProducts: Product[]) => {
    setProducts(nextProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(nextProducts));
    setCategories(Array.from(new Set(nextProducts.map((product) => product.category))));
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.id || storedUser.role !== "admin") {
      toast.error("Admin access required");
      return;
    }

    const loadProducts = async () => {
      try {
        const response = await customFetch.get("/products");
        const products: Product[] = response.data || [];
        persistProducts(products);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      } catch (e) {
        persistProducts(persistedProducts);
      }
    };
    loadProducts();
  }, []);

  const displayedProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const minPrice = filters.minPrice ? Number(filters.minPrice) : -Infinity;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Infinity;
    const minPopularity = filters.minPopularity ? Number(filters.minPopularity) : -Infinity;
    const maxPopularity = filters.maxPopularity ? Number(filters.maxPopularity) : Infinity;

    return products.filter((product) => {
      const matchesSearch = query
        ? product.title.toLowerCase().includes(query) || String(product.id).includes(query)
        : true;
      const matchesCategory = filters.category ? product.category === filters.category : true;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      const matchesPopularity = product.popularity >= minPopularity && product.popularity <= maxPopularity;
      return matchesSearch && matchesCategory && matchesPrice && matchesPopularity;
    });
  }, [products, searchQuery, filters]);

  const handleProductChange = (id: string, key: keyof Product, value: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              [key]:
                key === "price" || key === "popularity" || key === "stock"
                  ? Number(value)
                  : value,
            }
          : product
      )
    );
  };

  const handleImageSelection = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      handleProductChange(id, "image", result);
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = async (product: Product) => {
    try {
      await customFetch.put(`/products/${product.id}`, product);
      const nextProducts = products.map((currentProduct) =>
        currentProduct.id === product.id ? product : currentProduct
      );
      persistProducts(nextProducts);
      toast.success("Product updated successfully");
    } catch (e) {
      const nextProducts = products.map((currentProduct) =>
        currentProduct.id === product.id ? product : currentProduct
      );
      persistProducts(nextProducts);
      toast.success("Product updated locally");
    }
  };

  const getProductImage = (image: string) => {
    if (!image) return "";
    if (image.startsWith("data:image/") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `/assets/${encodeURI(image)}`;
  };

  const resetFilters = () => {
    setFilters({ category: "", minPrice: "", maxPrice: "", minPopularity: "", maxPopularity: "" });
    setSearchQuery("");
  };

  const isAdmin = JSON.parse(localStorage.getItem("user") || "{}").role === "admin";

  if (!isAdmin) {
    return (
      <div className="max-w-screen-2xl mx-auto pt-24 px-5">
        <h1 className="text-3xl font-bold">Admin access required</h1>
        <p className="mt-4">Please login with an admin account to view settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 px-5">
      <h1 className="text-4xl font-bold mb-8">Product Settings</h1>

      <div className="border border-black rounded-md p-5 mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
          <div className="flex-grow">
            <label className="block text-sm font-medium mb-2">Search by Title or ID</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-black p-3"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:flex-grow">
            <label className="flex flex-col gap-2">
              Category
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="border border-black p-3"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              Min Price
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                className="border border-black p-3"
              />
            </label>
            <label className="flex flex-col gap-2">
              Max Price
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                className="border border-black p-3"
              />
            </label>
            <label className="flex flex-col gap-2">
              Popularity
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPopularity}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minPopularity: e.target.value }))}
                  className="border border-black p-3"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPopularity}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxPopularity: e.target.value }))}
                  className="border border-black p-3"
                />
              </div>
            </label>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button mode="white" text="Reset filters" onClick={resetFilters} />
          <p className="text-sm text-gray-600">
            Showing {displayedProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {displayedProducts.map((product) => (
          <div key={product.id} className="border border-gray-300 rounded-md p-4 bg-white">
            <div className="flex items-center gap-4 mb-4">
              {product.image ? (
                <img
                  src={getProductImage(product.image)}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded border border-black"
                />
              ) : (
                <div className="w-24 h-24 border border-dashed border-black rounded flex items-center justify-center text-xs text-center p-2">
                  No image
                </div>
              )}
              <div className="text-sm text-gray-700">Current product image preview</div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2">
                ID
                <input
                  type="text"
                  value={product.id}
                  onChange={(e) => handleProductChange(product.id, "id", e.target.value)}
                  className="border border-black p-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                Title
                <input
                  type="text"
                  value={product.title}
                  onChange={(e) => handleProductChange(product.id, "title", e.target.value)}
                  className="border border-black p-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                Image
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={product.image}
                    onChange={(e) => handleProductChange(product.id, "image", e.target.value)}
                    className="border border-black p-2"
                    placeholder="product image 1.jpg"
                  />
                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 border border-black px-3 py-2 text-sm hover:bg-gray-100">
                    Choose local image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelection(product.id, e)} />
                  </label>
                </div>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <label className="flex flex-col gap-2">
                Category
                <input
                  type="text"
                  value={product.category}
                  onChange={(e) => handleProductChange(product.id, "category", e.target.value)}
                  className="border border-black p-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                Price
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => handleProductChange(product.id, "price", e.target.value)}
                  className="border border-black p-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                Popularity
                <input
                  type="number"
                  value={product.popularity}
                  onChange={(e) => handleProductChange(product.id, "popularity", e.target.value)}
                  className="border border-black p-2"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-1 mt-4">
              <label className="flex flex-col gap-2">
                Stock
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => handleProductChange(product.id, "stock", e.target.value)}
                  className="border border-black p-2"
                />
              </label>
            </div>
            <div className="mt-4">
              <label className="flex flex-col gap-2">
                Description
                <textarea
                  value={product.description || ""}
                  onChange={(e) => handleProductChange(product.id, "description", e.target.value)}
                  className="border border-black p-2 min-h-[120px]"
                  placeholder="Add a short product description"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <Button mode="brown" text="Save product" onClick={() => saveProduct(product)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
