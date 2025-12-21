// scripts/update-sitemap.js
const fs = require('fs');

function updateSitemap() {
    try {
        // Read your existing sitemap
        let sitemap = fs.readFileSync('sitemap.xml', 'utf8');
        
        // Find where to insert new blog posts (after the blog.html entry)
        const blogMarker = '<!-- Blog Posts -->';
        const endMarker = '<!-- Scripts & Courses -->';
        
        // Read blog data
        const blogData = JSON.parse(fs.readFileSync('data/blog-posts.json', 'utf8'));
        
        // Generate blog post entries
        let blogEntries = '';
        blogData.posts.forEach(post => {
            blogEntries += `\n    <url>
        <loc>https://sanjaygodot.netlify.app/${post.url}</loc>
        <lastmod>${post.date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });
        
        // Update the sitemap
        const updatedSitemap = sitemap.replace(
            /(<!-- Blog Posts -->\s*)([\s\S]*?)(\s*<!-- Scripts & Courses -->)/,
            `$1${blogEntries}$3`
        );
        
        fs.writeFileSync('sitemap.xml', updatedSitemap);
        console.log('✅ Sitemap updated with', blogData.posts.length, 'blog posts');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

updateSitemap();
