import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export interface BlogPost {
    id: string;
    title: string;
    description: string;
    publication_date: Date;
    last_updated?: Date;
    draft?: boolean;
    image?: string;
    tags?: string[];
    slug?: string;
    body?: string;
};

export function getPrintableDate(date: Date) {
    const format = Intl.DateTimeFormat('en-UK', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    });
    return format.format(date);
}

export async function getAllBlogPosts() : Promise<BlogPost[]> {
    return await getCollection('blog')
    .then((posts: CollectionEntry<'blog'>[]) => {
        return posts
            .sort((a, b) => {
                return new Date(b.data.publication_date).getTime() - new Date(a.data.publication_date).getTime();
            })
            .map((post) => {
                return {
                    id: post.id,
                    title: post.data.title,
                    description: post.data.description,
                    publication_date: post.data.publication_date,
                    last_updated: post.data.last_updated,
                    draft: post.data.draft,
                    image: post.data.image,
                    tags: post.data.tags,
                    slug: post.data.slug,
                    body: post.body,
                } as BlogPost;
            });
    });
}

export function getPostLink(post: BlogPost) {
    if (post.slug) {
        return `/posts/${post.id}/${post.slug}`;
    }
    return `/posts/${post.id}`;
}

export async function getBlogPost(id: string) : Promise<BlogPost | null> {
    return await getRawBlogPost(id)
    .then((post) => {
        if (!post) {
            return null;
        }
        return {
            id: post.id,
            title: post.data.title,
            description: post.data.description,
            publication_date: post.data.publication_date,
            last_updated: post.data.last_updated,
            draft: post.data.draft,
            image: post.data.image,
            tags: post.data.tags,
            slug: post.data.slug,
            body: post.body,
        } as BlogPost;
    });
}

export function getRawBlogPost(id: string) : Promise<CollectionEntry<'blog'> | null> {
    return getEntry('blog', id);
}

export function getBlogPostReadTime(post: BlogPost) : number | null {
    const wordsPerMinute = 200;
    const words = getBlogPostWordCount(post);
    if (!words) {
        return null;
    }
    const readTime = Math.ceil(words / wordsPerMinute);
    return readTime;
}

export function getBlogPostWordCount(post: BlogPost) : number | null {
    const text = post.body;
    if (!text) {
        return null;
    }
    const words = text.split(/\s+/).length;
    return words;
}