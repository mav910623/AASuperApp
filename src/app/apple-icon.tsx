import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: 40,
          color: '#FFFFFF',
          fontWeight: 900,
          fontSize: 96,
          letterSpacing: '-2px',
          fontFamily: 'sans-serif',
        }}
      >
        AA
      </div>
    ),
    {
      ...size,
    }
  );
}
