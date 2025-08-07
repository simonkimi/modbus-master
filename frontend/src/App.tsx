import "./App.css";
import { ServerController } from "@/components/ServerController";
import { createGlobalStore, GlobalStoreContext } from "@/store/globalStore";
import { ModbusItemController, ModbusTable } from "@/components/ModbusTable";
import { Toaster } from "solid-toast";

function App() {
  const store = createGlobalStore();

  return (
    <GlobalStoreContext.Provider value={store}>
      <Toaster
        toastOptions={{
          style: {
            background:
              "color-mix(in oklab,var(--d-btn-color, var(--color-base-content)) 8%,var(--color-base-100))",
            color: "var(--d-btn-color, var(--color-base-content))",
          },
        }}
      />
      <main class="flex flex-col p-4">
        <ServerController />
        <div class="pt-4">
          <ModbusItemController />
          <ModbusTable />
        </div>
      </main>
    </GlobalStoreContext.Provider>
  );
}

export default App;
