import client from "./client";

function createAuthHeaders(token, headers = {}) {
  return {
    ...headers,
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

function normalizeInquiryError(error, fallbackMessage) {
  const status = error?.response?.status;

  if (status === 401) {
    return new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
  }

  return new Error(
    error?.response?.data?.message ||
      error?.message ||
      fallbackMessage
  );
}

export async function memberInquiryRequest(
  path,
  token,
  options = {}
) {
  const {
    fallbackMessage = "문의 요청을 처리하지 못했습니다.",
    headers,
    ...requestOptions
  } = options;

  try {
    const response = await client.request({
      url: path,
      ...requestOptions,
      headers: createAuthHeaders(token, headers),
    });

    return response.data;
  } catch (error) {
    throw normalizeInquiryError(error, fallbackMessage);
  }
}