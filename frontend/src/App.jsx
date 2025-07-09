import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RecipeLandingPage from "./pages/Recipe/RecipeLandingPage";
import RecipesView from "./pages/Recipe/RecipeView";
import RecipeByTags from "./pages/Recipe/RecipeByTags";
import SearchRecipes from "./pages/Recipe/SearchRecipes";
import FavoritesPage from "./pages/Recipe/FavoritesPage";
import CollectionsPage from "./pages/Recipe/CollectionsPage";
import CollectionDetailPage from "./pages/Recipe/CollectionDetailPage";
import UserProfilePage from "./pages/Recipe/UserProfilePage";
import SettingsPage from "./pages/Recipe/SettingsPage";
import AdminLogin from "./pages/Admin/AdminLogin";

import Dashboard from "./pages/Admin/Dashboard";
import Recipes from "./pages/Admin/Recipes";
import RecipesEditor from "./pages/Admin/RecipesEditor";
import Comments from "./pages/Admin/Comments";
import Users from "./pages/Admin/Users";
import Moderation from "./pages/Admin/Moderation";
import EmailVerification from "./pages/Auth/EmailVerification";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

import PrivateRoute from "./routes/PrivateRoute";
import { UserProvider } from "./context/userContext";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            {/* Default Route */}
            <Route path="/" element={<RecipeLandingPage />} />

            {/* Auth Routes */}
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* User Pages */}
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route
              path="/collections/:slug"
              element={<CollectionDetailPage />}
            />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/search" element={<SearchRecipes />} />
            <Route path="/tag/:tagName" element={<RecipeByTags />} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/recipes" element={<Recipes />} />
              <Route path="/admin/create" element={<RecipesEditor />} />
              <Route
                path="/admin/edit/:recipeSlug"
                element={<RecipesEditor isEdit={true} />}
              />
              <Route path="/admin/comments" element={<Comments />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/moderation" element={<Moderation />} />
            </Route>

            <Route path="/admin-login" element={<AdminLogin />} />
            {/* Recipe Route (must be last to avoid catching other routes) */}
            <Route path="/:slug" element={<RecipesView />} />
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
