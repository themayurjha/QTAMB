import { createClient } from '@supabase/supabase-js';
import { openai } from '../src/lib/openai.js';
import { format } from 'date-fns';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateStoryContent(category) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert in relationship advice and creating engaging web stories."
      },
      {
        role: "user",
        content: `Create a web story about questions to ask your boyfriend in the category: ${category}. 
          Include:
          - A catchy title
          - 5-7 engaging questions with brief explanations
          - Why these questions are important
          Format as JSON with title, description, and pages array.`
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function generateStoryImage(prompt) {
  // Generate image using DALL-E
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Professional, clean illustration for a relationship advice web story about: ${prompt}`,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });

  return response.data[0].url;
}

async function createWebStory(category) {
  try {
    // Generate story content
    const content = await generateStoryContent(category);
    
    // Create story directory
    const date = format(new Date(), 'yyyy-MM-dd');
    const slug = `${date}-${category.toLowerCase().replace(/\s+/g, '-')}`;
    const storyDir = path.join('public', 'stories', slug);
    await fs.mkdir(storyDir, { recursive: true });

    // Generate and save images for each page
    const pages = await Promise.all(content.pages.map(async (page, index) => {
      const imageUrl = await generateStoryImage(page.title);
      const imagePath = path.join(storyDir, `image-${index}.jpg`);
      
      // Download and optimize image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      await sharp(Buffer.from(imageBuffer))
        .resize(1200, 1600, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(imagePath);

      return {
        ...page,
        image: `/stories/${slug}/image-${index}.jpg`
      };
    }));

    // Generate AMP HTML
    const storyHtml = generateAmpHtml(content.title, content.description, pages);
    await fs.writeFile(path.join(storyDir, 'index.html'), storyHtml);

    // Update sitemap
    await updateSitemap(slug);

    // Store story metadata in Supabase
    const { error } = await supabase
      .from('web_stories')
      .insert({
        title: content.title,
        description: content.description,
        category,
        slug,
        published_at: new Date().toISOString()
      });

    if (error) throw error;

    console.log(`Web story created successfully: /stories/${slug}`);
    return `/stories/${slug}`;
  } catch (error) {
    console.error('Error creating web story:', error);
    throw error;
  }
}

function generateAmpHtml(title, description, pages) {
  return `<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="canonical" href="https://questiontoaskyourboyfriend.com/stories/${slug}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
</head>
<body>
  <amp-story
    standalone
    title="${title}"
    publisher="Questions to Ask Your Boyfriend"
    publisher-logo-src="https://questiontoaskyourboyfriend.com/android-chrome-192x192.png"
    poster-portrait-src="${pages[0].image}">

    ${pages.map((page, index) => `
    <amp-story-page id="page${index}">
      <amp-story-grid-layer template="fill">
        <amp-img src="${page.image}"
            width="720"
            height="1280"
            layout="responsive">
        </amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="vertical">
        <h1>${page.title}</h1>
        <p>${page.content}</p>
      </amp-story-grid-layer>
    </amp-story-page>
    `).join('')}

    <amp-story-bookend src="bookend.json" layout="nodisplay">
    </amp-story-bookend>
  </amp-story>
</body>
</html>`;
}

async function updateSitemap(newStorySlug) {
  const sitemap = await fs.readFile('public/sitemap.xml', 'utf-8');
  const $ = cheerio.load(sitemap, { xmlMode: true });
  
  // Add new story URL
  const newUrl = $('<url>');
  $('<loc>', { text: `https://questiontoaskyourboyfriend.com/stories/${newStorySlug}` }).appendTo(newUrl);
  $('<changefreq>', { text: 'never' }).appendTo(newUrl);
  $('<priority>', { text: '0.8' }).appendTo(newUrl);
  
  $('urlset').append(newUrl);
  
  await fs.writeFile('public/sitemap.xml', $.xml());
}

// Export the function to be used via API
export async function generateWebStory(category) {
  return await createWebStory(category);
}