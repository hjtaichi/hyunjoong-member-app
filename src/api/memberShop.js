import { apiRequest } from "./request";

export async function getMemberProducts(token) {
  const result = await apiRequest("/api/member/products", token);
  return result.data || [];
}

export async function createProductOrder(token, payload) {
  const result = await apiRequest("/api/member/product-orders", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result.data || result;
}