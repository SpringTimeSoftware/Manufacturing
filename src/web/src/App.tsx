import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./app/AppProviders";
import { appRouter } from "./app/router";

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}
