export async function imageUrlToBase64(url: string): Promise<string | ArrayBuffer | null> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Returns "data:image/png;base64,..."
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}