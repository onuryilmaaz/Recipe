import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RecipeLandingPage from "./pages/Recipe/RecipeLandingPage";
import RecipesView from "./pages/Recipe/RecipeView";
import RecipeByTags from "./pages/Recipe/RecipeByTags";
import SearchRecipes from "./pages/Recipe/SearchRecipes";
import AdminLogin from "./pages/Admin/AdminLogin";

import Dashboard from "./pages/Admin/Dashboard";
import Recipes from "./pages/Admin/Recipes";
import RecipesEditor from "./pages/Admin/RecipesEditor";
import Comments from "./pages/Admin/Comments";

import PrivateRoute from "./routes/PrivateRoute";
import UserProvider from "./context/userContext";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            {/* Default Route */}
            <Route path="/" element={<RecipeLandingPage />} />
            <Route path="/:slug" element={<RecipesView />} />
            <Route path="/tag/:tageName" element={<RecipeByTags />} />
            <Route path="/search" element={<SearchRecipes />} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={["Admin"]} />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/posts" element={<Recipes />} />
            <Route path="/admin/create" element={<RecipesEditor />} />
            <Route
              path="/admin/edit/:postSlug"
              element={<RecipesEditor isEdit={true} />}
            />
            <Route path="/admin/comments" element={<Comments />} />
            <Route />

            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </Router>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </UserProvider>
  );
};

export default App;
