import store from "../store";
import { setShow } from "../store/features/rateLimitSlice";

const customFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (response.status === 429) {
      store.dispatch(
        setShow({
          show: true,
          message: "Contact support@deal.ai to upgrade for unlimited access",
        })
      );
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export default customFetch;
