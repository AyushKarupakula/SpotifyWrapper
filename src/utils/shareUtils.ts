export const generateShareableText = (data: any) => {
  const topArtists = data.topArtists.slice(0, 3).join(', ');
  const topTracks = data.topTracks.slice(0, 3).join(', ');
  
  return `Check out my Spotify Wrapped!\n\nTop Artists:\n${topArtists}\n\nTop Tracks:\n${topTracks}`;
};

export const generateShareableImage = async (data: any) => {
  // This is a placeholder for future implementation
  // You can implement image generation using html-to-image or similar libraries
  return null;
}; 