window.global = window;
import { createRoot } from "react-dom/client";
import "./index.css";
import store from "./store/store.js";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  AuthLayout,
  Call,
  ChatPageLayout,
  EditProfile,
  EmptyPage,
  HomeLayout,
  NotFoundPage,
  Profile,
  ScreenLayout,
  UpdatePageLayout,
  Updates,
} from "./pages/index.js";
import {
  Chat,
  ChatProfile,
  CheckUserAuthentication,
  EmptyStatus,
  FindUser,
  ForgotPasswordLayout,
  Login,
  Register,
  SideBar,
  VerifyAccountLayout,
} from "./components/index.js";
import Home from "./pages/Home.jsx";
import { SocketProvider } from "./contexts/SocketProvider.jsx";
import AddStatus from "./components/AddStatus.jsx";
import { MediaProvider } from "./contexts/mediaProvider.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "auth",
        element: (
          <CheckUserAuthentication>
            <AuthLayout />
          </CheckUserAuthentication>
        ),
        children: [
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
      {
        path: "",
        element: (
          <CheckUserAuthentication>
            <HomeLayout />
          </CheckUserAuthentication>
        ),
        children: [
          {
            path: "chat?",
            element: <Home />,
          },
          {
            path: "chat/:userId",
            element: <ChatPageLayout />,
            children: [
              {
                path: "",
                element: <Chat />,
              },
              {
                path: "profile",
                element: <ChatProfile />,
              },
            ],
          },
          {
            path: "find-user",
            element: (
              <ScreenLayout chatSection>
                <FindUser />
              </ScreenLayout>
            ),
          },
          {
            path: "updates",
            element: (
              <ScreenLayout updatesSection>
                <UpdatePageLayout />
              </ScreenLayout>
            ),
            children: [
              {
                path: "",
                element: <EmptyStatus />,
              },
              {
                path: "add",
                element: <AddStatus />,
              },
              {
                path: ":statusUserIndex/:statusUserId",
                element: <Updates />,
              },
            ],
          },
          {
            path: "call",
            element: (
              <ScreenLayout chatSection>
                <Call />
              </ScreenLayout>
            ),
          },
          {
            path: "profile",
            element: (
              <ScreenLayout chatSection>
                <Profile />
              </ScreenLayout>
            ),
          },
          {
            path: "profile/edit",
            element: (
              <ScreenLayout>
                <EditProfile />
              </ScreenLayout>
            ),
          },
          {
            path: "profile/forgot-password",
            element: (
              <ScreenLayout>
                <ForgotPasswordLayout />
              </ScreenLayout>
            ),
          },
          {
            path: "profile/verify-account",
            element: (
              <ScreenLayout>
                <VerifyAccountLayout />
              </ScreenLayout>
            ),
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketProvider>
      <MediaProvider>
        <RouterProvider router={router} />
      </MediaProvider>
    </SocketProvider>
  </Provider>
);
