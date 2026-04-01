export class MusicalItem {
    id: number;
    title: string;
    artist: string;
    genre: string;
    image: string;
    type: string;
    audioPreview: string; // Nueva propiedad para la URL de la vista previa de audio

    constructor(data: any) {
        this.id = data.id;

        this.title = data.title || data.name;
        this.artist = data.artist || "Independent Artist";
        this.genre = data.genre || "Unspecified Genre";
        this.image = data.image || "default-image.jpg";
        this.type = data.type;
        this.audioPreview = data.audioPreview || ""; // Asignar la URL de la vista previa de audio
    }

    // Unifico los métodos en uno que sea descriptivo
    get summaryInfo(): string {
        return `${this.title} - ${this.artist} (${this.genre})`;
    }
}
