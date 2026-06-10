import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { Hospitals } from "./pages/Hospitals";
import { HospitalDetails } from "./pages/HospitalDetails";
import { AddHospital } from "./pages/AddHospital";
import { HospitalUpdate } from "./pages/HospitalUpdate";
import { FLRounds } from "./pages/FLRounds";
import { AggregationEngine } from "./pages/AggregationEngine";
import { Subscriptions } from "./pages/Subscriptions";
import { SubscriptionUpgrade } from "./pages/SubscriptionUpgrade";
import { SubscriptionRenew } from "./pages/SubscriptionRenew";
import { PlanDetails } from "./pages/PlanDetails";
import { PlanSettings } from "./pages/PlanSettings"; // Add this import
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { ModelDistribution } from "./pages/ModelDistribution";
import { AddAITeam } from "./pages/AddAITeam";
import { AddDoctor } from "./pages/AddDoctor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },
      { path: "hospitals", Component: Hospitals },
      { path: "hospitals/add", Component: AddHospital },
      { path: "hospitals/update/:id", Component: HospitalUpdate },
      { path: "hospitals/:id", Component: HospitalDetails },
      { path: "doctors/add", Component: AddDoctor },
      { path: "ai-team/add", Component: AddAITeam },
      { path: "model-distribution", Component: ModelDistribution },
      { path: "fl-rounds", Component: FLRounds },
      { path: "aggregation", Component: AggregationEngine },
      { path: "subscriptions", Component: Subscriptions },
      { path: "subscriptions/upgrade/:id", Component: SubscriptionUpgrade },
      { path: "subscriptions/renew/:id", Component: SubscriptionRenew },
      { path: "plans/:id", Component: PlanDetails },
      { path: "plan-settings/:id", Component: PlanSettings }, // Add this route
      { path: "notifications", Component: Notifications },
      { path: "settings", Component: Settings },
    ],
  },
]);