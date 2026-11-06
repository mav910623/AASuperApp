import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1E40AF',
          borderRadius: 112,
          color: '#FFFFFF',
          fontWeight: 900,
          fontSize: 270,
          letterSpacing: '-6px',
          fontFamily: 'sans-serif',
        }}
      >
        AA
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
