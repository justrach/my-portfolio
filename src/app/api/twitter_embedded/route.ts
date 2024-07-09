import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');
  console.log('Received URL:', url);

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Normalize URL to use the base tweet URL without any extra parts
  const normalizedUrl = url.split('?')[0].split('/video')[0];
  const apiUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}`;
  console.log('Normalized URL:', normalizedUrl);
  console.log('Final API URL:', apiUrl);

  try {
    const response = await axios.get(apiUrl);
    console.log('Twitter embed response:', response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching Twitter embed:', error.response ? error.response.data : error.message);
    return NextResponse.json({ error: 'Error fetching Twitter embed' }, { status: error.response?.status || 500 });
  }
}