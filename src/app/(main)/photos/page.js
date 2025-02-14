import { PhotoGallery } from './components/PhotoGallery';
import { getPhotos } from './utils';
import { metadata } from './metadata';

export { metadata };

export default async function PhotosPage() {
    const photos = await getPhotos();

    return (
        <main className="flex flex-col items-center justify-start w-full animate-fade-in">
            <PhotoGallery photos={photos} />
        </main>
    );
} 