const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const productImages = {
  'camera': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFhUVFxgXFxYYGBUVFRcYFhUYFxcXFhcYHyggGBolHRcVITEiJSkrLi4uGB8zODMtNygtLisBCgoKDg0NFRAPFSsdFR0tLS0tLS0rLSstLS0rLS0xKy0tKy0rLSstLS0rLS0rLSstLSsrKzctKystLSs4LS4rLf/AABEIAMQBAQMBIgACEQEDEQH',
  'laptop': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxEQEhUSEBAVFREQFRAWFRYVEhAWEhYXFRUWFhcVFRUYHSkgGBolGxUVITEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGi0lHyYyMTI1NzctNS0rLTYtLys1NTc3LS8wMC01MjcvMC0tNS0tLS8tKystLS0wLTUtKy8vLf/AABEIAOEA4QMBEQACEQEDEQH',
  'headphone': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASEhUSEhIVFRUTFxUaGBcVFxUVFhcWFRgXFhcWHhUYHiggGxolGxcYIjEhJSsrLi4uGh82ODMtNygtLisBCgoKDg0OGxAQGy0lICUvKzctLS0tNy0tLTU3NysvKy0rLS01LSstKy0xNy0tLS0tLi8rNS0vLS0tNS0tKy0rLf/AABEIAOEA4QMBIQACEQEDEQH',
  'smartwatch': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxESEhUSEhIWFhUXFhgWGBgVFRgZGBUXGxgYFxYVFRgYHSggGBslHR0VIzEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGzAlICUtLS0tLS0tLS0tLS0tLS0tLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBEQACEQEDEQH'
};

async function updateProductImages() {
  const client = await pool.connect();
  try {
    // Get all products
    const result = await client.query('SELECT id, name FROM products ORDER BY id');
    console.log('Current products:', result.rows);

    // Update each product with matching image
    for (const product of result.rows) {
      const productName = product.name.toLowerCase();
      let imageUrl = null;

      // Match product name to image
      if (productName.includes('camera')) {
        imageUrl = productImages.camera;
      } else if (productName.includes('laptop')) {
        imageUrl = productImages.laptop;
      } else if (productName.includes('headphone')) {
        imageUrl = productImages.headphone;
      } else if (productName.includes('watch') || productName.includes('smart')) {
        imageUrl = productImages.smartwatch;
      }

      if (imageUrl) {
        await client.query(
          'UPDATE products SET image_url = $1 WHERE id = $2',
          [imageUrl, product.id]
        );
        console.log(`Updated ${product.name} with image`);
      } else {
        console.log(`No matching image found for ${product.name}`);
      }
    }

    console.log('All products updated successfully!');
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateProductImages();
