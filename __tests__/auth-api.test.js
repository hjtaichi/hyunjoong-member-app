import client from "../src/api/client";
import {
  loginApi,
  registerApi,
  getMeApi,
  refreshAccessTokenApi,
} from "../src/api/auth";

jest.mock("../src/api/client", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe("회원 인증 API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("로그인 ID와 비밀번호를 로그인 API에 전달한다", async () => {
    client.post.mockResolvedValue({
      data: {
        accessToken: "access-token",
      },
    });

    const result = await loginApi({
      email: "member01",
      password: "secret",
    });

    expect(client.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "member01",
      password: "secret",
    });

    expect(result).toEqual({
      accessToken: "access-token",
    });
  });

  test("회원가입 신청 본문을 그대로 전달한다", async () => {
    const payload = {
      email: "new-member",
      password: "password",
      name: "신규회원",
    };

    client.post.mockResolvedValue({
      data: {
        ok: true,
      },
    });

    await registerApi(payload);

    expect(client.post).toHaveBeenCalledWith(
      "/api/auth/register",
      payload
    );
  });

  test("내 정보 조회에 Bearer 토큰을 사용한다", async () => {
    client.get.mockResolvedValue({
      data: {
        userId: 10,
        name: "회원",
      },
    });

    const result = await getMeApi("member-token");

    expect(client.get).toHaveBeenCalledWith("/api/auth/me", {
      headers: {
        Authorization: "Bearer member-token",
      },
    });

    expect(result.userId).toBe(10);
  });

  test("refresh token으로 access token 갱신을 요청한다", async () => {
    client.post.mockResolvedValue({
      data: {
        accessToken: "new-access-token",
      },
    });

    const result = await refreshAccessTokenApi("refresh-token");

    expect(client.post).toHaveBeenCalledWith("/api/auth/refresh", {
      refreshToken: "refresh-token",
    });

    expect(result.accessToken).toBe("new-access-token");
  });
});