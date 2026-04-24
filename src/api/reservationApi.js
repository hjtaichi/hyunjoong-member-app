import { apiFetch } from "./api";

export async function cancelReservationApi(token, reservationId) {
  return apiFetch(
    `/member/reservations/${reservationId}`,
    {
      method: "DELETE",
    },
    token
  );
}