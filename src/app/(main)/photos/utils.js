import photoManifest from '@/data/photo-manifest.json';

export function getPhotos() {
  return photoManifest.map(photo => ({
    ...photo,
    alt: photo.title,
    date: new Date(photo.date),
    dimensions: { width: photo.width, height: photo.height },
  }));
}
