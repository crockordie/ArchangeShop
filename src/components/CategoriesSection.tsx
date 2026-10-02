import CategoryItem from "./CategoryItem";

const CategoriesSection = () => {
  return (
    <div className="max-w-screen-2xl px-5 mx-auto mt-24">
      <h2 className="text-black text-5xl font-normal tracking-[1.56px] max-sm:text-4xl mb-12">
        Our Categories
      </h2>
      <div className="flex justify-between flex-wrap gap-y-10">
        <CategoryItem
          categoryTitle="Special Edition"
          image="1.jpg"
          link="special-edition"
        />
        <CategoryItem
          categoryTitle="Luxury Collection"
          image="resized-1080x1080.jpg"
          link="luxury-collection"
        />
        <CategoryItem
          categoryTitle="Summer Edition"
          image="resized-1080x1080 (2).jpg"
          link="summer-edition"
        />
        <CategoryItem
          categoryTitle="Unique Collection"
          image="resized-1080x1080 (1).jpg"
          link="unique-collection"
        />
      </div>
    </div>
  );
};
export default CategoriesSection;
