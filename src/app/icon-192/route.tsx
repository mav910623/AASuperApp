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
          borderRadius: 42,
          color: '#FFFFFF',
          fontWeight: 900,
          fontSize: 104,
          letterSpacing: '-2px',
          fontFamily: 'sans-serif',
        }}
      >
        AA
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
