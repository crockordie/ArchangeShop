import {
  Button,
  Dropdown,
  ProductItem,
  QuantityInput,
  StandardSelectInput,
} from "../components";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";
import WithSelectInputWrapper from "../utils/withSelectInputWrapper";
import WithNumberInputWrapper from "../utils/withNumberInputWrapper";
import { formatCategoryName } from "../utils/formatCategoryName";
import customFetch from "../axios/custom";
import productsDb from "../data/db.json";
import toast from "react-hot-toast";

const SingleProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  // defining default values for input fields
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // defining HOC instances
  const SelectInputUpgrade = WithSelectInputWrapper(StandardSelectInput);
  const QuantityInputUpgrade = WithNumberInputWrapper(QuantityInput);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const response = await customFetch(`products/${params.id}`);
        setSingleProduct(response.data);
      } catch (error) {
        const fallbackProduct = (productsDb as { products: Product[] })?.products?.find(
          (product) => product.id === params.id
        );
        if (fallbackProduct) {
          setSingleProduct(fallbackProduct);
          toast.success("Loaded product details from local fallback");
        } else {
          toast.error("Unable to load product details from local fallback");
        }
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await customFetch("/products");
        setProducts(response.data);
      } catch (error) {
        const fallbackProducts = (productsDb as { products: Product[] })?.products ?? [];
        if (fallbackProducts.length > 0) {
          setProducts(fallbackProducts.slice(0, 3));
          toast.success("Loaded product list from local fallback");
        } else {
          toast.error("Unable to load product list from local fallback");
        }
      }
    };
    fetchSingleProduct();
    fetchProducts();
  }, [params.id]);

  const availableSizes = React.useMemo(
    () =>
      singleProduct?.size
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? [],
    [singleProduct?.size]
  );

  const availableColors = React.useMemo(
    () =>
      singleProduct?.color
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? [],
    [singleProduct?.color]
  );

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSize(availableSizes[0].toLowerCase());
    }

    if (availableColors.length > 0) {
      setColor(availableColors[0].toLowerCase());
    }
  }, [availableSizes, availableColors]);

  const getProductImageSrc = (image?: string) => {
    if (!image) return "";
    if (image.startsWith("data:image/") || image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `/assets/${image}`;
  };

  const handleAddToCart = () => {
    if (singleProduct) {
      dispatch(
        addProductToTheCart({
          id: singleProduct.id + size + color,
          image: singleProduct.image,
          title: singleProduct.title,
          category: singleProduct.category,
          price: singleProduct.price,
          quantity,
          size,
          color,
          popularity: singleProduct.popularity,
          stock: singleProduct.stock,
        })
      );
      toast.success("Product added to the cart");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3">
      <div className="grid grid-cols-3 gap-x-8 max-lg:grid-cols-1">
        <div className="lg:col-span-2">
          <img
            src={getProductImageSrc(singleProduct?.image)}
            alt={singleProduct?.title}
          />
        </div>
        <div className="w-full flex flex-col gap-5 mt-9">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl">{singleProduct?.title}</h1>
            <div className="flex justify-between items-center">
              <p className="text-base text-secondaryBrown">
                {formatCategoryName(singleProduct?.category || "")}
              </p>
              <p className="text-base font-bold">XAF {singleProduct?.price}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-black">Choose size</span>
              <SelectInputUpgrade
                selectList={availableSizes.map((availableSize) => ({
                  id: availableSize.toLowerCase(),
                  value: availableSize.toUpperCase(),
                }))}
                value={size}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSize(() => e.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-black">Choose color</span>
              <SelectInputUpgrade
                selectList={availableColors.map((availableColor) => ({
                  id: availableColor.toLowerCase(),
                  value: availableColor.toUpperCase(),
                }))}
                value={color}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setColor(() => e.target.value)
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-black">Quantity</span>
              <QuantityInputUpgrade
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuantity(() => parseInt(e.target.value))
                }
              />
            </label>
          </div>
          <div className="flex flex-col gap-3">
            <Button mode="brown" text="Add to cart" onClick={handleAddToCart} />
            <p className="text-secondaryBrown text-sm text-right">
              Delivery estimated on the Friday, July 26
            </p>
          </div>
          <div>
            {/* drowdown items */}
            <Dropdown dropdownTitle="Description">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore
              quos deleniti, mollitia, vitae harum suscipit voluptatem quasi, ab
              assumenda accusantium rem praesentium accusamus quae quam tempore
              nostrum corporis eaque. Mollitia.
            </Dropdown>

            <Dropdown dropdownTitle="Product Details">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga ad
              at odio illo, necessitatibus, reprehenderit dolore voluptas ea
              consequuntur ducimus repellat soluta mollitia facere sapiente.
              Unde provident possimus hic dolore.
            </Dropdown>

            <Dropdown dropdownTitle="Delivery Details">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga ad
              at odio illo, necessitatibus, reprehenderit dolore voluptas ea
              consequuntur ducimus repellat soluta mollitia facere sapiente.
              Unde provident possimus hic dolore.
            </Dropdown>
          </div>
        </div>
      </div>

      {/* similar products */}
      <div>
        <h2 className="text-black/90 text-5xl mt-24 mb-12 text-center max-lg:text-4xl">
          Similar Products
        </h2>
        <div className="flex flex-wrap justify-between items-center gap-y-8 mt-12 max-xl:justify-start max-xl:gap-5 ">
          {products.slice(0, 3).map((product: Product) => (
            <ProductItem
              key={product?.id}
              id={product?.id}
              image={product?.image}
              title={product?.title}
              category={product?.category}
              price={product?.price}
              popularity={product?.popularity}
              stock={product?.stock}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default SingleProduct;
