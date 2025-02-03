import Swal from "sweetalert2";

interface AdAccount {
  account_id(account_id: any): unknown;
  id: string;
  name: string;
  // Add other properties as needed
}

interface AdSet {
  id: string;
  name: string;
  // Add more properties as needed
}

const showMessage1 = (title: string) => {
  const toast = Swal.mixin({
    toast: true,
    position: "top-start",
    showConfirmButton: false,
    timer: 3000,
  });

  toast.fire({
    icon: "error",
    title: title,
    padding: "10px 20px",
  });
};

export const getAdAccountsForBusiness = async (
  businessId: string,
  accessToken: string
): Promise<AdAccount[]> => {
  try {
    const url = `https://graph.facebook.com/v18.0/${businessId}/owned_ad_accounts?fields=name,id,account_id&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Error fetching ad accounts for business: ${data.error.message}`
      );
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching ad accounts for business:", error || "");
    showMessage1(
      "The selected business doesn't have any ad account associated with it. Please try using a different business"
    );
    throw error;
  }
};

export const getLongLiveToken = async (accessToken: string): Promise<any> => {
  try {
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1345961409359181&client_secret=a027ac3713e3bee34134471d5300aaf2&fb_exchange_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error fetching token: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error fetching token:", error || "");
    showMessage1("Error fetching token");
    throw error;
  }
};

export const getUserInfoFromMeta = async (
  accessToken: string
): Promise<any> => {
  try {
    const url = `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error fetching user info: ${data.error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error fetching user info:", error || "");
    showMessage1("Error fetching user info");
    throw error;
  }
};

export const getOwnedPagesForBusiness = async (
  businessId: string,
  accessToken: string
): Promise<AdSet[]> => {
  try {
    const url = `https://graph.facebook.com/v18.0/${businessId}/owned_pages?access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Error fetching owned pages for business: ${data.error.message}`
      );
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching owned pages for business:", error || "");
    showMessage1("Error fetching owned pages for business. Please try again.");
    throw error;
  }
};
