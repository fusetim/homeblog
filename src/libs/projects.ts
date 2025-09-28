import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { getLanguageById, type Language } from "./languages";

const projectImages = import.meta.glob<{ default: ImageMetadata }>('../data/projects/*.{png,jpg,jpeg,svg,gif}', { eager: true });

/// Type for a project entry
export interface Project {
    id: string;
    name: string;
    description: string;
    image?: ImageMetadata | string;
    link?: string;
    tags: string[];
    langs: Language[];
};

/// Get the image metadata or URL for a project image
export function getProjectImage(image: string | undefined): ImageMetadata | string | undefined {
    // If no image is provided, return undefined
    if (!image) {
        return undefined;
    }
    // If the image is an absolute URL, return it as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }
    // Otherwise, try to find the image in the imported project images
    const imagePath = `../data/projects/${image}`;
    if (projectImages[imagePath]) {
        return projectImages[imagePath].default;
    } else {
        console.warn(`Image not found for project: ${image} at path: ${imagePath}`);
        return undefined;
    }
}

/// Get all project entries
export async function getAllProjects(): Promise<Project[]> {
    const entries = await getCollection('projects');
    return entries.map(entry => {
        const langs = entry.data.langs.map(getLanguageById).filter((lang): lang is Language => lang !== undefined);
        return {
            id: entry.data.id,
            name: entry.data.name,
            description: entry.data.description,
            image: getProjectImage(entry.data.image),
            link: entry.data.link,
            tags: entry.data.tags ?? [],
            langs
        };
    });
}
