import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // This assumes the command to run the client app is executed from the workspace root (D:/AMessages)
    const songsDirectory = path.join(process.cwd(), 'client', 'public', 'songs');
    const filenames = fs.readdirSync(songsDirectory);

    const songs = filenames.filter(
      (file) => file.endsWith('.mp3') || file.endsWith('.wma')
    );

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('ERROR in /api/songs route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load songs directory. Please check server console for details.',
        errorMessage: error.message
      },
      { status: 500 }
    );
  }
} 