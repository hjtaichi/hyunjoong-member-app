import { apiRequest } from "./request";
import { API_BASE_URL } from "../config/env";

function resolveImageUrl(value) {
  if (!value) return value;

  if (String(value).startsWith("http://") || String(value).startsWith("https://")) {
    return value;
  }

  const cleanPath = String(value).startsWith("/") ? value : `/${value}`;

  return `${API_BASE_URL}${cleanPath}`;
}

function normalizePhoto(photo) {
  if (!photo) return photo;

  return {
    ...photo,
    imageUrl: resolveImageUrl(photo.imageUrl),
    thumbnailUrl: resolveImageUrl(photo.thumbnailUrl),
  };
}

function normalizeAlbum(album) {
  if (!album) return album;

  return {
    ...album,
    coverImageUrl: resolveImageUrl(album.coverImageUrl),
    coverThumbnailUrl: resolveImageUrl(album.coverThumbnailUrl),
    photos: Array.isArray(album.photos)
      ? album.photos.map(normalizePhoto)
      : album.photos,
  };
}

export async function getDojangAlbums(token, room = "general") {
  const query = room ? `?room=${encodeURIComponent(room)}` : "";

  const result = await apiRequest(
    `/api/member/dojang-albums${query}`,
    token
  );

  const albums = result.data || result;

  return Array.isArray(albums) ? albums.map(normalizeAlbum) : [];
}

export async function getDojangAlbumDetail(token, albumId) {
  const result = await apiRequest(
    `/api/member/dojang-albums/${albumId}`,
    token
  );

  const album = result.data || result;

  return normalizeAlbum(album);
}

export async function getRecentDojangAlbumPhotos(
  token,
  room = "general",
  limit = 6
) {
  const query = `?room=${encodeURIComponent(room)}&limit=${Number(limit || 6)}`;

  const result = await apiRequest(
    `/api/member/dojang-albums/recent-photos${query}`,
    token
  );

  const photos = result.data || result;

  return Array.isArray(photos) ? photos.map(normalizePhoto) : [];
}
export async function createDojangAlbumComment(token, albumId, content) {
  const result = await apiRequest(
    `/api/member/dojang-albums/${albumId}/comments`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );

  return result.data || result;
}

export async function deleteDojangAlbumComment(token, albumId, commentId) {
  const result = await apiRequest(
    `/api/member/dojang-albums/${albumId}/comments/${commentId}`,
    token,
    {
      method: "DELETE",
    }
  );

  return result.data || result;
}