import { useContext } from "solid-js";
import { GlobalStoreContext } from "@/store/globalStore";

export const ServerController = () => {
  const store = useContext(GlobalStoreContext)!;

  return (
    <div class="flex flex-row w-full justify-between">
      <div class="flex flex-row  w-full items-center space-x-2">
        <p>端口:</p>
        <input
          type="text"
          class="d-input"
          value={store.port}
          onInput={(e) => store.setPort(Number(e.currentTarget.value))}
          disabled={store.isRunning}
        />
        <button
          class="d-btn"
          classList={{
            "d-btn-success": !store.isRunning,
            "d-btn-error": store.isRunning,
          }}
          onClick={() => (store.isRunning ? store.stop() : store.start())}
        >
          {store.isRunning ? "停止" : "启动"}
        </button>
      </div>
    </div>
  );
};
