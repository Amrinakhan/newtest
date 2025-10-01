import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE endpoint - Delete a product
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    console.log('DELETE request for product ID:', productId);

    const client = await pool.connect();

    // Check if product exists
    const checkResult = await client.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    console.log('Product found:', checkResult.rows.length > 0);

    if (checkResult.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await client.query('DELETE FROM products WHERE id = $1', [productId]);
    client.release();

    console.log('Product deleted successfully');
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT endpoint - Update a product
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    const body = await request.json();
    const { name, description, price, image_url } = body;

    console.log('PUT request for product ID:', productId);
    console.log('Update data:', { name, description, price, image_url });

    // Validation
    if (!name || !description || !price || !image_url) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Check if product exists
    const checkResult = await client.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    console.log('Product found:', checkResult.rows.length > 0);

    if (checkResult.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product
    const result = await client.query(
      'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [name, description, price, image_url, productId]
    );
    client.release();

    console.log('Product updated successfully:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
