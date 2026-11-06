import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 7,
          color: '#FFFFFF',
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: '-0.5px',
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
