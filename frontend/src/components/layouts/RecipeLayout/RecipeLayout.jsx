import RecipeNavbar from "./RecipeNavbar";

const RecipeLayout = ({ children, activeMenu }) => {
  return (
    <div className="bg-white pb-30">
      <RecipeNavbar activeMenu={activeMenu} />
      <div className="container mx-auto px-5 md:px-0 mt-10"> {children} </div>
    </div>
  );
};

export default RecipeLayout;
