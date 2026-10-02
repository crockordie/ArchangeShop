import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import Button from "../components/Button";
import productsSeed from "../data/db.json";

const fallbackCategories = [
  "special-edition",
  "luxury-collection",
  "summer-edition",
  "unique-collection",
];

const PRODUCTS_STORAGE_KEY = "admin-product-settings-fallback";

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const colorOptions = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Pink",
  "Yellow",
  "Purple",
];

const AdminProducts = () => {
  const fallbackProducts = (productsSeed as { products?: Product[] }).products || [];
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [selected, setSelected] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formValues, setFormValues] = useState({
    id: "",
    title: "",
    image: "",
    description: "",
    category: "",
    price: "",
    popularity: "",
    stock: "",
    size: "",
    color: "",
  });

  const persistProducts = (nextProducts: Product[]) => {
    setProducts(nextProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(nextProducts));
  };

  const loadProducts = async () => {
    try {
      const response = await customFetch.get("/products");
      const nextProducts = response.data || [];
      persistProducts(nextProducts);
    } catch (e) {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          if (Array.isArray(parsedProducts)) {
            setProducts(parsedProducts);
            return;
          }
        } catch {
          // ignore invalid local storage payload
        }
      }
      persistProducts(fallbackProducts);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.id || storedUser.role !== "admin") {
      toast.error("Admin access required");
      return;
    }
    loadProducts();
  }, []);

  const startEdit = (product: Product) => {
    setSelected(product);
    setFormValues({
      id: product.id,
      title: product.title,
      image: product.image || "",
      description: product.description || "",
      category: product.category,
      price: String(product.price),
      popularity: String(product.popularity),
      stock: String(product.stock),
      size: product.size || "",
      color: product.color || "",
    });
    setIsEditing(true);
  };

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      handleChange("image", result);
    };
    reader.readAsDataURL(file);
  };

  const toggleSizeOption = (option: string) => {
    const currentSizes = formValues.size
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);

    const nextSizes = currentSizes.includes(option)
      ? currentSizes.filter((size) => size !== option)
      : [...currentSizes, option];

    handleChange("size", nextSizes.join(", "));
  };

  const toggleColorOption = (option: string) => {
    const currentColors = formValues.color
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);

    const nextColors = currentColors.includes(option)
      ? currentColors.filter((color) => color !== option)
      : [...currentColors, option];

    handleChange("color", nextColors.join(", "));
  };

  const saveChanges = async () => {
    if (!selected) return;
    try {
      const data = {
        ...selected,
        title: formValues.title,
        image: formValues.image,
        description: formValues.description.trim() || undefined,
        category: formValues.category,
        price: Number(formValues.price),
        popularity: Number(formValues.popularity),
        stock: Number(formValues.stock),
        size: formValues.size.trim() || undefined,
        color: formValues.color.trim() || undefined,
      };
      await customFetch.put(`/products/${selected.id}`, data);
      persistProducts(
        products.map((product) => (product.id === selected.id ? data : product))
      );
      toast.success("Product updated");
      setIsEditing(false);
      setSelected(null);
      loadProducts();
    } catch (e) {
      const nextProducts = products.map((product) =>
        product.id === selected.id
          ? {
              ...selected,
              title: formValues.title,
              image: formValues.image,
              description: formValues.description.trim() || undefined,
              category: formValues.category,
              price: Number(formValues.price),
              popularity: Number(formValues.popularity),
              stock: Number(formValues.stock),
              size: formValues.size.trim() || undefined,
              color: formValues.color.trim() || undefined,
            }
          : product
      );
      persistProducts(nextProducts);
      toast.success("Product updated locally");
      setIsEditing(false);
      setSelected(null);
    }
  };

  const availableCategories = useMemo(() => {
    const categories = products
      .map((product) => product.category)
      .filter((category): category is string => Boolean(category));

    return Array.from(new Set([...fallbackCategories, ...categories]));
  }, [products]);

  const addProduct = async () => {
    setFormValues({
      id: "",
      title: "",
      image: "",
      description: "",
      category: availableCategories[0] || "",
      price: "",
      popularity: "",
      stock: "",
      size: "",
      color: "",
    });
    setIsAdding(true);
  };

  const createProduct = async () => {
    const trimmedId = formValues.id.trim();
    const trimmedTitle = formValues.title.trim();
    const trimmedImage = formValues.image.trim();
    const trimmedDescription = formValues.description.trim();
    const trimmedCategory = formValues.category.trim();

    if (!trimmedId || !trimmedTitle || !trimmedImage || !trimmedCategory || !formValues.price || !formValues.popularity || !formValues.stock) {
      toast.error("Please complete all product fields before creating the product");
      return;
    }

    try {
      const newProduct = {
        id: trimmedId,
        title: trimmedTitle,
        image: trimmedImage,
        description: trimmedDescription || undefined,
        category: trimmedCategory,
        price: Number(formValues.price),
        popularity: Number(formValues.popularity),
        stock: Number(formValues.stock),
        size: formValues.size.trim() || undefined,
        color: formValues.color.trim() || undefined,
      };
      await customFetch.post("/products", newProduct);
      persistProducts([newProduct, ...products]);
      toast.success("Product created");
      setIsAdding(false);
      loadProducts();
    } catch (e) {
      const newProduct = {
        id: trimmedId,
        title: trimmedTitle,
        image: trimmedImage,
        description: trimmedDescription || undefined,
        category: trimmedCategory,
        price: Number(formValues.price),
        popularity: Number(formValues.popularity),
        stock: Number(formValues.stock),
        size: formValues.size.trim() || undefined,
        color: formValues.color.trim() || undefined,
      };
      persistProducts([newProduct, ...products]);
      toast.success("Product created locally");
      setIsAdding(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await customFetch.delete(`/products/${id}`);
      persistProducts(products.filter((product) => product.id !== id));
      toast.success("Product removed");
      loadProducts();
    } catch (e) {
      persistProducts(products.filter((product) => product.id !== id));
      toast.success("Product removed locally");
    }
  };

  const getProductImage = (image: string) => {
    if (!image) return "";
    if (image.startsWith("data:image/") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `/assets/${encodeURI(image)}`;
  };

  const isAdmin = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    return storedUser?.role === "admin";
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-screen-2xl mx-auto pt-24 px-5">
        <h1 className="text-3xl font-bold">Admin access required</h1>
        <p className="mt-4">Please login with an admin account to manage products.</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 px-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-4xl font-bold">Product Management</h1>
          <Button onClick={addProduct} mode="brown" text="Add product" />
        </div>
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="border border-black rounded-md p-4 flex flex-col gap-3">
              <div className="flex justify-between gap-4">
                <div className="flex gap-4 items-center">
                  {product.image ? (
                    <img
                      src={getProductImage(product.image)}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded border border-black"
                    />
                  ) : (
                    <div className="w-20 h-20 border border-dashed border-black rounded flex items-center justify-center text-xs text-center p-2">
                      No image
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold">{product.title}</h2>
                    <p className="text-sm text-gray-700">Category: {product.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => startEdit(product)} mode="transparent" text="Edit" />
                  <Button onClick={() => deleteProduct(product.id)} mode="white" text="Delete" />
                </div>
              </div>
              <div className="grid gap-1 text-sm">
                <p>Price: XAF {product.price}</p>
                <p>Stock: {product.stock}</p>
                <p>Popularity: {product.popularity}</p>
                <p>Size: {product.size || "Not set"}</p>
                <p>Color: {product.color || "Not set"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditing && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-5">
          <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit product</h2>
            <div className="grid gap-4">
              <label className="flex flex-col gap-2">
                Title
                <input
                  className="border border-black p-2"
                  value={formValues.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                Image
                <div className="flex items-center gap-4">
                  {formValues.image ? (
                    <img
                      src={getProductImage(formValues.image)}
                      alt={formValues.title || "Product image"}
                      className="w-24 h-24 object-cover rounded border border-black"
                    />
                  ) : (
                    <div className="w-24 h-24 border border-dashed border-black rounded flex items-center justify-center text-xs text-center p-2">
                      No image
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      className="border border-black p-2"
                      value={formValues.image}
                      onChange={(e) => handleChange("image", e.target.value)}
                      placeholder="product image 1.jpg"
                    />
                    <label className="inline-flex w-fit cursor-pointer items-center gap-2 border border-black px-3 py-2 text-sm hover:bg-gray-100">
                      Choose local image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelection} />
                    </label>
                  </div>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                Description
                <textarea
                  className="border border-black p-2 min-h-[120px]"
                  value={formValues.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Add a short product description"
                />
              </label>
              <label className="flex flex-col gap-2">
                Category
                <select
                  className="border border-black p-2"
                  value={formValues.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                Price
                <input
                  type="number"
                  className="border border-black p-2"
                  value={formValues.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                Popularity
                <input
                  type="number"
                  className="border border-black p-2"
                  value={formValues.popularity}
                  onChange={(e) => handleChange("popularity", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                Stock
                <input
                  type="number"
                  className="border border-black p-2"
                  value={formValues.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                />
              </label>
              <div className="flex flex-col gap-2">
                <span>Size (optional)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sizeOptions.map((option) => {
                    const selectedSizes = formValues.size
                      .split(",")
                      .map((size) => size.trim())
                      .filter(Boolean);

                    return (
                      <label key={option} className="flex items-center gap-2 border border-black p-2">
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(option)}
                          onChange={() => toggleSizeOption(option)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span>Color (optional)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colorOptions.map((option) => {
                    const selectedColors = formValues.color
                      .split(",")
                      .map((color) => color.trim())
                      .filter(Boolean);

                    return (
                      <label key={option} className="flex items-center gap-2 border border-black p-2">
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(option)}
                          onChange={() => toggleColorOption(option)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button onClick={() => setIsEditing(false)} mode="white" text="Cancel" />
              <Button onClick={saveChanges} mode="brown" text="Save changes" />
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-5">
          <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add new product</h2>
            <div className="grid gap-4">
              <label className="flex flex-col gap-2">
                ID
                <input
                  className="border border-black p-2"
                  value={formValues.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                Title
                <input
                  className="border border-black p-2"
                  value={formValues.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                Image
                <div className="flex items-center gap-4">
                  {formValues.image ? (
                    <img
                      src={getProductImage(formValues.image)}
                      alt={formValues.title || "Product image"}
                      className="w-24 h-24 object-cover rounded border border-black"
                    />
                  ) : (
                    <div className="w-24 h-24 border border-dashed border-black rounded flex items-center justify-center text-xs text-center p-2">
                      No image
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      className="border border-black p-2"
                      value={formValues.image}
                      onChange={(e) => handleChange("image", e.target.value)}
                      placeholder="product image 1.jpg"
                    />
                    <label className="inline-flex w-fit cursor-pointer items-center gap-2 border border-black px-3 py-2 text-sm hover:bg-gray-100">
                      Choose local image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelection} />
                    </label>
                  </div>
                </div>
              </label>
              <label className="flex flex-col gap-2">
                Description
                <textarea
                  className="border border-black p-2 min-h-[120px]"
                  value={formValues.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Add a short product description"
                />
              </label>
              <label className="flex flex-col gap-2">
                Category
                <select
                  className="border border-black p-2"
                  value={formValues.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                Price
                <input
                  type="number"
                  className="border border-black p-2"
                  value={formValues.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                Popularity
                <input
                  type="number"
                  className="border border-black p-2"
                  value={formValues.popularity}
                  onChange={(e) => handleChange("popularity", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                Stock
                <input
                  type="number"
                  className="border border-black p-2"
                  value={formValues.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                />
              </label>
              <div className="flex flex-col gap-2">
                <span>Size (optional)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sizeOptions.map((option) => {
                    const selectedSizes = formValues.size
                      .split(",")
                      .map((size) => size.trim())
                      .filter(Boolean);

                    return (
                      <label key={option} className="flex items-center gap-2 border border-black p-2">
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(option)}
                          onChange={() => toggleSizeOption(option)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span>Color (optional)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colorOptions.map((option) => {
                    const selectedColors = formValues.color
                      .split(",")
                      .map((color) => color.trim())
                      .filter(Boolean);

                    return (
                      <label key={option} className="flex items-center gap-2 border border-black p-2">
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(option)}
                          onChange={() => toggleColorOption(option)}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Button onClick={() => setIsAdding(false)} mode="white" text="Cancel" />
              <Button onClick={createProduct} mode="brown" text="Create product" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
